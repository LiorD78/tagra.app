#!/usr/bin/env node
/**
 * build-page-tr.js — Node port zjednodušeného tools/i18n.py walk() (bez bs4/DOM
 * knihovny, čistě regexem — v /run sandboxu je zápis python3 souborů blokovaný
 * schvalovací bránou, viz CLAUDE.md, poučení ze 4. 9.).
 *
 * Extrahuje segmenty ze zdrojového HTML stránky ve stejném pořadí jako
 * tools/i18n.py walk(): <title>, <meta name|property> (jen META_KEYS),
 * textové uzly mimo <script>/<style>/<noscript>/<title>, atributy
 * alt/aria-label/placeholder — všechno v pořadí dokumentu.
 *
 * Použití:
 *   node tools/i18n/build-page-tr.js verify <page_id>
 *     — porovná vlastní extrakci z EN zdroje s existujícím <page_id>.en.json
 *       (self-check walk() logiky, nic nezapisuje)
 *   node tools/i18n/build-page-tr.js tr <page_id> <lang> <html_relpath>
 *     — extrahuje z živé přeložené stránky <html_relpath>, spáruje 1:1 podle
 *       pořadí s <page_id>.en.json a zapíše <page_id>.tr.<lang>.json jako
 *       plochý slovník EN -> překlad (stejný tvar jako u ostatních stránek —
 *       *.tr.de.json / *.tr.pl.json / *.tr.el.json v tomto adresáři; tvar
 *       {page,lang,tr:{index:val}} používaný v *.tr.hu.json je HU výjimka,
 *       kterou tools/i18n.py cmd_todo/cmd_merge (gl.get(s['en'])) neumí číst).
 *       Segmenty, kde živý text == anglický text u běžné věty (ne
 *       jazykově-neutrální token), se do tr NEZAPISUJÍ — zůstávají ve frontě.
 *   node tools/i18n/build-page-tr.js todo <page_id> <lang>
 *     — přegeneruje <page_id>.todo.<lang>.json proti aktuálnímu
 *       <page_id>.tr.<lang>.json (+ _common.<lang>.json glosáři)
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const I18N = __dirname;

const META_KEYS = new Set([
  "description", "keywords",
  "og:title", "og:description", "og:site_name", "og:image:alt",
  "twitter:title", "twitter:description", "twitter:image:alt",
]);
const HAS_LETTER = /\p{L}/u;

const ENTITY_NAMED = {
  amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: " ",
  euro: "€", middot: "·", ndash: "–", mdash: "—", hellip: "…",
  copy: "©", reg: "®", trade: "™",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
};

function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (m, body) => {
    if (body[0] === "#") {
      const isHex = body[1] === "x" || body[1] === "X";
      const code = isHex ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return Object.prototype.hasOwnProperty.call(ENTITY_NAMED, body) ? ENTITY_NAMED[body] : m;
  });
}

function norm(raw) {
  return decodeEntities(raw).replace(/\s+/g, " ").trim();
}

function stripComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, (m) => " ".repeat(m.length));
}

function stripDoctype(html) {
  return html.replace(/<!doctype[^>]*>/i, (m) => " ".repeat(m.length));
}

function blankTagBlocks(html, names) {
  const re = new RegExp(`<(${names.join("|")})\\b[^>]*>[\\s\\S]*?<\\/\\1>`, "gi");
  return html.replace(re, (m) => " ".repeat(m.length));
}

function parseAttrs(tagSrc) {
  const attrs = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = re.exec(tagSrc))) {
    attrs[m[1].toLowerCase()] = m[3] !== undefined ? m[3] : m[4];
  }
  return attrs;
}

// Mirrors tools/i18n.py walk(): title, meta[META_KEYS], text (outside
// script/style/noscript/title), attr(alt/aria-label/placeholder) — each
// group in document order, groups concatenated in that fixed order.
function walk(html) {
  html = stripComments(html);
  html = stripDoctype(html);
  html = blankTagBlocks(html, ["script", "style", "noscript"]);

  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? norm(titleMatch[1]) : null;
  if (titleMatch) {
    html = html.slice(0, titleMatch.index) +
      " ".repeat(titleMatch[0].length) +
      html.slice(titleMatch.index + titleMatch[0].length);
  }

  const metas = [];
  const texts = [];
  const attrs = [];

  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
  let lastIndex = 0;
  let m;
  while ((m = tagRe.exec(html))) {
    const chunk = html.slice(lastIndex, m.index);
    if (chunk) {
      const t = norm(chunk);
      if (t && HAS_LETTER.test(t)) texts.push(t);
    }
    lastIndex = tagRe.lastIndex;

    const tagName = m[1].toLowerCase();
    const a = parseAttrs(m[2]);

    if (tagName === "meta") {
      const key = a.name || a.property;
      if (key && META_KEYS.has(key) && a.content) {
        const v = norm(a.content);
        if (v) metas.push(v);
      }
    }
    for (const name of ["alt", "aria-label", "placeholder"]) {
      if (a[name]) {
        const v = norm(a[name]);
        if (v && HAS_LETTER.test(v)) attrs.push(v);
      }
    }
  }
  const tail = html.slice(lastIndex);
  if (tail) {
    const t = norm(tail);
    if (t && HAS_LETTER.test(t)) texts.push(t);
  }

  const segs = [];
  if (title) segs.push({ k: "title", v: title });
  for (const v of metas) segs.push({ k: "meta", v });
  for (const v of texts) segs.push({ k: "text", v });
  for (const v of attrs) segs.push({ k: "attr", v });
  return segs;
}

function readEnSegments(pageId) {
  const p = path.join(I18N, `${pageId}.en.json`);
  const d = JSON.parse(fs.readFileSync(p, "utf8"));
  return d.segments.map((s) => ({ k: s.k, v: s.en }));
}

// Jazykový přepínač (.nav-lang-menu) vypisuje název každého jazyka jeho
// vlastním endonymem — ten se nepřekládá, je stejný na každé jazykové mutaci
// (viz LANGS/EXTERNAL_LANGS v tools/i18n.py set_langmenu()). Uzavřená, stálá
// množina — bezpečné tvrdě zapsat, ne totéž co hádat překlad.
const LANG_MENU_ENDONYMS = new Set([
  "English", "Deutsch", "Polski", "Nederlands", "Français", "Italiano",
  "Ελληνικά", "Magyar", "Română", "Čeština", "Slovenčina",
]);

// Language-neutral token: ok to keep identical to EN (brand names, numbers,
// codes, emails, URLs, short acronyms) — not a sign of a missed translation.
function isLangNeutral(s) {
  if (LANG_MENU_ENDONYMS.has(s)) return true;
  if (!HAS_LETTER.test(s)) return true; // purely numeric/punctuation
  if (/^[A-Z0-9 .,€$/·%()+-]+$/.test(s)) return true; // e.g. "TAGRA MAX", "19 EUR / year", "561/2006"
  if (/@/.test(s) || /^https?:\/\//.test(s) || /^www\./i.test(s)) return true;
  if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(s)) return true; // e.g. "sftp.styletronic.eu", "tdt.cz"
  if (/^[A-Za-zÀ-ž0-9.,'’()/-]{1,3}$/.test(s)) return true; // very short tokens/codes
  if (/^(TAGRA|DKV LIVE|SFTP|USB|GPS|Windows|Truck Data Technology,? s\.r\.o\.|AETR)\b/.test(s)) return true;
  return false;
}

// Živé přeložené stránky mohou mít drobně odlišnou DOM strukturu než aktuální
// EN šablona (vložená sekce navíc, přeuspořádaný blok) — čistě pořadové
// spárování podle indexu by v takovém úseku tiše spárovalo špatný EN řetězec
// se špatným překladem. Řešení: najdi "kotvy" — segmenty s jazykově
// neinvariantním obsahem (čísla o >=2 číslicích, technické řetězce), spáruj
// je mezi EN a živou stránkou pomocí LCS (musí jít za sebou v obou pořadích),
// a teprve MEZI dvěma sousedními kotvami spároduj zbytek 1:1 — ale jen když
// má úsek na obou stranách stejnou délku. Jinak úsek zůstává nespárovaný
// (řetězce zůstanou ve frontě todo, žádný hádaný překlad se nezapíše).
const ANCHOR_KEYWORDS = [
  ".DDD", ".C1B", ".V1B", "ESM", "G2V2", "SFTP", "sftp.styletronic.eu",
  "sales@tagra.app", "tdt.cz", "DKV LIVE", "AETR", "QR",
  "TAGRA Trucker", "TAGRA MAX", "TAGRA 1", "TAGRA 2", "TAGRA 4", "TAGRA 6",
];

function extractAnchorTokens(s) {
  const tokens = [];
  for (const kw of ANCHOR_KEYWORDS) if (s.includes(kw)) tokens.push(kw);
  const nums = s.match(/\d{2,}/g);
  if (nums) tokens.push(...nums);
  return tokens;
}

function signature(s) {
  const tokens = extractAnchorTokens(s);
  if (!tokens.length) return null;
  return tokens.sort().join("|");
}

// Standard LCS DP nad rovností podpisů (ne hodnot) — vrátí seznam
// spárovaných dvojic indexů [enIdx, otherIdx] v rostoucím pořadí v obou.
function lcsAlignBySignature(enVals, otherVals) {
  const enSig = enVals.map(signature);
  const otherSig = otherVals.map(signature);
  const n = enSig.length, m = otherSig.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (enSig[i] !== null && enSig[i] === otherSig[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }
  const pairs = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (enSig[i] !== null && enSig[i] === otherSig[j]) {
      pairs.push([i, j]);
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return pairs;
}

// Vrátí mapu enIndex -> otherIndex jen tam, kde je spárování jisté: přímo na
// kotvě, nebo v úseku mezi dvěma kotvami stejné délky na obou stranách.
function safeAlign(enVals, otherVals) {
  const anchorPairs = lcsAlignBySignature(enVals, otherVals);
  const map = new Map();
  let prevEn = -1, prevOther = -1;
  const boundaries = [...anchorPairs, [enVals.length, otherVals.length]];
  const stats = { anchors: anchorPairs.length, safeGapChars: 0, unsafeGaps: 0, unsafeSpan: 0 };
  for (const [ei, oi] of boundaries) {
    const enGapLen = ei - prevEn - 1;
    const otherGapLen = oi - prevOther - 1;
    if (enGapLen === otherGapLen) {
      for (let k = 1; k <= enGapLen; k++) map.set(prevEn + k, prevOther + k);
      stats.safeGapChars += enGapLen;
    } else if (enGapLen > 0 || otherGapLen > 0) {
      stats.unsafeGaps++;
      stats.unsafeSpan += enGapLen;
    }
    if (ei < enVals.length) map.set(ei, oi); // kotva samotná
    prevEn = ei; prevOther = oi;
  }
  return { map, stats };
}

function cmdVerify(pageId) {
  const slugmap = JSON.parse(fs.readFileSync(path.join(ROOT, "i18n", "slugmap.json"), "utf8"));
  const enPath = path.join(ROOT, slugmap[pageId].en, "index.html");
  const html = fs.readFileSync(enPath, "utf8");
  const extracted = walk(html);
  const expected = readEnSegments(pageId);
  console.log(`extracted: ${extracted.length}, expected (${pageId}.en.json): ${expected.length}`);
  let mismatches = 0;
  const n = Math.min(extracted.length, expected.length);
  for (let i = 0; i < n; i++) {
    if (extracted[i].k !== expected[i].k || extracted[i].v !== expected[i].v) {
      mismatches++;
      if (mismatches <= 10) {
        console.log(`  #${i} MISMATCH\n    got:      ${extracted[i].k} ${JSON.stringify(extracted[i].v)}\n    expected: ${expected[i].k} ${JSON.stringify(expected[i].v)}`);
      }
    }
  }
  console.log(`mismatches: ${mismatches}`);
  process.exit(mismatches === 0 && extracted.length === expected.length ? 0 : 1);
}

function loadCommonDict(lang) {
  const p = path.join(I18N, `_common.${lang}.json`);
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function cmdTr(pageId, lang, htmlRel) {
  const htmlPath = path.join(ROOT, htmlRel);
  const html = fs.readFileSync(htmlPath, "utf8");
  const extracted = walk(html);
  const enSegs = readEnSegments(pageId);
  const enVals = enSegs.map((s) => s.v);
  const otherVals = extracted.map((s) => s.v);

  if (extracted.length !== enSegs.length) {
    console.log(`⚠️  počet segmentů nesedí: živá stránka ${extracted.length}, ${pageId}.en.json ${enSegs.length} — stránka strukturně neodpovídá 1:1 aktuální EN šabloně, používám kotvové (anchor) párování místo prostého indexu.`);
  }

  const { map, stats } = safeAlign(enVals, otherVals);
  console.log(`   kotvy (anchor body): ${stats.anchors}, bezpečně spárováno mezerami: ${stats.safeGapChars}, nejisté úseky: ${stats.unsafeGaps} (celkem ${stats.unsafeSpan} EN segmentů bez páru)`);

  const tr = {};
  const identicalKept = [];
  const identicalSkipped = [];
  const unresolved = [];
  for (let i = 0; i < enSegs.length; i++) {
    const en = enVals[i];
    if (en in tr) continue; // dedup: první výskyt vítězí, stejně jako cmd_todo/cmd_merge (klíčováno EN textem)
    if (!map.has(i)) {
      unresolved.push(en);
      continue;
    }
    const j = map.get(i);
    if (extracted[j].k !== enSegs[i].k) {
      unresolved.push(en); // typ segmentu nesedí — nejistý pár, nehádej
      continue;
    }
    const val = otherVals[j];
    if (val === en) {
      if (isLangNeutral(en)) {
        tr[en] = val;
        identicalKept.push(en);
      } else {
        identicalSkipped.push(en);
      }
      continue;
    }
    tr[en] = val;
  }

  // Uzavřená množina jazykových endonym z nav-lang-menu (viz LANG_MENU_ENDONYMS
  // výše) — pokud se EN řetězec nepodařilo spárovat kotvami, ale živá stránka
  // ho doslovně obsahuje, je bezpečné ho převzít i bez pozičního párování.
  let endonymsRecovered = 0;
  for (const en of enVals) {
    if (LANG_MENU_ENDONYMS.has(en) && !(en in tr) && otherVals.includes(en)) {
      tr[en] = en;
      endonymsRecovered++;
    }
  }

  const dst = path.join(I18N, `${pageId}.tr.${lang}.json`);
  fs.writeFileSync(dst, JSON.stringify(tr, null, 1) + "\n", "utf8");
  console.log(`✅ ${path.relative(ROOT, dst)} — ${Object.keys(tr).length} párů`);
  console.log(`   shodné s EN a ponechané (jazykově neutrální): ${identicalKept.length}`);
  console.log(`   shodné s EN a VYNECHANÉ (podezření na nepřeloženo, zůstává v todo): ${identicalSkipped.length}`);
  if (identicalSkipped.length) {
    for (const s of identicalSkipped.slice(0, 20)) console.log(`     - ${s}`);
  }
  console.log(`   nejisté párování (bez kotev v okolí, zůstává v todo): ${unresolved.length}`);
  if (unresolved.length) {
    for (const s of unresolved.slice(0, 20)) console.log(`     ? ${s}`);
  }
  if (endonymsRecovered) {
    console.log(`   dodatečně dohledáno přes LANG_MENU_ENDONYMS (bez pozičního párování): ${endonymsRecovered}`);
  }
}

function cmdTodo(pageId, lang) {
  const enSegs = readEnSegments(pageId);
  const gl = loadCommonDict(lang);
  const pf = path.join(I18N, `${pageId}.tr.${lang}.json`);
  if (fs.existsSync(pf)) Object.assign(gl, JSON.parse(fs.readFileSync(pf, "utf8")));

  const todo = [];
  const seen = new Set();
  for (const s of enSegs) {
    const en = s.v;
    if (en in gl || seen.has(en)) continue;
    seen.add(en);
    todo.push(en);
  }
  const dst = path.join(I18N, `${pageId}.todo.${lang}.json`);
  const before = fs.existsSync(dst) ? fs.statSync(dst).size : 0;
  fs.writeFileSync(dst, JSON.stringify(todo, null, 1) + "\n", "utf8");
  const after = fs.statSync(dst).size;
  console.log(`✅ ${path.relative(ROOT, dst)} — ${todo.length} řetězců k překladu (${before} B → ${after} B)`);
}

const [, , cmd, ...args] = process.argv;
if (cmd === "verify") cmdVerify(args[0]);
else if (cmd === "tr") cmdTr(args[0], args[1], args[2]);
else if (cmd === "todo") cmdTodo(args[0], args[1]);
else {
  console.error("Použití:\n  build-page-tr.js verify <page_id>\n  build-page-tr.js tr <page_id> <lang> <html_relpath>\n  build-page-tr.js todo <page_id> <lang>");
  process.exit(1);
}
