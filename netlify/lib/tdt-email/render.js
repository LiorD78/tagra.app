/**
 * Šablony e-mailů zkušební verze pro tdt.cz / tdt.sk.
 * Obsah: content-cz.json, content-sk.json (texty, odkazy, podpisy). Tady jen vzhled.
 *
 * Názvy (jako u tagra.app):
 *   {lang}-{aud}               #1 uvítací (zkušební verze)
 *   {lang}-existing-{aud}      #1 pro stávajícího zákazníka (placená licence)
 *   email2-{aud}-{lang}        #2 rychlý start (+3 dny)
 *   email3-{aud}-{lang}        #3 zkušební verze brzy končí
 * Předmět = <title>. Náhled: https://tagra.app/.netlify/functions/tdt-trial-email?preview=cz-fleet
 */
const CONTENT = {
  cz: require("./content-cz.json"),
  sk: require("./content-sk.json"),
};

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const GREEN = "#5C820F";
const LOGO = "https://tagra.app/assets/img/logo-tdt-email-white.png";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

function stepRows(steps, lastMargin = 24) {
  return steps.map(([t, d], i) => {
    const mb = i === steps.length - 1 ? lastMargin : 18;
    return `            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:${mb}px;">
              <tr>
                <td width="40" style="vertical-align:top;padding-right:14px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="32" height="32" align="center" style="background:${GREEN};border-radius:50%;color:#ffffff;font-weight:700;font-size:15px;line-height:32px;font-family:${FONT};">${i + 1}</td>
                    </tr>
                  </table>
                </td>
                <td style="vertical-align:top;">
                  <p class="dm-text" style="margin:4px 0 4px;font-size:16px;font-weight:600;color:#0b2c4a;">${t}</p>
                  <p class="dm-muted" style="margin:0;font-size:14.5px;line-height:1.5;color:#515154;">${d}</p>
                </td>
              </tr>
            </table>`;
  }).join("\n");
}

function button(label, url, size = 17) {
  return `            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="border-radius:99px;background:${GREEN};" bgcolor="${GREEN}">
                  <a href="${esc(url)}" class="btn btn-mob" target="_blank" rel="noopener" style="display:inline-block;padding:16px 36px;font-family:${FONT};font-size:${size}px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:99px;background:${GREEN};">
                    ${label}
                  </a>
                </td>
              </tr>
            </table>`;
}

const pMuted = (s, mb = 10) => `<p class="dm-muted" style="margin:0 0 ${mb}px;font-size:14px;line-height:1.55;color:#515154;">${s}</p>`;

function box(eyebrow, body) {
  return `            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="dm-compliance-bg" style="background:#f4f8fc;border:1px solid #e1ebf6;border-radius:12px;margin-bottom:16px;">
              <tr>
                <td class="px-mob" style="padding:18px 22px;">
                  <p class="dm-compliance-eb" style="margin:0 0 6px;font-size:13px;font-weight:700;color:#0b2c4a;letter-spacing:0.04em;text-transform:uppercase;">${eyebrow}</p>
                  ${body.map((x, i) => pMuted(x, i === body.length - 1 ? 0 : 10)).join("")}
                </td>
              </tr>
            </table>`;
}

function signature(sig) {
  const lines = sig.lines.map((l) => `
              <tr><td style="padding:0 0 2px 0;font-size:15px;line-height:1.6;color:#1f2d3d;">${l}</td></tr>`).join("");
  return `            <p class="dm-muted" style="margin:0 0 10px;font-size:15px;line-height:1.55;color:#515154;">${sig.greeting}</p>
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;color:#1f2d3d;">
              <tr><td class="dm-text" style="padding:0 0 2px 0;font-size:16px;font-weight:700;line-height:1.5;color:#0b2c4a;">${sig.name}</td></tr>
              <tr><td class="dm-muted" style="padding:0 0 8px 0;font-size:14px;line-height:1.5;color:#515154;">${sig.role}</td></tr>${lines}
              <tr><td style="padding:8px 0 0 0;font-size:12px;line-height:1.5;color:#5a6b7b;">${sig.company}</td></tr>
            </table>`;
}

function renderMail(m, common) {
  const sig = common.signatures[m.sign];
  const blocks = [];
  blocks.push(`        <tr>
          <td class="dm-card px-mob" style="background:#ffffff;padding:40px 40px 24px;">
            <p style="margin:0 0 12px;font-size:14px;color:${GREEN};font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">${m.eyebrow}</p>
            <h1 class="h1-mob dm-text" style="margin:0 0 16px;font-size:30px;line-height:1.2;font-weight:700;color:#0b2c4a;letter-spacing:-0.02em;">${m.h1}</h1>
            ${m.intro.map((x) => `<p class="dm-muted" style="margin:0 0 12px;font-size:16px;line-height:1.55;color:#515154;">${x}</p>`).join("")}
          </td>
        </tr>`);
  if (m.download) {
    const d = m.download;
    blocks.push(`        <tr>
          <td class="dm-card px-mob" style="background:#ffffff;padding:0 40px 28px;">
${button(d.label, d.url, 18)}
            <p class="dm-muted" style="margin:14px 0 0;font-size:13px;line-height:1.5;color:#86868b;">${d.note}</p>
          </td>
        </tr>`);
  }
  if (m.steps) {
    const head = m.steps_title ? `<p class="dm-text" style="margin:0 0 18px;font-size:18px;font-weight:700;color:#0b2c4a;">${m.steps_title}</p>` : "";
    blocks.push(`        <tr>
          <td class="dm-card px-mob" style="background:#ffffff;padding:8px 40px 8px;">
            ${head}
${stepRows(m.steps)}
          </td>
        </tr>`);
  }
  if (m.cta) {
    const c = m.cta;
    const note = c.note ? `<p class="dm-muted" style="margin:14px 0 0;font-size:14px;line-height:1.5;color:#515154;">${c.note}</p>` : "";
    blocks.push(`        <tr>
          <td class="dm-card px-mob" style="background:#ffffff;padding:0 40px 32px;">
${button(c.label, c.url)}
            ${note}
          </td>
        </tr>`);
  }
  if ((m.boxes && m.boxes.length) || (m.outro && m.outro.length)) {
    const inner = (m.boxes || []).map((b) => box(b.eyebrow, b.body)).join("\n");
    const outro = (m.outro || []).map((x) => `<p class="dm-muted" style="margin:12px 0 0;font-size:14.5px;line-height:1.55;color:#515154;">${x}</p>`).join("");
    blocks.push(`        <tr>
          <td class="dm-card" style="background:#ffffff;padding:0 40px;">
            <div class="dm-border" style="height:1px;background:#e6edf5;line-height:1px;font-size:1px;">&nbsp;</div>
          </td>
        </tr>
        <tr>
          <td class="dm-card px-mob" style="background:#ffffff;padding:28px 40px 24px;">
${inner}
            ${outro}
          </td>
        </tr>`);
  }
  blocks.push(`        <tr>
          <td class="dm-card px-mob" style="background:#ffffff;padding:8px 40px 40px;border-radius:0 0 16px 16px;">
            <div class="dm-border" style="height:1px;background:#e6edf5;line-height:1px;font-size:1px;margin-bottom:24px;">&nbsp;</div>
${signature(sig)}
          </td>
        </tr>`);
  const f = common.footer;
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="${common.html_lang}" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<meta name="robots" content="noindex, nofollow" />
<title>${m.title}</title>
<style type="text/css">
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
  body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
  table { border-collapse: collapse !important; }
  a { color: #134a8e; text-decoration: underline; }
  a.btn { text-decoration: none !important; }
  @media screen and (max-width: 600px) {
    .email-container { width: 100% !important; max-width: 100% !important; }
    .px-mob { padding-left: 24px !important; padding-right: 24px !important; }
    .h1-mob { font-size: 25px !important; line-height: 1.25 !important; }
    .btn-mob { padding: 14px 28px !important; font-size: 16px !important; }
  }
  @media (prefers-color-scheme: dark) {
    .dm-bg { background: #0b1422 !important; }
    .dm-card { background: #14213a !important; }
    .dm-text { color: #e6ecf3 !important; }
    .dm-muted { color: #a9b4c5 !important; }
    .dm-border { border-color: #22324f !important; }
    .dm-compliance-bg { background: #1a2942 !important; border-color: #2b3d5c !important; }
    .dm-compliance-eb { color: #7fb3f0 !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#eef4fa;font-family:${FONT};color:#0b0b0c;" class="dm-bg">

<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#eef4fa;">
  ${m.preheader}
</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="dm-bg" style="background:#eef4fa;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="email-container" style="max-width:600px;width:100%;">

        <tr>
          <td style="background:linear-gradient(135deg,#0b2c4a 0%,#134a8e 100%);background-color:#134a8e;padding:24px 40px;border-radius:16px 16px 0 0;" class="px-mob">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="vertical-align:middle;">
                  <a href="${f.web}" style="text-decoration:none;color:#ffffff;">
                    <img src="${LOGO}" alt="Truck Data Technology" width="121" height="34" style="display:block;height:34px;width:121px;border:0;" />
                  </a>
                </td>
                <td align="right" style="vertical-align:middle;font-size:13px;color:#a9c4e6;font-weight:500;letter-spacing:0.05em;text-transform:uppercase;">${m.strip}</td>
              </tr>
            </table>
          </td>
        </tr>

${blocks.join("\n\n")}

        <tr>
          <td style="padding:24px 40px 0;text-align:center;" class="px-mob">
            <p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:#7a8a9e;">${f.company}</p>
            <p style="margin:0;font-size:12px;line-height:1.5;color:#7a8a9e;">
              <a href="${f.web}" style="color:#7a8a9e;text-decoration:underline;">${f.web_label}</a>
              &middot;
              <a href="mailto:${f.mail}" style="color:#7a8a9e;text-decoration:underline;">${f.mail}</a>
              &middot;
              <a href="${f.privacy}" style="color:#7a8a9e;text-decoration:underline;">${f.privacy_label}</a>
            </p>
            <p style="margin:12px 0 0;font-size:11px;line-height:1.5;color:#9aa6b8;">${m.reason || f.reason}</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>
`;
}

/** Název šablony → HTML. Neznámý název → null. */
function render(name) {
  const lang = /(^|-)sk($|-)/.test(name) ? "sk" : /(^|-)cz($|-)/.test(name) ? "cz" : null;
  if (!lang) return null;
  const data = CONTENT[lang];
  for (const [key, m] of Object.entries(data.mails)) {
    if (key.replace("{lang}", lang) === name) return renderMail(m, data.common);
  }
  return null;
}

function names() {
  const out = [];
  for (const lang of Object.keys(CONTENT)) for (const key of Object.keys(CONTENT[lang].mails)) out.push(key.replace("{lang}", lang));
  return out;
}

module.exports = { render, names };
