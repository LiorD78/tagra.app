#!/usr/bin/env node
// #239 (dávka 2/6): odkaz „Shop" do hlavičky (desktop + rozbalovací menu) – 8 jazyků.
// Idempotentní; assertuje stav před i po. Spuštění: node handoff/nav-shop-link.mjs [root]
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const T = {
  en: ['Shop', 'TAGRA Shop – buy licences and devices'],
  de: ['Shop', 'TAGRA Shop – Lizenzen und Geräte kaufen'],
  pl: ['Sklep', 'TAGRA Shop – kup licencje i urządzenia'],
  nl: ['Shop', 'TAGRA Shop – licenties en apparaten kopen'],
  fr: ['Boutique', 'TAGRA Shop – acheter des licences et des appareils'],
  it: ['Shop', 'TAGRA Shop – acquista licenze e dispositivi'],
  el: ['Κατάστημα', 'TAGRA Shop – αγορά αδειών και συσκευών'],
  ro: ['Magazin', 'TAGRA Shop – cumpărați licențe și dispozitive'],
};
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) files.push(p);
  }
})(root);

const CTA = /<li class="nav-cta-li"><a class="nav-cta"/;
let changed = 0, already = 0, skipped = 0;
const list = [];
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  if (!CTA.test(s)) continue;
  const lang = (s.match(/<html[^>]*\blang="([a-zA-Z-]+)"/) || [])[1]?.slice(0, 2).toLowerCase();
  if (!T[lang]) { skipped++; continue; } // hu, cs, sk beze změny
  if (s.includes('data-cta="nav"')) { already++; continue; }
  if ((s.match(CTA) || []).length !== 1) throw new Error('nečekaná struktura: ' + f);
  const [label, aria] = T[lang];
  const li = `<li class="nav-shop-li"><a aria-label="${aria}" class="nav-shop" data-cta="nav" href="https://shop.tagra.app/">${label}</a></li>\n`;
  const out = s.replace(CTA, li + '<li class="nav-cta-li"><a class="nav-cta"');
  if (out.length !== s.length + li.length) throw new Error('délka nesedí: ' + f);
  fs.writeFileSync(f, out);
  changed++; list.push(path.relative(root, f));
}
// post-assert
let total = 0;
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const n = (s.match(/class="nav-shop"/g) || []).length;
  if (n > 1) throw new Error('duplicita: ' + f);
  total += n;
}
console.log(JSON.stringify({ changed, already, skipped, totalWithShop: total }));
fs.writeFileSync(path.join(root, '.nav-shop-files.txt'), list.join('\n') + '\n');
