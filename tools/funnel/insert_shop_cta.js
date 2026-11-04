#!/usr/bin/env node
'use strict';
// Vloží do článků odkazy / boxy na TAGRA Shop. Deterministické, idempotentní.
// Použití: node tools/funnel/insert_shop_cta.js --lang en
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const START = '<!-- shop-cta:start -->';
const END = '<!-- shop-cta:end -->';
const URLS = {
  err: 'https://shop.tagra.app/tagra-software/',
  card: 'https://shop.tagra.app/tagra-trucker/',
  dl: 'https://shop.tagra.app/software-device-bundles/',
};

const argv = process.argv.slice(2);
const li = argv.indexOf('--lang');
const lang = li >= 0 ? argv[li + 1] : null;
if (!lang) { console.error('Chybí --lang <kód>'); process.exit(1); }
if (lang === 'hu') { console.error('hu/ se nesmí upravovat'); process.exit(1); }

const texts = JSON.parse(fs.readFileSync(path.join(__dirname, 'cta_texts.json'), 'utf8'));
const map = JSON.parse(fs.readFileSync(path.join(__dirname, 'article_map.json'), 'utf8'));
if (!map[lang]) { console.error('Jazyk není v article_map.json: ' + lang); process.exit(1); }
const T = (k) => {
  const v = texts[k] && texts[k][lang];
  if (!v) { console.error('Chybí text ' + k + '/' + lang); process.exit(1); }
  return v;
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const LINK_STYLE = 'font-size:14px;margin:2px 0 0;color:rgba(255,255,255,.88);';
const A_STYLE = 'color:#fff;text-decoration:underline;';

function secondaryLink(type, slot) {
  const label = type === 'err' ? T('err_link') : (type === 'card' ? T('card_btn') : T('dl_btn')) + ' →';
  return START + '<p class="shop-cta-link" style="' + LINK_STYLE + '"><a data-cta="' + slot +
    '" href="' + URLS[type] + '" rel="noopener" style="' + A_STYLE + '">' + esc(label) + '</a></p>' + END;
}

function shopBox(type, trialHref) {
  const a = (href, cls, label, extra) => '<a ' + (cls ? 'class="' + cls + '" ' : '') + 'href="' + href + '"' +
    (extra || '') + '>' + esc(label) + '</a>';
  let h, p, btn, btnHref, secLabel, secHref, secRel;
  if (type === 'card') {
    h = T('card_h'); p = T('card_p'); btn = T('card_btn'); btnHref = URLS.card;
    secLabel = T('card_link'); secHref = 'https://shop.tagra.app/smart-card-reader/'; secRel = ' rel="noopener"';
  } else {
    h = T('dl_h'); p = T('dl_p'); btn = T('dl_btn'); btnHref = URLS.dl;
    secLabel = T('trial') + ' →'; secHref = trialHref; secRel = '';
  }
  return START + '<div class="cta-box" data-cta="article_shopbox">\n<h3>' + esc(h) + '</h3>\n<p>' + esc(p) +
    '</p>\n' + a(btnHref, 'cta-btn', btn, ' rel="noopener"') + '\n<p style="' + LINK_STYLE + '">' +
    a(secHref, '', secLabel, secRel + ' style="' + A_STYLE + '"') + '</p>\n</div>' + END;
}

// Najde index konce boxu (pozice těsně před jeho uzavíracím </div>), začíná na openIdx = začátek <div ...>
function boxClose(html, openIdx) {
  const re = /<div\b|<\/div>/g;
  re.lastIndex = openIdx;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    if (m[0] === '</div>') { depth--; if (depth === 0) return m.index; } else depth++;
  }
  throw new Error('Nenalezen konec cta-boxu');
}

function process_(file, type) {
  let html = fs.readFileSync(file, 'utf8');
  // idempotence: odstranit dříve vložené úseky
  html = html.replace(new RegExp(START + '[\\s\\S]*?' + END, 'g'), '');
  const mainStart = html.indexOf('<main');
  const mainEnd = html.lastIndexOf('</main>');
  if (mainStart < 0 || mainEnd < 0) throw new Error('Chybí <main>');

  // 1) stávající cta-boxy v <main>
  const boxRe = /<div\b[^>]*class="[^"]*\bcta-box\b[^"]*"[^>]*>/g;
  const boxes = [];
  let m;
  boxRe.lastIndex = mainStart;
  while ((m = boxRe.exec(html)) && m.index < mainEnd) {
    if (/data-cta="article_shopbox"/.test(m[0])) continue;
    boxes.push({ idx: m.index, tag: m[0] });
  }
  // trial URL z první /try/ odkazu uvnitř prvního boxu (fallback: první v <main>)
  let trial = null;
  // trial stránka podle jazyka (EN /try/, ostatní lokalizované slugy)
  const hrefRe = /href="(\/(?:try|de\/testen|pl\/wyprobuj|nl\/gratis-proefversie|fr\/essai-gratuit|it\/prova-gratuita|el\/dokimi|ro\/incercare-gratuita)\/(?:\?[^"]*)?)"/;
  for (const b of boxes) {
    const seg = html.slice(b.idx, boxClose(html, b.idx));
    const hm = hrefRe.exec(seg);
    if (hm) { trial = hm[1]; break; }
  }
  if (!trial) { const hm = hrefRe.exec(html.slice(mainStart, mainEnd)); if (hm) trial = hm[1]; }

  // vkládání odzadu, ať se neposouvají indexy
  const inserts = [];
  boxes.forEach((b) => {
    const slot = /\bcc-top\b/.test(b.tag) ? 'article_top' : 'article_end';
    inserts.push({ at: boxClose(html, b.idx), text: secondaryLink(type, slot) });
  });

  // 2) shopbox pro card / dl
  let shop = false;
  if (type === 'card' || type === 'dl') {
    if (!trial && type === 'dl') throw new Error('Nenalezen trial URL pro shopbox');
    let href = null;
    if (type === 'dl') {
      const u = trial.replace(/&amp;/g, '&');
      href = (/[?&]src=/.test(u) ? u.replace(/([?&]src=[^&]*)/, '$1-shopbox') : u + (u.includes('?') ? '&' : '?') + 'src=article-shopbox').replace(/&/g, '&amp;');
    }
    const body = html.slice(0, mainEnd);
    let at = -1;
    const rel = body.lastIndexOf('<div class="related">');
    const relGrid = body.lastIndexOf('<div class="related-grid"');
    if (rel >= 0 && relGrid >= 0 && relGrid - rel < 120) at = rel;
    else if (relGrid >= 0) at = relGrid;
    else {
      const faq = body.indexOf('<details class="faq-item"');
      if (faq >= 0 && faq > mainStart) at = faq;
      else { const tail = /(?:<\/div>\s*)*(?:<\/section>\s*)*$/.exec(body); at = tail.index; }
    }
    inserts.push({ at, text: shopBox(type, href) });
    shop = true;
  }

  inserts.sort((x, y) => y.at - x.at);
  for (const ins of inserts) html = html.slice(0, ins.at) + ins.text + html.slice(ins.at);
  fs.writeFileSync(file, html);
  return { links: boxes.length, shop };
}

const rows = [];
let fail = false;
for (const [url, type] of Object.entries(map[lang])) {
  const file = path.join(ROOT, url, 'index.html');
  if (!fs.existsSync(file)) { rows.push({ url, type, links: 'CHYBÍ SOUBOR', shop: '-' }); fail = true; continue; }
  try {
    const r = process_(file, type);
    rows.push({ url, type, links: r.links, shop: r.shop ? 'ano' : 'ne' });
    if (r.links < 1) { rows[rows.length - 1].links = '0 (přeskočeno)'; }
  } catch (e) {
    rows.push({ url, type, links: 'CHYBA: ' + e.message, shop: '-' });
    fail = true;
  }
}

const w = Math.max(...rows.map((r) => r.url.length));
console.log('soubor'.padEnd(w) + '  typ   cta-box  shopbox');
for (const r of rows) console.log(r.url.padEnd(w) + '  ' + r.type.padEnd(4) + '  ' + String(r.links).padEnd(7) + '  ' + r.shop);
if (fail) { console.error('\nASSERT SELHAL: některý soubor chybí nebo nedostal ≥ 1 úpravu.'); process.exit(1); }
console.log('\nOK: ' + rows.length + ' souborů');
