/**
 * Netlify Function: tdt-trial-email
 *
 * Automatické e-maily ke zkušební verzi programu TAGRA pro weby tdt.cz a tdt.sk
 * (formulář "zkusebni-verze" na Netlify webech tdt-cz-prodtest / tdt-sk-prodtest).
 * Stejný princip jako trial-email.js pro tagra.app, ale česky/slovensky,
 * se značkou Truck Data Technology a s kontrolou stávajících zákazníků.
 *
 * ── SPOUŠTĚNÍ ─────────────────────────────────────────────────────────
 *   POST  outgoing webhook Netlify Forms (oba weby tdt.cz i tdt.sk sem)
 *         Hlavička X-Webhook-Signature (JWS, HS256) se ověřuje proti
 *         TDT_WEBHOOK_SECRET — bez platného podpisu se nic neodešle.
 *   GET   ?sweep=1 + hlavička X-Sweep-Key  → denní úklid (volá ho
 *         naplánovaná funkce tdt-trial-sweep)
 *   GET   ?preview=cz-fleet                 → náhled šablony v prohlížeči
 *         (?preview=list vypíše všechny názvy)
 *
 * ── CO ZÁKAZNÍK DOSTANE ──────────────────────────────────────────────
 *   Nový zájemce (bez placené licence TAGRA):
 *     #1  hned          odkaz ke stažení + postup instalace
 *     #2  +3 dny        rychlý start (databáze, načtení dat, výkaz)
 *     #3  +REMINDER     zkušební verze brzy končí (výchozí den 16)
 *   Stávající zákazník (placená licence na stejný e-mail v atlas.tagra_licenses):
 *     jen #1 „existing" — odkaz ke stažení + „zvolte Aktivovat", odpovědi na helpdesk.
 *   Denní úklid: kdo si mezitím koupil licenci, tomu se zruší naplánované #2/#3.
 *
 * Firmy vs. řidiči: podle stránky, ze které formulář přišel (referrer obsahuje
 * „trucker" → řidič). Jazyk: podle webu (tdt.sk → sk, jinak cz).
 *
 * ── DÉLKA ZKUŠEBNÍ VERZE ─────────────────────────────────────────────
 * Web slibuje 30 dní, návod 2026 uvádí 28, licenční server reálně dává 21
 * (10. 11. 2026: 289 z 300 zkušebních licencí). #3 proto výchozí den 16
 * a v textu není konkrétní počet dní. Změna = proměnná TDT_TRIAL_REMINDER_DAY.
 *
 * ── ŠABLONY ──────────────────────────────────────────────────────────
 *   netlify/lib/tdt-email/render.js (vzhled) + content-cz.json / content-sk.json
 *   (texty). Skládají se přímo ve funkci, žádné načítání přes HTTP.
 *   {lang}-{aud}, {lang}-existing-{aud}, email2-{aud}-{lang}, email3-{aud}-{lang}
 *   — předmět = <title>. SK texty: překlad crew (GPT + Gemini), SK gate čistý.
 *
 * ── KONFIGURACE (env na webu tagra.app) ──────────────────────────────
 *   TDT_RESEND_API_KEY        povinné — klíč Resend s právem odesílat z mail.tdt.cz
 *                             (sdílený RESEND_API_KEY smí jen tagra.app → 403)
 *   TDT_WEBHOOK_SECRET        povinné — JWS secret webhooku v Netlify Forms
 *   TDT_SUPABASE_URL          https://<projekt>.supabase.co
 *   TDT_SUPABASE_ANON_KEY     publishable/anon klíč
 *   TDT_LICENSE_TOKEN         token pro RPC public.tdt_trial_license_status
 *   TDT_SWEEP_KEY             klíč pro GET ?sweep=1 (výchozí = TDT_WEBHOOK_SECRET)
 *   TDT_RESEND_FROM           volitelné, výchozí "Truck Data Technology <obchod@mail.tdt.cz>"
 *   TDT_TRIAL_REMINDER_DAY    volitelné, výchozí 16
 *   LEAD_NOTIFY_TO            příjemce hlášení chyb (výchozí libor.dospel@gmail.com)
 *
 * Selhání kontroly licence = fail-open: zájemce dostane běžnou sekvenci.
 * Funkce vždy vrací 200 (kromě neplatného podpisu), aby Netlify neopakoval webhook.
 */

const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { render, names } = require("../lib/tdt-email/render.js");

const RESEND_API    = "https://api.resend.com/emails";
const LEAD_STORE    = "tdt-trial-leads";
const DAY_MS        = 24 * 60 * 60 * 1000;
const REPEAT_MIN    = 60;

const FROM_DEFAULT  = "Truck Data Technology <obchod@mail.tdt.cz>";
const REPLY_TO      = { cz: "obchod@tdt.cz", sk: "obchod@tdt.sk" };
const REPLY_TO_HELP = "helpdesk@tdt.cz";
const NOTIFY_TO_DEFAULT = "libor.dospel@gmail.com";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const DISPOSABLE_DOMAINS = [
  "example.com", "example.org", "test.com", "test.cz", "test.sk", "test.eu",
  "mailinator.com", "tempmail.com", "guerrillamail.com", "10minutemail.com", "laoia.com",
];
// Testovací adresy Resendu: delivered+paid…@resend.dev se chová jako stávající zákazník.
const TEST_PAID_RE = /^delivered\+paid[^@]*@resend\.dev$/i;

const logInfo  = (msg, extra) => console.log(`[tdt-trial-email] ${msg}`, extra || "");
const logError = (msg, extra) => console.error(`[tdt-trial-email] ERROR: ${msg}`, extra || "");

function reminderDay() {
  const n = Number(process.env.TDT_TRIAL_REMINDER_DAY);
  return Number.isFinite(n) && n >= 4 && n <= 30 ? n : 16;
}

function followups() {
  return [
    { mail: "email2", days: 3,             campaign: "tdt-trial-followup-2", idPrefix: "tdt2" },
    { mail: "email3", days: reminderDay(), campaign: "tdt-trial-followup-3", idPrefix: "tdt3" },
  ];
}

function normalizeEmailForKey(email) {
  return String(email || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "-");
}

function detectLang(payload, data) {
  const s = `${payload.site_url || ""} ${data.referrer || ""} ${payload.site_name || ""}`.toLowerCase();
  return /tdt\.sk|tdt-sk/.test(s) ? "sk" : "cz";
}

function detectAudience(data) {
  return /trucker/i.test(String(data.referrer || "")) ? "driver" : "fleet";
}

function subjectFromTemplate(html, fallback) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!m) return fallback;
  return m[1].trim()
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/&ndash;/g, "–").replace(/&mdash;/g, "—");
}

async function fetchTemplate(name) {
  const html = render(name);
  if (!html) throw new Error(`šablona ${name} neexistuje`);
  return html;
}

async function resend(apiKey, path, method, body, idempotencyKey) {
  const headers = { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey.slice(0, 256);
  const resp = await fetch(`${RESEND_API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!resp.ok) throw new Error(`Resend ${resp.status}: ${(await resp.text()).slice(0, 300)}`);
  return resp.json();
}

// ── PODPIS WEBHOOKU (Netlify JWS) ─────────────────────────────────────
function verifySignature(event) {
  const secret = process.env.TDT_WEBHOOK_SECRET;
  if (!secret) return { ok: false, why: "TDT_WEBHOOK_SECRET není nastaven" };
  const h = event.headers || {};
  const sig = h["x-webhook-signature"] || h["X-Webhook-Signature"];
  if (!sig) return { ok: false, why: "chybí X-Webhook-Signature" };
  try {
    const claims = jwt.verify(sig, secret, { issuer: "netlify", algorithms: ["HS256"] });
    const raw = event.isBase64Encoded ? Buffer.from(event.body || "", "base64") : Buffer.from(event.body || "", "utf8");
    const hash = crypto.createHash("sha256").update(raw).digest("hex");
    if (claims.sha256 !== hash) return { ok: false, why: "nesouhlasí sha256 těla" };
    return { ok: true };
  } catch (e) {
    return { ok: false, why: `neplatný podpis: ${e.message}` };
  }
}

// ── KONTROLA LICENCE (Supabase RPC) ───────────────────────────────────
async function licenseStatus(email) {
  if (TEST_PAID_RE.test(email)) return { paid: true, test: true };
  const url = process.env.TDT_SUPABASE_URL, key = process.env.TDT_SUPABASE_ANON_KEY, token = process.env.TDT_LICENSE_TOKEN;
  if (!url || !key || !token) return { paid: false, error: "licence check not configured" };
  try {
    const r = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/tdt_trial_license_status`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_email: email, p_token: token }),
    });
    if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`);
    const j = await r.json();
    return { paid: !!(j && j.paid), trial: !!(j && j.trial) };
  } catch (e) {
    logError(`licence check failed: ${e.message}`);
    return { paid: false, error: e.message };
  }
}

// ── STAV LEADU (Netlify Blobs, fail-open) ─────────────────────────────
async function getLeadStore(event) {
  try {
    const blobs = require("@netlify/blobs");
    if (typeof blobs.connectLambda === "function") blobs.connectLambda(event);
    return blobs.getStore(LEAD_STORE);
  } catch (e) {
    logError(`Blobs unavailable: ${e.message}`);
    return null;
  }
}
async function readLead(store, key) {
  if (!store) return null;
  try { return (await store.get(key, { type: "json" })) || null; }
  catch (e) { logError(`Blobs read failed (${key}): ${e.message}`); return null; }
}
async function writeLead(store, key, value) {
  if (!store) return;
  try { await store.setJSON(key, value); }
  catch (e) { logError(`Blobs write failed (${key}): ${e.message}`); }
}

// ── HLÁŠENÍ CHYB ─────────────────────────────────────────────────────
const escapeHtml = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function notifyError(apiKey, subject, detail, data) {
  if (!apiKey) return;
  try {
    const rows = Object.entries(data || {})
      .filter(([k]) => !["web", "ip", "user_agent"].includes(k))
      .map(([k, v]) => `<tr><td style="padding:2px 12px 2px 0;color:#666">${escapeHtml(k)}</td><td>${escapeHtml(typeof v === "string" ? v : JSON.stringify(v))}</td></tr>`).join("");
    await resend(apiKey, "", "POST", {
      from: process.env.TDT_RESEND_FROM || FROM_DEFAULT,
      to: (process.env.LEAD_NOTIFY_TO || NOTIFY_TO_DEFAULT).split(",").map((s) => s.trim()).filter(Boolean),
      subject: `[chyba] tdt.cz zkušební verze · ${subject}`.replace(/[\r\n]+/g, " "),
      html: `<p>${escapeHtml(detail)}</p><table style="font:14px sans-serif">${rows}</table>`,
      tags: [{ name: "campaign", value: "tdt-trial-error" }],
    });
  } catch (e) {
    logError(`error notification failed: ${e.message}`);
  }
}

// ── DENNÍ ÚKLID: zrušit #2/#3 tomu, kdo si koupil licenci ─────────────
async function sweep(event, apiKey) {
  const store = await getLeadStore(event);
  if (!store) return { statusCode: 500, body: "no blobs" };
  const now = Date.now();
  const report = { checked: 0, cancelled: 0, pruned: 0, errors: 0 };
  let list;
  try { list = await store.list(); } catch (e) { return { statusCode: 500, body: `list failed: ${e.message}` }; }

  for (const { key } of list.blobs || []) {
    const lead = await readLead(store, key);
    if (!lead) continue;
    // Staré záznamy (> 60 dní) pryč — sekvence je dávno odeslaná.
    if (now - Date.parse(lead.last_at || lead.first_at || 0) > 60 * DAY_MS) {
      try { await store.delete(key); report.pruned++; } catch { /* nic */ }
      continue;
    }
    const pending = (lead.scheduled || []).filter((s) => !s.cancelled && Date.parse(s.at) > now);
    if (!pending.length || !lead.email) continue;
    report.checked++;
    const lic = await licenseStatus(lead.email);
    if (!lic.paid) continue;
    for (const s of pending) {
      try {
        await resend(apiKey, `/${s.id}/cancel`, "POST");
        s.cancelled = new Date(now).toISOString();
        report.cancelled++;
        logInfo(`cancelled ${s.mail} for ${lead.email} (licence koupena)`);
      } catch (e) {
        report.errors++;
        logError(`cancel ${s.id} failed: ${e.message}`);
      }
    }
    lead.converted_at = lead.converted_at || new Date(now).toISOString();
    await writeLead(store, key, lead);
  }
  logInfo("sweep done", JSON.stringify(report));
  return { statusCode: 200, body: JSON.stringify(report) };
}

// ── HLAVNÍ HANDLER ───────────────────────────────────────────────────
exports.handler = async (event) => {
  const apiKey = process.env.TDT_RESEND_API_KEY || process.env.RESEND_API_KEY;

  if (event.httpMethod === "GET") {
    const q = event.queryStringParameters || {};
    const h = event.headers || {};
    const sweepKey = process.env.TDT_SWEEP_KEY || process.env.TDT_WEBHOOK_SECRET;
    if (q.sweep === "1" && sweepKey && (h["x-sweep-key"] || h["X-Sweep-Key"]) === sweepKey) {
      return sweep(event, apiKey);
    }
    if (q.preview) {
      if (q.preview === "list") {
        const links = names().map((n) => `<li><a href="?preview=${n}">${n}</a></li>`).join("");
        return { statusCode: 200, headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" }, body: `<!doctype html><meta charset="utf-8"><title>tdt.cz/sk – e-maily zkušební verze</title><ul style="font:16px/1.8 sans-serif">${links}</ul>` };
      }
      const html = render(String(q.preview));
      if (html) return { statusCode: 200, headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" }, body: html };
    }
    return { statusCode: 404, body: "Not found" };
  }
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const sig = verifySignature(event);
  if (!sig.ok) {
    logError(`rejected: ${sig.why}`);
    return { statusCode: 401, body: "Invalid signature" };
  }

  let payload;
  try {
    const raw = event.isBase64Encoded ? Buffer.from(event.body || "", "base64").toString("utf8") : (event.body || "{}");
    payload = JSON.parse(raw);
  } catch {
    return { statusCode: 200, body: "Ignored: invalid JSON" };
  }

  const data = payload.data || {};
  const formName = payload.form_name || data.form_name || "";
  if (formName !== "zkusebni-verze") return { statusCode: 200, body: `Ignored form: ${formName}` };

  if (String(data.web || "").trim()) return { statusCode: 200, body: "Ignored: honeypot" };
  if (/[?&]test=1\b/.test(String(data.referrer || ""))) return { statusCode: 200, body: "Ignored: test submission" };

  const email = String(data.email || payload.email || "").trim();
  if (!EMAIL_RE.test(email)) { logError(`invalid email: ${email}`); return { statusCode: 200, body: "Ignored: invalid email" }; }
  const domain = email.split("@")[1].toLowerCase();
  if (DISPOSABLE_DOMAINS.includes(domain)) return { statusCode: 200, body: "Ignored: disposable domain" };
  if (!apiKey) { logError("RESEND_API_KEY missing"); return { statusCode: 200, body: "Not configured" }; }

  const lang = detectLang(payload, data);
  const aud  = detectAudience(data);
  const key  = `${lang}-${normalizeEmailForKey(email)}`;
  const from = process.env.TDT_RESEND_FROM || FROM_DEFAULT;

  const store = await getLeadStore(event);
  const prev  = await readLead(store, key);
  const now   = Date.now();
  const sinceLastMin = prev ? (now - Date.parse(prev.last_at)) / 60000 : Infinity;
  const count = prev ? (Number(prev.count) || 1) + 1 : 1;

  if (prev && sinceLastMin < REPEAT_MIN) {
    logInfo(`repeat < ${REPEAT_MIN} min for ${email}, nothing sent`);
    await writeLead(store, key, { ...prev, last_at: prev.last_at, count });
    return { statusCode: 200, body: JSON.stringify({ situation: "repeat-throttled" }) };
  }

  const lic = await licenseStatus(email);
  const existing = !!lic.paid;
  const prevAudiences = prev ? prev.audiences || [] : [];
  const scheduleSeq = !existing && !prevAudiences.includes(aud);

  const tags = [
    { name: "site", value: `tdt-${lang}` },
    { name: "audience", value: aud },
  ];

  // ── #1 ────────────────────────────────────────────────────────────
  const tpl1 = existing ? `${lang}-existing-${aud}` : `${lang}-${aud}`;
  let welcomeId = null;
  try {
    const html = await fetchTemplate(tpl1);
    const sent = await resend(apiKey, "", "POST", {
      from,
      to: [email],
      reply_to: existing ? REPLY_TO_HELP : REPLY_TO[lang],
      subject: subjectFromTemplate(html, "TAGRA"),
      html,
      tags: [...tags, { name: "campaign", value: existing ? "tdt-trial-existing" : "tdt-trial-signup" }],
    }, `tdt1-${key}-${aud}-${existing ? "x" : "t"}-${count}`);
    welcomeId = sent.id;
    logInfo(`#1 ${tpl1} sent to ${email} (id=${sent.id})`);
  } catch (e) {
    logError(`#1 failed for ${email}: ${e.message}`);
    await notifyError(apiKey, `uvítací mail neodešel (${email})`, e.message, data);
    return { statusCode: 200, body: "Welcome email failed" };
  }

  // ── #2 a #3 ───────────────────────────────────────────────────────
  const scheduled = [];
  const failed = [];
  if (scheduleSeq) {
    for (const step of followups()) {
      const at = new Date(now + step.days * DAY_MS).toISOString();
      try {
        const html = await fetchTemplate(`${step.mail}-${aud}-${lang}`);
        const sent = await resend(apiKey, "", "POST", {
          from,
          to: [email],
          reply_to: REPLY_TO[lang],
          subject: subjectFromTemplate(html, "TAGRA"),
          html,
          scheduled_at: at,
          tags: [...tags, { name: "campaign", value: step.campaign }],
        }, `${step.idPrefix}-${key}-${aud}`);
        scheduled.push({ mail: step.mail, at, id: sent.id });
      } catch (e) {
        failed.push(step.mail);
        logError(`${step.mail} scheduling failed for ${email}: ${e.message}`);
      }
    }
    if (failed.length) await notifyError(apiKey, `nenaplánováno ${failed.join(", ")} (${email})`, "Uvítací mail odešel, navazující se nepodařilo naplánovat.", data);
  }

  const nowIso = new Date(now).toISOString();
  await writeLead(store, key, {
    email,
    lang,
    first_at: prev ? prev.first_at : nowIso,
    last_at: nowIso,
    count,
    existing,
    licence_check_error: lic.error || undefined,
    audiences: [...new Set([...prevAudiences, ...(existing ? [] : [aud])])],
    welcome_ids: [...(prev ? prev.welcome_ids || [] : []), welcomeId],
    scheduled: [...(prev ? prev.scheduled || [] : []), ...scheduled],
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ lang, aud, existing, welcome: welcomeId, scheduled, failed }),
  };
};

exports._test = { detectLang, detectAudience, subjectFromTemplate, verifySignature };
