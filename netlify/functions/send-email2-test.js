// One-off test sender for onboarding email #2 (driver/fleet).
// GET /.netlify/functions/send-email2-test?token=...&aud=driver|fleet[&to=...][&name=...]
const TOKEN = "tmx-e2-7kq93xv1";
const ALLOWED_TO = ["libor.dospel@gmail.com", "martin.vojta@tdt.cz"];

const TEMPLATES = {
  driver: {
    url: "https://tagra.app/try/email-preview/email2-driver-en.html",
    subject: "Read your driver card in TAGRA — first steps",
    defaultName: "Benedict",
  },
  fleet: {
    url: "https://tagra.app/try/email-preview/email2-fleet-en.html",
    subject: "TAGRA quick start: import your files and run the first report",
    defaultName: "Ziheng",
  },
};

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  if (q.token !== TOKEN) return { statusCode: 403, body: "forbidden" };

  const tpl = TEMPLATES[q.aud];
  if (!tpl) return { statusCode: 400, body: "aud must be driver|fleet" };

  const to = (q.to || "libor.dospel@gmail.com").toLowerCase().trim();
  if (!ALLOWED_TO.includes(to)) return { statusCode: 400, body: "recipient not allowed" };

  const name = (q.name || tpl.defaultName).replace(/[<>&"]/g, "");

  const htmlRes = await fetch(tpl.url + "?nocache=" + Date.now(), {
    headers: { "Cache-Control": "no-cache" },
  });
  if (!htmlRes.ok) return { statusCode: 502, body: "template fetch failed: " + htmlRes.status };
  const html = (await htmlRes.text()).replaceAll("{NAME}", name);

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Ivan Szabó — TAGRA <sales@tagra.app>",
      to: [to],
      reply_to: "sales@tagra.app",
      subject: "[TEST v2] " + tpl.subject,
      html,
    }),
  });

  const data = await r.json().catch(() => ({}));
  return {
    statusCode: r.ok ? 200 : 502,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: r.ok, status: r.status, aud: q.aud, to, data }),
  };
};
