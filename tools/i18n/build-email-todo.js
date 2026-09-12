#!/usr/bin/env node
/**
 * Postaví tools/i18n/emails.todo.<lang>.json — kompletní deduplikovaný seznam
 * anglických řetězců ze všech e-mailových šablon, které nová jazyková mutace
 * (zatím bez glosáře) potřebuje přeložit.
 *
 * Zdroj: try/email-preview/{en-fleet,en-driver,en-enforcement,
 *        email2-fleet-en,email2-driver-en,email3-fleet-en,email3-driver-en}.html
 * (email2/email3 mají jen fleet+driver — enforcement je z těchto sekvencí
 * úmyslně vyloučen, viz netlify/functions/trial-email.js)
 *
 * Extrakce zrcadlí walk() z tools/i18n.py (BeautifulSoup na běžných stránkách):
 * <title>, textové uzly mimo <script>/<style>, atributy alt/aria-label/placeholder.
 * Entity (&euro;, &nbsp; …) se ponechávají doslovně, nedekódují se.
 *
 * Po sestavení fronta prochází kontrolou na 3 zakázané vzory z issue #163:
 *   1. tvrzení, že čtečka je součástí balení ("included in the box" / "ships
 *      with a reader included")
 *   2. "139" jako roční poplatek TAGRA MAX (správně 149 €)
 *   3. "Article 10b(2)" (správně Article 10(2))
 *
 * Použití: node tools/i18n/build-email-todo.js nl ro
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const TPL_DIR = path.join(ROOT, "try", "email-preview");
const OUT_DIR = __dirname;

const SOURCES = [
  "en-fleet.html",
  "en-driver.html",
  "en-enforcement.html",
  "email2-fleet-en.html",
  "email2-driver-en.html",
  "email3-fleet-en.html",
  "email3-driver-en.html",
];

const HAS_LETTER = /\p{L}/u;

// Entity se ve výstupu ponechávají doslovně (žádné se nedekóduje jako
// alfabetický znak — €, &middot;, &nbsp; a „ nejsou písmena) — dekóduje se
// jen dočasná kopie pro test "obsahuje písmeno", aby fragmenty typu čistě
// "&nbsp;" nebo "&middot;" nevypadaly jako přeložitelný text.
const ENTITY_DECODE = { "&euro;": "€", "&middot;": "·", "&nbsp;": " ", "&quot;": '"' };
function decodeForLetterCheck(s) {
  return s.replace(/&[a-zA-Z]+;/g, (e) => ENTITY_DECODE[e] ?? e);
}

function stripScriptStyle(html) {
  return html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, (m) =>
    " ".repeat(m.length)
  );
}

function norm(raw) {
  return raw.replace(/\s+/g, " ").trim();
}

function extractFromFile(file, seen, out) {
  const html = fs.readFileSync(path.join(TPL_DIR, file), "utf8");

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch) add(norm(titleMatch[1]), seen, out);

  const body = stripScriptStyle(html);

  for (const m of body.matchAll(/>([^<>]+)</g)) {
    add(norm(m[1]), seen, out);
  }

  for (const m of html.matchAll(/\s(?:alt|aria-label|placeholder)="([^"]*)"/gi)) {
    add(norm(m[1]), seen, out);
  }
}

function add(text, seen, out) {
  if (!text || !HAS_LETTER.test(decodeForLetterCheck(text))) return;
  if (seen.has(text)) return;
  seen.add(text);
  out.push(text);
}

function build() {
  const seen = new Set();
  const out = [];
  for (const file of SOURCES) {
    extractFromFile(file, seen, out);
  }
  return out;
}

const FORBIDDEN = [
  [/included in the box/i, "čtečka jako součást balení (bod 1)"],
  [/ships with a reader included/i, "čtečka jako součást balení (bod 1)"],
  [/(?<!1)\b139\b(?!\s*\/)/, "€139 jako roční poplatek MAX místo 149 (bod 2)"],
  [/Article 10b\(2\)/, "Article 10b(2) místo Article 10(2) (bod 3)"],
];

function checkForbidden(list) {
  const hits = [];
  for (const s of list) {
    for (const [re, label] of FORBIDDEN) {
      if (re.test(s)) hits.push({ label, s });
    }
  }
  return hits;
}

const langs = process.argv.slice(2);
if (!langs.length) {
  console.error("Použití: node tools/i18n/build-email-todo.js <lang> [<lang> ...]");
  process.exit(1);
}

const todo = build();
console.log(`  emails: ${todo.length} unikátních řetězců z ${SOURCES.length} šablon`);

const hits = checkForbidden(todo);
if (hits.length) {
  console.error("  ✗ kontrola obsahu SELHALA — fronta obsahuje zakázaný vzor:");
  for (const h of hits) console.error(`      [${h.label}] ${h.s}`);
  process.exit(1);
}
console.log("  ✅ kontrola obsahu (bod 3): žádný ze 3 zakázaných vzorů ve frontě není");

for (const lang of langs) {
  const dst = path.join(OUT_DIR, `emails.todo.${lang}.json`);
  fs.writeFileSync(dst, JSON.stringify(todo, null, 1) + "\n", "utf8");
  console.log(`  ✅ ${path.relative(ROOT, dst)} (${todo.length} řetězců)`);
}
