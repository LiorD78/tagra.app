#!/usr/bin/env node
/**
 * apply-es-home.js — Node ekvivalent `i18n.py apply home es` (bs4 ani zápis
 * přes python3 nejsou v /run sandboxu k dispozici, viz CLAUDE.md).
 *
 * Vstup:  index.html (EN home) + tools/i18n/es-core.tr.es.json (slovník EN -> ES)
 *         + i18n/slugmap.json (musí obsahovat "es" u home/fleet/driver/try/thanks)
 * Výstup: es/index.html, tools/i18n/home.todo.es.json
 *
 * Segmenty se berou stejným walkem jako tools/i18n/build-page-tr.js walk()
 * (title, meta[META_KEYS], textové uzly mimo script/style/noscript, atributy
 * alt/aria-label/placeholder), ale se zachováním pozic -> náhrada přímo
 * v původním HTML. Nic se neinterpretuje: co není ve slovníku, zůstává EN.
 *
 * Použití (z kořene tagra.app):  node tools/i18n/apply-es-home.js
 * Skript je idempotentní (výstup je vždy čistá funkce EN zdroje).
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const LANG = "es";
const LOCALE = "es_ES";
const SLUGMAP = JSON.parse(fs.readFileSync(path.join(ROOT, "i18n", "slugmap.json"), "utf8"));
const DICT = JSON.parse(fs.readFileSync(path.join(__dirname, "es-core.tr.es.json"), "utf8"));

const META_KEYS = new Set(["description", "keywords", "og:title", "og:description", "og:site_name",
  "og:image:alt", "twitter:title", "twitter:description", "twitter:image:alt"]);
const LD_KEYS = new Set(["name", "description", "text", "headline", "alternateName", "about",
  "articleSection", "jobTitle", "caption"]);
const HAS_LETTER = /\p{L}/u;
const ENT = { amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: " ", euro: "€", middot: "·",
  ndash: "–", mdash: "—", hellip: "…", copy: "©", reg: "®", trade: "™", rsquo: "’", lsquo: "‘",
  rdquo: "”", ldquo: "“" };
const decode = (s) => s.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (m, b) => {
  if (b[0] === "#") {
    const c = (b[1] === "x" || b[1] === "X") ? parseInt(b.slice(2), 16) : parseInt(b.slice(1), 10);
    return Number.isFinite(c) ? String.fromCodePoint(c) : m;
  }
  return Object.prototype.hasOwnProperty.call(ENT, b) ? ENT[b] : m;
});
const norm = (raw) => decode(raw).replace(/\s+/g, " ").trim();
const escText = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const blank = (m) => " ".repeat(m.length);

// Jazykově neutrální tokeny (stejná pravidla jako při sestavení slovníku, 36b-build-es-tr.js)
const NEUTRAL_SKIP = new Set(["TAGRA", "EN", "English", "Deutsch", "Polski", "Nederlands", "Français",
  "Italiano", "Ελληνικά", "Magyar", "Română", "Čeština", "Slovenčina", "Español", "TAGRA III",
  "sales@tagra.app", "FAQ", "Windows"]);
const isNeutral = (v) => NEUTRAL_SKIP.has(v) || /^[\d\s€.,:+/%–\-()×]+$/.test(v) || /^[A-Z0-9 .+\-/]{1,6}$/.test(v)
  || !HAS_LETTER.test(v);

const todo = [];
const todoSeen = new Set();
let translated = 0, neutral = 0, missing = 0, total = 0;
function lookup(v) {
  total++;
  if (Object.prototype.hasOwnProperty.call(DICT, v)) { translated++; return DICT[v]; }
  if (isNeutral(v)) { neutral++; return null; }
  missing++;
  if (!todoSeen.has(v)) { todoSeen.add(v); todo.push(v); }
  return null;
}

// ---------- 1) segmenty v původním HTML (span-preserving walk) ----------
function translateBody(src) {
  let h = src.replace(/<!--[\s\S]*?-->/g, blank).replace(/<!doctype[^>]*>/i, blank);
  h = h.replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, blank);
  const edits = []; // {s, e, text}
  const tm = h.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (tm) {
    const innerStart = tm.index + tm[0].indexOf(">") + 1;
    const v = norm(tm[1]);
    const t = v ? lookup(v) : null;
    if (t != null) edits.push({ s: innerStart, e: innerStart + tm[1].length, text: escText(t) });
    h = h.slice(0, tm.index) + blank(tm[0]) + h.slice(tm.index + tm[0].length);
  }
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
  const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let last = 0, m;
  const textChunk = (s, e) => {
    const chunk = h.slice(s, e);
    const v = norm(chunk);
    if (!v || !HAS_LETTER.test(v)) return;
    const t = lookup(v);
    if (t == null) return;
    const lead = chunk.slice(0, chunk.length - chunk.trimStart().length);
    const trail = chunk.slice(chunk.trimEnd().length);
    edits.push({ s, e, text: lead + escText(t) + trail });
  };
  const attrEdits = [];
  while ((m = tagRe.exec(h))) {
    if (m.index > last) textChunk(last, m.index);
    last = tagRe.lastIndex;
    const tag = m[1].toLowerCase();
    const bodyOff = m.index + m[0].indexOf(m[2], 1 + m[1].length);
    attrRe.lastIndex = 0;
    let a;
    const attrs = [];
    while ((a = attrRe.exec(m[2]))) {
      const val = a[3] !== undefined ? a[3] : a[4];
      const valStart = bodyOff + a.index + a[0].indexOf(a[2]) + 1;
      attrs.push({ name: a[1].toLowerCase(), val, s: valStart, e: valStart + val.length });
    }
    const byName = Object.fromEntries(attrs.map((x) => [x.name, x]));
    if (tag === "meta") {
      const key = (byName.name || byName.property || {}).val;
      const c = byName.content;
      if (key && META_KEYS.has(key) && c && c.val) {
        const v = norm(c.val);
        if (v) { const t = lookup(v); if (t != null) attrEdits.push({ s: c.s, e: c.e, text: escAttr(t) }); }
      }
    }
    for (const n of ["alt", "aria-label", "placeholder"]) {
      const x = byName[n];
      if (x && x.val) {
        const v = norm(x.val);
        if (v && HAS_LETTER.test(v)) { const t = lookup(v); if (t != null) attrEdits.push({ s: x.s, e: x.e, text: escAttr(t) }); }
      }
    }
  }
  if (last < h.length) textChunk(last, h.length);
  const all = edits.concat(attrEdits).sort((x, y) => y.s - x.s);
  let out = src;
  for (const ed of all) out = out.slice(0, ed.s) + ed.text + out.slice(ed.e);
  return out;
}

// ---------- 2) data-* šablony (JS selektor cen) — jen to, co je ve slovníku ----------
function translateDataAttrs(html) {
  return html.replace(/\b(data-(?:cap|fee|cta|note|note-box|save))="([^"]*)"/g, (all, name, val) => {
    const v = norm(val);
    if (Object.prototype.hasOwnProperty.call(DICT, v)) { translated++; total++; return `${name}="${escAttr(DICT[v])}"`; }
    if (isNeutral(v) || !/[A-Za-z]{3}/.test(v) || !/[ {]/.test(v)) return all;
    total++; missing++;
    if (!todoSeen.has(v)) { todoSeen.add(v); todo.push(v); }
    return all;
  });
}

// ---------- 3) JSON-LD ----------
function ldApply(o) {
  if (Array.isArray(o)) { o.forEach(ldApply); return; }
  if (o && typeof o === "object") {
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (LD_KEYS.has(k) && typeof v === "string" && HAS_LETTER.test(v)) {
        const t = lookup(norm(v));
        if (t != null) o[k] = t;
      } else ldApply(v);
    }
  }
}
function urlMap() {
  const um = {};
  for (const d of Object.values(SLUGMAP)) {
    if (d.en === undefined || d[LANG] === undefined) continue;
    const en = d.en.replace(/^\/|\/$/g, ""), lg = d[LANG].replace(/^\/|\/$/g, "");
    um[en ? `https://tagra.app/${en}/` : "https://tagra.app/"] = `https://tagra.app/${lg}/`;
  }
  return um;
}
function fixLd(txt) {
  const um = urlMap();
  txt = txt.replace('"inLanguage": "en"', `"inLanguage": "${LANG}"`);
  for (const k of Object.keys(um).filter((k) => k !== "https://tagra.app/").sort((a, b) => b.length - a.length)) {
    txt = txt.split(k).join(um[k]);
  }
  return txt.split('"https://tagra.app/"').join(`"${um["https://tagra.app/"]}"`);
}
function translateLd(html) {
  return html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (all, o, body, c) => {
    let data;
    try { data = JSON.parse(body); } catch (e) { return all; }
    ldApply(data);
    return o + "\n" + fixLd(JSON.stringify(data, null, 2)) + "\n" + c;
  });
}

// ---------- 4) head, odkazy, přepínač ----------
const enPath = (id) => SLUGMAP[id].en.replace(/^\/|\/$/g, "");
const EN2ID = {};
for (const id of Object.keys(SLUGMAP)) if (SLUGMAP[id].en !== undefined) EN2ID[enPath(id)] = id;

function localizeHrefs(html) {
  return html.replace(/(<a\b[^>]*?\bhref=")(\/[^"]*)(")/g, (all, p1, href, p3) => {
    if (href.startsWith("//")) return all;
    const body = href.split("?")[0].split("#")[0];
    const tail = href.slice(body.length);
    const id = EN2ID[body.replace(/^\/|\/$/g, "")];
    if (id && SLUGMAP[id][LANG]) return p1 + "/" + SLUGMAP[id][LANG].replace(/^\/|\/$/g, "") + "/" + tail + p3;
    return all;
  });
}

function setHead(html) {
  html = html.replace('<html lang="en">', `<html lang="${LANG}">`);
  html = html.replace('<link href="https://tagra.app/" rel="canonical"/>', `<link href="https://tagra.app/${SLUGMAP.home[LANG]}/" rel="canonical"/>`);
  html = html.replace('<meta content="https://tagra.app/" property="og:url"/>',
    `<meta content="https://tagra.app/${SLUGMAP.home[LANG]}/" property="og:url"/>\n<meta content="${LOCALE}" property="og:locale"/>`);
  // hreflang: stejná sada jako EN + es (abecedně), reciproční odkazy jinde se NEdělají (dávka D)
  const link = (hl, href) => `<link href="${href}" hreflang="${hl}" rel="alternate"/>`;
  html = html.replace(link("el", "https://tagra.app/el/"), link("el", "https://tagra.app/el/") + link("es", `https://tagra.app/${SLUGMAP.home[LANG]}/`));
  return html;
}

function setLangMenu(html) {
  html = html.replace('<summary aria-label="Language: EN">EN</summary>', '<summary aria-label="Language: ES">ES</summary>');
  const cur = ' aria-current="page" class="active"';
  const strip = (s) => s.split(`<a${cur} href="/" hreflang="en">`).join('<a href="/" hreflang="en">');
  html = strip(html);
  const esA = `<a${cur} href="/es/" hreflang="es">Español</a>`;
  // za Italiano: v menu v hlavičce i v patičce (<li>)
  html = html.replace('<a href="/it/" hreflang="it">Italiano</a></li>', `<a href="/it/" hreflang="it">Italiano</a></li><li>${esA}</li>`);
  html = html.replace('<a href="/it/" hreflang="it">Italiano</a><a', `<a href="/it/" hreflang="it">Italiano</a>${esA}<a`);
  return html;
}

// ---------- main ----------
for (const [id, slug] of [["home", "es"], ["fleet", "es/empresas"], ["driver", "es/conductores"], ["try", "es/prueba-gratis"], ["thanks", "es/gracias"]]) {
  if (SLUGMAP[id][LANG] !== slug) { console.error(`slugmap ${id}.${LANG} != ${slug}`); process.exit(1); }
}
const srcHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
let out = translateBody(srcHtml);
out = translateDataAttrs(out);
out = translateLd(out);
out = localizeHrefs(out);
out = setHead(out);
out = setLangMenu(out);

fs.mkdirSync(path.join(ROOT, "es"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "es", "index.html"), out, "utf8");
fs.writeFileSync(path.join(__dirname, "home.todo.es.json"), JSON.stringify(todo, null, 1) + "\n", "utf8");
console.log(`es/index.html: ${(Buffer.byteLength(out) / 1024).toFixed(1)} KB`);
console.log(`segmentů celkem ${total}: přeloženo ${translated}, jazykově neutrální ${neutral}, bez překladu ${missing} (unikátních ${todo.length})`);
