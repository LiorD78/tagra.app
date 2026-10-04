/**
 * Netlify Function: resend-webhook
 *
 * Příjem webhooků z Resendu (Svix) pro události email.bounced a email.complained.
 * Pro adresu příjemce:
 *   1. zruší všechny NAPLÁNOVANÉ e-maily (DELETE /emails/{id}/cancel; ID jsou v Blobs
 *      store "trial-leads", pole `scheduled`, zapisuje je trial-email.js),
 *   2. v Blobs označí adresu jako `suppressed` (trial-email.js jí pak nic neodešle),
 *   3. pošle Liborovi notifikaci „TAGRA lead · BOUNCE/COMPLAINT · …“.
 *
 * ── KONFIGURACE (Netlify env) ────────────────────────────────────────
 *   RESEND_WEBHOOK_SECRET  povinné — „Signing secret“ webhooku (whsec_…)
 *   RESEND_OPS_KEY         klíč s plným přístupem; ruší naplánované maily. Sending klíč
 *                          (RESEND_API_KEY) na cancel vrací 401, použije se jen jako fallback.
 *   RESEND_API_KEY         odeslání notifikace
 *
 * Resend → Webhooks → Add webhook → URL https://tagra.app/.netlify/functions/resend-webhook,
 * události email.bounced + email.complained; secret je na detailu webhooku („Signing Secret“).
 *
 * Odpovědi: 401 špatný podpis, 500 chybí secret (Resend zkusí znovu), jinak 200.
 */

const crypto = require("crypto");
const {
  RESEND_API, EMAIL_RE, normalizeEmailForKey, escapeHtml, getLeadStore, sendInternalNotify,
} = require("./lib/lead-common");

const TOLERANCE_S = 5 * 60;
const HANDLED = { "email.bounced": "BOUNCE", "email.complained": "COMPLAINT" };

const logInfo  = (msg) => console.log(`[resend-webhook] ${msg}`);
const logError = (msg) => console.error(`[resend-webhook] ERROR: ${msg}`);

/** Ověření podpisu Svix: HMAC-SHA256 z `${id}.${timestamp}.${body}`, secret = base64 za „whsec_“. */
function verifySignature(secret, headers, rawBody) {
  const h = (n) => headers[n] || headers[n.toLowerCase()];
  const id = h("svix-id"), ts = h("svix-timestamp"), sigHeader = h("svix-signature");
  if (!id || !ts || !sigHeader) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > TOLERANCE_S) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = crypto.createHmac("sha256", key).update(`${id}.${ts}.${rawBody}`).digest();

  // Hlavička: „v1,<base64> v1,<base64>“ (víc podpisů při rotaci secretu).
  return sigHeader.split(" ").some((part) => {
    const [version, sig] = part.split(",");
    if (version !== "v1" || !sig) return false;
    const given = Buffer.from(sig, "base64");
    return given.length === expected.length && crypto.timingSafeEqual(given, expected);
  });
}

async function cancelScheduled(opsKey, id) {
  // Stejně jako resend-ops.js: POST, při neúspěchu DELETE.
  const url = `${RESEND_API}/emails/${encodeURIComponent(id)}/cancel`;
  const call = (method) => fetch(url, { method, headers: { Authorization: `Bearer ${opsKey}` } });
  let r = await call("POST");
  if (!r.ok) r = await call("DELETE");
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    logError("RESEND_WEBHOOK_SECRET not configured");
    return { statusCode: 500, body: "Not configured" };
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64").toString("utf8")
    : (event.body || "");

  if (!verifySignature(secret, event.headers || {}, rawBody)) {
    logError("Invalid webhook signature");
    return { statusCode: 401, body: "Invalid signature" };
  }

  let evt;
  try { evt = JSON.parse(rawBody); } catch { return { statusCode: 200, body: "Ignored: invalid JSON" }; }

  const kind = HANDLED[evt.type];
  if (!kind) return { statusCode: 200, body: "Ignored: event type" };

  const data = evt.data || {};
  // Interní notifikace (tag campaign=lead-notify) se neřeší — zabráníme smyčce.
  const tags = data.tags;
  const campaign = Array.isArray(tags) ? (tags.find((t) => t.name === "campaign") || {}).value : (tags || {}).campaign;
  if (campaign === "lead-notify") return { statusCode: 200, body: "Ignored: internal mail" };

  const recipients = (Array.isArray(data.to) ? data.to : [data.to]).map((a) => String(a || "").trim().toLowerCase()).filter(Boolean);
  const sendKey = process.env.RESEND_API_KEY;
  const opsKey  = process.env.RESEND_OPS_KEY || sendKey;
  const store   = getLeadStore(event);

  for (const addr of recipients) {
    const cancelled = [], failed = [];
    let lead = null;

    try {
      if (store && EMAIL_RE.test(addr)) lead = (await store.get(normalizeEmailForKey(addr), { type: "json" })) || null;
    } catch (e) {
      logError(`Blobs read failed (${addr}): ${e.message}`);
    }

    for (const s of (lead && lead.scheduled) || []) {
      if (Date.parse(s.at) <= Date.now()) continue; // už odešel, není co rušit
      try { await cancelScheduled(opsKey, s.id); cancelled.push(s.mail); }
      catch (e) { failed.push(`${s.mail}: ${e.message}`); logError(`cancel ${s.id} failed: ${e.message}`); }
    }

    if (store && lead) {
      try {
        await store.setJSON(normalizeEmailForKey(addr), { ...lead, suppressed: kind.toLowerCase(), suppressed_at: new Date().toISOString() });
      } catch (e) { logError(`Blobs write failed (${addr}): ${e.message}`); }
    }

    const detail = data.bounce
      ? `${data.bounce.type || ""} ${data.bounce.subType || ""} ${data.bounce.message || ""}`.trim() : "";
    const html =
      `<p><b>${kind}</b> pro <b>${escapeHtml(addr)}</b> (mail „${escapeHtml(data.subject || "")}“, ID ${escapeHtml(data.email_id || "")}).</p>` +
      (detail ? `<p>${escapeHtml(detail)}</p>` : "") +
      `<p>Zrušeno naplánovaných: <b>${cancelled.length ? escapeHtml(cancelled.join(", ")) : "žádné"}</b>` +
      (failed.length ? ` — NEPODAŘILO SE: ${escapeHtml(failed.join("; "))}` : "") + `</p>` +
      (lead ? "" : `<p>Lead v Blobs nenalezen — naplánované maily zruš ručně (Resend → Emails → Scheduled).</p>`);

    await sendInternalNotify(sendKey, `TAGRA lead · ${kind} · ${addr}`, html);
    logInfo(`${kind} ${addr}: cancelled=${cancelled.length}, failed=${failed.length}, lead=${!!lead}`);
  }

  return { statusCode: 200, body: "ok" };
};
