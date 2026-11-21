// 79-3: it/** odkazy shop.tagra.app/<cesta> -> shop.tagra.app/it/<cesta>. Idempotentní.
import fs from 'node:fs'; import path from 'node:path';
const RE = /https:\/\/shop\.tagra\.app\/(?!it\/|it["'#?\s<)]|$)/g;
const files = [];
(function walk(d){ for (const e of fs.readdirSync(d,{withFileTypes:true})) { const p=path.join(d,e.name); e.isDirectory()?walk(p):/\.(html|js|json|txt|xml)$/.test(e.name)&&files.push(p); } })('it');
let total=0;
for (const f of files) {
  const s = fs.readFileSync(f,'utf8'); let n=0;
  const o = s.replace(RE, ()=>{n++; return 'https://shop.tagra.app/it/';});
  if (n) { fs.writeFileSync(f,o); console.log(n+'\t'+f); total+=n; }
}
console.log('TOTAL', total);
