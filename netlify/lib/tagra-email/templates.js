/**
 * Registr nových šablon e-mailů zkušební verze tagra.app (v2, TAGRA III).
 * Jazyk se zapojí tak, že se přidá content-{lang}.json a řádek do CONTENT níže
 * a jeho cesty do config.path ve funkci netlify/functions/trial-templates.mjs.
 * Jazyky, které tu nejsou, dál posílají staré statické šablony z /try/email-preview/.
 */
const { renderMail } = require("./render.js");

const CONTENT = {
  en: require("./content-en.json"),
  de: require("./content-de.json"),
};

/** Název šablony (např. en-fleet, email3-driver-de) → { html, title } nebo null. */
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
