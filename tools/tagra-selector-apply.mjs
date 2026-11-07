#!/usr/bin/env node
/* ONE-TIME migration (7. 11. 2026) for branch tagra-trucker2-selector – delete after the merge.
   Inserts into the /fleet/ and /driver/ pages of all 9 languages: TAGRA TRUCKER 2 (price rows, fee mentions, schema),
   the selector markers + CSS/JS includes, the /fleet/ mobile hero order; adds the /go/tagra-trucker-2/ line to _redirects
   and TAGRA TRUCKER 2 to llms.txt. Then runs tools/tagra-selector.mjs to fill the selector markup.
   Idempotent: files that already contain the change are skipped.   Run: node tools/tagra-selector-apply.mjs */
import fs from 'node:fs';
import path from 'node:path';
import * as TS from './tagra-selector.mjs';

const ROOT = TS.ROOT;
const I = TS.loadTexts();
const P = TS.loadPrices();
const T2 = P.trucker2;
const V = '20261107';
const HEAD = `<link href="/assets/css/tagra-selector.css?v=${V}" rel="stylesheet"/>` +
  `<script defer="" src="/assets/js/tagra-prices.js?v=${V}"></script>` +
  `<script defer="" src="/assets/js/tagra-selector.js?v=${V}"></script>`;

function count(s, sub) { return s.split(sub).length - 1; }
function one(src, oldS, newS, what) {
  const n = count(src, oldS);
  if (n !== 1) throw new Error(`${what}: expected 1 match, got ${n}`);
  return src.replace(oldS, () => newS);
}
function head(src, what) {
  if (src.includes('tagra-selector.css')) return src;
  return one(src, '</head>', HEAD + '</head>', what + ' head');
}
/* after every 'X19Y (TAGRA Trucker),' add 'X29Y (TAGRA TRUCKER 2),' (bento, FAQ, FAQ schema) */
function feeFrag(src) {
  let n = 0;
  const re = /((?:<strong>)?(?:€)?19(?:&nbsp;| | )?(?:€)?(?:\s?\/\s?[^\s<(),]+)?(?:<\/strong>)?) \(TAGRA Trucker\),/g;
  const out = src.replace(re, (m, g1) => { n++; return m + ' ' + g1.replace('19', '29') + ' (TAGRA TRUCKER 2),'; });
  return [out, n];
}
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => fs.writeFileSync(path.join(ROOT, p), s);

function fleet(c, T) {
  const file = c.fleet + '/index.html', what = c.fleet;
  let s = read(file);
  if (s.includes('tsel:fleet')) { console.log(what, 'already done'); return; }
  s = head(s, what);
  s = one(s, 'class="band band--hero band--hero--blue">', 'class="band band--hero band--hero--blue tsel-hero">', what + ' hero class');
  const hs = s.indexOf('id="main-content"'), he = s.indexOf('</section>', hs);
  const hero = s.slice(hs, he);
  const row = hero.match(/<div class="anim-up" style="margin-bottom:16px;transition-delay:\.15s[^"]*">/)[0];
  let hero2 = hero.replace(row, () => '<!-- tsel:fleet-hero -->\n<!-- /tsel:fleet-hero -->\n' + row.replace('class="anim-up"', 'class="anim-up tsel-hero__cta"'));
  hero2 = hero2.replace(/\n?<a class="btn-outline" href="https:\/\/shop\.tagra\.app\/tagra-software\/" hreflang="en">[^<]*<\/a>/, '');
  s = s.slice(0, hs) + hero2 + s.slice(he);
  s = one(s, '<!-- Version price table -->', '<div class="tsel-pricing">\n<!-- tsel:fleet -->\n<!-- /tsel:fleet -->\n</div>\n<!-- Version price table -->', what + ' pricing');
  /* TRUCKER 2 row in the price table, right after TRUCKER */
  const r = s.match(/<tr[^>]*>\s*<td[^>]*>(?:A )?TAGRA Trucker[\s\S]*?<\/tr>\n/)[0];
  let r2 = r.replace(/>(A )?TAGRA Trucker/, '>TAGRA TRUCKER 2');
  r2 = r2.replace(/(<span class="t3p-rownote">)[^<]*(<\/span>)/g, (m, a, b) => a + TS.esc(T.row_t2_note) + b);
  const tds = [...r2.matchAll(/<td[^>]*>[\s\S]*?<\/td>/g)].map((m) => m[0]);
  r2 = r2.replace(tds[1], () => tds[1].replace(/>[^<]*<\/td>$/, () => '>' + TS.esc(T.row_t2_drivers) + '</td>'));
  r2 = r2.replace(tds[2], () => tds[2].replace(/>(€?)49((?:&nbsp;| )?€?) /, (m, a, b) => '>' + a + '88' + c.dec + '62' + b + ' '));
  r2 = r2.replace(tds[3], () => tds[3].replace('19', '29'));
  r2 = r2.split('href="https://shop.tagra.app/tagra-trucker/" hreflang="en"').join(`href="${T2.href}"`);
  r2 = r2.split(': TAGRA Trucker"').join(': TAGRA TRUCKER 2"');
  s = s.replace(r, () => r + r2);
  let n;
  [s, n] = feeFrag(s);
  s = one(s, '"offerCount": "6"', '"offerCount": "7"', what + ' offerCount');
  write(file, s);
  console.log(what, `ok, fee mentions +${n}`);
}

function driver(c, T) {
  const file = c.driver + '/index.html', what = c.driver;
  let s = read(file);
  if (s.includes('tsel:driver')) { console.log(what, 'already done'); return; }
  s = head(s, what);
  /* hero: one line about TAGRA TRUCKER 2 */
  const hs = s.indexOf('id="main-content"'), he = s.indexOf('</section>', hs);
  const hero = s.slice(hs, he);
  const meta = hero.match(/<p class="anim-up" style="font-size:15px;color:var\(--text2\);transition-delay:\.2s">/)[0];
  const line = TS.fill(TS.esc(T.d_hero), { link: '<a href="#tagra-trucker-selector">TAGRA TRUCKER 2</a>', price: TS.esc(TS.money(c, T2.price)) });
  s = s.slice(0, hs) + hero.replace(meta, () => `<p class="tsel-t2line">${line}</p>\n` + meta) + s.slice(he);
  /* pricing: selector + TRUCKER 2 rows */
  const ps = s.indexOf('id="pricing"');
  const box = '<div style="background:#fff;border-radius:var(--radius);border:1px solid var(--border);overflow:hidden;margin-bottom:24px">';
  const bi = s.indexOf(box, ps);
  s = s.slice(0, bi) + '<div class="tsel-pricing">\n<!-- tsel:driver -->\n<!-- /tsel:driver -->\n</div>\n' + s.slice(bi);
  const pe = s.indexOf('</section>', ps);
  const sec = s.slice(ps, pe);
  const rows = [...sec.matchAll(/(<div style="display:flex;justify-content:space-between[^"]*"><span style="color:var\(--text2\)">(.*?)<\/span><span[^>]*>(.*?)<\/span><\/div>\n)/g)];
  const trRow = rows.find((m) => /^(A )?TAGRA Trucker$/.test(m[2]))[1];
  const feeRow = rows.find((m) => /19/.test(m[3]) && m[3].includes('€') && !m[2].includes('TAGRA'))[1];
  const swap = (row, label, o, nw) => row
    .replace(/(<span style="color:var\(--text2\)">).*?(<\/span>)/, (m, a, b) => a + TS.esc(label) + b)
    .replace(/(<span style="font-weight:600[^"]*">)(.*?)(<\/span><\/div>)/, (m, a, b, z) => a + b.replace(o, nw) + z);
  const t2Row = swap(trRow, T.d_row_t2, '49', '88' + c.dec + '62');
  const fee2Row = swap(feeRow, T.d_row_fee2, '19', '29');
  const sec2 = sec.replace(trRow, () => trRow + t2Row).replace(feeRow, () => feeRow + fee2Row);
  s = s.slice(0, ps) + sec2 + s.slice(pe);
  /* schema: SoftwareApplication offers -> [TRUCKER, TRUCKER 2] */
  let done = false;
  s = s.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (m, a, body, z) => {
    if (done) return m;
    let d;
    try { d = JSON.parse(body); } catch (e) { return m; }
    if (!d || Array.isArray(d) || d['@type'] !== 'SoftwareApplication' || !d.offers || Array.isArray(d.offers) || typeof d.offers !== 'object') return m;
    const rest = { ...d.offers }; delete rest['@type'];
    const o1 = { '@type': 'Offer', name: 'TAGRA TRUCKER', ...rest };
    const o2 = { '@type': 'Offer', name: T.schema_t2_name, priceCurrency: 'EUR', price: '88.62', description: T.schema_t2_desc,
      url: (d.url || '') + '#tagra-trucker-selector', availability: 'https://schema.org/InStock' };
    d.offers = [o1, o2];
    done = true;
    return a + '\n' + JSON.stringify(d, null, 2) + '\n' + z;
  });
  if (!done) throw new Error(what + ': SoftwareApplication offer not found');
  write(file, s);
  console.log(what, 'ok');
}

const REDIR = `# ------------------------------------------------------------------
# TAGRA TRUCKER 2 (7. 11. 2026): every TRUCKER 2 link on tagra.app points here (fleet/driver pages,
# assets/js/tagra-prices.js). Product is not in shop.tagra.app yet -> shop contact form (302).
# When https://shop.tagra.app/tagra-trucker-2/ exists, change ONLY the target on the line below.
# ------------------------------------------------------------------
/go/tagra-trucker-2/   https://shop.tagra.app/contact/   302!

`;
function redirects() {
  const s = read('_redirects');
  if (s.includes('/go/tagra-trucker-2/')) { console.log('_redirects already done'); return; }
  write('_redirects', REDIR + s);
  console.log('_redirects ok');
}
function llms() {
  let s = read('llms.txt');
  if (s.includes('TAGRA TRUCKER 2')) { console.log('llms.txt already done'); return; }
  s = one(s, '  reader is included.\n- **TAGRA Control**',
    '  reader is included.\n- **TAGRA TRUCKER 2** — one TAGRA TRUCKER licence for a two-driver crew sharing one PC,\n  with one USB card reader included.\n- **TAGRA Control**', 'llms family');
  s = one(s, '| TAGRA Trucker | 1 driver | €49 | €19 |\n',
    '| TAGRA Trucker | 1 driver | €49 | €19 |\n| TAGRA TRUCKER 2 | 2 drivers (two-driver crew, one PC) | €88.62 | €29 |\n', 'llms table');
  s = one(s, 'TAGRA Trucker includes a free USB card reader (flat €9.90 shipping incl. VAT).\n',
    'TAGRA Trucker includes a free USB card reader (flat €9.90 shipping incl. VAT); TAGRA TRUCKER 2\n' +
    'includes one USB card reader for both drivers.\n' +
    'Which edition fits: 1 vehicle = TAGRA 1, 2 = TAGRA 2, 3–4 = TAGRA 4, 5–6 = TAGRA 6, 7 or more = TAGRA MAX;\n' +
    'an employed driver = TAGRA Trucker, two drivers in a pair = TAGRA TRUCKER 2. Licences and bundles are\n' +
    'sold online at https://shop.tagra.app/ (TAGRA TRUCKER 2 on request via the shop contact form until it\n' +
    'is listed; in Hungary through Rukon Kft.).\n', 'llms note');
  write('llms.txt', s);
  console.log('llms.txt ok');
}

/* comments in the assets pushed earlier still name the first (Python) draft of the generator */
function fixRefs() {
  for (const f of ['assets/js/tagra-prices.js', 'assets/js/tagra-selector.js', 'assets/css/tagra-selector.css']) {
    const s = read(f);
    if (s.includes('tools/tagra_selector.py')) { write(f, s.split('tools/tagra_selector.py').join('tools/tagra-selector.mjs')); console.log(f, 'ref ok'); }
  }
}

fixRefs();
redirects();
llms();
for (const [lang, c] of Object.entries(TS.LANGS)) {
  fleet(c, I[lang]);
  driver(c, I[lang]);
}
process.exitCode = TS.main();
