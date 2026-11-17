#!/usr/bin/env node
/**
 * es-core-sweep.js — plošné doplnění španělštiny (#291, dávka 36b-D). Idempotentní.
 *  1) reciproční <link hreflang="es" rel="alternate"> na EN a jazykových verzích
 *     stránek home, fleet, driver, try, thanks (vkládá se za hreflang="el", abecedně)
 *  2) „Español“ do jazykového přepínače v hlavičce (.nav-lang-menu) na všech stránkách
 *     (stránky bez ES verze vedou na /es/; nav.js jim ekvivalent dotáhne z hreflang v <head>)
 * Patička: tools/fix_footer_lang.js (LANGS obsahuje es).
 * Použití: node tools/es-core-sweep.js [--apply]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');
const SLUGMAP = JSON.parse(fs.readFileSync(path.join(ROOT, 'i18n', 'slugmap.json'), 'utf8'));
const IDS = ['home', 'fleet', 'driver', 'try', 'thanks'];
const slash = (s) => s.replace(/^\/|\/$/g, '');

const hreflangFiles = new Map(); // soubor -> URL es verze
for (const id of IDS) {
  const esUrl = `https://tagra.app/${slash(SLUGMAP[id].es)}/`;
  for (const [lang, p] of Object.entries(SLUGMAP[id])) {
    const f = path.join(ROOT, slash(p), 'index.html');
    if (fs.existsSync(f)) hreflangFiles.set(f, esUrl);
  }
}

function walk(dir, acc) {
  for (const n of fs.readdirSync(dir)) {
    if (['.git', 'node_modules', 'tools', 'email-preview'].includes(n)) continue;
    const p = path.join(dir, n);
    if (fs.statSync(p).isDirectory()) walk(p, acc);
    else if (n === 'index.html') acc.push(p);
  }
  return acc;
}

const st = { hreflang: 0, menu: 0, menuHas: 0 };
for (const f of walk(ROOT, [])) {
  const src = fs.readFileSync(f, 'utf8');
  let out = src;
  const esUrl = hreflangFiles.get(f);
  if (esUrl && !/hreflang="es" rel="alternate"/.test(out)) {
    const n = out.replace(/(<link href="[^"]*" hreflang="el" rel="alternate"\/>)/, `$1<link href="${esUrl}" hreflang="es" rel="alternate"/>`);
    if (n !== out) { out = n; st.hreflang++; } else console.log('bez hreflang el:', path.relative(ROOT, f));
  }
  out = out.replace(/(<div class="nav-lang-menu"[^>]*>)([\s\S]*?)(<\/div>)/, (all, a, body, c) => {
    if (/hreflang="es"/.test(body)) { st.menuHas++; return all; }
    const n = body.replace(/(<a\b[^>]*hreflang="it"[^>]*>Italiano<\/a>)/, '$1<a href="/es/" hreflang="es">Español</a>');
    if (n === body) { console.log('bez Italiano v menu:', path.relative(ROOT, f)); return all; }
    st.menu++;
    return a + n + c;
  });
  if (out !== src && APPLY) fs.writeFileSync(f, out, 'utf8');
}
console.log(APPLY ? 'ZÁPIS' : 'NÁHLED', st);
