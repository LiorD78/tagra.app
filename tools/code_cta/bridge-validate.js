#!/usr/bin/env node
/* Validace mostu 79-1 (spouští se z kořene repa): počty po jazycích, 1 horní box, vyvážení tagů,
   ř/ě/ů v textech boxů ne-EN jazyků, zkušební odkazy existují, seznam odkazů do shopu. */
'use strict';
const fs = require('fs'), path = require('path');
const files = [];
(function w(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name.startsWith('.') || e.name === 'node_modules') continue; const p = path.join(d, e.name); if (e.isDirectory()) w(p); else if (e.name === 'index.html') files.push(p); } })('.');
const stats = {}, bad = [], shop = new Set(), tries = new Set();
let n = 0;
for (const f of files.map((x) => x.replace(/^\.\//, ''))) {
  const d = fs.readFileSync(f, 'utf8');
  if (!d.includes('data-bridge-v="2"')) continue;
  n++;
  const lang = f.split('/')[0] === 'articles' ? 'en' : f.split('/')[0];
  const kind = /data-br-box="sym-top"/.test(d) ? 'sym' : 'err';
  stats[lang + '/' + kind] = (stats[lang + '/' + kind] || 0) + 1;
  const tops = (d.match(/class="cta-box cc-top/g) || []).length, brTops = (d.match(/br-box br-top/g) || []).length;
  if (tops !== 1 || brTops !== 1) bad.push([f, 'horních boxů', tops, brTops]);
  if ((d.match(/data-br-box="[a-z]+-end"/g) || []).length !== 1) bad.push([f, 'koncových boxů != 1']);
  if ((d.match(/id="brBar"/g) || []).length !== 1) bad.push([f, 'lišta != 1']);
  if (d.includes('stickyCta')) bad.push([f, 'zbytek staré lišty']);
  const body = d.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  for (const t of ['div', 'section', 'details', 'form', 'blockquote']) {
    const o = (body.match(new RegExp('<' + t + '[\\s>]', 'g')) || []).length, c = (body.match(new RegExp('</' + t + '>', 'g')) || []).length;
    if (o !== c) bad.push([f, 'bilance ' + t, o, c]);
  }
  /* texty boxů: od br-box po konec boxu/lišty */
  const chunks = [];
  const re = /<div class="cta-box[^"]*br-box[\s\S]*?(?=<\/section>|<div class="cta-box(?! br)|$)/g;
  let m; while ((m = re.exec(d))) chunks.push(m[0]);
  const bar = d.match(/<div aria-label="TAGRA TRUCKER" class="br-bar"[\s\S]*?<\/button>/); if (bar) chunks.push(bar[0]);
  if (lang !== 'en') {
    const vis = chunks.join('\n').replace(/<[^>]*>/g, ' ');
    for (const ch of vis) if ('řŘěĚůŮ'.includes(ch)) { bad.push([f, 'ř/ě/ů v textu boxu', ch]); break; }
  }
  for (const h of d.matchAll(/href="(https:\/\/shop\.tagra\.app\/[^"]*tagra-trucker\/)"/g)) shop.add(h[1]);
  for (const h of d.matchAll(/data-cta="trial" href="([^"?]+)\?/g)) tries.add(h[1]);
}
const missing = [...tries].filter((t) => !fs.existsSync(t.replace(/^\//, '') + 'index.html') && !fs.existsSync(t.replace(/^\//, '') + '/index.html'));
console.log('stránek s mostem:', n); console.log(JSON.stringify(stats));
console.log('shop odkazy:', [...shop].join(' ')); console.log('trial cíle:', [...tries].join(' ')); console.log('trial cíle chybějící:', missing.join(' ') || '0');
console.log('problémy:', bad.length); for (const b of bad) console.log(...b);
process.exit(bad.length || missing.length ? 1 : 0);
