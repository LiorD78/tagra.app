/**
 * JEDNORÁZOVÁ funkce — osobní odpověď jednomu konkrétnímu zájemci.
 *
 * Kontext: Αθανάσιος Παλαμούτης odeslal 19. 8. formulář 3x během minuty
 * a do zprávy napsal jen "ερωτησεις". Kvůli kolizi query stringu
 * (viz PR #52) dostal navíc fleetové maily místo driver. Tohle je lidská
 * odpověď v řečtině — ptáme se, jaký má dotaz, a nabízíme konkrétní pomoc.
 *
 * Text prošel crew review (GPT + Gemini + Mistral), shoda 3/3 na obsahu,
 * použita Gemini struktura + řecký termín pro čtečku karet (shoda 2:1).
 *
 * Záměrně natvrdo: příjemce, předmět i tělo. Nejde z toho poslat nic jiného
 * nikomu jinému. Po odeslání může soubor zmizet.
 *
 * GET /.netlify/functions/reply-palamoutis?token=...
 */

const TOKEN     = "tmx-reply-palamoutis-9f2c";
const TO        = "sakis033@yahoo.gr";
const SUBJECT   = "Ερωτήσεις σχετικά με το TAGRA TRUCKER";

const BODY_HTML = `<!DOCTYPE html>
<html lang="el"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:16px;line-height:1.6;color:#1d1d1f;">
<p>Αγαπητέ κ. Παλαμούτη,</p>

<p>ζητούμε συγγνώμη για το τεχνικό λάθος με τα προηγούμενα email που αφορούσαν την εταιρική έκδοση. Το πρόβλημα διορθώθηκε και σήμερα σας στείλαμε το σωστό email για το TAGRA TRUCKER.</p>

<p>Είδαμε ότι στις 19/8 στη φόρμα στο tagra.app αναφέρατε πως έχετε «ερωτήσεις». Τι ακριβώς θα θέλατε να ρωτήσετε;</p>

<p>Μπορούμε να σας βοηθήσουμε συγκεκριμένα με:</p>
<ul style="margin:0 0 16px 0;padding-left:20px;">
<li>την εγκατάσταση του προγράμματος,</li>
<li>την ανάγνωση της κάρτας οδηγού μέσω αναγνώστη καρτών USB,</li>
<li>το τι περιλαμβάνει η δοκιμαστική έκδοση 30 ημερών,</li>
<li>το αν η έκδοση TRUCKER αρκεί για την περίπτωσή σας.</li>
</ul>

<p>Μπορείτε απλώς να απαντήσετε απευθείας σε αυτό το email.</p>

<p>Με εκτίμηση,<br>Η ομάδα TAGRA</p>
</body></html>`;

exports.handler = async (event) => {
  const q = (event.queryStringParameters || {});
  if (q.token !== TOKEN) return { statusCode: 403, body: "forbidden" };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { statusCode: 500, body: "RESEND_API_KEY not configured" };

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "TAGRA <sales@tagra.app>",
      to: [TO],
      reply_to: "sales@tagra.app",
      subject: SUBJECT,
      html: BODY_HTML,
      tags: [
        { name: "campaign", value: "manual-reply" },
        { name: "audience", value: "driver" },
        { name: "language", value: "gr" },
      ],
    }),
  });

  const data = await r.json().catch(() => ({}));
  return {
    statusCode: r.ok ? 200 : 502,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: r.ok, status: r.status, to: TO, data }),
  };
};
