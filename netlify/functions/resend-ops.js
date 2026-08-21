/**
 * Servisní funkce nad Resendem — čtení a rušení NAPLÁNOVANÝCH mailů.
 *
 * Proč existuje: kvůli kolizi query stringu (PR #52) se čtyřem řidičům
 * naplánovala fleetová sekvence #2 a #3 místo driver. ID naplánovaných
 * mailů se v trial-email.js jen logují, nikam se neukládají, takže je
 * potřeba je v Resendu dohledat a zrušit.
 *
 * ── POZOR: POTŘEBUJE VLASTNÍ KLÍČ ────────────────────────────────────
 * RESEND_API_KEY je v Resendu založený jako "sending access" — čtení
 * i rušení na něm vrací 401 restricted_api_key. Ověřeno 21. 8. 2026.
 *
 * Aby tahle funkce fungovala, je potřeba v Resendu založit klíč
 * s plným přístupem a uložit ho v Netlify jako RESEND_OPS_KEY.
 * Funkce ho preferuje a na RESEND_API_KEY spadne jen jako fallback.
 * Sending klíč zůstává beze změny — trial-email.js se nedotýkáme.
 *
 * Klíč se čte z process.env a NIKDY se nevrací v odpovědi.
 *
 * Omezení (schválně úzké):
 *   - rušit lze POUZE adresy z ALLOWED_RECIPIENTS
 *   - rušit lze POUZE maily, které ještě nebyly odeslány
 *
 * GET /.netlify/functions/resend-ops?token=...&action=list
 * GET /.netlify/functions/resend-ops?token=...&action=get&id=...
 * GET /.netlify/functions/resend-ops?token=...&action=cancel&ids=id1,id2
 */

const TOKEN = "tmx-resend-ops-4b71";
const API   = "https://api.resend.com";

// Jen lidé zasažení chybou z PR #52. Nic jiného tahle funkce neumí zrušit.
const ALLOWED_RECIPIENTS = [
  "fanelcristian4@gmail.com",
  "matt.hamc@gmail.com",
  "localkorner@gmail.com",
  "sakis033@yahoo.gr",
];

const json = (code, obj) => ({
  statusCode: code,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(obj, null, 2),
});

async function rq(apiKey, path, method = "GET") {
  const r = await fetch(API + path, {
    method,
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { ok: r.ok, status: r.status, body };
}

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  if (q.token !== TOKEN) return { statusCode: 403, body: "forbidden" };

  const apiKey = process.env.RESEND_OPS_KEY || process.env.RESEND_API_KEY;
  if (!apiKey) return json(500, { error: "no Resend key configured" });

  const usingOpsKey = Boolean(process.env.RESEND_OPS_KEY);

  // ── Výpis mailů. Se sending klíčem vrátí Resend 401 restricted_api_key.
  if (q.action === "list") {
    const res = await rq(apiKey, "/emails?limit=100");
    if (!res.ok) {
      return json(200, {
        listSupported: false,
        usingOpsKey,
        hint: usingOpsKey ? undefined : "nastav RESEND_OPS_KEY (klíč s plným přístupem)",
        status: res.status,
        body: res.body,
      });
    }

    const rows = (res.body && (res.body.data || res.body)) || [];
    const slim = (Array.isArray(rows) ? rows : []).map((e) => ({
      id: e.id,
      to: e.to,
      subject: e.subject,
      created_at: e.created_at,
      scheduled_at: e.scheduled_at,
      last_event: e.last_event,
    }));
    return json(200, { listSupported: true, usingOpsKey, count: slim.length, emails: slim });
  }

  // ── Detail jednoho mailu (pro ověření, co se ruší)
  if (q.action === "get") {
    if (!q.id) return json(400, { error: "id required" });
    const res = await rq(apiKey, `/emails/${q.id}`);
    const e = res.body || {};
    return json(200, {
      status: res.status,
      usingOpsKey,
      id: e.id,
      to: e.to,
      subject: e.subject,
      scheduled_at: e.scheduled_at,
      last_event: e.last_event,
    });
  }

  // ── Zrušení naplánovaných mailů
  if (q.action === "cancel") {
    const ids = String(q.ids || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!ids.length) return json(400, { error: "ids required" });

    const results = [];
    for (const id of ids) {
      // 1) ověřit, že mail patří někomu ze seznamu a ještě neodešel
      const detail = await rq(apiKey, `/emails/${id}`);
      const e = detail.body || {};
      const to = [].concat(e.to || []).map((x) => String(x).toLowerCase());
      const allowed = to.some((addr) => ALLOWED_RECIPIENTS.includes(addr));

      if (!detail.ok) {
        results.push({ id, cancelled: false, reason: `lookup failed (${detail.status})` });
        continue;
      }
      if (!allowed) {
        results.push({ id, cancelled: false, reason: "recipient not in allow-list", to });
        continue;
      }
      if (e.last_event && e.last_event !== "scheduled") {
        results.push({ id, cancelled: false, reason: `already ${e.last_event}`, to });
        continue;
      }

      // 2) zrušit — Resend používá POST, starší dokumentace uvádí DELETE
      let res = await rq(apiKey, `/emails/${id}/cancel`, "POST");
      if (!res.ok && (res.status === 404 || res.status === 405)) {
        res = await rq(apiKey, `/emails/${id}/cancel`, "DELETE");
      }
      results.push({
        id,
        to,
        subject: e.subject,
        scheduled_at: e.scheduled_at,
        cancelled: res.ok,
        status: res.status,
        body: res.ok ? undefined : res.body,
      });
    }
    return json(200, { usingOpsKey, results });
  }

  return json(400, { error: "action must be list|get|cancel" });
};
