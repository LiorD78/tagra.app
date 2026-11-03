// TAGRA III + TAGRA Shop promo — deterministic transform of tagra.app (main @ afa799c6).
// Usage: node apply.js <repo-root>   (hu/ and assets/js/shop.js are never touched)
'use strict';
const fs = require('fs');
const path = require('path');
process.chdir(process.argv[2] || '.');
const ALL = JSON.parse(fs.readFileSync(path.join(__dirname, 't3data.json'), 'utf8'));
const CSS = fs.readFileSync(path.join(__dirname, 't3-promo.css'), 'utf8');

const SHOP = 'https://shop.tagra.app/';
const LANGS = ['en', 'de', 'fr', 'it', 'pl', 'nl', 'ro', 'el'];
const P = {
  en: { home: 'index.html', fleet: 'fleet', driver: 'driver', hiw: 'how-it-works', who: 'for-whom', faq: 'faq', try: 'try', thanks: 'try/thanks', enf: 'enforcement', inst: 'manuals/how-to-install-tagra' },
  de: { home: 'de/index.html', fleet: 'de/fuhrpark', driver: 'de/fahrer', hiw: 'de/so-funktioniert-es', who: 'de/fuer-wen', faq: 'de/faq', try: 'de/testen', thanks: 'de/danke', enf: 'de/kontrollbehoerden', inst: 'de/anleitungen/tagra-installieren' },
  fr: { home: 'fr/index.html', fleet: 'fr/entreprises', driver: 'fr/conducteurs', hiw: 'fr/fonctionnement', who: 'fr/pour-qui', faq: 'fr/faq', try: 'fr/essai-gratuit', thanks: 'fr/merci', enf: 'fr/autorites-de-controle', inst: 'fr/manuels/installer-tagra' },
  it: { home: 'it/index.html', fleet: 'it/per-aziende', driver: 'it/per-autisti', hiw: 'it/come-funziona', who: 'it/a-chi-si-rivolge', faq: 'it/faq', try: 'it/prova-gratuita', thanks: 'it/grazie', enf: 'it/organi-di-controllo', inst: 'it/manuali/installazione-tagra' },
  pl: { home: 'pl/index.html', fleet: 'pl/dla-przewoznikow', driver: 'pl/dla-kierowcow', hiw: 'pl/jak-to-dziala', who: 'pl/dla-kogo', faq: 'pl/faq', try: 'pl/wyprobuj', thanks: 'pl/dziekujemy', enf: 'pl/organy-kontrolne', inst: 'pl/instrukcje/instalacja-tagra' },
  nl: { home: 'nl/index.html', fleet: 'nl/voor-transportbedrijven', driver: 'nl/voor-chauffeurs', hiw: 'nl/hoe-het-werkt', who: 'nl/voor-wie', faq: 'nl/veelgestelde-vragen', try: 'nl/gratis-proefversie', thanks: 'nl/bedankt', enf: 'nl/handhaving', inst: 'nl/handleidingen/tagra-installeren' },
  ro: { home: 'ro/index.html', fleet: 'ro/pentru-firme', driver: 'ro/pentru-conducatori', hiw: 'ro/cum-functioneaza', who: 'ro/pentru-cine', faq: 'ro/intrebari-frecvente', try: 'ro/incercare-gratuita', thanks: 'ro/multumim', enf: 'ro/autoritati-de-control', inst: 'ro/manuale/instalare-tagra' },
  el: { home: 'el/index.html', fleet: 'el/stolos', driver: 'el/odigoi', hiw: 'el/pos-leitourgei', who: 'el/gia-poion', faq: 'el/faq', try: 'el/dokimi', thanks: 'el/efharisto', enf: 'el/eleghos', inst: 'el/egcheiridia/egkatastasi-tagra' },
};
const file = (p) => (p.endsWith('.html') ? p : p + '/index.html');
const rd = (p) => fs.readFileSync(file(p), 'utf8');
const touched = new Set();
const wr = (p, s) => { fs.writeFileSync(file(p), s); touched.add(file(p)); };

function fail(msg) { throw new Error(msg); }
// Replace exactly `n` matches of a global regex (default 1).
function rep(s, re, fn, n, label) {
  const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  const m = s.match(g) || [];
  const want = n === undefined ? 1 : n;
  if (m.length !== want) fail((label || re) + ': expected ' + want + ' match(es), got ' + m.length);
  return s.replace(g, fn);
}
function insertAt(s, idx, ins) { return s.slice(0, idx) + ins + s.slice(idx); }
const esc = (t) => t.replace(/&(?!(?:[a-z]+|#\d+);)/g, '&amp;');
const dec = (t) => t.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
// Wrap the first "TAGRA Shop" in a link.
const linkShop = (t, url) => { if (!t.includes('TAGRA Shop')) fail('no TAGRA Shop in: ' + t); return esc(t).replace('TAGRA Shop', '<a href="' + url + '" hreflang="en">TAGRA Shop</a>'); };
const linkMail = (t) => esc(t).replace('sales@tagra.app', '<a href="mailto:sales@tagra.app">sales@tagra.app</a>');
const linkHost = (t) => esc(t).replace('shop.tagra.app', '<a href="' + SHOP + '" hreflang="en">shop.tagra.app</a>');
const CSSLINK = '<link href="/assets/css/t3-promo.css?v=20261103" rel="stylesheet"/>';
function addCss(s) { if (s.includes('t3-promo.css')) return s; const i = s.indexOf('</head>'); if (i < 0) fail('no </head>'); return insertAt(s, i, CSSLINK + '\n'); }

// ── JSON-LD helpers: modify a string value in place (only JSON-escaped literal swap) ──
function ldBlocks(s) { const out = []; const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g; let m; while ((m = re.exec(s))) out.push({ start: m.index + m[0].indexOf('>') + 1, text: m[1] }); return out; }
function walk(o, fn) { if (Array.isArray(o)) o.forEach((x) => walk(x, fn)); else if (o && typeof o === 'object') { fn(o); Object.values(o).forEach((v) => walk(v, fn)); } }
function swapLdString(s, oldV, newV, label) {
  const a = JSON.stringify(oldV), b = JSON.stringify(newV);
  let found = 0, out = s;
  for (const blk of ldBlocks(s)) { const c = blk.text.split(a).length - 1; found += c; }
  if (found !== 1) {
    // try with escaped forward slashes variant
    fail(label + ': ld string occurrences = ' + found + ' for ' + a.slice(0, 80));
  }
  const blks = ldBlocks(s);
  for (const blk of blks) if (blk.text.includes(a)) { const nt = blk.text.replace(a, b); out = s.slice(0, blk.start) + nt + s.slice(blk.start + blk.text.length); break; }
  return out;
}
function insertLdFaq(s, questions, label) {
  // prepend questions to the FAQPage mainEntity array (string-level insert after "mainEntity": [)
  const blks = ldBlocks(s).filter((b) => /"@type"\s*:\s*"FAQPage"/.test(b.text));
  if (blks.length !== 1) fail(label + ': FAQPage blocks ' + blks.length);
  const b = blks[0];
  const m = b.text.match(/"mainEntity"\s*:\s*\[/);
  if (!m) fail(label + ': no mainEntity');
  const pretty = /\n\s+"@type"/.test(b.text);
  const ins = questions.map((q) => JSON.stringify({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } })).join(', ') + ', ';
  const pos = b.start + m.index + m[0].length;
  return insertAt(s, pos, pretty ? '\n    ' + ins : ins);
}
function checkLd(s, label) { for (const b of ldBlocks(s)) { try { JSON.parse(b.text); } catch (e) { fail(label + ': invalid JSON-LD ' + e.message); } } }
function faqLdAnswer(s, qName) {
  let ans = null;
  for (const b of ldBlocks(s)) { let o; try { o = JSON.parse(b.text); } catch (e) { continue; } walk(o, (x) => { if (x['@type'] === 'Question' && dec(x.name) === dec(qName)) ans = x.acceptedAnswer && x.acceptedAnswer.text; }); }
  return ans;
}
// FAQ <details> helper: find details whose answer matches `test`; returns {summary, aStart, aEnd, inner}
function findDetails(s, test, label, n) {
  const re = /<details>\s*<summary>([\s\S]*?)<\/summary>\s*<(div|p) class="faq-a(?:nswer)?">([\s\S]*?)<\/\2>\s*<\/details>/g;
  const hits = []; let m;
  while ((m = re.exec(s))) if (test(m[1], m[3])) hits.push({ summary: m[1], tag: m[2], inner: m[3], aEnd: m.index + m[0].lastIndexOf('</' + m[2] + '>'), aStart: m.index + m[0].indexOf(m[3], m[0].indexOf('<' + m[2] + ' class="faq-a')) });
  if (hits.length !== (n || 1)) fail(label + ': details hits ' + hits.length);
  return hits;
}

// ── extracted per-language strings ──
const X = {};
for (const l of LANGS) {
  const f = rd(P[l].fleet), d = rd(P[l].driver);
  const nw = (f.match(/<span class="t3-badge">([^<]*)<\/span>/) || fail(l + ' badge'))[1];
  const buy = (f.match(/aria-label="[^"]*: TAGRA 1"[^>]*>([^<]*)<\/a>/) || fail(l + ' buy'))[1];
  const alt = (f.match(/<img alt="([^"]*)"[^>]*src="\/assets\/img\/tagra3\/tagra3-overview\.webp"/) || fail(l + ' alt'))[1];
  const tryHref = (f.match(/<a class="btn-cta" href="([^"?]*)\?audience=fleet" rel="noopener" target="_blank">/) || fail(l + ' try'))[1];
  const fleetHref = '/' + (P[l].fleet === 'fleet' ? 'fleet' : P[l].fleet) + '/';
  const t3q = findDetails(f, (sm, a) => /TAGRA III/.test(sm) && /561\/2006/.test(a) && /AETR/.test(a) && !/<strong>/.test(a), l + ' t3 faq')[0];
  const rdq = findDetails(d, (sm, a) => /USB/.test(sm) && /9[.,]90/.test(a), l + ' reader faq')[0];
  X[l] = { nw, buy, alt, tryHref, fleetHref, t3q, rdq };
}

// ── components ──
function shopBand(l) {
  const T = ALL[l], x = X[l];
  const tile = (key, url, title, desc, price, badge) => '<a class="t3p-tile' + (key ? ' t3p-tile--key' : '') + '" href="' + SHOP + url + '" hreflang="en">' + (badge ? '<span class="t3p-tile__badge">' + esc(badge) + '</span>' : '') + '<strong class="t3p-tile__t">' + esc(title) + '</strong><span class="t3p-tile__d">' + esc(desc) + '</span>' + (price ? '<span class="t3p-tile__p">' + esc(price) + '</span>' : '') + '</a>';
  return '\n<!-- ═══ TAGRA SHOP (order online) ═══ -->\n<section aria-label="TAGRA Shop" class="t3p-shop" id="tagra-shop">\n<div class="t3p-wrap">\n<div class="t3p-head">\n<div class="eyebrow t3p-eyebrow"><span class="t3-badge">' + x.nw + '</span>' + esc(T.shop_eyebrow) + '</div>\n<h2 class="t3p-h2">' + esc(T.shop_h2) + '</h2>\n<p class="t3p-lead">' + esc(T.shop_lead) + '</p>\n</div>\n<div class="t3p-grid">\n' + [
    tile(true, 'tagra-software/', T.shop_t1_title, T.shop_t1_desc, T.shop_t1_price),
    tile(true, 'software-device-bundles/', T.shop_t2_title, T.shop_t2_desc, '', T.shop_t2_badge),
    tile(false, 'download-box-ii-s/', T.shop_t3_title, T.shop_t3_desc, T.shop_t3_price),
    tile(false, 'download-station/', T.shop_t4_title, T.shop_t4_desc, T.shop_t4_price),
    tile(false, 'smart-card-reader/', T.shop_t5_title, T.shop_t5_desc, T.shop_t5_price),
    tile(false, 'tagra-trucker/', T.shop_t6_title, T.shop_t6_desc, T.shop_t6_price),
  ].join('\n') + '\n</div>\n<div class="t3p-cta"><a class="btn-cta" href="' + SHOP + '" hreflang="en">' + esc(T.shop_cta) + '</a><a class="btn-outline" href="' + SHOP + 'download-devices/" hreflang="en">' + esc(T.shop_cta2) + '</a></div>\n<p class="t3p-note">' + linkMail(T.shop_note) + '</p>\n</div>\n</section>\n';
}
function homeIntro(l) {
  const T = ALL[l], x = X[l];
  return '\n<!-- ═══ TAGRA III (latest generation) ═══ -->\n<section aria-label="TAGRA III" class="t3p-intro" id="tagra-iii">\n<div class="t3p-wrap t3p-intro__grid">\n<div class="t3p-intro__text">\n<div class="eyebrow t3p-eyebrow"><span class="t3-badge">' + x.nw + '</span>' + esc(T.home_t3_eyebrow) + '</div>\n<h2 class="t3p-h2">' + esc(T.home_t3_h2) + '</h2>\n<p class="t3p-lead">' + esc(T.home_t3_lead) + '</p>\n<ul class="t3p-list">\n' + ['home_t3_b1', 'home_t3_b2', 'home_t3_b3', 'home_t3_b4'].map((k) => '<li>' + esc(T[k]) + '</li>').join('\n') + '\n</ul>\n<div class="t3p-cta"><a class="btn-cta" href="' + x.tryHref + '?audience=fleet" rel="noopener" target="_blank">' + esc(T.home_t3_cta_try) + '</a><a class="btn-outline" href="' + x.fleetHref + '#tagra-iii">' + esc(T.home_t3_cta_more) + '</a><a class="btn-outline" href="' + SHOP + 'tagra-software/" hreflang="en">' + x.buy + '</a></div>\n<p class="t3p-note">' + esc(T.home_t3_note) + '</p>\n</div>\n<a class="t3p-shot" href="' + x.fleetHref + '#tagra-iii"><img alt="' + x.alt + '" decoding="async" height="939" loading="lazy" sizes="(max-width: 980px) 100vw, 560px" src="/assets/img/tagra3/tagra3-overview-960.webp" srcset="/assets/img/tagra3/tagra3-overview-960.webp 960w, /assets/img/tagra3/tagra3-overview.webp 1402w" width="1402"/></a>\n</div>\n</section>\n';
}
const detailsHtml = (q, aHtml) => '<details>\n<summary>' + q + '</summary>\n<div class="faq-a">' + aHtml + '</div>\n</details>\n';

const log = [];
for (const l of LANGS) {
  const T = ALL[l], x = X[l];
  // ═══ HOME ═══
  {
    let s = rd(P[l].home);
    s = rep(s, /<title>([^<]*)<\/title>/, (m, t) => '<title>' + (t.startsWith('TAGRA –') ? t.replace('TAGRA –', 'TAGRA III –') : /\| TAGRA$/.test(t) ? t.replace(/\| TAGRA$/, '| TAGRA III') : fail(l + ' home title ' + t)) + '</title>', 1, l + ' title');
    for (const prop of ['property="og:title"', 'name="twitter:title"']) {
      const re = new RegExp('<meta content="([^"]*)" ' + prop + '/>');
      const m = s.match(re);
      if (m && (m[1].startsWith('TAGRA –') || /\| TAGRA$/.test(m[1]))) s = s.replace(re, '<meta content="' + (m[1].startsWith('TAGRA –') ? m[1].replace('TAGRA –', 'TAGRA III –') : m[1].replace(/\| TAGRA$/, '| TAGRA III')) + '" ' + prop + '/>');
    }
    s = rep(s, /<meta content="[^"]*" name="description"\/>/, () => '<meta content="' + esc(T.home_meta).replace(/"/g, '&quot;') + '" name="description"/>', 1, l + ' meta');
    s = rep(s, /(<div class="hero-glass anim-up">\s*<div class="eyebrow">)TAGRA ·/, (m, a) => a + '<span class="t3-badge">' + x.nw + '</span>TAGRA III ·', 1, l + ' hero eyebrow');
    s = rep(s, /(class="split-card split-card--fleet"[\s\S]*?<h3 class="card-title">)TAGRA<br\/>/, (m, a) => a + 'TAGRA III<br/>', 1, l + ' fleet card');
    s = rep(s, /(class="split-card split-card--driver"[\s\S]*?<ul class="card-list">\s*<li>[^<]*<\/li>\s*<li>)([^<]*)(<\/li>)/, (m, a, b, c) => a + esc(T.tr_home_li) + c, 1, l + ' driver card li');
    s = rep(s, /(<p class="pricing-teaser-price">[\s\S]*?)(<\/p>)/, (m, a, b) => a.replace(/\s+$/, '') + ' ' + esc(T.tr_home_pricing_append) + b, 1, l + ' pricing teaser');
    const tb = s.indexOf('<div class="trust-bar'); if (tb < 0) fail(l + ' trust-bar');
    s = insertAt(s, tb, homeIntro(l).replace(/^\n/, ''));
    const pc = s.indexOf('class="pricing-teaser-cta"'); const pe = s.indexOf('</section>', pc); if (pc < 0 || pe < 0) fail(l + ' pricing end');
    s = insertAt(s, pe + '</section>'.length, shopBand(l));
    // Trucker offer description in JSON-LD (if present)
    for (const b of ldBlocks(s)) { let o; try { o = JSON.parse(b.text); } catch (e) { fail(l + ' home ld'); } walk(o, (n) => { if (n['@type'] === 'Offer' && typeof n.description === 'string' && /19/.test(n.description) && !/149/.test(n.description)) { s = swapLdString(s, n.description, n.description + ' ' + T.tr_offer_append, l + ' home trucker offer'); log.push(l + ' home: trucker offer ld'); } }); }
    s = addCss(s); checkLd(s, l + ' home');
    wr(P[l].home, s);
  }
  // ═══ FLEET ═══
  {
    let s = rd(P[l].fleet);
    s = rep(s, /(<p class="lead anim-up"[^>]*>\s*<strong>)([^<]*)(<\/strong>)/, (m, a, b, c) => a + esc(T.fleet_lead_strong) + c, 1, l + ' fleet lead');
    s = rep(s, /<div class="anim-up" style="margin-bottom:16px;transition-delay:\.15s">(\s*<a class="btn-cta" href="[^"]*\?audience=fleet"[^>]*>[^<]*<\/a>)\s*<\/div>/, (m, a) => '<div class="anim-up" style="margin-bottom:16px;transition-delay:.15s;display:flex;flex-wrap:wrap;justify-content:center;gap:12px">' + a + '\n<a class="btn-outline" href="' + SHOP + 'tagra-software/" hreflang="en">' + x.buy + '</a>\n</div>', 1, l + ' fleet hero cta');
    s = rep(s, /(<p style="color:var\(--text2\);margin-top:6px;max-width:480px">)([\s\S]*?)(<\/p>)/, (m, a, b, c) => a + b.replace(/\s+$/, '') + ' ' + esc(T.tr_fleet_box_append) + c, 1, l + ' fleet trucker box');
    const pr = s.indexOf('id="tagra-pricing"'); if (pr < 0) fail(l + ' pricing');
    {
      const seg0 = s.slice(pr);
      const m = seg0.match(/<p style="margin:16px 0 24px">([\s\S]*?)<\/p>/); if (!m) fail(l + ' pricing p');
      const at = pr + m.index; const nw = '<p style="margin:16px 0 24px">' + m[1].replace(/\s+$/, '') + ' ' + linkShop(T.pricing_shop, SHOP + 'tagra-software/') + '</p>';
      s = s.slice(0, at) + nw + s.slice(at + m[0].length);
    }
    s = rep(s, /(<td style="padding:12px;font-weight:700;color:var\(--text-strong\)">TAGRA Trucker)(<\/td>)/, (m, a, b) => a + '<span class="t3p-rownote">' + esc(T.tr_fleet_row_note) + '</span>' + b, 1, l + ' fleet trucker row');
    const pe = s.indexOf('</section>', s.indexOf('id="tagra-pricing"'));
    s = insertAt(s, pe + '</section>'.length, shopBand(l));
    // FAQ: how to buy (answer mentions QR) — append shop sentence (HTML + JSON-LD)
    const bq = findDetails(s, (sm, a) => /QR/.test(a), l + ' fleet buy faq')[0];
    const oldA = faqLdAnswer(s, bq.summary);
    s = s.slice(0, bq.aEnd).replace(/\s+$/, '') + ' ' + linkShop(T.faq_buy_append, SHOP) + s.slice(bq.aEnd);
    if (oldA) s = swapLdString(s, oldA, oldA + ' ' + T.faq_buy_append, l + ' fleet buy ld'); else log.push(l + ' fleet: buy FAQ not in JSON-LD');
    if (l === 'fr') {
      s = rep(s, /<div class="eyebrow">Commander TAGRA Trucker — 49 € HT → &amp; Confirmation de commande et envoi de la licence par e-mail\.<\/div>/, () => '<div class="eyebrow">' + esc(T.fr_fix_eyebrow_pricing) + '</div>', 1, 'fr fleet eyebrow');
      s = rep(s, /<h2 style="text-transform:none">Tarifs<br\/>Prix et conditions<\/h2>/, () => '<h2 style="text-transform:none">' + T.fr_fix_h2_pricing + '</h2>', 1, 'fr fleet h2');
      s = rep(s, /(<a class="btn-cta(?: btn-cta--sm)?" href="\/fr\/essai-gratuit\/\?audience=fleet" rel="noopener" target="_blank">)\s*Téléchargez, installez et utilisez le logiciel complet\. Sans carte bancaire\.\s*(<\/a>)/, (m, a, b) => a + esc(T.fr_fix_btn_trial) + b, 2, 'fr fleet buttons');
      log.push('fr fleet: fixed pricing eyebrow, h2, 2 trial buttons');
    }
    s = addCss(s); checkLd(s, l + ' fleet');
    wr(P[l].fleet, s);
  }
  // ═══ DRIVER (TAGRA Trucker — not TAGRA III) ═══
  {
    let s = rd(P[l].driver);
    s = rep(s, /(<p class="lead anim-up"[^>]*>)([\s\S]*?)(<\/p>)/, (m, a, b, c) => {
      const t = b.trim(); const cut = Math.max(t.lastIndexOf('. '), t.lastIndexOf('</strong> '));
      if (cut < 0) fail(l + ' driver lead cut');
      const keep = t.slice(0, cut + (t[cut] === '.' ? 1 : '</strong>'.length));
      log.push(l + ' driver lead: removed "' + dec(t.slice(cut + 1)).slice(0, 90) + '"');
      return a + '\n' + keep + ' ' + esc(T.tr_hero_line) + '\n    ' + c;
    }, 1, l + ' driver lead');
    s = rep(s, /<div class="anim-up" style="margin-bottom:16px;transition-delay:\.15s">(\s*<a class="btn-cta" href="[^"]*\?audience=driver"[^>]*>[^<]*<\/a>)\s*<\/div>/, (m, a) => '<div class="anim-up" style="margin-bottom:16px;transition-delay:.15s;display:flex;flex-wrap:wrap;justify-content:center;gap:12px">' + a + '\n<a class="btn-outline" href="' + SHOP + 'tagra-trucker/" hreflang="en">' + esc(T.tr_hero_btn) + '</a>\n</div>', 1, l + ' driver hero cta');
    s = rep(s, /(<div class="bc s5 greenfill fly-right"[^>]*>\s*<div class="eyebrow"[^>]*>[^<]*<\/div>\s*<div class="bc-title">)[\s\S]*?(<\/div>\s*<div class="bc-text">)[^<]*(<\/div>)/, (m, a, b, c) => a + T.tr_bento_title + b + esc(T.tr_bento_text) + c, 1, l + ' driver bento');
    s = rep(s, /(<div class="feats">\s*<div class="fi"><div class="fck">[\s\S]*?<\/div>)<span>[\s\S]*?<\/span>(<\/div>)/, (m, a, b) => a + '<span>' + T.tr_feat_li + '</span>' + b, 1, l + ' driver feat');
    if (l !== 'fr') s = rep(s, /(<p style="margin-top:14px;font-size:15px;color:var\(--text2\)">Windows · [^·<]* · )[^<]*(<\/p>)/, (m, a, b) => a + esc(T.tr_trial_meta) + b, 1, l + ' driver trial meta');
    {
      const pr = s.indexOf('id="pricing"'); if (pr < 0) fail(l + ' driver pricing');
      const seg0 = s.slice(pr); const m = seg0.match(/<p style="margin:16px 0 24px">([\s\S]*?)<\/p>/); if (!m) fail(l + ' driver pricing p');
      const at = pr + m.index; s = s.slice(0, at) + '<p style="margin:16px 0 24px">' + linkShop(T.tr_pricing_p, SHOP + 'tagra-trucker/') + '</p>' + s.slice(at + m[0].length);
    }
    const row = (k, v, green) => '\n<div style="display:flex;justify-content:space-between;gap:16px;padding:14px 20px;border-bottom:1px solid var(--border)"><span style="color:var(--text2)">' + esc(k) + '</span><span style="font-weight:600' + (green ? ';color:var(--green-brand)' : '') + ';text-align:right">' + esc(v) + '</span></div>';
    s = rep(s, /(<div style="display:flex;justify-content:space-between;padding:14px 20px;border-bottom:1px solid var\(--border\)"><span style="color:var\(--text2\)">TAGRA Trucker<\/span><span style="font-weight:600">[^<]*<\/span><\/div>)/, (m, a) => a + row(T.tr_row_reader_k, T.tr_row_reader_v, true) + row(T.tr_row_ship_k, T.tr_row_ship_v), 1, l + ' driver rows');
    // JSON-LD Offer description
    let did = 0;
    for (const b of ldBlocks(s)) { const o = JSON.parse(b.text); walk(o, (n) => { if (n['@type'] === 'Offer' && typeof n.description === 'string' && !did) { s = swapLdString(s, n.description, n.description + ' ' + T.tr_offer_append, l + ' driver offer'); did++; } }); }
    if (!did) fail(l + ' driver offer missing');
    if (l === 'fr') {
      s = rep(s, /<section aria-label="[^"]*" class="band band--gray" id="pricing">/, () => '<section aria-label="' + T.fr_fix_aria_pricing + '" class="band band--gray" id="pricing">', 1, 'fr drv aria');
      s = rep(s, /<div class="eyebrow">Commander TAGRA Trucker — 49 € HT → &amp; Confirmation de commande et envoi de la licence par e-mail\.<\/div>/, () => '<div class="eyebrow">' + esc(T.fr_fix_eyebrow_pricing) + '</div>', 1, 'fr drv eyebrow');
      s = rep(s, /<h2 style="text-transform:none">Tarifs<br\/>Prix et conditions<\/h2>/, () => '<h2 style="text-transform:none">' + T.fr_fix_h2_pricing + '</h2>', 1, 'fr drv h2');
      s = rep(s, /(<a class="btn-cta btn-cta--sm" href="\/fr\/essai-gratuit\/\?audience=driver" rel="noopener" target="_blank">)Prêt pour les conducteurs de fourgon dès juillet 2026(<\/a>)/, (m, a, b) => a + esc(T.fr_fix_btn_trucker_trial) + b, 1, 'fr drv btn1');
      s = rep(s, /<h2>Télécharger l'essai<\/h2>\s*<p style="margin-top:8px;color:var\(--text2\)">ESSAYEZ TAGRA TRUCKER GRATUITEMENT PENDANT 30 JOURS<\/p>/, () => '<h2>ESSAYEZ TAGRA TRUCKER GRATUITEMENT PENDANT 30 JOURS</h2>\n<p style="margin-top:8px;color:var(--text2)">Téléchargez, installez et utilisez le programme complet. Sans carte bancaire.</p>', 1, 'fr drv trial h2');
      s = rep(s, /(<a class="btn-cta(?: btn-cta--sm)?" href="\/fr\/essai-gratuit\/\?audience=driver" rel="noopener" target="_blank">)Téléchargez, installez et utilisez le logiciel complet\. Sans carte bancaire\.(<\/a>)/, (m, a, b) => a + esc(T.fr_fix_btn_trial) + b, 2, 'fr drv trial btns');
      s = rep(s, /<p style="margin-top:14px;font-size:15px;color:var\(--text2\)">Télécharger la version d'essai<\/p>/, () => '<p style="margin-top:14px;font-size:15px;color:var(--text2)">Windows · Gratuit · ' + esc(T.tr_trial_meta) + '</p>', 1, 'fr drv trial meta');
      log.push('fr driver: fixed pricing aria/eyebrow/h2, trial section h2/p/meta, 3 trial buttons');
    }
    checkLd(s, l + ' driver');
    wr(P[l].driver, s);
  }
  // ═══ HOW IT WORKS ═══
  {
    let s = rd(P[l].hiw);
    s = rep(s, /(<p class="anim-up" style="font-size:21px;[^"]*">)([\s\S]*?)(<\/p>)/, (m, a, b, c) => a + b.replace(/\s+$/, '') + ' <strong>' + esc(T.hiw_lead_append) + '</strong>\n    ' + c, 1, l + ' hiw lead');
    s = rep(s, /(<p style="color:var\(--text2\);margin-top:6px;max-width:480px">)([\s\S]*?)(<\/p>)/, (m, a, b, c) => a + b.replace(/\s+$/, '') + ' ' + esc(T.tr_hiw_append) + c, 1, l + ' hiw trucker');
    const ft = s.indexOf('<footer'); const gi = s.lastIndexOf('<section class="band band--gray">', ft); if (gi < 0) fail(l + ' hiw gray');
    const ci = s.lastIndexOf('<!--', gi); const at = (ci > s.lastIndexOf('</section>', gi)) ? ci : gi;
    s = insertAt(s, at, shopBand(l).replace(/^\n/, ''));
    s = addCss(s); checkLd(s, l + ' hiw');
    wr(P[l].hiw, s);
  }
  // ═══ FOR WHOM ═══
  {
    let s = rd(P[l].who);
    s = rep(s, /(<div style="font-size:24px;font-weight:800;color:var\(--text-strong\);line-height:1\.2;margin-top:4px">)TAGRA 1 \/ 2 \/ 4 \/ 6 \/ MAX(<\/div>)/, (m, a, b) => a + 'TAGRA III<span class="t3p-sub">TAGRA 1 / 2 / 4 / 6 / MAX</span>' + b, 1, l + ' who heading');
    s = rep(s, /(<div class="who-card who-card--driver[\s\S]*?<p style="color:var\(--text2\)">)([\s\S]*?)(<\/p>)/, (m, a, b, c) => a + b.replace(/\s+$/, '') + ' ' + esc(T.tr_fleet_box_append) + c, 1, l + ' who driver');
    const g = s.indexOf('<div class="g3">'); const e = s.indexOf('</section>', g); if (g < 0 || e < 0) fail(l + ' who g3');
    s = insertAt(s, e + '</section>'.length, shopBand(l));
    s = addCss(s); checkLd(s, l + ' who');
    wr(P[l].who, s);
  }
  // ═══ FAQ ═══
  {
    let s = rd(P[l].faq);
    // reader answer (old: "recommend a model") -> answer from the driver page (free reader + shipping)
    const rq = findDetails(s, (sm, a) => /USB/.test(sm) && /TAGRA Trucker/.test(sm), l + ' faq reader')[0];
    const oldR = faqLdAnswer(s, rq.summary);
    s = s.slice(0, rq.aStart) + x.rdq.inner + s.slice(rq.aStart + rq.inner.length);
    if (oldR) s = swapLdString(s, oldR, dec(x.rdq.inner), l + ' faq reader ld'); else log.push(l + ' faq: reader Q not in JSON-LD');
    // buy answer
    const bq = findDetails(s, (sm, a) => /QR/.test(a) && /MAX/.test(a), l + ' faq buy')[0];
    const oldB = faqLdAnswer(s, bq.summary);
    s = s.slice(0, bq.aEnd).replace(/\s+$/, '') + ' ' + linkShop(T.faq_buy_append, SHOP) + s.slice(bq.aEnd);
    if (oldB) s = swapLdString(s, oldB, oldB + ' ' + T.faq_buy_append, l + ' faq buy ld'); else log.push(l + ' faq: buy Q not in JSON-LD');
    // new questions at the top of the first FAQ group
    const fi = s.indexOf('<div class="faq">'); if (fi < 0) fail(l + ' faq div');
    const onlineA = esc(T.faq_online_a).replace('TAGRA Shop', '\u0001').replace('shop.tagra.app', '\u0002').replace('\u0001', '<a href="' + SHOP + '" hreflang="en">TAGRA Shop</a>').replace('\u0002', '<a href="' + SHOP + '" hreflang="en">shop.tagra.app</a>');
    s = insertAt(s, fi + '<div class="faq">'.length, '\n' + detailsHtml(x.t3q.summary, x.t3q.inner) + detailsHtml(esc(T.faq_online_q), onlineA).replace(/\n$/, ''));
    s = insertLdFaq(s, [[dec(x.t3q.summary), dec(x.t3q.inner)], [T.faq_online_q, T.faq_online_a]], l + ' faq ld');
    const ft = s.indexOf('<footer'); const se = s.lastIndexOf('</section>', ft); if (se < 0) fail(l + ' faq end');
    s = insertAt(s, se + '</section>'.length, shopBand(l));
    s = addCss(s); checkLd(s, l + ' faq');
    wr(P[l].faq, s);
  }
  // ═══ TRY ═══
  {
    let s = rd(P[l].try);
    s = rep(s, /(<p class="try-help" style="margin-top:10px">[\s\S]*?)(<\/p>)/, (m, a, b) => a.replace(/\s*→\s*<\/a>\s*$/, '</a>') + ' · <a href="' + SHOP + 'tagra-trucker/" hreflang="en">' + x.buy + '</a>' + b + '\n<p class="try-help" style="margin-top:10px">' + linkShop(T.try_shop, SHOP) + '</p>', 1, l + ' try help');
    checkLd(s, l + ' try');
    wr(P[l].try, s);
  }
  // ═══ THANKS: download button names TAGRA III (the file is TAGRA_III.zip) ═══
  {
    let s = rd(P[l].thanks);
    s = rep(s, /(<span id="downloadLabel">)([^<]*)(<\/span>)/, (m, a, b, c) => a + b.replace(/\bTAGRA\b(?! III| TRUCKER)/, 'TAGRA III') + c, 1, l + ' thanks label');
    // dict entries: only for en/de/fr/it/pl/nl/ro/el blocks (never cs/sk/hu)
    s = s.replace(/"download_tagra":\s*"([^"]*)"/g, (m, v, off) => {
      const before = s.slice(0, off); const km = [...before.matchAll(/"([a-z]{2})"\s*:\s*\{/g)].pop();
      if (!km || !LANGS.includes(km[1])) return m;
      return m.replace(v, v.replace(/\bTAGRA\b(?! III| TRUCKER)/, 'TAGRA III'));
    });
    wr(P[l].thanks, s);
  }
  // ═══ ENFORCEMENT: DOWNLOAD BOX II S can now be bought in the shop ═══
  {
    let s = rd(P[l].enf);
    s = rep(s, /(<div class="device-specs">(?:\s*<div class="dspec">[\s\S]*?<\/div>)+\s*<\/div>)/, (m, a) => a + '\n<div style="margin-top:20px;display:flex;flex-wrap:wrap;gap:12px"><a class="btn-cta btn-cta--sm" href="' + SHOP + 'download-box-ii-s/" hreflang="en">' + x.buy + '</a></div>', 1, l + ' enf device');
    wr(P[l].enf, s);
  }
  // ═══ INSTALL MANUAL ═══
  {
    let s = rd(P[l].inst);
    s = rep(s, /<div class="tmx-keys"><p>[\s\S]*?<\/p><a class="tmx-btn" href="https:\/\/www\.truckmall\.cz"[^>]*>[^<]*<\/a><\/div>/, () => '<div class="tmx-keys"><p>' + linkShop(T.install_keys_p, SHOP + 'download-devices/') + '</p><a class="tmx-btn" href="' + SHOP + 'download-devices/" hreflang="en">' + esc(T.install_keys_btn) + '</a></div>', 1, l + ' inst keys');
    s = rep(s, /(<div class="tmx-tldr">[\s\S]*?<\/div>)/, (m, a) => a + '<div class="tmx-keys"><p>' + esc(T.install_t3_p) + '</p><a class="tmx-btn" href="https://www.tdt.cz/download/TAGRA_III.zip" rel="noopener">' + esc(T.install_t3_btn) + '</a></div>', 1, l + ' inst t3');
    checkLd(s, l + ' inst');
    wr(P[l].inst, s);
  }
}

// ═══ FOOTER: "TAGRA Shop" link in the Product column on every non-HU, non-CZ/SK page ═══
function walkDir(d, out) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (['.git', 'node_modules', 'hu'].includes(e.name) && d === '.') continue; walkDir(p, out); } else if (e.name.endsWith('.html')) out.push(p); } return out; }
const skip = /^(hu\/|privacy\/(cz|sk)\/|try\/(cz|sk)\/|try\/email-preview\/|docs\/|tools\/|netlify\/|node_modules\/)/;
let fcount = 0;
for (const p of walkDir('.', []).map((p) => p.replace(/^\.\//, '')).sort()) {
  if (skip.test(p)) continue;
  let s = fs.readFileSync(p, 'utf8');
  const fi = s.indexOf('<footer class="site-footer"'); if (fi < 0) continue;
  if (s.includes('href="https://shop.tagra.app/" hreflang="en">TAGRA Shop</a></li>')) continue;
  const ci = s.indexOf('<div class="footer-col">', fi); const ue = s.indexOf('</ul>', ci);
  if (ci < 0 || ue < 0) { log.push('footer: no product column in ' + p); continue; }
  s = insertAt(s, ue, '<li><a href="https://shop.tagra.app/" hreflang="en">TAGRA Shop</a></li>\n');
  fs.writeFileSync(p, s); touched.add(p); fcount++;
}
fs.writeFileSync('assets/css/t3-promo.css', CSS); touched.add('assets/css/t3-promo.css');
for (const t of touched) if (/^hu\//.test(t) || t === 'assets/js/shop.js') fail('touched forbidden ' + t);
console.log(log.join('\n'));
console.log('footer links: ' + fcount + ', files touched: ' + touched.size);
console.log('ok');
