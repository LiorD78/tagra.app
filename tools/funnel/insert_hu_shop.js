#!/usr/bin/env node
'use strict';
// #279: HU – položka Shop v navigaci (jako DE). Idempotentní; vkládá před <li class="nav-cta-li">.
// Stránky bez nav-cta-li (ingyenes-probaverzio, koszonjuk) se přeskakují – stejně jako DE testen/danke.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..', 'hu');
const LI = '<li class="nav-shop-li"><a class="nav-shop" data-cta="nav" href="https://shop.tagra.app/hu/" aria-label="TAGRA Shop">Shop</a></li>\n';
const MARK = '<li class="nav-cta-li">';
let n = 0, skip = 0;
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!p.endsWith('.html')) continue;
    let h = fs.readFileSync(p, 'utf8');
    if (!h.includes('class="site-nav"')) continue;
    if (h.includes('nav-shop-li')) { n++; continue; }
    const i = h.indexOf(MARK);
    if (i < 0) { skip++; console.log('přeskočeno: ' + path.relative(ROOT, p)); continue; }
    fs.writeFileSync(p, h.slice(0, i) + LI + h.slice(i)); n++;
  }
})(ROOT);
console.log('nav Shop: ' + n + ' stránek, přeskočeno ' + skip);
