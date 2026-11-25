/**
 * Netlify Function: trial-email-v2 – náhled a testovací odeslání nových šablon e-mailů
 * zkušební verze (tagra.app v2 i tdt.cz/tdt.sk).
 * Ostré odesílání: tagra.app = trial-email.js (nové šablony mu servíruje trial-templates.mjs),
 * tdt.cz/tdt.sk = tdt-trial-email.js.
 *
 *   GET ?preview=list                       seznam šablon
 *   GET ?preview=en-fleet[&name=Libor]      náhled v prohlížeči (i cz-fleet, sk-driver …)
 *   GET ?send=en-fleet&token=…&to=…         testovací odeslání (jen povolené adresy)
 */
const tpl = require("../lib/tagra-email/templates.js");
const tdt = require("../lib/tdt-email/render.js");

const TOKEN = "tg3-v2-test-8p2m";
const ALLOWED_TO = ["libor.dospel@tdt.cz", "libor.dospel@gmail.com", "ivan.szabo@tdt.cz"];

const names = () => tpl.names().concat(tdt.names());

function find(name) {
  const t = tpl.renderTemplate(name);
  if (t) return t;
  const html = tdt.render(name);
  if (html) return { html, title: ((/<title>([\s\S]*?)<\/title>/.exec(html) || [])[1] || name) };
  return null;
}

const fillName = (html, name) => (name ? html.replaceAll("{NAME}", name) : html);

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const name = String(q.name || "").replace(/[<>&"]/g, "").slice(0, 40);

  if (q.preview) {
    if (q.preview === "list") {
      const links = names().map((n) => `<li><a href="?preview=${n}">${n}</a></li>`).join("");
      return { statusCode: 200, headers: { "Content-Type": "text/html; charset=utf-8" }, body: `<!DOCTYPE html><meta charset="utf-8"><title>E-maily v2</title><ul>${links}</ul>` };
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
