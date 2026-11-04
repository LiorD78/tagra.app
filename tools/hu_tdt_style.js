#!/usr/bin/env node
/* tagra.app/hu/ – přiblížení maďarské verze novému webu tdt.cz (3. 11. 2026)
   Deterministický jednorázový skript (node, bez závislostí). Spouští se z kořene
   repa: `node tools/hu_tdt_style.js`. Na každé změně ověřuje přesný počet výskytů
   a při neshodě skončí chybou – nic nedělá „napůl“ potichu.
   Co dělá:
     1. stáhne 3D ikony a USP ikony z www.tdt.cz do assets/img/hu/ (ověří SHA-256)
     2. všechny hu/.../index.html: nové menu podle tdt.cz (podnabídky TAGRA program
        a Ügyfeleinknek), odkaz na assets/css/hu.css, odkaz Letöltések v patičce,
        recenze bez „TRUCKMALL“
     3. hu/index.html: tlačítka v hero, USP lišta, „Meglévő ügyfeleinknek“,
        pruh TAGRA III, dlaždice produktů a služeb, nákup u Rukon Kft.
     4. nová stránka hu/letoltesek/ (současná TAGRA + TAGRA III + ovladače)
     5. odstranění DOWNLOAD BOX II S Wi-Fi (letoltokulcs, letolto-eszkozok,
        tavoli-letoltes) a TAGRA Trucker „včetně USB čtečky karty“
     6. sitemap.xml + tools/i18n.py
   Maďarské texty připravila crew (GPT + Gemini, rozhodčí Grok). */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const P = (...a) => path.join(ROOT, ...a);
const read = (f) => fs.readFileSync(P(f), 'utf8');
const write = (f, s) => { fs.mkdirSync(path.dirname(P(f)), { recursive: true }); fs.writeFileSync(P(f), s); };

function count(s, sub) { let n = 0, i = 0; while ((i = s.indexOf(sub, i)) !== -1) { n++; i += sub.length; } return n; }
function rep(s, from, to, n = 1, where = '') {
  const c = count(s, from);
  if (c !== n) throw new Error(`${where}: expected ${n}× but found ${c}× of: ${from.slice(0, 120)}`);
  return s.split(from).join(to);
}

/* ---------- 1. ikony z tdt.cz ---------- */
const ICON_SHA = {
  'qz-ke-stazeni.webp': 'd9d30f014f0e120843ea5a44aee7315b35e83670a48ebfc65abb560175208280',
  'qz-aktivace-licence.webp': '543b0fbd1ac2f94fe52a5c041799ebd150f893d2ce7fd4ad58b10cd8317c2bae',
  'qz-caste-dotazy.webp': 'ba0b631bac9f9bda54531945b7c9f1b944a65c373bae0f6778deb5ff35c8b4b3',
  'qz-navody.webp': 'd93172e086006333c49bf4cdc88514001e3bf61262349922a9e47e4dd8370b36',
  'qz-kontakty.webp': '83e1c828f4632e34fdb0722660e59e7e18f25e6081432686a41c9a098cfcc665',
  'ico-tachograf-stahovani.webp': '8f78a3b19cfd71ab8ee49410e7d859e9f797e0b28e30cbed179c74ae205b4494',
  'ico-gps-tacho.webp': '32677fd7cc448e1eeac85a692f39275dfdc300f47119c8128d393891f13fa7b4',
  'ico-u-vas.webp': 'c1481b5dcdc3efa76b6368f23e3fac63babcfa0dac331227e38b0e629370066e',
  'ico-ridic.webp': 'e1e94bfb692129f1eeb385b65c0031b570852eed4c65fcb4aa13f33b4fdc8085',
  'usp-21-let-flat.webp': '5d1247419796d5055a4ed67e3acae7c06747136653fd8d7081329971ffd73870',
  'usp-jednicka-palec-flat.webp': '07e752bf01ee7f76f411f06a2ea31b0ea9a7eca243fd949623305f4c2d420790',
  'usp-truck-eshop-flat.webp': '3ae1bf028300c04e08415e523d5527e2c9ce95adbf8c767ecaaf05703063db4f',
};
const ICON_LIST = [
  ['ikony', 'qz-ke-stazeni.webp'], ['ikony', 'qz-aktivace-licence.webp'], ['ikony', 'qz-caste-dotazy.webp'],
  ['ikony', 'qz-navody.webp'], ['ikony', 'qz-kontakty.webp'], ['ikony', 'ico-tachograf-stahovani.webp'],
  ['ikony', 'ico-gps-tacho.webp'], ['ikony', 'ico-u-vas.webp'], ['ikony', 'ico-ridic.webp'],
  ['usp', 'usp-21-let-flat.webp'], ['usp', 'usp-jednicka-palec-flat.webp'], ['usp', 'usp-truck-eshop-flat.webp'],
];
async function fetchIcons() {
  for (const [dir, name] of ICON_LIST) {
    const out = `assets/img/hu/${name}`;
    const url = `https://www.tdt.cz/assets/img/${dir}/${name}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`download ${url}: HTTP ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    const h = crypto.createHash('sha256').update(buf).digest('hex');
    if (h !== ICON_SHA[name]) throw new Error(`sha256 mismatch ${name}: ${h}`);
    fs.mkdirSync(path.dirname(P(out)), { recursive: true });
    fs.writeFileSync(P(out), buf);
  }
}

/* ---------- maďarské texty (crew) ---------- */
const T = {
  nav_program: 'TAGRA program',
  sub_fleet_t: 'Fuvarozóknak és cégeknek', sub_fleet_d: '1 járműtől korlátlan flottáig – az új TAGRA III',
  sub_driver_t: 'Sofőröknek', sub_driver_d: 'TAGRA TRUCKER a saját sofőrkártyához',
  sub_enf_t: 'Hatóságoknak', sub_enf_d: 'TAGRA Control rendőrségnek, ellenőrző hatóságoknak',
  sub_train_t: 'TAGRA-oktatás', sub_train_d: 'Munkatársainak – online vagy az Ön telephelyén',
  nav_devices: 'Letöltő eszközök', nav_gps: 'GPS nyomkövetés', nav_eval: 'Adatkiértékelés', nav_articles: 'Cikkek',
  nav_customers: 'Ügyfeleinknek', nav_contact: 'Kapcsolat',
  sub_dl_t: 'Letöltések', sub_dl_d: 'TAGRA, TAGRA III, illesztőprogramok és távsegítség',
  sub_man_t: 'Kézikönyvek', sub_man_d: 'Útmutatók lépésről lépésre',
  sub_faq_t: 'GYIK', sub_faq_d: 'Válaszok a leggyakoribb kérdésekre',
  sub_lic_t: 'Licencek', sub_lic_d: 'Licenc aktiválása, megújítása és bővítése',
};

/* ---------- 2. menu ---------- */
function navFor(rel, ctaLi) {
  const page = '/' + rel.replace(/index\.html$/, '');
  const cur = (href) => (href === page ? ' aria-current="page"' : '');
  const top = (href, label, extra) => `<li><a${extra || cur(href)} href="${href}">${label}</a></li>`;
  const sub = (href, t, d) => `<li><a${cur(href)} href="${href}"><strong>${t}</strong><span>${d}</span></a></li>`;
  const inArticles = page.startsWith('/hu/cikkek/');
  return '<ul class="nav-links" id="nav-links">\n'
    + `<li class="has-sub"><a href="/hu/fuvarozoknak/">${T.nav_program}</a><ul class="sub">`
    + sub('/hu/fuvarozoknak/', T.sub_fleet_t, T.sub_fleet_d)
    + sub('/hu/soforoknek/', T.sub_driver_t, T.sub_driver_d)
    + sub('/hu/hatosagoknak/', T.sub_enf_t, T.sub_enf_d)
    + sub('/hu/tagra-oktatas-cegeknek/', T.sub_train_t, T.sub_train_d)
    + '</ul></li>\n'
    + top('/hu/letolto-eszkozok/', T.nav_devices) + '\n'
    + top('/hu/gps-nyomkovetes/', T.nav_gps) + '\n'
    + top('/hu/tachograf-adatkiertekeles/', T.nav_eval) + '\n'
    + top('/hu/cikkek/', T.nav_articles, inArticles ? ' aria-current="page"' : '') + '\n'
    + `<li class="has-sub"><a href="/hu/letoltesek/">${T.nav_customers}</a><ul class="sub">`
    + sub('/hu/letoltesek/', T.sub_dl_t, T.sub_dl_d)
    + sub('/hu/kezikonyvek/', T.sub_man_t, T.sub_man_d)
    + sub('/hu/gyakori-kerdesek/', T.sub_faq_t, T.sub_faq_d)
    + sub('/hu/letoltesek/#licenc', T.sub_lic_t, T.sub_lic_d)
    + '</ul></li>\n'
    + top('/hu/kapcsolat/', T.nav_contact) + '\n'
    + (ctaLi ? ctaLi + '\n' : '')
    + '</ul>';
}

function walk(dir) {
  let out = [];
  for (const e of fs.readdirSync(P(dir), { withFileTypes: true })) {
    const r = path.posix.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(r));
    else if (e.name === 'index.html') out.push(r);
  }
  return out;
}

const CSS_LINK = '<link href="/assets/css/hu.css?v=20261103" rel="stylesheet"/>';

function common(rel, s) {
  // menu
  const OPEN = '<ul class="nav-links" id="nav-links">';
  if (count(s, OPEN) !== 1) throw new Error(rel + ': nav-links ul count ' + count(s, OPEN));
  const a = s.indexOf(OPEN);
  let depth = 0, i = a, b = -1;
  const re = /<ul\b|<\/ul>/g; re.lastIndex = a;
  for (let m; (m = re.exec(s));) { depth += m[0] === '</ul>' ? -1 : 1; if (depth === 0) { b = m.index + 5; break; } }
  if (b < 0) throw new Error(rel + ': unbalanced nav-links');
  void i;
  const old = s.slice(a, b);
  const cta = (old.match(/<li class="nav-cta-li">[\s\S]*?<\/li>/) || [null])[0];
  s = s.slice(0, a) + navFor(rel, cta) + s.slice(b);
  // CSS
  if (!s.includes('/assets/css/hu.css')) s = rep(s, '</head>', CSS_LINK + '\n</head>', 1, rel);
  // patička: Letöltések pod Kézikönyvek
  const fi = s.indexOf('<footer class="site-footer"');
  if (fi === -1) throw new Error(rel + ': no footer');
  let foot = s.slice(fi);
  const k = '<li><a href="/hu/kezikonyvek/">Kézikönyvek</a></li>';
  if (count(foot, k) === 1 && !foot.includes('/hu/letoltesek/')) {
    foot = foot.replace(k, k + '<li><a href="/hu/letoltesek/">Letöltések</a></li>');
    s = s.slice(0, fi) + foot;
  }
  // recenze bez TRUCKMALL
  s = s.split('<p class="rev-meta">Ellenőrzött TRUCKMALL ügyfél</p>').join('<p class="rev-meta">Ellenőrzött ügyfél</p>');
  return s;
}

/* ---------- 3. úvodní stránka ---------- */
const HOME_HERO_CTA = `<div class="cta-row hu-hero-cta anim-up" style="transition-delay:.15s"><a class="btn-cta" href="/hu/ingyenes-probaverzio/?audience=fleet">Próbálja ki 30 napig ingyen</a><a class="btn-glass" href="#tagra-iii-hu"><b>Újdonság:</b> TAGRA III</a></div>
`;
const HOME_TOP = `<!-- ═══ USP (jako tdt.cz) ═══ -->
<section aria-label="Miért TAGRA" class="band--usp"><div class="usp-bar"><a class="usp-item" href="/hu/hatosagoknak/"><span class="usp-img"><img alt="" decoding="async" height="60" src="/assets/img/hu/usp-jednicka-palec-flat.webp" width="60"/></span><span class="usp-text"><strong>A gyakorlatban bevált</strong>Hatóságok és fuvarozók ezreinek bizalma.</span></a><a class="usp-item" href="/hu/tachograf-tanacsadas/"><span class="usp-img"><img alt="" decoding="async" height="60" src="/assets/img/hu/usp-21-let-flat.webp" width="60"/></span><span class="usp-text"><strong>21 év tapasztalat</strong>Értünk hozzá. Segítünk. Megoldjuk.</span></a><a class="usp-item" href="/hu/cikkek/tachograf-furgon-kotelezettseg-2026/"><span class="usp-img"><img alt="" decoding="async" height="60" src="/assets/img/hu/usp-truck-eshop-flat.webp" width="60"/></span><span class="usp-text"><strong>Kisteherautókra készen</strong>Tachográf 2,5–3,5 t-hoz: 2026.&nbsp;07.&nbsp;01&#8209;től</span></a><a class="usp-item" href="/hu/kapcsolat/"><span class="usp-img"><img alt="" decoding="async" height="60" src="/assets/img/hu/usp-hu-flat.svg" width="60"/></span><span class="usp-text"><strong>Vásárlás, magyar támogatás</strong>Budapesti partnerünknél, a&nbsp;Rukon&nbsp;Kft.-nél</span></a></div></section>
<!-- ═══ MEGLÉVŐ ÜGYFELEINKNEK (jako tdt.cz) ═══ -->
<section aria-label="Meglévő ügyfeleinknek" class="band--qz"><div class="container"><h2 class="qz-t">Meglévő ügyfeleinknek</h2><div class="qz-grid"><a class="qz-item" data-track="qz-letoltesek" href="/hu/letoltesek/"><img alt="" class="qz-ico" decoding="async" height="256" loading="lazy" src="/assets/img/hu/qz-ke-stazeni.webp" width="256"/><span><strong>Letöltések</strong>TAGRA, TAGRA III és illesztőprogramok</span></a><a class="qz-item" data-track="qz-licenc" href="/hu/letoltesek/#licenc"><img alt="" class="qz-ico" decoding="async" height="256" loading="lazy" src="/assets/img/hu/qz-aktivace-licence.webp" width="256"/><span><strong>Licencek</strong>Licenc aktiválása és megújítása</span></a><a class="qz-item" data-track="qz-gyik" href="/hu/gyakori-kerdesek/"><img alt="" class="qz-ico" decoding="async" height="256" loading="lazy" src="/assets/img/hu/qz-caste-dotazy.webp" width="256"/><span><strong>GYIK</strong>Válaszok a leggyakoribb kérdésekre</span></a><a class="qz-item" data-track="qz-kezikonyvek" href="/hu/kezikonyvek/"><img alt="" class="qz-ico" decoding="async" height="256" loading="lazy" src="/assets/img/hu/qz-navody.webp" width="256"/><span><strong>Kézikönyvek</strong>Útmutatók lépésről lépésre</span></a><a class="qz-item" data-track="qz-kapcsolat" href="/hu/kapcsolat/"><img alt="" class="qz-ico" decoding="async" height="256" loading="lazy" src="/assets/img/hu/qz-kontakty.webp" width="256"/><span><strong>Kapcsolat</strong>Értékesítés és műszaki támogatás</span></a></div></div></section>
<!-- ═══ TAGRA III ═══ -->
<section aria-labelledby="t3-hu-title" class="hu-t3" id="tagra-iii-hu"><div class="container"><div class="hu-t3-grid">
<div class="anim-up"><span class="eyebrow"><span class="t3-new">Újdonság</span></span><h2 id="t3-hu-title">TAGRA III – a sikeres TAGRA program legújabb generációja</h2><p class="t3-lead">Minden lényeges információ egyetlen felületen: az új áttekintő nézet azonnal mutatja, mire kell figyelnie – szabálysértések, letöltési határidők, lejáró kártyák és tachográf-kalibrálások –, még mielőtt az ellenőrzés felfedezné.</p>
<ul class="t3-list"><li>Minden szabálysértés jogszabályi hivatkozással és teendőkkel</li><li>Áttekinthető feladatlista: letöltések, kártyaérvényesség, kalibrálás</li><li>Munkaidő-kiértékelés a magyar, cseh és szlovák szabályok szerint</li><li>Korszerű kezelés, ellenőrzésre kész kimutatások</li></ul>
<div class="cta-row"><a class="btn-cta" href="/hu/ingyenes-probaverzio/?audience=fleet">Próbálja ki ingyen a TAGRA III-at</a><a class="btn-outline" href="/hu/fuvarozoknak/">Bővebben a TAGRA III-ról</a></div>
<div class="hu-t3-note"><strong>Már használja a TAGRA programot?</strong><p>Használja tovább a megszokott TAGRA programot – változatlanul működik. A TAGRA III folyamatosan fejlődik, de még nem tartalmaz minden megszokott funkciót, és magyarul egyelőre nem érhető el. Jelenleg angol, német, olasz, francia, cseh és szlovák nyelven használható. A jelenlegi verzió mellett is nyugodtan kipróbálhatja. <a href="/hu/letoltesek/">Letöltések →</a></p></div></div>
<figure class="hu-t3-shot anim-up"><img alt="TAGRA III áttekintés – adatbetöltés, járművezetők és járművek feladatokkal, adatexport ellenőrzéshez" decoding="async" height="939" loading="lazy" sizes="(max-width: 900px) 100vw, 600px" src="/assets/img/tagra3/tagra3-overview-960.webp" srcset="/assets/img/tagra3/tagra3-overview-960.webp 960w, /assets/img/tagra3/tagra3-overview.webp 1402w" width="1402"/></figure>
</div></div></section>
`;
const HOME_TILES = `<!-- ═══ PRODUKTY A SLUŽBY (jako tdt.cz) ═══ -->
<section aria-labelledby="hu-tiles-title" class="hu-tiles"><div class="container"><div class="hu-tiles-h"><h2 id="hu-tiles-title">Minden a tachográfadatok kezeléséhez</h2></div>
<div class="tile-grid"><a class="tile" href="/hu/fuvarozoknak/"><h3 class="tile-h-logo"><img alt="TAGRA program" decoding="async" height="32" loading="lazy" src="/assets/img/logo-light.svg?v=20260513zh" width="140"/></h3><p>Program a tachográfok és sofőrkártyák adatainak letöltéséhez, archiválásához és kiértékeléséhez – kis és nagy fuvarozóknak, sofőröknek és ellenőrző hatóságoknak.</p><span class="tile-more">Bővebben →</span></a><a class="tile tile--ico" href="/hu/letolto-eszkozok/"><img alt="" class="tile-ico" decoding="async" height="256" loading="lazy" src="/assets/img/hu/ico-tachograf-stahovani.webp" width="256"/><h3>Tachográfadatok letöltése</h3><p>Eszközök a digitális tachográfok és sofőrkártyák adatainak kézi és távoli letöltéséhez.</p><span class="tile-more">Bővebben →</span></a><a class="tile tile--ico" href="/hu/gps-nyomkovetes/"><img alt="" class="tile-ico" decoding="async" height="256" loading="lazy" src="/assets/img/hu/ico-gps-tacho.webp" width="256"/><h3>GPS nyomkövetés</h3><p>GPS-alapú járműkövetés elektronikus menetlevéllel – EUTracker.</p><span class="tile-more">Bővebben →</span></a><a class="tile tile--ico" href="/hu/tachograf-adatkiertekeles/"><img alt="" class="tile-ico" decoding="async" height="256" loading="lazy" src="/assets/img/hu/ico-u-vas.webp" width="256"/><h3>Adatkiértékelés és oktatás</h3><p>Kiértékeljük az adatokat Ön helyett, betanítjuk munkatársait, és segítünk eligazodni a jogszabályokban.</p><span class="tile-more">Bővebben →</span></a></div>
<div class="callout-cta"><p>A tachográfadatok letöltéséhez <strong>vállalkozáskártyára</strong> van szüksége, amellyel feloldhatja a tachográf zárolását. Cikkünkből megtudhatja, hogyan igényelheti Magyarországon. <a href="/hu/cikkek/vallalkozaskartya-tachograf/">Hogyan igényelhet vállalkozáskártyát? →</a></p></div>
</div></section>
`;
const BUY_BAND = `<!-- ═══ NÁKUP U RUKON KFT. ═══ -->
<section aria-labelledby="hu-buy-title" class="hu-buy"><div class="container"><div class="hu-buy-card anim-up">
<div><span class="eyebrow">Vásárlás Magyarországon</span><h2 id="hu-buy-title">Mindent beszerezhet partnerünknél, a&nbsp;Rukon&nbsp;Kft.&#8209;nél</h2><p>A TAGRA programot és a licenceket, a letöltőkulcsokat, a távoli letöltési megoldásokat és a GPS nyomkövetést Magyarországon hivatalos partnerünk, a <strong>Rukon Kft.</strong> kínálja – magyar nyelvű tanácsadással és támogatással.</p></div>
<div class="hu-buy-contact"><div class="who">Varga Katalin — Rukon Kft.</div><div class="addr">1101 Budapest, Albertirsai út 2–4.</div><a class="tel" href="tel:+36304742540">+36 30 474 2540</a><a class="mail" href="mailto:rukon@rukon.hu">rukon@rukon.hu</a><div class="cta-row"><a class="btn-cta" href="/hu/kapcsolat/">Kérjen ajánlatot</a><a class="btn-glass-w" href="tel:+36304742540">Telefonáljon</a></div></div>
</div></div></section>
`;

function home(s) {
  const W = 'hu/index.html';
  s = rep(s, '</div>\n</div>\n</section>\n<!-- ═══ PICKER (3 audience cards)', '</div>\n' + HOME_HERO_CTA + '</div>\n</section>\n' + HOME_TOP + '<!-- ═══ PICKER (3 audience cards)', 1, W);
  s = rep(s, '<!-- ═══ UI SHOWCASE', HOME_TILES + '<!-- ═══ UI SHOWCASE', 1, W);
  s = rep(s, '<!-- ═══ FAQ TEASER', BUY_BAND + '<!-- ═══ FAQ TEASER', 1, W);
  // TAGRA Trucker – USB čtečka karty v balení
  s = rep(s, 'segítségével — standard USB kártyaolvasóval.</p>', 'segítségével — a csomagban található USB-kártyaolvasóval.</p>', 1, W);
  s = rep(s, '<li>Standard USB kártyaolvasóval működik</li>', '<li>USB-kártyaolvasó a csomagban</li>', 1, W);
  s = rep(s, 'vezetési és pihenőidejük ellenőrzésére. Szabványos USB-kártyaolvasóval működik."', 'vezetési és pihenőidejük ellenőrzésére. USB-kártyaolvasóval együtt szállítjuk."', 1, W);
  return s;
}

/* ---------- 5. Wi-Fi / Trucker / TRUCKMALL na dalších stránkách ---------- */
function letoltokulcs(s) {
  const W = 'hu/letoltokulcs/index.html';
  s = rep(s, 'Webáruházunkban háromféle megoldást kínálunk a tachográfadatok számítógépre való letöltésére. Minden változat másfajta üzemmódra készült – válassza ki az igényeinek megfelelőt.',
    'Két megoldást kínálunk a tachográfadatok számítógépre történő letöltéséhez. Mindkettő más működési igényekhez igazodik – válassza az Önnek megfelelőt.', 1, W);
  // srovnávací tabulka: pryč sloupec DBII-S Wi-Fi
  const th = /\n\s*<th class="col-iis" style="width: 26%;">\s*<span class="winner-badge-green">Vezeték nélkül<\/span>\s*<span[^>]*>DBII-S Wi-Fi<\/span>\s*<\/th>/;
  if (!th.test(s)) throw new Error(W + ': Wi-Fi th not found');
  s = s.replace(th, '');
  const t0 = s.indexOf('<table class="compare-table">'), t1 = s.indexOf('</table>', t0);
  let tbl = s.slice(t0, t1);
  let removed = 0;
  tbl = tbl.replace(/<tr>[\s\S]*?<\/tr>/g, (tr) => {
    const lines = tr.split('\n');
    const idx = lines.map((l, i) => (/^\s*<td class="col-iis">.*<\/td>\s*$/.test(l) ? i : -1)).filter((i) => i >= 0);
    if (idx.length !== 2) return tr;
    removed++;
    lines.splice(idx[1], 1);
    return lines.join('\n');
  });
  if (removed !== 7) throw new Error(W + ': expected 7 Wi-Fi cells, removed ' + removed);
  tbl = rep(tbl, '<th style="width: 22%;"></th>', '<th style="width: 22%;"></th>', 1, W);
  tbl = rep(tbl, '<th class="col-iis" style="width: 26%;">', '<th class="col-iis" style="width: 39%;">', 1, W);
  tbl = rep(tbl, '<th class="col-dbr-soft" style="width: 26%;">', '<th class="col-dbr-soft" style="width: 39%;">', 1, W);
  s = s.slice(0, t0) + tbl + s.slice(t1);
  const pa = s.indexOf('Minden változat arra való, amire tervezték:');
  const pb = s.indexOf('</p>', pa);
  if (pa === -1 || count(s, 'Minden változat arra való, amire tervezték:') !== 1) throw new Error(W + ': cmp_after');
  s = s.slice(0, pa) + 'Mindegyik megoldásnak megvan a maga helye: a <a href="/hu/letoltokulcs/">DBII-S</a> bevált letöltőkulcs a kézi letöltéshez, a <a href="/hu/tavoli-letoltes/">DOWNLOAD BOX REMOTE</a> pedig teljesen automatikusan tölti le az adatokat, anélkül, hogy Önnek a járművekhez kellene mennie. A telephelyen kialakított fix letöltési ponthoz a <a href="/hu/letolto-eszkozok/">DOWNLOAD STATION</a> is rendelkezésre áll.\n                    ' + s.slice(pb);
  // FAQ (HTML + schema): Wi-Fi otázka -> rozdíl oproti DOWNLOAD BOX REMOTE
  const Q = 'Mi a különbség e letöltőkulcs és a DOWNLOAD BOX REMOTE között?';
  const A = 'A DOWNLOAD BOX II S hordozható letöltőkulcs: az adatokat közvetlenül a járműnél tölti le, majd USB-kábellel másolja át a számítógépre. A DOWNLOAD BOX REMOTE fixen beépített egység, amely a tachográf és a sofőrkártya adatait automatikusan, távolról, mobilhálózaton keresztül tölti le – anélkül, hogy a járműhöz kellene mennie. Mindkét megoldás beépítetten támogatja a G2V2 intelligens tachográfokat.';
  const AH = 'A DOWNLOAD BOX II S hordozható letöltőkulcs: az adatokat közvetlenül a járműnél tölti le, majd <strong>USB-kábellel</strong> másolja át a számítógépre. A <a href="/hu/tavoli-letoltes/">DOWNLOAD BOX REMOTE</a> fixen beépített egység, amely a tachográf és a sofőrkártya adatait <strong>automatikusan, távolról</strong>, mobilhálózaton keresztül tölti le – anélkül, hogy a járműhöz kellene mennie. Mindkét megoldás beépítetten támogatja a G2V2 intelligens tachográfokat.';
  s = rep(s, '<summary>Mi a különbség e letöltőkulcs és a Wi-Fi verzió között?</summary>', `<summary>${Q}</summary>`, 1, W);
  const fa = s.indexOf('<div class="faq-a"> <p>Ez az alapváltozat (II S) <strong>USB-kábelen</strong>');
  const fb = s.indexOf('</p> </div>', fa);
  if (fa === -1 || fb === -1) throw new Error(W + ': faq html');
  s = s.slice(0, fa) + `<div class="faq-a"> <p>${AH}` + s.slice(fb);
  const qa = s.indexOf('{"@type": "Question", "name": "Mi a különbség e letöltőkulcs és a Wi-Fi verzió között?"');
  const qb = s.indexOf('"}}', qa);
  if (qa === -1 || qb === -1) throw new Error(W + ': faq schema');
  s = s.slice(0, qa) + `{"@type": "Question", "name": "${Q}", "acceptedAnswer": {"@type": "Answer", "text": "${A}` + s.slice(qb);
  if (/wi-?fi/i.test(s)) throw new Error(W + ': Wi-Fi still present');
  return s;
}

function letoltoEszkozok(s) {
  return rep(s, '<li>Wi-Fi változat: automatikus feltöltés</li>', '', 1, 'hu/letolto-eszkozok/index.html');
}

function tavoliLetoltes(s) {
  const W = 'hu/tavoli-letoltes/index.html';
  const re = /<div class="tc-val" style="align-items: flex-start;">\s*<span class="tb-icon tb-icon--gray-check"><\/span>\s*<div>\s*Kábellel<br>\s*<span[^>]*>\(esetleg Wi-Fi-n keresztül\)<\/span>\s*<\/div>\s*<\/div>/g;
  const m = s.match(re);
  if (!m || m.length !== 1) throw new Error(W + ': Wi-Fi cell ' + (m ? m.length : 0));
  return s.replace(re, '<div class="tc-val"><span class="tb-icon tb-icon--gray-check"></span> Kábellel</div>');
}

function soforoknek(s) {
  const W = 'hu/soforoknek/index.html';
  s = rep(s, 'bármilyen közúti ellenőrzés előtt. Sofőrkártya-letöltés szabványos USB-kártyaolvasóval.</p>', 'bármilyen közúti ellenőrzés előtt. Sofőrkártya-letöltés a csomagban található USB-kártyaolvasóval.</p>', 1, W);
  s = rep(s, '<div class="bc-title">Standard USB<br/>kártyaolvasó</div>', '<div class="bc-title">USB-kártyaolvasó<br/>a csomagban</div>', 1, W);
  s = rep(s, '<span><strong>Standard USB kártyaolvasó</strong> — csatlakoztassa, olvassa be kártyáját, kész</span>', '<span><strong>USB-kártyaolvasó a csomagban</strong> — csatlakoztassa, olvassa be sofőrkártyáját, kész</span>', 1, W);
  return s;
}

function fuvarozoknak(s) {
  return rep(s, 'A TAGRA Trucker egyéni sofőrkártya-letöltésre és archiválásra készült — szabványos USB-kártyaolvasóval.</p>',
    'A TAGRA Trucker egyéni sofőrkártya-letöltésre és archiválásra készült — USB-kártyaolvasóval a csomagban.</p>', 1, 'hu/fuvarozoknak/index.html');
}

function gyik(s) {
  const W = 'hu/gyakori-kerdesek/index.html';
  const q0 = 'Szükségem van USB kártyaolvasóra a TAGRA Truckerhez?', q1 = 'Szükségem van külön USB-kártyaolvasóra a TAGRA Truckerhez?';
  const a0 = 'Igen. A TAGRA Trucker egy szabványos USB kártyaolvasón keresztül olvassa be a sofőrkártyáját. Ha Önnek nincs ilyen, lépjen kapcsolatba velünk, és ajánlunk egy kompatibilis modellt.';
  const a1 = 'Nem kell külön megvásárolnia. A TAGRA Trucker program USB-kártyaolvasón keresztül olvassa be a sofőrkártyáját, amelyet a licenccel együtt, egy csomagban közvetlenül elküldünk Önnek. Magyarországon a vásárlással és további kérdésekkel kapcsolatban keresse a Rukon Kft.-t.';
  s = rep(s, q0, q1, 2, W);
  s = rep(s, a0, a1, 2, W);
  return s;
}

function telepitese(s) {
  const W = 'hu/kezikonyvek/tagra-telepitese/index.html';
  return rep(s, '<div class="tmx-keys"><p>Nincs még tachográf <b>letöltőkulcsa</b> még? Közvetlenül megvásárolhatja webáruházunkból (cseh/szlovák piac). Magyarországon a készüléket a Rukon Kft. forgalmazza — <a href="mailto:rukon@rukon.hu">rukon@rukon.hu</a>, +36 30 474 2540.</p><a class="tmx-btn" href="https://www.truckmall.cz" rel="noopener" target="_blank">Letöltőkulcsok a TRUCKMALL.cz oldalon</a></div>',
    '<div class="tmx-keys"><p>Még nincs <b>letöltőkulcsa</b> a tachográfhoz? Magyarországon partnerünknél, a Rukon Kft.-nél szerezheti be — <a href="mailto:rukon@rukon.hu">rukon@rukon.hu</a>, +36 30 474 2540.</p><a class="tmx-btn" href="/hu/letoltokulcs/">DOWNLOAD BOX letöltőkulcsok</a></div>', 1, W);
}

function cikkTip(s) {
  return rep(s, '<div class="callout-title">TRUCKMALL tipp</div>', '<div class="callout-title">TAGRA tipp</div>', 1, 'hu/cikkek/tachograf-adatok-letoltese-kiertekelese/index.html');
}

/* ---------- 4. nová stránka Letöltések ---------- */
const DL = {
  eu: 'https://www.tdt.cz/download/TAGRA_eu.zip',
  t3: 'https://www.tdt.cz/download/TAGRA_III.zip',
  trucker: 'https://www.tdt.cz/download/Trucker.zip',
  f: 'https://www.tdt.cz/sites/default/files/prilohy/',
};
const DL_TITLE = 'Letöltések: TAGRA, TAGRA III, illesztőprogramok – TAGRA';
const DL_DESC = 'TAGRA és TAGRA III letöltés, kártyaolvasó-illesztőprogramok, DOWNLOAD STATION Wi-Fi kliens és távoli segítség – minden egy helyen.';
const DL_URL = 'https://tagra.app/hu/letoltesek/';
const zipItem = (href, t, d, track) => `<a class="dl" data-track="${track}" download="" href="${href}"><span class="dl-ico">ZIP</span><span><span class="dl-t">${t}</span><span class="dl-d">${d}</span></span></a>`;
const DL_MAIN = `<main id="main-content">
<section class="hu-dl-hero"><div class="container"><span class="eyebrow">Meglévő ügyfeleinknek</span><h1>TAGRA letöltések</h1><p class="lead">Minden egy helyen, amire a TAGRA programhoz szüksége lehet: a jelenlegi TAGRA telepítője, az új TAGRA III kipróbálása, illesztőprogramok és távoli segítség. A részletes útmutatókat a <a href="/hu/kezikonyvek/">Kézikönyvek</a> között találja.</p>
<nav aria-label="Ügyfeleinknek" class="hu-subnav"><a href="/hu/gyakori-kerdesek/">GYIK</a><a aria-current="page" href="/hu/letoltesek/">Letöltések</a><a href="/hu/kezikonyvek/">Kézikönyvek</a><a href="/hu/kapcsolat/">Kapcsolat</a></nav></div></section>
<section aria-labelledby="dl-choose" class="hu-dl-sec"><div class="container"><h2 id="dl-choose">Melyik verziót töltse le?</h2>
<div class="dlv-grid">
<div class="dlv-card dlv-card--main"><span class="dlv-badge">Meglévő ügyfeleinknek ajánljuk</span><div class="dlv-head"><img alt="" decoding="async" height="256" src="/assets/img/hu/qz-ke-stazeni.webp" width="256"/><h3>TAGRA – a jelenlegi verzió</h3></div><p>A bevált TAGRA program, amelyet Magyarországon számos fuvarozó használ. A megszokott teljes funkcionalitás – első telepítéshez és új számítógépre költözéshez is.</p><ul><li>Minden funkció, amelyet ismer és naponta használ</li><li>Licence és adatai változatlanul megmaradnak</li></ul><div class="dlv-actions"><a class="btn-cta" data-track="dl-tagra-eu" download="" href="${DL.eu}">TAGRA letöltése</a><span class="dlv-meta">Windows · ZIP · 156 MB</span></div></div>
<div class="dlv-card dlv-card--new"><span class="dlv-badge">Újdonság – próbálja ki</span><div class="dlv-head"><img alt="" class="dlv-thumb" decoding="async" height="643" src="/assets/img/tagra3/tagra3-overview-960.webp" width="960"/><h3>TAGRA III</h3></div><p>A sikeres TAGRA program legújabb generációja. Az új áttekintő felület mutatja a legfontosabbakat: szabálysértések jogszabályi hivatkozással, adatletöltések, lejáró kártyák és kalibrálások.</p><ul><li>Modern kezelőfelület és új feladatáttekintés</li><li>Szabálysértések jogszabályi hivatkozással és tanácsokkal</li></ul><div class="dlv-actions"><a class="btn-outline" data-track="dl-tagra-iii" download="" href="${DL.t3}">Próbálja ki a TAGRA III-at</a><span class="dlv-meta">Windows · ZIP · 47 MB</span><a class="dlv-more" href="/hu/fuvarozoknak/">Bővebben a TAGRA III-ról →</a></div></div>
</div>
<div class="dl-warn" role="note"><strong>Érdemes tudnia, mielőtt a TAGRA III-ra vált</strong><p>A TAGRA III folyamatosan fejlődik, de még nem tartalmazza a jelenlegi TAGRA program összes megszokott funkcióját. Meglévő ügyfeleinknek ezért azt javasoljuk, hogy továbbra is a jelenlegi TAGRA programban dolgozzanak, a TAGRA III-at pedig telepítsék mellé, és próbálják ki kényelmesen. A program jelenleg angol, német, olasz, francia, cseh és szlovák nyelven érhető el – magyarul egyelőre nem.</p></div>
<div class="dl-list"><a class="dl" data-track="dl-trucker" download="" href="${DL.trucker}"><span class="dl-ico dl-ico--3d"><img alt="" decoding="async" height="256" loading="lazy" src="/assets/img/hu/ico-ridic.webp" width="256"/></span><span><span class="dl-t">TAGRA TRUCKER</span><span class="dl-d">Sofőröknek, akik saját sofőrkártyájuk adatait értékelik ki – USB-kártyaolvasóval a csomagban. Windows · ZIP</span></span></a></div>
</div></section>
<section aria-labelledby="licenc-t" class="hu-dl-sec hu-dl-sec--gray" id="licenc"><div class="container"><h2 id="licenc-t">Licencek</h2>
<div class="hu-lic"><img alt="" decoding="async" height="256" loading="lazy" src="/assets/img/hu/qz-aktivace-licence.webp" width="256"/><div><p>A licenckulcs aktiválásában, az éves megújításban és a licenc több járműre történő bővítésében magyarországi partnerünk, a Rukon Kft. segít Önnek.</p><p class="lic-c">Varga Katalin — Rukon Kft. · <a href="tel:+36304742540">+36 30 474 2540</a> · <a href="mailto:rukon@rukon.hu">rukon@rukon.hu</a></p></div><a class="btn-cta" href="/hu/kapcsolat/">Kapcsolat a Rukon Kft.-vel</a></div>
</div></section>
<section aria-labelledby="drv-t" class="hu-dl-sec"><div class="container"><h2 id="drv-t">Illesztőprogramok a tartozékokhoz</h2>
<div class="dl-list">${zipItem(DL.f + 'ovladac-pro-tdt-usb-kabel1.zip', 'Illesztőprogram a TDT USB-kábelhez', 'A TDT USB-kábel illesztőprogramja Windows rendszerhez.', 'dl-usb')}${zipItem(DL.f + 'ovladac-ctecky-karet-gempc-win-64.zip', 'GemPC kártyaolvasó-illesztőprogram (64 bites)', 'Windows 64 bit', 'dl-gempc64')}${zipItem(DL.f + 'ovladac-ctecky-karet-gempc-win-321.zip', 'GemPC kártyaolvasó-illesztőprogram (32 bites)', 'Windows 32 bit', 'dl-gempc32')}${zipItem(DL.f + 'client-db-ii-hu.zip', 'Kliens a DOWNLOAD STATION Wi-Fi eszközhöz', 'A kliens magyar nyelvű változata.', 'dl-station-hu')}</div>
<h2 style="margin-top:44px" id="rem-t">Távoli segítség és adatbázis</h2>
<div class="dl-list">${zipItem(DL.f + 'teamviewerqs_x64.exe_.zip', 'TeamViewer QuickSupport (64 bit)', 'A műszaki támogatás távoli segítségnyújtásához.', 'dl-teamviewer')}${zipItem(DL.f + 'firebird-5.0.1.1469-0-windows-x64.exe_.zip', 'Firebird 5.0.1 (64 bit)', 'Firebird adatbázis a TAGRA programhoz.', 'dl-firebird')}</div>
</div></section>
<section aria-labelledby="help-t" class="hu-dl-sec hu-dl-sec--gray"><div class="container" style="text-align:center"><h2 id="help-t">Segítségre van szüksége a telepítéshez?</h2><p style="max-width:640px;margin:0 auto 24px;color:var(--text2)">A telepítési útmutató lépésről lépésre végigvezeti a folyamaton. Ha elakad, telefonáljon – magyarul segítünk.</p><div class="cta-row" style="justify-content:center"><a class="btn-cta" href="/hu/kezikonyvek/tagra-telepitese/">Telepítési útmutató</a><a class="btn-outline" href="/hu/kapcsolat/">Kapcsolat</a></div></div></section>
${BUY_BAND}</main>
`;

function buildDownloads() {
  const src = read('hu/eutracker-plus/index.html');
  const iTitle = src.indexOf('<title>');
  const iStyle = src.indexOf('<style>\n    *,*::before,*::after');
  const iStyleEnd = src.indexOf('</style>', iStyle) + '</style>'.length;
  const iLinks = src.indexOf('<link href="/assets/css/tokens.css"');
  const iMain = src.indexOf('<main id="main-content">');
  const iMainEnd = src.indexOf('</main>') + '</main>'.length;
  if ([iTitle, iStyle, iLinks, iMain].some((i) => i < 0) || iMainEnd < 10) throw new Error('downloads template');
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', '@id': DL_URL + '#breadcrumb', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Főoldal', item: 'https://tagra.app/hu/' },
        { '@type': 'ListItem', position: 2, name: 'Letöltések', item: DL_URL } ] },
      { '@type': 'WebPage', '@id': DL_URL + '#webpage', url: DL_URL, name: DL_TITLE, description: DL_DESC, inLanguage: 'hu',
        isPartOf: { '@id': 'https://tagra.app/#website' }, publisher: { '@id': 'https://tagra.app/#organization' }, breadcrumb: { '@id': DL_URL + '#breadcrumb' } },
      { '@type': 'SoftwareApplication', name: 'TAGRA', applicationCategory: 'BusinessApplication', operatingSystem: 'Windows', downloadUrl: DL.eu, inLanguage: 'hu',
        publisher: { '@id': 'https://tagra.app/#organization' } },
      { '@type': 'SoftwareApplication', name: 'TAGRA III', applicationCategory: 'BusinessApplication', operatingSystem: 'Windows', downloadUrl: DL.t3,
        publisher: { '@id': 'https://tagra.app/#organization' } },
    ],
  };
  const head = `<title>${DL_TITLE}</title>
<meta content="${DL_DESC}" name="description"/>
<meta content="#0b2c4a" name="theme-color"/>
<link href="/manifest.json" rel="manifest"/>
<link href="${DL_URL}" rel="canonical"/>
<link href="${DL_URL}" hreflang="hu" rel="alternate"/><link href="${DL_URL}" hreflang="x-default" rel="alternate"/>
<meta content="website" property="og:type"/>
<meta content="hu_HU" property="og:locale"/>
<meta content="TAGRA" property="og:site_name"/>
<meta content="${DL_TITLE}" property="og:title"/><meta content="${DL_DESC}" property="og:description"/>
<meta content="https://tagra.app/assets/img/tagra3/og-fleet-tagra3.jpg" property="og:image"/>
<meta content="${DL_URL}" property="og:url"/>
<meta content="summary_large_image" name="twitter:card"/>
`;
  let s = src.slice(0, iTitle) + head + src.slice(iStyle, iStyleEnd) + '\n<script type="application/ld+json">' + JSON.stringify(ld) + '</script>\n'
    + src.slice(iLinks, iMain) + DL_MAIN.replace(/\n$/, '') + src.slice(iMainEnd);
  s = s.split('href="/hu/eutracker-plus/" hreflang="hu">Magyar</a>').join('href="/hu/letoltesek/" hreflang="hu">Magyar</a>');
  if (s.includes('eutracker-plus/"') && /<link[^>]*eutracker-plus/.test(s)) throw new Error('downloads: template leftovers');
  return s;
}

/* ---------- 6. sitemap + i18n.py ---------- */
function sitemap(s) {
  const anchor = '    <loc>https://tagra.app/hu/letoltokulcs/</loc>';
  const i = s.indexOf(anchor); if (i === -1 || s.includes('/hu/letoltesek/')) throw new Error('sitemap anchor');
  const j = s.indexOf('</url>', i) + '</url>'.length;
  const block = `\n  <url>\n    <loc>${DL_URL}</loc>\n    <xhtml:link rel="alternate" hreflang="hu" href="${DL_URL}"/>\n    <xhtml:link rel="alternate" hreflang="x-default" href="${DL_URL}"/>\n    <lastmod>2026-11-03</lastmod>\n  </url>`;
  return s.slice(0, j) + block + s.slice(j);
}
function i18npy(s) {
  return rep(s, `                nl = BeautifulSoup('<li>Telephelyi változat: Download Station – zárható fali doboz, alap és Wi-Fi-változat</li>', 'html.parser').li
                li.insert_after(nl)`,
  `                # 3. 11. 2026: DOWNLOAD BOX II S Wi-Fi se samostatně neprodává (jen v DOWNLOAD STATION Wi-Fi) -> nahradit
                nl = BeautifulSoup('<li>Telephelyi változat: Download Station – zárható fali doboz, alap és Wi-Fi-változat</li>', 'html.parser').li
                li.replace_with(nl)`, 1, 'tools/i18n.py');
}

/* ---------- běh ---------- */
async function main() {
  if (!process.argv.includes('--no-fetch')) await fetchIcons();
  const files = walk('hu').sort();
  const special = {
    'hu/index.html': home,
    'hu/letoltokulcs/index.html': letoltokulcs,
    'hu/letolto-eszkozok/index.html': letoltoEszkozok,
    'hu/tavoli-letoltes/index.html': tavoliLetoltes,
    'hu/soforoknek/index.html': soforoknek,
    'hu/fuvarozoknak/index.html': fuvarozoknak,
    'hu/gyakori-kerdesek/index.html': gyik,
    'hu/kezikonyvek/tagra-telepitese/index.html': telepitese,
    'hu/cikkek/tachograf-adatok-letoltese-kiertekelese/index.html': cikkTip,
  };
  if (files.includes('hu/letoltesek/index.html')) throw new Error('already applied');
  for (const f of files) {
    let s = read(f);
    if (special[f]) s = special[f](s);
    s = common(f, s);
    write(f, s);
  }
  write('hu/letoltesek/index.html', common('hu/letoltesek/index.html', buildDownloads()));
  write('sitemap.xml', sitemap(read('sitemap.xml')));
  write('tools/i18n.py', i18npy(read('tools/i18n.py')));
  // závěrečné kontroly
  for (const f of walk('hu')) {
    const s = read(f);
    if (/shop\.tagra\.app|href="https?:\/\/(www\.)?truckmall/i.test(s)) throw new Error(f + ': shop/truckmall link');
    if (/DBII-S Wi-Fi|DOWNLOAD BOX II S Wi-Fi|Wi-Fi változat: automatikus/i.test(s)) throw new Error(f + ': DBII-S Wi-Fi left');
    for (const m of s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
  }
  console.log('ok ' + (files.length + 1) + ' hu pages');
}
main().catch((e) => { console.error('FAIL: ' + e.message); process.exit(1); });
