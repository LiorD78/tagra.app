/**
 * Sdílené pomůcky pro lead řetěz (trial-email.js + resend-webhook.js).
 * Není to samostatná Netlify funkce — leží v podsložce bez index.js.
 */

const RESEND_API = "https://api.resend.com";

const LEAD_STORE        = "trial-leads";
const NOTIFY_FROM       = "TAGRA leads <sales@tagra.app>";
const NOTIFY_TO_DEFAULT = "libor.dospel@gmail.com";

// Rozumná kontrola: bez mezer, bez "@" a lomítek v lokální části i doméně, TLD ≥ 2 písmena.
// MUSÍ odpovídat atributu pattern ve formulářích /try/* (try/index.html a jazykové mutace).
const EMAIL_RE = /^[^\s@\/]+@[^\s@\/]+\.[a-z]{2,}$/i;

/** E-mail → ASCII klíč (lowercase, ořezaný, non-alfanumerické → "-"). */
function normalizeEmailForKey(email) {
  return String(email || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "-");
}

const escapeHtml = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Netlify Blobs store s leady. Při nedostupnosti vrací null (volající je fail-open). */
function getLeadStore(event) {
  try {
    const blobs = require("@netlify/blobs");
    // Funkce ve formátu exports.handler (Lambda režim) potřebují connectLambda.
    if (event && typeof blobs.connectLambda === "function") blobs.connectLambda(event);
    return blobs.getStore(LEAD_STORE);
  } catch (e) {
    console.error(`[lead-common] Blobs unavailable: ${e.message}`);
    return null;
  }
}

/** Interní notifikace Liborovi. Nikdy nevyhazuje chybu. Vrací true při úspěchu. */
async function sendInternalNotify(apiKey, subject, html) {
  if (!apiKey) return false;
  try {
    const resp = await fetch(`${RESEND_API}/emails`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: (process.env.LEAD_NOTIFY_TO || NOTIFY_TO_DEFAULT).split(",").map((s) => s.trim()).filter(Boolean),
        subject: String(subject).replace(/[\r\n]+/g, " "),
        html,
        tags: [{ name: "campaign", value: "lead-notify" }],
      }),
    });
    if (!resp.ok) throw new Error(`Resend ${resp.status}: ${await resp.text()}`);
    return true;
  } catch (e) {
    console.error(`[lead-common] Internal notification failed: ${e.message}`);
    return false;
  }
}

module.exports = {
  RESEND_API, LEAD_STORE, NOTIFY_FROM, NOTIFY_TO_DEFAULT,
  EMAIL_RE, normalizeEmailForKey, escapeHtml, getLeadStore, sendInternalNotify,
};
