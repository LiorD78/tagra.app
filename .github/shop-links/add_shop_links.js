// One-shot helper for branch shop-links: adds "Buy in shop" links to shop.tagra.app.
// Usage: node add_shop_links.js <repo-root>
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2];
const S = 'https://shop.tagra.app';

const BUY = {
  en: 'Buy in shop', de: 'Im Shop kaufen', fr: 'Acheter dans la boutique',
  it: 'Acquista nello shop', pl: 'Kup w sklepie', nl: 'Kopen in de webshop',
  ro: 'Cumpărați în magazin', el: 'Αγορά από το e-shop'
};
const BUNDLE = {
  en: 'TAGRA + DOWNLOAD BOX II S bundles', de: 'Pakete: TAGRA + DOWNLOAD BOX II S',
  fr: 'Packs TAGRA + DOWNLOAD BOX II S', it: 'Pacchetti TAGRA + DOWNLOAD BOX II S',
  pl: 'Zestawy TAGRA + DOWNLOAD BOX II S', nl: 'Bundels TAGRA + DOWNLOAD BOX II S',
  ro: 'Pachete TAGRA + DOWNLOAD BOX II S', el: 'Πακέτα TAGRA + DOWNLOAD BOX II S'
};
const FLEET = {
  en: 'fleet', de: 'de/fuhrpark', fr: 'fr/entreprises', it: 'it/per-aziende',
  pl: 'pl/dla-przewoznikow', nl: 'nl/voor-transportbedrijven', ro: 'ro/pentru-firme', el: 'el/stolos'
};
const DRIVER = {
  en: 'driver', de: 'de/fahrer', fr: 'fr/conducteurs', it: 'it/per-autisti',
  pl: 'pl/dla-kierowcow', nl: 'nl/voor-chauffeurs', ro: 'ro/pentru-conducatori', el: 'el/odigoi'
};
const HOME = { en: '', de: 'de', fr: 'fr', it: 'it', pl: 'pl', nl: 'nl', ro: 'ro', el: 'el' };
const PRODUCT = [
  ['Trucker', '/tagra-trucker/', 'TAGRA Trucker'], ['TAGRA MAX', '/tagra-max/', 'TAGRA MAX'],
  ['TAGRA 1', '/tagra-1/', 'TAGRA 1'], ['TAGRA 2', '/tagra-2/', 'TAGRA 2'],
  ['TAGRA 4', '/tagra-4/', 'TAGRA 4'], ['TAGRA 6', '/tagra-6/', 'TAGRA 6']
];

function assert(c, m) { if (!c) { throw new Error('assert failed: ' + m); } }
function count(s, sub) { return s.split(sub).length - 1; }

function rw(rel, fn) {
  const p = rel ? path.join(ROOT, rel, 'index.html') : path.join(ROOT, 'index.html');
  const s = fs.readFileSync(p, 'utf8');
  const n = fn(s);
  assert(n !== s, rel);
  fs.writeFileSync(p, n, 'utf8');
}

function fleet(lg) {
  rw(FLEET[lg], function (s) {
    const buy = BUY[lg];
    const i = s.indexOf('<table class="price-table"');
    assert(i >= 0, 'table ' + lg);
    const j = s.indexOf('</table>', i);
    let t = s.slice(i, j);
    t = t.replace('</tr>\n</thead>', '<th style="padding:10px 12px"></th>\n</tr>\n</thead>');
    assert(t.indexOf('<th style="padding:10px 12px"></th>') >= 0, 'th ' + lg);
    const bodyI = t.indexOf('<tbody>');
    const body = t.slice(bodyI).replace(/<tr[^>]*>[\s\S]*?<\/tr>/g, function (r) {
      const first = /<td[^>]*>([\s\S]*?)<\/td>/.exec(r)[1];
      for (const [key, url, name] of PRODUCT) {
        if (first.indexOf(key) >= 0) {
          const cell = '<td style="padding:12px;text-align:right"><a aria-label="' + buy + ': ' + name +
            '" class="btn-outline btn-cta--sm" href="' + S + url +
            '" hreflang="en" style="white-space:nowrap">' + buy + '</a></td>\n';
          return r.slice(0, -5) + cell + '</tr>';
        }
      }
      throw new Error('no product in row: ' + first);
    });
    assert(count(body, 'shop.tagra.app') === 6, 'rows ' + lg);
    s = s.slice(0, i) + t.slice(0, bodyI) + body + s.slice(j);
    const old = '<a href="mailto:sales@tagra.app" style="display:inline-block;margin-top:24px">';
    assert(count(s, old) === 1, 'mailto ' + lg);
    const add = '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:24px">' +
      '<a class="btn-cta btn-cta--sm" href="' + S + '/download-box-ii-s/" hreflang="en">' + buy + '</a>' +
      '<a class="btn-outline btn-cta--sm" href="' + S + '/software-device-bundles/" hreflang="en">' + BUNDLE[lg] + '</a>' +
      '</div>\n';
    return s.split(old).join(add + old);
  });
}

function driver(lg) {
  rw(DRIVER[lg], function (s) {
    const i = s.indexOf('id="pricing"');
    assert(i >= 0, 'pricing ' + lg);
    const j = s.indexOf('</section>', i);
    let sec = s.slice(i, j);
    const m = /<div style="margin-top:24px">\n(<a class="btn-cta btn-cta--sm" href="[^"]*audience=driver"[^>]*>[^<]*<\/a>)\n<\/div>/.exec(sec);
    assert(m, 'driver ' + lg);
    const rep = '<div style="margin-top:24px;display:flex;flex-wrap:wrap;gap:12px">\n' + m[1] + '\n' +
      '<a class="btn-outline btn-cta--sm" href="' + S + '/tagra-trucker/" hreflang="en">' + BUY[lg] + '</a>\n</div>';
    sec = sec.slice(0, m.index) + rep + sec.slice(m.index + m[0].length);
    return s.slice(0, i) + sec + s.slice(j);
  });
}

function home(lg) {
  rw(HOME[lg], function (s) {
    const m = /(<div class="pricing-teaser-cta">\n<a class="btn-outline" href="[^"]*#tagra-pricing">[^<]*<\/a>\n)/.exec(s);
    assert(m, 'home ' + lg);
    const end = m.index + m[0].length;
    const add = '<a class="btn-outline" href="' + S + '/tagra-software/" hreflang="en">' + BUY[lg] + '</a>\n';
    return s.slice(0, end) + add + s.slice(end);
  });
}

for (const lg of Object.keys(BUY)) {
  fleet(lg);
  driver(lg);
  home(lg);
}
console.log('ok');
