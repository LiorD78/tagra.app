/**
 * Netlify Function: trial-email-v2 – nové šablony e-mailů zkušební verze tagra.app (TAGRA III).
 * Zatím jen NÁHLED a TEST, ostré odesílání dál dělá trial-email.js se starými šablonami
 * z /try/email-preview/. Po schválení Liborem se nové šablony přepnou do ostrého provozu.
 *
 *   GET ?preview=list                       seznam šablon
 *   GET ?preview=en-fleet[&name=Libor]      náhled v prohlížeči
 *   GET ?send=en-fleet&token=…&to=…         testovací odeslání (jen povolené adresy)
 *
 * Texty: netlify/lib/tagra-email/content-{lang}.json, vzhled: render.js.
 */
const { renderMail } = require("../lib/tagra-email/render.js");

const CONTENT = {
  en: require("../lib/tagra-email/content-en.json"),
  de: require("../lib/tagra-email/content-de.json"),
};
const TOKEN = "tg3-v2-test-8p2m";
const ALLOWED_TO = ["libor.dospel@tdt.cz", "libor.dospel@gmail.com"];

function names() {
  const out = [];
  for (const [lang, c] of Object.entries(CONTENT)) for (const k of Object.keys(c.mails)) out.push(k.replace("{lang}", lang));
  return out;
}

function find(name) {
  for (const [lang, c] of Object.entries(CONTENT)) {
    for (const [k, m] of Object.entries(c.mails)) {
      if (k.replace("{lang}", lang) === name) return { html: renderMail(m, c.common), title: m.title };
    }
  }
  return null;
}

const fillName = (html, name) => (name ? html.replaceAll("{NAME}", name) : html);

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const name = String(q.name || "").replace(/[<>&"]/g, "").slice(0, 40);

  if (q.preview) {
    if (q.preview === "list") {
      const links = names().map((n) => `<li><a href="?preview=${n}">${n}</a></li>`).join("");
      return { statusCode: 200, headers: { "Content-Type": "text/html; charset=utf-8" }, body: `<!DOCTYPE html><meta charset="utf-8"><title>TAGRA e-maily v2</title><ul>${links}</ul>` };
    }
    const t = find(String(q.preview));
    if (!t) return { statusCode: 404, body: "unknown template" };
    return { statusCode: 200, headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" }, body: fillName(t.html, name) };
  }

  if (q.send) {
    if (q.token !== TOKEN) return { statusCode: 403, body: "forbidden" };
    const to = String(q.to || "libor.dospel@tdt.cz").toLowerCase().trim();
    if (!ALLOWED_TO.includes(to)) return { statusCode: 400, body: "recipient not allowed" };
    const t = find(String(q.send));
    if (!t) return { statusCode: 404, body: "unknown template" };
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "TAGRA <sales@tagra.app>",
        to: [to],
        reply_to: "sales@tagra.app",
        subject: `[TEST] ${t.title.replace(/&middot;/g, "·").replace(/&nbsp;/g, " ")}`,
        html: fillName(t.html, name || "Libor"),
      }),
    });
    const data = await r.json().catch(() => ({}));
    return { statusCode: r.ok ? 200 : 502, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: r.ok, status: r.status, template: q.send, to, data }) };
  }

  return { statusCode: 400, body: "use ?preview=list" };
};
