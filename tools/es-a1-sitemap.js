#!/usr/bin/env node
/**
 * es-a1-sitemap.js — sitemap.xml pro nové ES stránky (#330, 79-2b A1). Idempotentní.
 *  - +3 <url> (es/privacidad, es/contacto, es/preguntas-frecuentes) s alternates jako EN protějšek + es
 *  - do existujících <url> záznamů skupin privacy/contact/faq doplní hreflang="es" (abecedně)
 * Použití: node tools/es-a1-sitemap.js [--apply]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const F = path.resolve(__dirname, '..', 'sitemap.xml');
const APPLY = process.argv.includes('--apply');
const PAGES = [
  { en: 'https://tagra.app/privacy/', es: 'https://tagra.app/es/privacidad/' },
  { en: 'https://tagra.app/contact/', es: 'https://tagra.app/es/contacto/' },
  { en: 'https://tagra.app/faq/', es: 'https://tagra.app/es/preguntas-frecuentes/' },
];
let xml = fs.readFileSync(F, 'utf8');
const blocks = () => xml.match(/  <url>\n[\s\S]*?  <\/url>\n/g);
const locOf = (b) => b.match(/<loc>([^<]*)<\/loc>/)[1];
const altRe = /    <xhtml:link rel="alternate" hreflang="([^"]*)" href="([^"]*)"\/>\n/g;
const mk = (lang, href) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>\n`;
const st = { novych: 0, doplneno: 0, uzMa: 0 };

function withEs(block, esUrl) {
  if (/hreflang="es"/.test(block)) return block;
  const alts = [...block.matchAll(altRe)].map((m) => [m[1], m[2]]);
  const xd = alts.filter((a) => a[0] === 'x-default');
  const rest = alts.filter((a) => a[0] !== 'x-default').concat([['es', esUrl]]).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const all = rest.concat(xd).map(([l, h]) => mk(l, h)).join('');
  const first = block.indexOf('    <xhtml:link');
  const last = block.lastIndexOf('/>\n', block.indexOf('<lastmod>')) + 3;
  return block.slice(0, first) + all + block.slice(last);
}

for (const P of PAGES) {
  const grp = new Set();
  const enBlock = blocks().find((b) => locOf(b) === P.en);
  if (!enBlock) throw new Error('v sitemap chybí ' + P.en);
  for (const m of enBlock.matchAll(altRe)) grp.add(m[2]);
  grp.add(P.en);
  // existující záznamy skupiny
  for (const b of blocks()) {
    if (!grp.has(locOf(b))) continue;
    if (/hreflang="es"/.test(b)) { st.uzMa++; continue; }
    xml = xml.replace(b, withEs(b, P.es)); st.doplneno++;
  }
  // nový záznam
  if (!blocks().some((b) => locOf(b) === P.es)) {
    const nb = withEs(enBlock.replace(`<loc>${P.en}</loc>`, `<loc>${P.es}</loc>`), P.es);
    const all = blocks();
    const lastEs = [...all].reverse().find((b) => /<loc>https:\/\/tagra\.app\/es\//.test(locOf(b)) || locOf(b).startsWith('https://tagra.app/es/'));
    const anchor = lastEs || all[all.length - 1];
    xml = xml.replace(anchor, anchor + nb); st.novych++;
  }
}
if (APPLY) fs.writeFileSync(F, xml, 'utf8');
console.log(APPLY ? 'ZÁPIS' : 'NÁHLED', st);
