#!/usr/bin/env node
/**
 * es-a1-sweep.js — plošné provázání nových ES stránek privacidad / contacto /
 * preguntas-frecuentes (#330, 79-2b A1). Idempotentní.
 *  1) reciproční <link hreflang="es" rel="alternate"> do všech stránek hreflang skupin
 *     EN privacy/, contact/, faq/ (vkládá se za hreflang="el", abecedně)
 *  2) v es/** přemapování href="/privacy/" | "/contact/" | "/faq/" (i "/en/…") na ES stránky
 *     (patička, nav, cookie lišta, GDPR odkazy ve formulářích)
 *  3) i18n/slugmap.json: es pro privacy / contact / faq
 * Přepínač jazyků (.nav-lang-menu, patička) přesměruje na ekvivalent sám assets/js/nav.js
 * z hreflang v <head>, proto se statické menu v protějšcích nemění.
 * Použití: node tools/es-a1-sweep.js [--apply]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');
const PAGES = {
  privacy: { en: 'privacy', es: 'es/privacidad' },
  contact: { en: 'contact', es: 'es/contacto' },
  faq: { en: 'faq', es: 'es/preguntas-frecuentes' },
};
const read = (f) => fs.readFileSync(f, 'utf8');
const urlToFile = (u) => path.join(ROOT, new URL(u).pathname.replace(/^\/|\/$/g, ''), 'index.html');
const st = { hreflang: 0, hreflangHas: 0, hreflangMissingEl: 0, links: 0, linkFiles: 0, slugmap: 0 };
const planned = new Map(); // soubor -> nový obsah

function get(f) { return planned.has(f) ? planned.get(f) : read(f); }

// 1) hreflang es
for (const [id, p] of Object.entries(PAGES)) {
  const esUrl = `https://tagra.app/${p.es}/`;
  const enFile = path.join(ROOT, p.en, 'index.html');
  const group = new Set([enFile]);
  for (const m of read(enFile).matchAll(/<link href="([^"]*)" hreflang="([^"]*)" rel="alternate"\/>/g)) {
    if (m[2] === 'x-default' || m[2] === 'es') continue;
    if (!m[1].startsWith('https://tagra.app/')) continue;
    group.add(urlToFile(m[1]));
  }
  let n = 0;
  for (const f of group) {
    if (!fs.existsSync(f)) { console.log('chybí soubor skupiny:', path.relative(ROOT, f)); continue; }
    const src = get(f);
    if (/hreflang="es" rel="alternate"/.test(src)) { st.hreflangHas++; continue; }
    const out = src.replace(/(<link href="[^"]*" hreflang="el" rel="alternate"\/>)/, `$1<link href="${esUrl}" hreflang="es" rel="alternate"/>`);
    if (out === src) { st.hreflangMissingEl++; console.log('bez hreflang el:', path.relative(ROOT, f)); continue; }
    planned.set(f, out); st.hreflang++; n++;
  }
  console.log(`hreflang ${id}: skupina ${group.size} souborů, doplněno ${n}`);
}

// 2) odkazy v es/**
const MAP = { '/privacy/': '/es/privacidad/', '/contact/': '/es/contacto/', '/faq/': '/es/preguntas-frecuentes/' };
function walk(dir, acc) {
  for (const n of fs.readdirSync(dir)) {
    const p = path.join(dir, n);
    if (fs.statSync(p).isDirectory()) walk(p, acc); else if (n === 'index.html') acc.push(p);
  }
  return acc;
}
for (const f of walk(path.join(ROOT, 'es'), [])) {
  const src = get(f);
  let cnt = 0;
  const out = src.replace(/href="(?:\/en)?(\/privacy\/|\/contact\/|\/faq\/)"/g, (_, k) => { cnt++; return `href="${MAP[k]}"`; });
  if (cnt) { planned.set(f, out); st.links += cnt; st.linkFiles++; }
}

// 3) slugmap
const smFile = path.join(ROOT, 'i18n', 'slugmap.json');
let sm = read(smFile);
for (const [id, p] of Object.entries(PAGES)) {
  const obj = JSON.parse(sm)[id];
  if (obj.es === p.es) continue;
  const re = new RegExp(`("${id}": \\{[^}]*?"it": "[^"]*")`);
  if (!re.test(sm)) throw new Error('slugmap: nenalezen ' + id);
  sm = sm.replace(re, `$1,\n    "es": "${p.es}"`);
  st.slugmap++;
}
if (st.slugmap) planned.set(smFile, sm);
JSON.parse(sm); // validace

if (APPLY) for (const [f, c] of planned) fs.writeFileSync(f, c, 'utf8');
console.log(APPLY ? 'ZÁPIS' : 'NÁHLED', st);
