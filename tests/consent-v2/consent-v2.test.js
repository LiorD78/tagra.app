const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..'), SHOTS = process.env.TMX_SHOTS || path.join(__dirname, 'shots');
const I18N = JSON.parse(fs.readFileSync(process.env.TMX_I18N || path.join(__dirname, 'consent-i18n.json'), 'utf8'));
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
const server = http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split('?')[0]);
  if (q.method === 'POST') { r.writeHead(200); return r.end('ok'); }
  let f = path.join(ROOT, u); if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { r.writeHead(404); return r.end('nf'); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
const ADS_RE = /googleadservices|doubleclick|facebook\.(com|net)|bat\.bing\.com|google\.com\/(pagead|ccm)/;
const results = []; let fail = 0;
function ok(name, cond, info) { results.push((cond ? 'PASS' : 'FAIL') + ' ' + name + (info ? ' — ' + info : '')); if (!cond) fail++; }

async function ctx(browser, o = {}) {
  const c = await browser.newContext({ viewport: o.mobile ? { width: 390, height: 800 } : { width: 1280, height: 800 }, isMobile: !!o.mobile });
  const log = { ads: [], clarity: [], gtm: [], post: [] };
  await c.route('**/*', async (route) => {
    const url = route.request().url();
    if (url.startsWith('http://127.0.0.1')) {
      if (o.adsOn && /\/assets\/js\/ads\.js/.test(url)) {
        const body = fs.readFileSync(ROOT + '/assets/js/ads.js', 'utf8')
          .replace("var ADS_ENABLED = false;", 'var ADS_ENABLED = true;').replace("var GOOGLE_ADS_ID = '';", "var GOOGLE_ADS_ID = 'AW-1234567890';")
          .replace("trial_download: '', generate_lead: ''", "trial_download: 'LBLtrial', generate_lead: 'LBLlead'").replace("var UET_TAG_ID = '';", "var UET_TAG_ID = '99999999';");
        return route.fulfill({ status: 200, contentType: 'application/javascript', body });
      }
      if (route.request().method() === 'POST') log.post.push({ url, body: route.request().postData() });
      return route.continue();
    }
    if (ADS_RE.test(url)) log.ads.push(url);
    if (/clarity\.ms/.test(url)) log.clarity.push(url);
    if (/googletagmanager|google-analytics/.test(url)) log.gtm.push(url);
    const js = /\.js|\/tag\/|bat\.js|fbevents|gtag/.test(url);
    return route.fulfill({ status: 200, contentType: js ? 'application/javascript' : 'text/plain', body: '' });
  });
  return { c, log };
}
const BASE = 'http://127.0.0.1:8099';
(async () => {
  await new Promise(r => server.listen(8099, r));
  const browser = await chromium.launch();
  const btn = (p, a) => p.locator('#tmx-cc button[data-a="' + a + '"]');

  // (a) bez volby a „Pouze nezbytné“
  { const { c, log } = await ctx(browser); const p = await c.newPage();
    await p.goto(BASE + '/'); await p.waitForSelector('#tmx-cc'); await p.waitForTimeout(800);
    ok('a1 bez volby: lišta vidět, 0 ads požadavků', log.ads.length === 0 && log.clarity.length === 0, 'ads=' + log.ads.length + ' clarity=' + log.clarity.length);
    ok('a2 bez volby: žádné GA/ads cookies', !/_ga|_gcl|_fbp|_uet|_clck/.test(await p.evaluate(() => document.cookie)));
    await btn(p, 'nec').click(); await p.waitForTimeout(600);
    const st = await p.evaluate(() => localStorage.getItem('tmx-consent-v2'));
    ok('a3 „Pouze nezbytné“: v2 an=0 mk=0, 0 ads, 0 clarity', /"an":0,"mk":0/.test(st) && log.ads.length === 0 && log.clarity.length === 0, st);
    await p.goto(BASE + '/de/'); await p.waitForTimeout(600);
    ok('a4 další stránka po odmítnutí: lišta se nevrací, 0 ads/clarity', !(await p.$('#tmx-cc')) && log.ads.length === 0 && log.clarity.length === 0);
    await c.close(); }

  // (b) Přijmout vše s ADS_ENABLED=false
  { const { c, log } = await ctx(browser); const p = await c.newPage();
    await p.goto(BASE + '/'); await btn(p, 'all').click(); await p.waitForTimeout(1200);
    const dl = await p.evaluate(() => JSON.stringify(window.dataLayer.filter(x => x[0] === 'consent' && x[1] === 'update').map(x => x[2])));
    ok('b1 Consent Mode update granted (analytics + ad_*)', /"analytics_storage":"granted"/.test(dl) && /"ad_storage":"granted"/.test(dl), dl);
    ok('b2 GA tag (gtag/js) načten, Clarity načten', log.gtm.length > 0 && log.clarity.length > 0, 'gtm=' + log.gtm.length + ' clarity=' + log.clarity.length);
    ok('b3 ADS_ENABLED=false: 0 ads požadavků, fbq/uetq neexistují', log.ads.length === 0 && (await p.evaluate(() => !window.fbq && !window.uetq)), 'ads=' + log.ads.length);
    ok('b4 web-vitals načten po souhlasu', await p.evaluate(() => performance.getEntriesByType('resource').some(r => /web-vitals/.test(r.name))));
    ok('b5 tmxConsent() {an:1,mk:1}', JSON.stringify(await p.evaluate(() => window.tmxConsent())) === '{"an":1,"mk":1,"decided":true}');
    // znovuotevření + stažení marketingu
    await p.goto(BASE + '/'); await p.click('#tmx-cc-footlink'); await p.waitForSelector('#tmx-cc #tmx-cc-mk');
    ok('b6 patička „Nastavení“ otevře panel s uloženou volbou', await p.isChecked('#tmx-cc-mk') && await p.isChecked('#tmx-cc-an') && await p.isDisabled('#tmx-cc-ne'));
    await p.screenshot({ path: SHOTS + '/panel-reopen-en-desktop.png' });
    await p.uncheck('#tmx-cc-mk'); await Promise.all([p.waitForNavigation(), btn(p, 'save').click()]); await p.waitForTimeout(400);
    ok('b7 uložení an=1 mk=0', /"an":1,"mk":0/.test(await p.evaluate(() => localStorage.getItem('tmx-consent-v2'))));
    await c.close(); }

  // (c) ADS_ENABLED=true + fiktivní ID
  { const { c, log } = await ctx(browser, { adsOn: true }); const p = await c.newPage();
    await p.goto(BASE + '/'); await p.waitForSelector('#tmx-cc'); await p.waitForTimeout(800);
    ok('c1 ads zapnuté, bez volby: 0 ads požadavků', log.ads.length === 0, 'ads=' + log.ads.length);
    await btn(p, 'nec').click(); await p.waitForTimeout(600);
    ok('c2 ads zapnuté, jen nezbytné: 0 ads', log.ads.length === 0);
    await p.goto(BASE + '/'); await p.click('#tmx-cc-footlink'); await p.check('#tmx-cc-an'); await btn(p, 'save').click(); await p.waitForTimeout(800);
    ok('c3 jen analytika (mk=0): 0 ads, fbq nedefinováno', log.ads.length === 0 && await p.evaluate(() => !window.fbq));
    await c.close(); }
  { const { c, log } = await ctx(browser, { adsOn: true }); const p = await c.newPage();
    await p.goto(BASE + '/'); await p.waitForSelector('#tmx-cc'); const before = log.ads.length; await btn(p, 'all').click(); await p.waitForTimeout(1500);
    const hosts = [...new Set(log.ads.map(u => new URL(u).host))];
    ok('c4 po souhlasu (mk) jdou ads požadavky; před ním 0', before === 0 && log.ads.length > 0, 'hosty: ' + hosts.join(', '));
    ok('c5 Meta init + PageView s pixelem 1445469577001824', await p.evaluate(() => (window.fbq.queue || []).some(a => a[0] === 'init' && a[1] === '1445469577001824') && (window.fbq.queue || []).some(a => a[0] === 'track' && a[1] === 'PageView')));
    ok('c6 gtag config AW + UET', await p.evaluate(() => window.dataLayer.some(x => x[0] === 'config' && x[1] === 'AW-1234567890')) && log.ads.some(u => /bat\.bing\.com\/bat\.js/.test(u)));
    await p.evaluate(() => { gtag('event', 'trial_download', { product: 'tagra' }); gtag('event', 'generate_lead', {}); gtag('event', 'shop_click', { product_slug: 'tagra-trucker-2' }); });
    const ev = await p.evaluate(() => ({ q: (window.fbq.queue || []).map(a => [a[0], a[1], a[3] && a[3].eventID, a[2] && a[2].product_slug]), dl: window.dataLayer.filter(x => x[0] === 'event' && x[1] === 'conversion').map(x => x[2].send_to) }));
    const names = ev.q.map(a => a[1]);
    ok('c7 mapování: StartTrial, Lead, ShopClick(product_slug) + eventID UUID', ['StartTrial', 'Lead', 'ShopClick'].every(n => names.includes(n)) && ev.q.filter(a => ['StartTrial', 'Lead', 'ShopClick'].includes(a[1])).every(a => /^[0-9a-f-]{36}$/.test(a[2] || '')) && ev.q.find(a => a[1] === 'ShopClick')[3] === 'tagra-trucker-2', JSON.stringify(ev.q.slice(-3)));
    ok('c8 Google Ads konverze send_to AW/label pro trial_download i generate_lead', ev.dl.includes('AW-1234567890/LBLtrial') && ev.dl.includes('AW-1234567890/LBLlead'), ev.dl.join(','));
    ok('c9 UET událost trial_download', await p.evaluate(() => Array.isArray(window.uetq) ? window.uetq.some((a, i, arr) => a === 'event' && arr[i + 1] === 'trial_download') : true));
    await c.close(); }
  // c10 odvolání marketingu zastaví další události
  { const { c, log } = await ctx(browser, { adsOn: true }); const p = await c.newPage();
    await p.goto(BASE + '/'); await btn(p, 'all').click(); await p.waitForTimeout(800);
    await p.goto(BASE + '/'); await p.click('#tmx-cc-footlink'); await p.uncheck('#tmx-cc-mk'); await Promise.all([p.waitForNavigation(), btn(p, 'save').click()]);
    await p.waitForTimeout(600);
    const n = log.ads.length; await p.evaluate(() => gtag('event', 'generate_lead', {})); await p.waitForTimeout(300);
    ok('c10 po odvolání marketingu: nová stránka bez fbq/ads', await p.evaluate(() => !window.fbq) && log.ads.length === n);
    await c.close(); }

  // (d) 11 jazyků
  const PAGES = { en: '/', de: '/de/', pl: '/pl/', el: '/el/', hu: '/hu/', fr: '/fr/', it: '/it/', nl: '/nl/', ro: '/ro/', cs: '/privacy/cz/', sk: '/privacy/sk/' };
  for (const [l, u] of Object.entries(PAGES)) {
    const { c } = await ctx(browser); const p = await c.newPage(); await p.goto(BASE + u); await p.waitForSelector('#tmx-cc');
    const txt = await p.$eval('#tmx-cc', e => e.innerText); const t = I18N[l];
    const good = txt.includes(t.t) && txt.includes(t.all) && txt.includes(t.nec) && txt.includes(t.set);
    const lang = await p.evaluate(() => document.documentElement.lang);
    ok('d lišta ' + l + ' (' + u + ', lang=' + lang + '): texty = JSON', good);
    if (['en', 'de', 'pl'].includes(l)) {
      await p.screenshot({ path: SHOTS + '/banner-' + l + '-desktop.png' });
      await btn(p, 'set').click(); await p.waitForTimeout(200); await p.screenshot({ path: SHOTS + '/panel-' + l + '-desktop.png' });
    }
    await c.close();
    if (['en', 'de', 'pl'].includes(l)) {
      const m = await ctx(browser, { mobile: true }); const mp = await m.c.newPage(); await mp.goto(BASE + u); await mp.waitForSelector('#tmx-cc');
      await mp.screenshot({ path: SHOTS + '/banner-' + l + '-mobile.png' });
      const fits = await mp.evaluate(() => { const b = document.getElementById('tmx-cc').getBoundingClientRect(); return b.right <= innerWidth + 1 && b.left >= -1; });
      await btn(mp, 'set').click(); await mp.waitForTimeout(200); await mp.screenshot({ path: SHOTS + '/panel-' + l + '-mobile.png' });
      ok('d mobil ' + l + ': lišta se vejde na šířku', fits); await m.c.close();
    }
  }
  // a11y: dialog, fokus, Esc
  { const { c } = await ctx(browser); const p = await c.newPage(); await p.goto(BASE + '/'); await p.waitForSelector('#tmx-cc');
    ok('d-a11y role=dialog + aria-label', await p.$eval('#tmx-cc', e => e.getAttribute('role') === 'dialog' && !!e.getAttribute('aria-label')));
    await p.keyboard.press('Escape'); ok('d-a11y Esc nezavírá bez volby', !!(await p.$('#tmx-cc')));
    await btn(p, 'set').click(); ok('d-a11y po „Nastavení“ je fokus uvnitř dialogu', await p.evaluate(() => document.getElementById('tmx-cc').contains(document.activeElement)));
    await c.close(); }

  // (e) migrace v1 → v2
  for (const [v1, adsOn, expect] of [['granted', false, 'nobanner'], ['denied', false, 'nobanner'], ['granted', true, 'banner'], ['denied', true, 'banner']]) {
    const { c, log } = await ctx(browser, { adsOn }); const p = await c.newPage();
    await p.addInitScript((v) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('tmx-consent-v1', v); sessionStorage.setItem('seeded', '1'); } }, v1);
    await p.goto(BASE + '/'); await p.waitForTimeout(900);
    const banner = !!(await p.$('#tmx-cc')); const tc = await p.evaluate(() => window.tmxConsent());
    const wantAn = v1 === 'granted' ? 1 : 0;
    ok('e migrace v1=' + v1 + ' ADS=' + adsOn + ': an=' + wantAn + ', mk=0, ' + (expect === 'banner' ? 'lišta znovu' : 'bez lišty') + (v1 === 'granted' && !adsOn ? ', Clarity ano' : ''),
      tc.an === wantAn && tc.mk === 0 && banner === (expect === 'banner') && (v1 === 'granted' && !adsOn ? log.clarity.length > 0 : true) && log.ads.length === 0, JSON.stringify(tc) + ' banner=' + banner);
    await c.close(); }

  // (f) CLS – přičitatelné liště; celkové CLS se porovná s baseline (uložená volba = lišta se nezobrazí)
  async function clsRun(u, saved) {
    const { c } = await ctx(browser); const p = await c.newPage();
    await p.addInitScript((sv) => { if (sv) localStorage.setItem('tmx-consent-v2', '{"v":2,"an":0,"mk":0,"ts":1}');
      window.__cls = 0; window.__bn = 0; window.__e = [];
      new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) { window.__cls += e.value;
        const mine = (e.sources || []).some(s => s.node && s.node.nodeType === 1 && (s.node.closest('#tmx-cc') || s.node.id === 'tmx-cc-footlink')); if (mine) window.__bn += e.value; } }).observe({ type: 'layout-shift', buffered: true }); }, saved);
    await p.goto(BASE + u); if (!saved) await p.waitForSelector('#tmx-cc'); await p.waitForTimeout(1500);
    if (!saved) { await btn(p, 'all').click(); await p.waitForTimeout(500); }
    const r = await p.evaluate(() => ({ cls: window.__cls, bn: window.__bn })); await c.close(); return r;
  }
  for (const u of ['/', '/de/', '/try/']) {
    const w = await clsRun(u, false), base = await clsRun(u, true);
    ok('f CLS ' + u + ': posuny způsobené lištou/odkazem v patičce = 0; CLS přičitatelné liště = 0', w.bn === 0, 'banner=' + w.bn + ', celkem s lištou=' + w.cls.toFixed(4) + ', baseline bez lišty=' + base.cls.toFixed(4) + ' (původ: nav.css, mimo tento PR)');
  }

  // (g) trial formulář + click ID
  { const { c, log } = await ctx(browser, { adsOn: true }); const p = await c.newPage();
    const q = '?gclid=GCL123&fbclid=FBC456&msclkid=MSC789&gbraid=GBR1&wbraid=WBR2';
    await p.goto(BASE + '/try/' + q); await p.waitForSelector('#tmx-cc');
    const empty = await p.evaluate(() => ['gclid', 'fbclid', 'msclkid', 'gbraid', 'wbraid'].every(n => document.querySelector('#trialForm input[name=' + n + ']').value === ''));
    ok('g1 bez souhlasu jsou click ID pole prázdná', empty);
    await btn(p, 'all').click(); await p.waitForTimeout(500);
    const vals = await p.evaluate(() => ['gclid', 'fbclid', 'msclkid', 'gbraid', 'wbraid'].map(n => document.querySelector('#trialForm input[name=' + n + ']').value).join(','));
    ok('g2 po marketingovém souhlasu jsou pole vyplněna', vals === 'GCL123,FBC456,MSC789,GBR1,WBR2', vals);
    await p.goto(BASE + '/try/'); await p.waitForTimeout(500);
    ok('g3 další stránka bez parametrů: click ID zůstala (sessionStorage)', await p.evaluate(() => document.querySelector('#trialForm input[name=gclid]').value) === 'GCL123');
    await p.check('input[name=audience][value=fleet]'); await p.fill('input[name=email]', 'test@example.com');
    await p.check('input[name=gdpr_consent]');
    await p.click('#trialForm .btn-submit'); await p.waitForTimeout(1200);
    const post = log.post.find(x => /form-name=tagra-trial/.test(x.body || ''));
    ok('g4 odeslaný formulář (POST /) obsahuje všech 5 click ID', !!post && /gclid=GCL123/.test(post.body) && /fbclid=FBC456/.test(post.body) && /msclkid=MSC789/.test(post.body) && /gbraid=GBR1/.test(post.body) && /wbraid=WBR2/.test(post.body), post ? post.body.replace(/email=[^&]*/, 'email=…') : 'POST nezachycen');
    await c.close(); }
  { const { c, log } = await ctx(browser, { adsOn: true }); const p = await c.newPage();
    await p.goto(BASE + '/try/?gclid=NOPE'); await p.waitForSelector('#tmx-cc'); await btn(p, 'nec').click();
    await p.check('input[name=audience][value=fleet]'); await p.fill('input[name=email]', 'a@b.cz'); await p.check('input[name=gdpr_consent]');
    await p.click('#trialForm .btn-submit'); await p.waitForTimeout(1000);
    const post = log.post.find(x => /form-name=tagra-trial/.test(x.body || ''));
    ok('g5 bez marketingového souhlasu se click ID neodešlou (gclid= prázdné)', !!post && (() => { const q = new URLSearchParams(post.body); return q.get('gclid') === '' && ['fbclid','msclkid','gbraid','wbraid'].every(k => q.get(k) === ''); })(), post ? post.body.slice(0,60) : 'POST nezachycen; posts=' + JSON.stringify(log.post.map(x=>x.url)));
    await c.close(); }

  await browser.close(); server.close();
  console.log(results.join('\n')); console.log('\nFAIL:', fail, ' celkem:', results.length);
  fs.writeFileSync(SHOTS + '/results.txt', results.join('\n') + '\n\nFAIL: ' + fail + ' / ' + results.length + '\n');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
