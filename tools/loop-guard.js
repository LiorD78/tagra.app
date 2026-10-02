#!/usr/bin/env node
/**
 * tools/loop-guard.js — pojistka automerge pro PR ze smyčky optimalizace (label `loop`).
 * Čte unified diff ze stdin (git diff origin/main...HEAD) a seznam změněných souborů z argv[2] (soubor).
 * Exit 0 = smí se automaticky mergnout, exit 2 = zablokovat (čeká na Libora), důvody na stdout.
 */
'use strict';
const fs = require('fs');

const diff = fs.readFileSync(0, 'utf8');
const files = fs.existsSync(process.argv[2] || '') ? fs.readFileSync(process.argv[2], 'utf8').split('\n').filter(Boolean) : [];
const reasons = [];

/* 1) Zakázané soubory a operace */
const FORBIDDEN_FILES = [
  /^sitemap\.xml$/, /^robots\.txt$/, /^_redirects$/, /^_headers$/, /^netlify\.toml$/,
  /^netlify\/functions\//, /^\.github\//, /^i18n\/slugmap\.json$/, /^assets\/js\/(nav|consent|analytics)\.js$/,
  /^try\//, /(^|\/)(kontakt|contact|impressum|privacy|cookies|datenschutz|polityka|adatvedelem)\//,
];
for (const f of files) {
  if (FORBIDDEN_FILES.some((re) => re.test(f))) reasons.push(`zakázaný soubor: ${f}`);
}
if (/^deleted file mode/m.test(diff)) reasons.push('PR maže soubor');
if (/^rename (from|to) /m.test(diff)) reasons.push('PR přejmenovává soubor / URL');

/* 2) Zakázaný obsah v přidaných i odebraných řádcích */
const changed = diff.split('\n').filter((l) => /^[+-]/.test(l) && !/^(\+\+\+|---)/.test(l));
const RULES = [
  [/€|\bEUR\b|\bKč\b|\bCZK\b|\bHUF\b|\bPLN\b|zł|"price"|"lowPrice"|"highPrice"|priceCurrency/i, 'cena / měna'],
  [/165\/2014|2016\/799|561\/2006|\b(čl\.|Art\.|art\.|artikel|artykuł|cikk)\s*\d+/i, 'právní odkaz / článek nařízení'],
  [/mailto:|tel:|@tagra\.app|@tdt\.(cz|sk)|\+4[0-9]{1,2}\s?\d{3}/i, 'kontakt'],
  [/googletagmanager|gtag\(|clarity|consent|smartsupp|dataLayer/i, 'analytika / consent'],
  [/TACHOCONSULTING|TACHOCONTROLL/i, 'zmínka konkurence'],
  [/aktualizační|update fee|Aktualisierungsgebühr/i, 'zakázaný termín (licenční poplatek)'],
  [/<link[^>]+rel="(canonical|alternate)"|hreflang=/i, 'canonical / hreflang'],
  [/noindex|nofollow/i, 'indexační direktiva'],
];
for (const [re, label] of RULES) {
  const hit = changed.find((l) => re.test(l));
  if (hit) reasons.push(`${label}: ${hit.slice(0, 140)}`);
}

/* 3) Rozsah */
const htmlFiles = files.filter((f) => f.endsWith('.html'));
if (htmlFiles.length > 12) reasons.push(`příliš mnoho HTML souborů (${htmlFiles.length} > 12)`);
const added = changed.filter((l) => l.startsWith('+')).length;
const removed = changed.filter((l) => l.startsWith('-')).length;
if (added + removed > 900) reasons.push(`příliš velký diff (${added}+/${removed}-)`);
if (removed > 0 && removed > added * 3) reasons.push(`PR převážně maže obsah (${removed}- vs ${added}+)`);

if (reasons.length) {
  console.log('BLOCK');
  for (const r of [...new Set(reasons)]) console.log('- ' + r);
  process.exit(2);
}
console.log(`PASS (${htmlFiles.length} HTML, ${added}+/${removed}-)`);
