#!/usr/bin/env node
/* 79-10: AI sekce z homepage jazyka -> stránka pro řidiče (hned za hero). Idempotentní.
 * Spuštění z kořene repa: node tools/code_cta/ai_driver.js [--dry-run] */
'use strict';
const fs = require('fs');
const DRY = process.argv.includes('--dry-run');
const F = JSON.parse(fs.readFileSync('tools/code_cta/strings.json', 'utf8'));
const TRY = { en: '/try/', es: '/es/prueba-gratis/' };
const SHOP = { de: 'https://shop.tagra.app/de/tagra-trucker/', pl: 'https://shop.tagra.app/pl/tagra-trucker/', hu: 'https://shop.tagra.app/hu/tagra-trucker/', es: 'https://shop.tagra.app/es/tagra-trucker/', it: 'https://shop.tagra.app/it/tagra-trucker/', fr: 'https://shop.tagra.app/fr/tagra-trucker/', nl: 'https://shop.tagra.app/nl/tagra-trucker/' };
const PAGES = { en: ['index.html', 'driver/index.html'], de: ['de/index.html', 'de/fahrer/index.html'], pl: ['pl/index.html', 'pl/dla-kierowcow/index.html'],
  hu: ['hu/index.html', 'hu/soforoknek/index.html'], ro: ['ro/index.html', 'ro/pentru-conducatori/index.html'], fr: ['fr/index.html', 'fr/conducteurs/index.html'],
  el: ['el/index.html', 'el/odigoi/index.html'], it: ['it/index.html', 'it/per-autisti/index.html'], nl: ['nl/index.html', 'nl/voor-chauffeurs/index.html'],
  es: ['es/index.html', 'es/conductores/index.html'] };
const CSS = '<link rel="stylesheet" href="/assets/css/t3-ai.css?v=20261110"/>';
let bad = 0;
for (const [lang, [home, drv]] of Object.entries(PAGES)) {
  const h = fs.readFileSync(home, 'utf8');
  let d = fs.readFileSync(drv, 'utf8');
  if (d.includes('class="t3ai"')) { console.log('SKIP', drv); continue; }
  const s = h.indexOf('<section class="t3ai"');
  const e = h.indexOf('</section>', s) + '</section>'.length;
  if (s < 0 || e < s) { console.log('PROBLEM no section', home); bad++; continue; }
  let sec = h.slice(s, e);
  const trial = (TRY[lang] || F[lang].try) + '?audience=driver';
  const shop = SHOP[lang] || 'https://shop.tagra.app/tagra-trucker/';
  sec = sec.replace(/(<div class="t3ai__cta"><a class="btn-cta" href=")[^"]*(")/, `$1${trial}$2`)
    .replace(/(<a class="btn-outline" href=")[^"]*(")/, `$1${shop}$2`);
  const noShop = lang === 'hu'; /* HU homepage tlačítko nákupu nemá; text nevymýšlíme */
  if (!sec.includes(`href="${trial}"`) || (!noShop && !sec.includes(`href="${shop}"`))) { console.log('PROBLEM cta', home); bad++; continue; }
  const hs = d.indexOf('</section>');
  if (hs < 0 || !d.includes('band--hero')) { console.log('PROBLEM hero', drv); bad++; continue; }
  const at = hs + '</section>'.length;
  d = d.slice(0, at) + sec + d.slice(at);
  if (!d.includes('t3-ai.css')) d = d.replace(/(<link[^>]*rel="stylesheet"[^>]*>)(?![\s\S]*<link[^>]*rel="stylesheet")/, `$1\n${CSS}`);
  if (!DRY) fs.writeFileSync(drv, d);
  console.log('OK', drv);
}
process.exit(bad ? 1 : 0);
