#!/usr/bin/env node
/*
 * RO + NL e-mailové šablony zkušební verze + telefony jen pro firmy (19. 9. 2026)
 *
 * Node port tools/email_l10n/gen.py + driver_no_phone.py — v GitHub Action
 * sandboxu je zápis souborů přes python3 blokovaný schvalovací bránou.
 * Výstup je bajtově shodný s Python verzí (ověřeno před commitem).
 *
 * 1) Vygeneruje 14 šablon v try/email-preview/ z anglických originálů:
 *      {ro,nl}-{driver,fleet,enforcement}.html   (#1 uvítací)
 *      email2-{driver,fleet}-{ro,nl}.html         (#2 +3 dny)
 *      email3-{driver,fleet}-{ro,nl}.html         (#3 +25 dní)
 * 2) Doplní ro/nl do netlify/functions/trial-email.js (VALID_LANGS,
 *    LANG_URL_SEGMENTS, předměty #1) — jen jednou.
 * 3) Varianta B: z navazujících e-mailů pro řidiče (email{2,3}-driver-*,
 *    všechny jazyky) odstraní řádek s Ivanovými telefony. E-maily pro firmy
 *    a kontakt HU distributora Rukon zůstávají beze změny.
 *
 * Texty: tools/email_l10n/en.json (anglický zdroj, index → text) a
 * tools/email_l10n/{ro,nl}.json (překlad GPT + Gemini, stejné klíče).
 * Idempotentní. Spuštění z kořene repa:  node tools/email_l10n/gen.mjs
 */
import fs from "node:fs";

const D = "tools/email_l10n/";
const EP = "try/email-preview/";
const FN = "netlify/functions/trial-email.js";
const read = (p) => fs.readFileSync(p, "utf8");

const ENT = { nbsp: "\u00a0", middot: "\u00b7", quot: '"', amp: "&", lt: "<", gt: ">", apos: "'", euro: "\u20ac", ndash: "\u2013", mdash: "\u2014" };
function unescape(s) {
  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (m, e) => {
    if (e[0] === "#") return String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    if (!(e in ENT)) throw new Error("Neznámá entita " + m);
    return ENT[e];
  });
}
const escText = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s) => escText(s).replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
const pyStrip = (s) => s.replace(/^\s+|\s+$/g, "");
const TOKEN = /<(style|script)\b[\s\S]*?<\/\1>|>([^<]+)</g;
const ATTR = /\b(alt|title)="([^"]+)"/g;

// Anglické zdrojové texty jsou zmrazené v en.json (index → text). Nepočítají se
// znovu ze šablon, protože krok 3 šablony mění (telefony) a indexy by se posunuly.
const EN = JSON.parse(read(D + "en.json"));
const IDX = new Map(Object.entries(EN).map(([k, t]) => [t, k]));

const LINKS = {
  ro: [["https://tagra.app/", "https://tagra.app/ro/"],
       ["https://tagra.app/privacy/", "https://tagra.app/ro/confidentialitate/"],
       ["https://tagra.app/fleet/", "https://tagra.app/ro/pentru-firme/"],
       ["https://tagra.app/enforcement/", "https://tagra.app/ro/autoritati-de-control/"],
       ["https://tagra.app/manuals/how-to-install-tagra/", "https://tagra.app/ro/manuale/instalare-tagra/"],
       ["https://tagra.app/driver/", "https://tagra.app/ro/pentru-conducatori/"]],
  nl: [["https://tagra.app/", "https://tagra.app/nl/"],
       ["https://tagra.app/privacy/", "https://tagra.app/nl/privacy/"],
       ["https://tagra.app/fleet/", "https://tagra.app/nl/voor-transportbedrijven/"],
       ["https://tagra.app/enforcement/", "https://tagra.app/nl/handhaving/"],
       ["https://tagra.app/manuals/how-to-install-tagra/", "https://tagra.app/nl/handleidingen/tagra-installeren/"],
       ["https://tagra.app/driver/", "https://tagra.app/nl/voor-chauffeurs/"]],
};
const FILES = [["en-driver", "{L}-driver"], ["en-fleet", "{L}-fleet"], ["en-enforcement", "{L}-enforcement"],
               ["email2-driver-en", "email2-driver-{L}"], ["email2-fleet-en", "email2-fleet-{L}"],
               ["email3-driver-en", "email3-driver-{L}"], ["email3-fleet-en", "email3-fleet-{L}"]];
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");

function translate(src, tx, lang) {
  const missing = [];
  let s = src.replace(TOKEN, (whole, tag, raw) => {
    if (tag !== undefined) return whole;
    const t = pyStrip(unescape(raw));
    const k = IDX.get(t);
    if (!t || k === undefined) return whole;
    if (!(k in tx)) { missing.push(t); return whole; }
    const lead = raw.match(/^\s*/)[0];
    const trail = raw.match(/\s*$/)[0];
    return ">" + lead + escText(tx[k]) + trail + "<";
  });
  s = s.replace(ATTR, (whole, a, v) => {
    const k = IDX.get(unescape(v));
    return k !== undefined && k in tx ? `${a}="${escAttr(tx[k])}"` : whole;
  });
  s = s.split('<html lang="en"').join(`<html lang="${lang}"`);
  for (const [a, b] of LINKS[lang]) {
    s = s.replace(new RegExp('href="' + reEsc(a) + '(\\?[^"]*)?"', "g"), (m, q) => `href="${b}${q || ""}"`);
  }
  s = s.replace(/(src=email[23]-(?:driver|fleet))-en\b/g, "$1-" + lang);
  return [s, missing];
}

let problems = 0;

// 1) šablony
for (const lang of ["ro", "nl"]) {
  const tx = JSON.parse(read(D + lang + ".json"));
  for (const [src, dst] of FILES) {
    const [s, missing] = translate(read(EP + src + ".html"), tx, lang);
    const name = EP + dst.replace("{L}", lang) + ".html";
    fs.writeFileSync(name, s);
    console.log("WROTE", name, "missing=" + missing.length);
    problems += missing.length;
  }
}

// 2) trial-email.js
let fn = read(FN);
if (!fn.includes('"ro", "nl"]')) {
  const a = 'const VALID_LANGS     = ["en", "de", "pl", "cz", "sk", "gr", "hu", "it", "fr"];';
  const b = 'it: "it", fr: "fr" };';
  const c = '    enforcement: "Merci pour votre intérêt pour TAGRA Control",\n  },\n};';
  const count = (x) => fn.split(x).length - 1;
  if (count(a) !== 1 || count(b) !== 1 || count(c) !== 1) {
    console.log("PROBLEM trial-email.js anchors not found");
    process.exit(1);
  }
  let blocks = "";
  for (const lang of ["ro", "nl"]) {
    const t = JSON.parse(read(D + lang + ".json"));
    blocks += `  ${lang}: {\n    fleet:       ${JSON.stringify(t["25"])},\n    driver:      ${JSON.stringify(t["0"])},\n` +
              `    enforcement: ${JSON.stringify(t["38"])},\n  },\n`;
  }
  fn = fn.replace(a, a.replace('"fr"];', '"fr", "ro", "nl"];'));
  fn = fn.replace(b, 'it: "it", fr: "fr", ro: "ro", nl: "nl" };');
  fn = fn.replace(c, c.slice(0, -3) + blocks + "};");
  fs.writeFileSync(FN, fn);
  console.log("PATCHED", FN);
} else {
  console.log("SKIP", FN, "(already patched)");
}

// 3) varianta B — Ivanovy telefony pryč z e-mailů pro řidiče
const IVAN = ["tel:+420739005345", "tel:+421905190653"];
const ROW = /\n[ \t]*<tr>\s*<td[^>]*>\s*<a href="tel:\+420739005345"[^>]*>[^<]*<\/a>\s*(?:<span[^>]*>[^<]*<\/span>\s*<a href="tel:\+421905190653"[^>]*>[^<]*<\/a>\s*)?<\/td>\s*<\/tr>/;
let phones = 0;
for (const f of fs.readdirSync(EP).filter((x) => /^email[23]-driver-.+\.html$/.test(x)).sort()) {
  const path = EP + f;
  const s = read(path);
  if (!IVAN.some((n) => s.includes(n))) continue;
  const next = s.replace(ROW, "");
  if (next === s || IVAN.some((n) => next.includes(n))) {
    console.log("PROBLEM phones", path);
    problems++;
    continue;
  }
  fs.writeFileSync(path, next);
  phones++;
  console.log("PHONES REMOVED", path);
}
console.log("phones_removed=" + phones);
console.log("problems=" + problems);
process.exit(problems ? 1 : 0);
