/**
 * Netlify Function: trial-email
 *
 * Spouští ji webhook Netlify Forms (formulář "tagra-trial").
 * Přes Resend odešle uvítací e-mail a NAPLÁNUJE zbytek sekvence.
 *
 * ── SEKVENCE ──────────────────────────────────────────────────────────
 *   #1  hned      uvítací mail (odkaz ke stažení / potvrzení poptávky)
 *   #2  +3 dny    quick start — jak naimportovat data a spustit výkaz
 *   #3  +25 dní   "zkušební verze končí za 5 dní" (z 30denního trialu)
 *
 * ENFORCEMENT je z #2 a #3 VYLOUČEN. Kontrolní orgány si Control verzi
 * nestahují samy — musí kontaktovat Ivana a ten jim pošle odkaz. Trial
 * jim tedy nezačíná odesláním formuláře, ale až Ivanovým mailem, a ten
 * okamžik tenhle systém nezná. Časovaný follow-up by dorazil někomu,
 * kdo program ještě nemá.
 *
 * ── PLÁNOVÁNÍ ─────────────────────────────────────────────────────────
 * Resend `scheduled_at` (ISO 8601, max 30 dní dopředu). Naplánované maily
 * jdou zrušit přes DELETE /emails/{id}/cancel — proto se jejich ID logují.
 *
 * Selhání naplánování NIKDY neshodí uvítací mail: #1 se odesílá první
 * a funkce vždy vrací 200, aby Netlify webhook neopakoval donekonečna.
 *
 * ── ŠABLONY ──────────────────────────────────────────────────────────
 *   /try/email-preview/{lang}-{audience}.html            → #1
 *   /try/email-preview/email2-{audience}-{lang}.html     → #2
 *   /try/email-preview/email3-{audience}-{lang}.html     → #3
 * Načítají se runtime přes HTTPS ze stejného deploye, {NAME} se dosadí.
 * Předmět #2/#3 se bere z <title> šablony — jediný zdroj pravdy, žádný drift.
 *
 * ── KONFIGURACE ──────────────────────────────────────────────────────
 *   RESEND_API_KEY   povinné
 *   RESEND_FROM      volitelné (výchozí "TAGRA <sales@tagra.app>")
 */

const RESEND_API    = "https://api.resend.com/emails";
const TEMPLATE_BASE = "https://tagra.app/try/email-preview";

const DAY_MS = 24 * 60 * 60 * 1000;

// Kdy odeslat navazující maily (dny od registrace)
const FOLLOWUP_SCHEDULE = [
  { mail: "email2", days: 3,  campaign: "trial-followup-2" },
  { mail: "email3", days: 25, campaign: "trial-followup-3" },
];

// Publika, kterým sekvence běží. Enforcement úmyslně chybí — viz hlavička.
const SEQUENCE_AUDIENCES = ["fleet", "driver"];

const VALID_AUDIENCES = ["fleet", "driver", "enforcement"];
const VALID_LANGS     = ["en", "de", "pl", "cz", "sk", "gr"];

// Předměty uvítacího mailu (#1). U #2/#3 se čtou z <title> šablony.
const SUBJECTS = {
  en: {
    fleet:       "Your TAGRA trial is ready — Download inside",
    driver:      "Your TAGRA TRUCKER trial is ready — Download inside",
    enforcement: "Thank you for your interest in TAGRA Control",
  },
  de: {
    fleet:       "Ihre TAGRA-Testversion ist bereit — Download im Inneren",
    driver:      "Ihre TAGRA TRUCKER-Testversion ist bereit — Download im Inneren",
    enforcement: "Vielen Dank für Ihr Interesse an TAGRA Control",
  },
  pl: {
    fleet:       "Wersja próbna TAGRA jest gotowa — link do pobrania w środku",
    driver:      "Wersja próbna TAGRA TRUCKER jest gotowa — link w środku",
    enforcement: "Dziękujemy za zainteresowanie TAGRA Control",
  },
  cz: {
    fleet:       "Vaše zkušební verze TAGRA je připravena — odkaz ke stažení uvnitř",
    driver:      "Vaše zkušební verze TAGRA TRUCKER je připravena — odkaz uvnitř",
    enforcement: "Děkujeme za Váš zájem o TAGRA Control",
  },
  sk: {
    fleet:       "Vaša skúšobná verzia TAGRA je pripravená — odkaz na stiahnutie vo vnútri",
    driver:      "Vaša skúšobná verzia TAGRA TRUCKER je pripravená — odkaz vo vnútri",
    enforcement: "Ďakujeme za Váš záujem o TAGRA Control",
  },
  gr: {
    fleet:       "Η δοκιμαστική έκδοση TAGRA είναι έτοιμη — σύνδεσμος λήψης εντός",
    driver:      "Η δοκιμαστική έκδοση TAGRA TRUCKER είναι έτοιμη — σύνδεσμος εντός",
    enforcement: "Σας ευχαριστούμε για το ενδιαφέρον σας για το TAGRA Control",
  },
};

const logInfo  = (msg, extra) => console.log(`[trial-email] ${msg}`, extra || "");
const logError = (msg, extra) => console.error(`[trial-email] ERROR: ${msg}`, extra || "");

/** "John Smith" → "John"; prázdné → "there" */
function firstName(fullName) {
  if (!fullName || typeof fullName !== "string") return "there";
  const trimmed = fullName.trim();
  return trimmed ? trimmed.split(/\s+/)[0] : "there";
}

/** Dekóduje entity, které se reálně vyskytují v <title>. */
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&nbsp;/g, " ")
    .replace(/&euro;/g, "€");
}

/** Předmět = <title> šablony. Jediný zdroj pravdy. */
function subjectFromTemplate(html, fallback) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? decodeEntities(m[1].trim()) : fallback;
}

async function fetchTemplate(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

/**
 * Odešle e-mail přes Resend. Když je zadáno `scheduledAt`, Resend ho
 * podrží a odešle až v daný čas.
 */
async function sendViaResend(apiKey, payload) {
  const resp = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Resend ${resp.status}: ${body}`);
  }
  return resp.json();
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    logError("Invalid JSON in webhook body");
    return { statusCode: 200, body: "Ignored: invalid JSON" };
  }

  const data     = payload.data || payload.payload || payload || {};
  const formName = payload.form_name || data.form_name || "(unknown)";

  if (formName !== "tagra-trial") {
    logInfo(`Ignored form: ${formName}`);
    return { statusCode: 200, body: "Ignored: not tagra-trial" };
  }

  const email    = (data.email || "").trim();
  const name     = (data.name || "").trim();
  const audience = (data.audience || "fleet").toLowerCase();
  const language = (data.language || "en").toLowerCase();

  if (!email) {
    logError("Missing email in submission");
    return { statusCode: 200, body: "Ignored: no email" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logError("RESEND_API_KEY not configured — skipping send");
    return { statusCode: 200, body: "Not configured: no API key" };
  }

  const aud      = VALID_AUDIENCES.includes(audience) ? audience : "fleet";
  const lang     = VALID_LANGS.includes(language) ? language : "en";
  const greeting = firstName(name);

  const fromAddr = process.env.RESEND_FROM || "TAGRA <sales@tagra.app>";
  const replyTo  = "sales@tagra.app";

  const result = { welcome: null, scheduled: [], failed: [] };

  // ── #1 UVÍTACÍ MAIL (hned) ──────────────────────────────────────────
  try {
    const html    = await fetchTemplate(`${TEMPLATE_BASE}/${lang}-${aud}.html`);
    const subject = (SUBJECTS[lang] && SUBJECTS[lang][aud]) || SUBJECTS.en[aud];

    const sent = await sendViaResend(apiKey, {
      from: fromAddr,
      to: [email],
      reply_to: replyTo,
      subject,
      html: html.replaceAll("{NAME}", greeting),
      tags: [
        { name: "campaign", value: "trial-signup" },
        { name: "audience", value: aud },
        { name: "language", value: lang },
      ],
    });

    result.welcome = sent.id;
    logInfo(`#1 sent to ${email} (lang=${lang}, audience=${aud}, id=${sent.id})`);
  } catch (e) {
    logError(`#1 failed for ${email}: ${e.message}`);
    // Bez uvítacího mailu nemá smysl plánovat zbytek sekvence.
    return { statusCode: 200, body: "Welcome email failed" };
  }

  // ── #2 a #3 (naplánované) ───────────────────────────────────────────
  // Enforcement přeskakujeme: trial jim začíná až Ivanovým mailem s odkazem.
  if (!SEQUENCE_AUDIENCES.includes(aud)) {
    logInfo(`Sequence skipped for audience=${aud} (handled manually)`);
    return {
      statusCode: 200,
      body: JSON.stringify({ sent: true, id: result.welcome, sequence: "skipped" }),
    };
  }

  const now = Date.now();

  for (const step of FOLLOWUP_SCHEDULE) {
    const tplUrl      = `${TEMPLATE_BASE}/${step.mail}-${aud}-${lang}.html`;
    const scheduledAt = new Date(now + step.days * DAY_MS).toISOString();

    try {
      const html    = await fetchTemplate(tplUrl);
      const subject = subjectFromTemplate(html, SUBJECTS.en[aud]);

      const sent = await sendViaResend(apiKey, {
        from: fromAddr,
        to: [email],
        reply_to: replyTo,
        subject,
        html: html.replaceAll("{NAME}", greeting),
        scheduled_at: scheduledAt,
        tags: [
          { name: "campaign", value: step.campaign },
          { name: "audience", value: aud },
          { name: "language", value: lang },
        ],
      });

      result.scheduled.push({ mail: step.mail, at: scheduledAt, id: sent.id });
      logInfo(`${step.mail} scheduled for ${email} at ${scheduledAt} (id=${sent.id})`);
    } catch (e) {
      // Jeden neúspěšný krok nesmí shodit další ani uvítací mail.
      result.failed.push(step.mail);
      logError(`${step.mail} scheduling failed for ${email}: ${e.message}`);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      sent: true,
      id: result.welcome,
      scheduled: result.scheduled,
      failed: result.failed,
    }),
  };
};
