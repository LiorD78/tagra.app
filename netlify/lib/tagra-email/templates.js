/**
 * Registr nových šablon e-mailů zkušební verze tagra.app (v2, TAGRA III).
 * EN a DE mají hotové content-{lang}.json. Ostatní jazyky se skládají za běhu z překladu
 * tools/trial-email-i18n/raw/{lang}.json + urls/{lang}.json nad strukturou content-en.json
 * (stejná logika jako tools/trial-email-i18n/assemble.py).
 * Nový jazyk: raw + urls, kód do RAW_LANGS a jeho cesty do config.path v netlify/functions/trial-templates.mjs.
 * Jazyky, které tu nejsou, dál posílají staré statické šablony z /try/email-preview/.
 */
const { renderMail } = require("./render.js");
const EN = require("./content-en.json");
const I18N = {
  order: require("../../../tools/trial-email-i18n/order.json"),
  aliases: require("../../../tools/trial-email-i18n/aliases.json"),
  tokens: require("../../../tools/trial-email-i18n/tokens.json"),
};
const RAW = {
  pl: [require("../../../tools/trial-email-i18n/raw/pl.json"), require("../../../tools/trial-email-i18n/urls/pl.json")],
  hu: [require("../../../tools/trial-email-i18n/raw/hu.json"), require("../../../tools/trial-email-i18n/urls/hu.json")],
  it: [require("../../../tools/trial-email-i18n/raw/it.json"), require("../../../tools/trial-email-i18n/urls/it.json")],
  fr: [require("../../../tools/trial-email-i18n/raw/fr.json"), require("../../../tools/trial-email-i18n/urls/fr.json")],
  es: [require("../../../tools/trial-email-i18n/raw/es.json"), require("../../../tools/trial-email-i18n/urls/es.json")],
  nl: [require("../../../tools/trial-email-i18n/raw/nl.json"), require("../../../tools/trial-email-i18n/urls/nl.json")],
  ro: [require("../../../tools/trial-email-i18n/raw/ro.json"), require("../../../tools/trial-email-i18n/urls/ro.json")],
  gr: [require("../../../tools/trial-email-i18n/raw/gr.json"), require("../../../tools/trial-email-i18n/urls/gr.json")],
};

function restore(v) {
  return v
    .replace(/<a\d+>/g, (t) => I18N.tokens[t])
    .replace(/<b>/g, '<strong class="dm-text" style="color:#0b2c4a;">')
    .replace(/<\/b>/g, "</strong>");
}
function setPath(o, path, val) {
  const p = path.split("/");
  for (const k of p.slice(0, -1)) o = Array.isArray(o) ? o[+k] : o[k];
  const last = p[p.length - 1];
  if (Array.isArray(o)) o[+last] = val;
  else o[last] = val;
}
function mapStrings(x, f) {
  if (typeof x === "string") return f(x);
  if (Array.isArray(x)) return x.map((y) => mapStrings(y, f));
  if (x && typeof x === "object") return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, mapStrings(v, f)]));
  return x;
}
function build(raw, urls) {
  const d = JSON.parse(JSON.stringify(EN));
  const tr = {};
  I18N.order.forEach((k, i) => (tr[k] = raw[String(i)]));
  for (const k of I18N.order) setPath(d, k, restore(tr[k]));
  for (const [k, src] of Object.entries(I18N.aliases)) setPath(d, k, restore(tr[src]));
  d.common.html_lang = urls.html_lang;
  const pairs = [];
  for (const [a, b] of urls.replace) {
    const m = /^"web": "(.*)"$/.exec(a);
    if (m) { if (d.common.footer.web === m[1]) d.common.footer.web = /^"web": "(.*)"$/.exec(b)[1]; }
    else pairs.push([a, b]);
  }
  const euro = urls.euro.replace(/\\1/g, "$1");
  return mapStrings(d, (s) => {
    for (const [a, b] of pairs) s = s.split(a).join(b);
    return s.replace(/€(\d+)/g, euro);
  });
}

const CONTENT = { en: EN, de: require("./content-de.json") };
for (const [lang, [raw, urls]] of Object.entries(RAW)) CONTENT[lang] = build(raw, urls);

/** Název šablony (např. en-fleet, email3-driver-pl) → { html, title } nebo null. */
function renderTemplate(name) {
  for (const [lang, c] of Object.entries(CONTENT)) {
    for (const [k, m] of Object.entries(c.mails)) {
      if (k.replace("{lang}", lang) === name) return { html: renderMail(m, c.common), title: m.title };
    }
  }
  return null;
}

function names() {
  const out = [];
  for (const [lang, c] of Object.entries(CONTENT)) for (const k of Object.keys(c.mails)) out.push(k.replace("{lang}", lang));
  return out;
}

module.exports = { CONTENT, renderTemplate, names };
