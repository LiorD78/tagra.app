/**
 * Netlify Function: send-link  (/.netlify/functions/send-link)
 *
 * Mobilní most „Pošlete si odkaz do PC" (balíček 42, 15. 11. 2026).
 * Návštěvník z mobilu zadá e-mail → dostane e-mail s odkazem na trial stránku
 * v jazyce stránky + odkazem na instalační návod. Program běží jen na Windows.
 *
 * ── CESTA E-MAILU ─────────────────────────────────────────────────────
 * Stejná jako trial e-maily (trial-email.js): Resend API, odesílatel
 * RESEND_FROM (výchozí "TAGRA <sales@tagra.app>"), klíč RESEND_API_KEY.
 * {link} míří na trial STRÁNKU (ne přímo na .zip), aby se lead zaevidoval
 * stejně jako dnes, až si návštěvník na PC stáhne zkušební verzi.
 *
 * ── OCHRANA ───────────────────────────────────────────────────────────
 *   - validace e-mailu na serveru (+ jednorázové domény se tiše ignorují)
 *   - honeypot (pole "website"; vyplněné = tiše 200)
 *   - rate limit 3 / hodinu / IP a 3 / hodinu / e-mail
 *   - dedup 24 h (stejný e-mail + jazyk = druhý e-mail neodejde, uživatel dostane OK)
 *   Čítače jsou v Netlify Blobs (store "mobile-bridge") pod SHA-256 hashem —
 *   e-mail ani IP se v čitelné podobě NEUKLÁDAJÍ a nepoužívají se pro marketing.
 *   Chyba Blobs = fail-open (e-mail odejde), aby výpadek úložiště nerozbil funkci.
 *
 * ── LEAD ──────────────────────────────────────────────────────────────
 * Interní notifikace na LEAD_NOTIFY_TO se zdrojem source=mobile_bridge
 * (měření převodu). HU: kopie pro Rukon (RUKON_LEADS_TO) stejnou cestou
 * a šablonou jako u trialu (buildRukonTrialEmail z trial-email.js).
 * Testovací režim: e-mail test+…@tagra.app → vše jde jen na LEAD_NOTIFY_TO,
 * nikdy na cizí adresy; odpověď obsahuje "test": true.
 *
 * Texty e-mailů: brain/fronta/2026-11-15-42-mobil-i18n.json (mail_subject, mail_body).
 */

const crypto = require("crypto");

const RESEND_API   = "https://api.resend.com/emails";
const STORE        = "mobile-bridge";
const HOUR_MS      = 60 * 60 * 1000;
const DAY_MS       = 24 * HOUR_MS;
const LIMIT_PER_H  = 3;
const SITE         = "https://tagra.app";
const NOTIFY_TO_DEFAULT = "libor.dospel@gmail.com";
const TEST_EMAIL_RE = /^test\+.*@tagra\.app$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const DISPOSABLE = ["example.com", "example.org", "laoia.com", "mailinator.com", "tempmail.com", "guerrillamail.com", "10minutemail.com"];

// Trial stránka a instalační návod podle jazyka stránky.
const LINKS = {
  en: { trial: "/try/",                          guide: "/manuals/how-to-install-tagra/" },
  de: { trial: "/de/testen/",                    guide: "/de/anleitungen/tagra-installieren/" },
  pl: { trial: "/pl/wyprobuj/",                  guide: "/pl/instrukcje/instalacja-tagra/" },
  hu: { trial: "/hu/ingyenes-probaverzio/",      guide: "/hu/kezikonyvek/tagra-telepitese/" },
  el: { trial: "/el/dokimi/",                    guide: "/el/egcheiridia/egkatastasi-tagra/" },
  it: { trial: "/it/prova-gratuita/",            guide: "/it/manuali/installazione-tagra/" },
  fr: { trial: "/fr/essai-gratuit/",             guide: "/fr/manuels/installer-tagra/" },
  nl: { trial: "/nl/gratis-proefversie/",        guide: "/nl/handleidingen/tagra-installeren/" },
  ro: { trial: "/ro/incercare-gratuita/",        guide: "/ro/manuale/instalare-tagra/" },
  es: { trial: "/es/prueba-gratis/",             guide: "/manuals/how-to-install-tagra/" },
};

// Texty doslova z brain/fronta/2026-11-15-42-mobil-i18n.json (crew GPT, kontrola Gemini);
// kopie souboru je vedle funkce, aby se nic nepřekládalo ani neupravovalo.
const TEXTS = require("./send-link-texts.json");

function mailTexts(lang) {
  const j = TEXTS[lang] || TEXTS.en;
  return { subject: j.mail_subject, body: j.mail_body };
}

const json = (statusCode, obj) => ({
  statusCode,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  body: JSON.stringify(obj),
});

const sha = (s) => crypto.createHash("sha256").update(String(s)).digest("hex").slice(0, 32);
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const logInfo  = (m) => console.log(`[send-link] ${m}`);
const logError = (m) => console.error(`[send-link] ERROR: ${m}`);

/** Doplní {link} a {guide}; vrátí { subject, text, html }. Čistá funkce (testovatelná). */
function buildBridgeEmail(lang, { utm = "mobile_bridge" } = {}) {
  const L = LINKS[lang] || LINKS.en;
  const q = `?audience=fleet&src=${utm}`;
  const link  = SITE + L.trial + q;
  const guide = SITE + L.guide;
  const t = mailTexts(lang);
  const text = t.body.replace(/\{link\}/g, link).replace(/\{guide\}/g, guide);
  const html = `<div style="font:15px/1.55 sans-serif;color:#1d1d1f">` +
    escapeHtml(text).replace(/(https:\/\/tagra\.app[^\s<]*)/g, '<a href="$1">$1</a>').replace(/\n/g, "<br>") + `</div>`;
  return { subject: t.subject, text, html, link, guide };
}

async function sendViaResend(apiKey, msg, idempotencyKey) {
  const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey.slice(0, 256);
  const res = await fetch(RESEND_API, { method: "POST", headers, body: JSON.stringify(msg) });
  const body = await res.text();
  if (!res.ok) throw new Error(`Resend ${res.status}: ${body.slice(0, 200)}`);
  try { return JSON.parse(body); } catch { return {}; }
}

function openStore(event) {
  try {
    const blobs = require("@netlify/blobs");
    if (typeof blobs.connectLambda === "function") blobs.connectLambda(event);
    return blobs.getStore(STORE);
  } catch (e) {
    logError(`Blobs unavailable: ${e.message}`);
    return null;
  }
}

/** Čítač v hodinovém okně. Vrací nový počet; při chybě 0 (fail-open). */
async function bump(store, key) {
  try {
    const cur = await store.get(key, { type: "json" });
    const n = (cur && cur.n || 0) + 1;
    await store.setJSON(key, { n, t: Date.now() });
    return n;
  } catch (e) {
    logError(`counter ${key.slice(0, 8)}: ${e.message}`);
    return 0;
  }
}

async function notifyInternal(apiKey, { email, lang, page, test, hu }) {
  try {
    const to = (process.env.LEAD_NOTIFY_TO || NOTIFY_TO_DEFAULT).split(",").map((s) => s.trim()).filter(Boolean);
    const from = process.env.RESEND_FROM || "TAGRA <sales@tagra.app>";
    const subject = `${test ? "[TEST] " : ""}Mobile bridge lead (${lang}) · ${email}`;
    const text = `source=mobile_bridge\nE-mail: ${email}\nJazyk: ${lang}\nStránka: ${page}\n` +
      `Odkaz na trial stránku odeslán zákazníkovi e-mailem (zákazník si program nainstaluje na PC).\n`;
    await sendViaResend(apiKey, { from, to, subject, text, tags: [{ name: "campaign", value: "mobile-bridge-lead" }] });
  } catch (e) { logError(`internal notify: ${String(e.message).slice(0, 160)}`); }

  if (!hu) return;
  // HU → Rukon: stejná cesta a šablona jako u trialu (jen pokud notifikace pro HU existuje).
  try {
    const { buildRukonTrialEmail } = require("./trial-email");
    const data = { email, language: "hu", country: "HU", name: "", source_url: `${page} | source: mobile_bridge | method: mobile_send` };
    const { subject, html, text } = buildRukonTrialEmail(data, { aud: "fleet", lang: "hu", createdAt: new Date().toISOString(), test });
    const to = test
      ? (process.env.LEAD_NOTIFY_TO || NOTIFY_TO_DEFAULT)
      : (process.env.RUKON_LEADS_TO || "varga@rukon.hu");
    await sendViaResend(apiKey, {
      from: process.env.RESEND_FROM || "TAGRA <sales@tagra.app>",
      to: to.split(",").map((s) => s.trim()).filter(Boolean),
      subject, html, text, reply_to: email,
      tags: [{ name: "campaign", value: "mobile-bridge-hu" }],
    });
  } catch (e) { logError(`rukon copy: ${String(e.message).slice(0, 160)}`); }
}

exports.buildBridgeEmail = buildBridgeEmail;
exports.LINKS = LINKS;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { ok: false, error: "method" });

  let b;
  try { b = JSON.parse(event.body || "{}"); } catch { return json(400, { ok: false, error: "json" }); }

  // Honeypot: bot dostane „OK", nic se neodešle.
  if (b.website) return json(200, { ok: true });

  const email = String(b.email || "").trim().toLowerCase();
  const lang  = Object.prototype.hasOwnProperty.call(LINKS, b.lang) ? b.lang : "en";
  const page  = String(b.page || "").replace(/[\r\n]+/g, " ").slice(0, 300);

  if (!EMAIL_RE.test(email) || email.length > 254) return json(400, { ok: false, error: "email" });

  const test = TEST_EMAIL_RE.test(email);
  if (DISPOSABLE.includes(email.split("@")[1])) return json(200, { ok: true });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { logError("RESEND_API_KEY missing"); return json(500, { ok: false, error: "config" }); }

  const ip = String((event.headers && (event.headers["x-nf-client-connection-ip"] || event.headers["client-ip"] ||
    String(event.headers["x-forwarded-for"] || "").split(",")[0])) || "unknown").trim();

  const store = test ? null : openStore(event);   // testovací adresy rate limit neblokuje
  if (store) {
    const hour = Math.floor(Date.now() / HOUR_MS);
    const nIp = await bump(store, `ip-${sha(ip)}-${hour}`);
    const nEm = await bump(store, `em-${sha(email)}-${hour}`);
    if (nIp > LIMIT_PER_H || nEm > LIMIT_PER_H) {
      logInfo("rate limited");
      return json(429, { ok: false, error: "rate" });
    }
    try {
      const key = `sent-${sha(email + "|" + lang)}`;
      const prev = await store.get(key, { type: "json" });
      if (prev && Date.now() - prev.t < DAY_MS) {
        logInfo("dedup 24h");
        return json(200, { ok: true, dedup: true });
      }
      await store.setJSON(key, { t: Date.now() });
    } catch (e) { logError(`dedup: ${e.message}`); }
  }

  const mail = buildBridgeEmail(lang);
  try {
    const sent = await sendViaResend(apiKey, {
      from: process.env.RESEND_FROM || "TAGRA <sales@tagra.app>",
      to: [email], subject: mail.subject, text: mail.text, html: mail.html,
      reply_to: "support@tagra.app",
      tags: [{ name: "campaign", value: "mobile-bridge" }],
    }, `bridge-${sha(email + "|" + lang)}-${Math.floor(Date.now() / DAY_MS)}`);
    logInfo(`sent (${lang})${test ? " TEST" : ""}, resend ${sent.id}`);
  } catch (e) {
    logError(String(e.message).slice(0, 200));
    return json(502, { ok: false, error: "send" });
  }

  await notifyInternal(apiKey, { email, lang, page, test, hu: lang === "hu" });
  return json(200, { ok: true, test });
};
