#!/usr/bin/env node
/**
 * tagra.app — zarovnání jazykového přepínače v patičce na vzor z hlavičky.
 *
 * Proč: patička je zapomenutý statický blok ze sedmijazyčné éry. Na 124 stránkách
 * vede odkaz "angličtina" jinam než na angličtinu, na 8 stránkách na /en/ (404),
 * chybí FR/NL/RO a na 32 stránkách míří Italiano na ekvivalent stránky.
 * Hlavička (.nav-lang-menu) je přitom správně a nav.js jí dotahuje ekvivalenty
 * z hreflang v <head>. Tenhle skript dá patičce stejný tvar včetně hreflang,
 * takže ji po úpravě selektoru obslouží tentýž nav.js.
 *
 * Bezpečnostní pojistky:
 *   - mění výhradně poslední <ul> v <footer class="site-footer">
 *   - jazykové položky se poznávají inverzně: vše, co není Contact / Privacy /
 *     Truck Data Technology (explicitní seznam níže)
 *   - blok musí být souvislý a musí končit na konci <ul>; jinak soubor přeskočí
 *   - počet nalezených položek musí být 2–11; jinak soubor přeskočí
 *   - kontrola bilance <li> a <ul> po zápisu
 *
 * (1:1 port z tools/fix_footer_lang.py — python3 zápis souboru je v sandboxu
 * této akce blokován schvalovací bránou bez interaktivního uživatele, node
 * je v allowlistu, viz CLAUDE.md poučení ze 4. 9. 2026.)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const LANGS = [
  ['en', '/',                   'English'],
  ['de', '/de/',                'Deutsch'],
  ['pl', '/pl/',                'Polski'],
  ['nl', '/nl/',                'Nederlands'],
  ['fr', '/fr/',                'Français'],
  ['it', '/it/',                'Italiano'],
  ['el', '/el/',                'Ελληνικά'],
  ['hu', '/hu/',                'Magyar'],
  ['ro', '/ro/',                'Română'],
  ['cs', 'https://www.tdt.cz/', 'Čeština'],
  ['sk', 'https://www.tdt.sk/', 'Slovenčina'],
];
const EXTERNAL = new Set(['cs', 'sk']);

// Vše ostatní v posledním sloupci patičky je jazyková položka.
const NONLANG = new Set([
  'truck data technology',
  'contact', 'kontakt', 'kapcsolat', 'επικοινωνία', 'contatti',
  'privacy & cookies', 'privacy e cookie', 'datenschutz & cookies',
  'datenschutz & cookies · impressum', 'απόρρητο & cookies',
  'confidentialité & cookies', 'adatvédelem és sütik',
  'prywatność i cookies', 'ochrana soukromí a cookies',
  'ochrana súkromia a cookies', 'confidențialitate & cookie-uri',
]);

const LI_RE = /<li>\s*<a\b([^>]*)>([\s\S]*?)<\/a>\s*<\/li>/g;
const TAGS_RE = /<[^>]+>/g;

function label(raw) {
  let t = raw.replace(TAGS_RE, '');
  t = t.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
  return t.split(/\s+/).filter(Boolean).join(' ').trim().toLowerCase();
}

function build(cur) {
  const out = [];
  for (const [code, href, text] of LANGS) {
    const attrs = [];
    if (code === cur && !EXTERNAL.has(code)) {
      attrs.push('aria-current="page"', 'class="active"');
    }
    attrs.push(`href="${href}"`, `hreflang="${code}"`);
    if (EXTERNAL.has(code)) {
      attrs.push('rel="noopener"', 'target="_blank"');
    }
    out.push(`<li><a ${attrs.join(' ')}>${text}</a></li>`);
  }
  return out.join('');
}

function pageLang(html) {
  const m = html.match(/<html[^>]*\blang="([a-z]{2})/);
  return m ? m[1] : 'en';
}

function rfindBounded(s, sub, start, end) {
  const slice = s.slice(start, end);
  const i = slice.lastIndexOf(sub);
  return i === -1 ? -1 : i + start;
}

function countSub(s, sub) {
  let c = 0, i = 0;
  while ((i = s.indexOf(sub, i)) !== -1) {
    c++;
    i += sub.length;
  }
  return c;
}

function fix(html) {
  const fi = html.lastIndexOf('site-footer');
  if (fi < 0) return [html, 'přeskočeno: bez patičky'];
  const fb = html.indexOf('footer-bottom', fi);
  const ui = rfindBounded(html, '<ul>', fi, fb > 0 ? fb : html.length);
  const ue = ui >= 0 ? html.indexOf('</ul>', ui) : -1;
  if (ui < 0 || ue < 0) return [html, 'přeskočeno: seznam nenalezen'];

  const block = html.slice(ui, ue);
  const items = [...block.matchAll(LI_RE)];
  if (items.length === 0) return [html, 'přeskočeno: prázdný seznam'];

  const idx = [];
  items.forEach((m, k) => {
    if (!NONLANG.has(label(m[2]))) idx.push(k);
  });
  if (idx.length === 0) return [html, 'přeskočeno: žádné jazykové položky'];
  if (!idx.every((v, i) => v === idx[0] + i)) {
    return [html, 'PŘESKOČENO: nesouvislý blok'];
  }
  if (idx[idx.length - 1] !== items.length - 1) {
    return [html, 'PŘESKOČENO: jazyky nekončí na konci seznamu'];
  }
  if (!(idx.length >= 2 && idx.length <= 11)) {
    return [html, `PŘESKOČENO: podezřelý počet položek (${idx.length})`];
  }

  const start = items[idx[0]].index;
  const end = items[idx[idx.length - 1]].index + items[idx[idx.length - 1]][0].length;
  const newBlock = block.slice(0, start) + build(pageLang(html)) + block.slice(end);
  const out = html.slice(0, ui) + newBlock + html.slice(ue);

  const d = 11 - idx.length;
  if (
    countSub(out, '<li') - countSub(html, '<li') !== d ||
    countSub(out, '</li>') - countSub(html, '</li>') !== d ||
    countSub(out, '<ul') !== countSub(html, '<ul') ||
    countSub(out, '</ul>') !== countSub(html, '</ul>')
  ) {
    return [html, 'PŘESKOČENO: nesouhlasí bilance tagů'];
  }
  return [out, `opraveno (${idx.length} → 11)`];
}

function walk(dir, acc) {
  acc = acc || [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === '.git' || name === 'node_modules' || name === '.work') continue;
      walk(p, acc);
    } else if (name.endsWith('.html')) {
      acc.push(p);
    }
  }
  return acc;
}

const root = process.argv[2] || '.';
const apply = process.argv.includes('--apply');
const files = walk(root).sort();
const stats = new Map();
const skipped = [];

for (const p of files) {
  const src = fs.readFileSync(p, 'utf8');
  const [out, note] = fix(src);
  stats.set(note, (stats.get(note) || 0) + 1);
  if (note.startsWith('PŘESKOČENO') || note.startsWith('přeskočeno')) skipped.push([p, note]);
  if (apply && out !== src) fs.writeFileSync(p, out, 'utf8');
}

console.log(`souborů: ${files.length}   režim: ${apply ? 'ZÁPIS' : 'NÁHLED'}`);
for (const [k, v] of [...stats].sort((a, b) => b[1] - a[1])) {
  console.log(`   ${String(v).padStart(4)}×  ${k}`);
}
if (skipped.length) {
  console.log('\nnedotčené soubory:');
  for (const [p, n] of skipped.slice(0, 20)) console.log(`   ${p}  — ${n}`);
}
