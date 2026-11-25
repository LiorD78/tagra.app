/**
 * Šablony e-mailů zkušební verze pro tagra.app (TAGRA III) – nový vzhled (25. 11. 2026).
 * Stejný design jako e-maily tdt.cz / tdt.sk (netlify/lib/tdt-email/render.js):
 * pásy přes celou šířku, hero s fotkou (překryv zapečený v JPG), zelené pill tlačítko,
 * karty s ikonami, „Potřebujete poradit?“ s lidmi, tmavě modrá patička.
 * Denní i noční režim (Apple Mail přes prefers-color-scheme, Outlook přes data-ogsb/ogsc
 * a obrázkové dlaždice – Outlook přebarvuje i barvy v CSS, obrázky ne).
 *
 * Rozdíly proti tdt.cz (Libor 25. 11. 2026):
 *   - všichni dostávají TAGRA III (fleet i TAGRA TRUCKER), instalačka TAGRA_III.zip
 *   - instalace jen obecně („postupujte podle pokynů na obrazovce“) – postup Firebird /
 *     databáze admin platí jen pro současnou TAGRU na tdt.cz, pro TAGRA III ne (varianta A)
 *   - licence se kupuje přímo v programu (všechny jazyky včetně HU), hardware v e-shopu
 *     shop.tagra.app
 *   - podpora support@tagra.app
 *
 * Obsah: content-{lang}.json (všechny texty včetně UI). Tady jen vzhled.
 * Názvy šablon (jako dosavadní soubory v /try/email-preview/):
 *   {lang}-{aud}            #1 uvítací (aud = fleet | driver | enforcement)
 *   email2-{aud}-{lang}     #2 +3 dny
 *   email4-{aud}-{lang}     #3 +7 dní
 *   email3-{aud}-{lang}     #4 +21 dní (cz/sk +25)
 *   email5-{aud}-{lang}     #5 +28 dní
 * {NAME} dosazuje netlify/functions/trial-email.js (fillName), bez jména ho čistě odstraní.
 */
const { seasonAt } = require("../season.js");
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const NAVY = "#0b2c4a";
const BLUE = "#134a8e";
const GREEN = "#6e9b12"; // stejná zelená jako logo TAGRA
const GREEN_TEXT = "#52760c";
const MUTED = "#515154";
const LINE = "#e3eaf2";
const APPLE_BG = "#eaf3f8";

const IMG = (p, q) => `https://www.tdt.cz/.netlify/images?url=${p}&amp;${q}`;
const A = {
  logoTdt: "https://tagra.app/assets/img/logo-tdt-email-v2.png",
  logoTagra: "https://tagra.app/assets/img/logo-email-white.png",
  // sezónní pozadí podle data odeslání (jaro/léto/podzim/zima přesně od rovnodennosti/slunovratu, 25. 11. 2026); překryv zapečený v JPG (Outlook zahazuje CSS gradient)
  get hero() { return `https://tagra.app/assets/img/email-hero-tdt.jpg?v=2-${seasonAt()}`; },
  team: (n) => IMG(`/assets/img/team/${n}.webp`, "fm=png&amp;w=160"),
  px: (n) => `https://tagra.app/.netlify/functions/email-logo/${n}.png`,
  tile: (n) => `https://tagra.app/.netlify/functions/email-px/${n}.png`,
};
const ICONS = {
  licence: IMG("/assets/img/ikony/qz-aktivace-licence.webp", "fm=png&amp;w=112"),
  contact: IMG("/assets/img/ikony/qz-kontakty.webp", "fm=png&amp;w=112"),
  download: IMG("/assets/img/ikony/qz-ke-stazeni.webp", "fm=png&amp;w=112"),
  manual: IMG("/assets/img/ikony/qz-navody.webp", "fm=png&amp;w=112"),
  faq: IMG("/assets/img/ikony/qz-caste-dotazy.webp", "fm=png&amp;w=112"),
};
const GREEN_IMG = `background-image:url('${A.px("px-green")}');`;
const NAVY_BAND = `background-image:url('${A.px("band-navy")}');background-size:100% 100%;background-repeat:repeat-y;`;

const esc = (s) => String(s).replace(/&(?!(amp|nbsp|middot|ndash|mdash|quot|euro|#\d+);)/g, "&amp;").replace(/"/g, "&quot;");

function button(label, url, { w = 300, light = false } = {}) {
  const u = esc(url);
  const bg = light ? "#ffffff" : GREEN;
  const fg = light ? NAVY : "#ffffff";
  return `<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${u}" style="height:52px;v-text-anchor:middle;width:${w}px;" arcsize="50%" stroke="f" fillcolor="${bg}">
<w:anchorlock/><center style="color:${fg};font-family:Arial,sans-serif;font-size:17px;font-weight:bold;">${label}</center>
</v:roundrect>
<![endif]--><!--[if !mso]><!-- --><a href="${u}" target="_blank" rel="noopener" class="btn${light ? " btn-light" : ""}" style="display:inline-block;background-color:${bg};${light ? `background-image:none;border:2px solid ${GREEN};line-height:48px;` : `${GREEN_IMG}line-height:52px;`}color:${fg};font-family:${FONT};font-size:17px;font-weight:700;text-align:center;text-decoration:none;border-radius:99px;padding:0 34px;mso-hide:all;">${label}</a><!--<![endif]-->`;
}

const P = (s, { size = 16, mb = 14 } = {}) =>
  `<p class="t-muted" style="margin:0 0 ${mb}px;font-family:${FONT};font-size:${size}px;line-height:1.6;color:${MUTED};">${s}</p>`;

function band(inner, { bg = "#ffffff", cls = "b-white", pad = "40px 32px" } = {}) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${bg}" class="${cls}" style="background-color:${bg};">
  <tr><td align="center" style="padding:0 12px;">
    <!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;">
      <tr><td class="px" style="padding:${pad};">
${inner}
      </td></tr>
    </table>
    <!--[if mso]></td></tr></table><![endif]-->
  </td></tr>
</table>`;
}

const eyebrow = (text) => `<p class="t-eb" style="margin:0 0 10px;font-family:${FONT};font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${GREEN_TEXT};">${text}</p>`;
const heading = (text, size = 24) => `<h2 class="t-head" style="margin:0 0 16px;font-family:${FONT};font-size:${size}px;line-height:1.2;font-weight:800;text-transform:uppercase;letter-spacing:-0.01em;color:${NAVY};">${text}</h2>`;

function steps(list) {
  return list.map(([t, d], i) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 ${i === list.length - 1 ? 4 : 18}px;">
  <tr>
    <td width="44" valign="top" style="padding-right:14px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="36" height="36" align="center" bgcolor="${GREEN}" style="background-color:${GREEN};${GREEN_IMG}border-radius:50%;font-family:${FONT};font-size:16px;font-weight:800;line-height:36px;color:#ffffff;">${i + 1}</td>
      </tr></table>
    </td>
    <td valign="top">
      <p class="t-head" style="margin:6px 0 4px;font-family:${FONT};font-size:17px;font-weight:700;line-height:1.35;color:${NAVY};">${t}</p>
      ${d ? `<p class="t-muted" style="margin:0;font-family:${FONT};font-size:15px;line-height:1.55;color:${MUTED};">${d}</p>` : ""}
    </td>
  </tr>
</table>`).join("\n");
}

// Ceník: řádky [počet vozidel, varianta, cena]
function prices(rows, note) {
  const tr = rows.map(([who, ed, price], i) => `<tr>
    <td class="t-muted" style="padding:12px 0;${i ? `border-top:1px solid ${LINE};` : ""}font-family:${FONT};font-size:14px;line-height:1.4;color:${MUTED};">${who}</td>
    <td class="t-head" style="padding:12px 8px;${i ? `border-top:1px solid ${LINE};` : ""}font-family:${FONT};font-size:16px;font-weight:800;line-height:1.4;color:${NAVY};">${ed}</td>
    <td class="t-head" align="right" style="padding:12px 0;${i ? `border-top:1px solid ${LINE};` : ""}font-family:${FONT};font-size:17px;font-weight:800;line-height:1.4;color:${NAVY};white-space:nowrap;">${price}</td>
  </tr>`).join("\n");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;">${tr}</table>${note ? P(note, { size: 13, mb: 4 }) : ""}`;
}

// Karta: tmavě modrá jako hlavička a patička, světlý text. Univerzální pro den i noc
// (Libor 25. 11. 2026): pozadí drží obrázková dlaždice band-navy, kterou Outlook nepřebarví,
// a světlý text Outlook nechává světlý. Žádné přepínání barev podle režimu.
const onNavy = (s) => s.replace(/color:#134a8e;/g, "color:#8cc3ff;").replace(/color:#0b2c4a;/g, "color:#ffffff;");
function card(b, iconArg) {
  const icon = iconArg !== undefined ? iconArg : ICONS[b.icon];
  const body = b.body.map((x, i) => `<p class="t-onnavy" style="margin:${i ? "10px" : "0"} 0 0;font-family:${FONT};font-size:15px;line-height:1.6;color:#dbe6f2;">${onNavy(x)}</p>`).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${NAVY}" background="${A.px("band-navy")}" class="b-navy" style="background-color:${NAVY};${NAVY_BAND}border-radius:16px;margin:0 0 14px;">
  <tr>
    ${icon ? `<td width="72" valign="top" class="ico" style="padding:20px 0 20px 20px;"><img src="${icon}" width="56" height="56" alt="" style="display:block;width:56px;height:56px;border:0;" /></td>` : ""}
    <td valign="top" style="padding:20px 22px 20px ${icon ? "8px" : "22px"};">
      <p class="t-onnavy" style="margin:0 0 6px;font-family:${FONT};font-size:14px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:#a8d14a;">${b.eyebrow}</p>
      ${body}
    </td>
  </tr>
</table>`;
}

function person(p) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td width="84" valign="top" style="padding:18px 0 18px 18px;"><img src="${A.team(p.photo)}" width="66" height="66" alt="${p.name}" style="display:block;width:66px;height:66px;border-radius:50%;border:0;background-color:#dfe9f2;" /></td>
    <td valign="top" style="padding:18px 18px 18px 14px;">
      <p class="t-head" style="margin:0;font-family:${FONT};font-size:16px;font-weight:800;line-height:1.35;color:${NAVY};">${p.name}</p>
      <p class="t-muted" style="margin:0 0 8px;font-family:${FONT};font-size:13px;line-height:1.45;color:${MUTED};">${p.role}</p>
      <p style="margin:0;font-family:${FONT};font-size:14px;line-height:1.6;">${p.tel ? `<a href="tel:${p.tel}" class="t-link" style="color:${BLUE};text-decoration:none;font-weight:700;">${p.telL}</a><br />` : ""}<a href="mailto:${p.mail}" class="t-link" style="color:${BLUE};text-decoration:underline;">${p.mail}</a></p>
    </td>
  </tr>
</table>`;
}
const CARD_TD = `bgcolor="#ffffff" class="col b-white b-card" style="background-color:#ffffff;border:1px solid ${LINE};border-radius:16px;"`;

function renderMail(m, common) {
  const ui = common.ui;
  const f = common.footer;
  const cta = m.download || m.cta;
  const intro = m.intro.slice();
  const greeting = intro.length > 1 ? intro.shift() : "";

  const top = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${NAVY}" background="${A.px("band-navy")}" class="b-navy" style="background-color:${NAVY};${NAVY_BAND}">
  <tr><td align="center" style="padding:0 12px;">
    <!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;">
      <tr><td class="px topbar" align="right" style="padding:10px 32px 0;font-family:${FONT};font-size:12px;line-height:1.5;color:#c9d8ea;">
        <span style="white-space:nowrap;"><span class="t-onnavy" style="color:#c9d8ea;">${ui.top_sales}&nbsp;</span><a href="tel:${ui.top_tel[0]}" style="color:#ffffff;text-decoration:none;font-weight:700;">${ui.top_tel[1]}</a></span>
        <span class="sep" style="color:#4d6f96;"> &nbsp;| </span>
        <span style="white-space:nowrap;"><span class="t-onnavy" style="color:#c9d8ea;">${ui.top_support}&nbsp;</span><a href="mailto:${ui.support_mail}" style="color:#ffffff;text-decoration:none;font-weight:700;">${ui.support_mail}</a></span>
      </td></tr>
      <tr><td class="px" style="padding:14px 32px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td valign="middle"><a href="${f.web}" target="_blank" style="text-decoration:none;"><img src="${A.logoTagra}" width="142" height="32" alt="TAGRA" style="display:block;width:142px;height:32px;border:0;" /></a></td>
          <td valign="middle" align="right"><img src="${A.logoTdt}" width="107" height="30" alt="Truck Data Technology" style="display:inline-block;width:107px;height:30px;border:0;" /></td>
        </tr></table>
      </td></tr>
    </table>
    <!--[if mso]></td></tr></table><![endif]-->
  </td></tr>
</table>`;

  const heroInner = `
        <span class="pill" style="display:inline-block;background-color:${GREEN};${GREEN_IMG}color:#ffffff;font-family:${FONT};font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;border-radius:99px;padding:6px 14px;margin:0 0 16px;">${m.strip}</span>
        <h1 class="h1" style="margin:0 0 16px;font-family:${FONT};font-size:34px;line-height:1.12;font-weight:800;text-transform:uppercase;letter-spacing:-0.01em;color:#ffffff;">${m.h1}</h1>
        ${greeting ? `<p class="t-onhero" style="margin:0 0 6px;font-family:${FONT};font-size:17px;line-height:1.6;color:#ffffff;font-weight:600;">${greeting}</p>` : ""}
        ${intro.map((x) => `<p class="t-onhero" style="margin:0 0 22px;font-family:${FONT};font-size:17px;line-height:1.6;color:#e3ecf6;">${x}</p>`).join("")}
        ${cta ? `<div style="margin:6px 0 0;">${button(cta.label, cta.url)}</div>` : ""}
        ${cta && cta.note ? `<p class="t-onhero" style="margin:14px 0 0;font-family:${FONT};font-size:13px;line-height:1.55;color:#bfd0e3;">${cta.note}</p>` : ""}`;
  const hero = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${NAVY}" class="b-navy" style="background-color:${NAVY};">
  <tr><td align="center" background="${A.hero}" bgcolor="${NAVY}" style="background-color:${NAVY};background-image:url('${A.hero}');background-size:cover;background-position:center 60%;padding:0 12px;">
    <!--[if gte mso 9]>
    <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:640px;">
    <v:fill type="frame" src="${A.hero}" color="${NAVY}" />
    <v:textbox inset="0,0,0,0">
    <table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td>
    <![endif]-->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;">
      <tr><td class="px hero" style="padding:48px 32px 52px;">${heroInner}
      </td></tr>
    </table>
    <!--[if gte mso 9]></td></tr></table></v:textbox></v:rect><![endif]-->
  </td></tr>
</table>`;

  const parts = [];
  if (m.prices) parts.push((m.prices_title ? heading(m.prices_title, 22) : "") + prices(m.prices, m.prices_note));
  if (m.steps) parts.push((m.steps_title ? heading(m.steps_title, 22) : "") + steps(m.steps));
  if (m.cta2) parts.push(`<div style="margin:4px 0 0;">${button(m.cta2.label, m.cta2.url, { light: true })}</div>`);
  if ((m.boxes && m.boxes.length) || (m.outro && m.outro.length)) {
    parts.push((m.boxes || []).map((b) => card(b)).join("\n") + (m.outro || []).map((x) => P(x, { size: 15, mb: 10 })).join(""));
  }
  const sig = common.signatures[m.sign];
  if (sig) parts.push(`<p class="t-muted" style="margin:0 0 4px;font-family:${FONT};font-size:15px;line-height:1.5;color:${MUTED};">${sig.greeting}</p>
        <p class="t-head" style="margin:0;font-family:${FONT};font-size:16px;font-weight:800;line-height:1.4;color:${NAVY};">${sig.name}</p>
        <p class="t-muted" style="margin:0;font-family:${FONT};font-size:14px;line-height:1.5;color:${MUTED};">${sig.role}</p>`);
  const content = parts.length ? band(parts.join(`\n<div style="height:24px;line-height:24px;font-size:1px;">&nbsp;</div>\n`), { pad: "40px 32px 32px" }) : "";

  const help = band(`${eyebrow(ui.help_eb)}${heading(ui.help_h, 24)}${P(ui.help_p, { size: 15, mb: 20 })}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="49%" valign="top" ${CARD_TD}>${person(ui.people[0])}</td>
          <td class="gap" width="2%" style="font-size:1px;line-height:1px;">&nbsp;</td>
          <td width="49%" valign="top" ${CARD_TD}>${person(ui.people[1])}</td>
        </tr></table>`, { bg: APPLE_BG, cls: "b-apple", pad: "40px 32px 44px" });

  const links = [[f.web_label, f.web], ...ui.links, [f.privacy_label, f.privacy]]
    .map(([t, u]) => `<a href="${esc(u)}" target="_blank" style="color:#ffffff;text-decoration:none;white-space:nowrap;">${t}</a>`)
    .join(`<span style="color:#4d6f96;">&nbsp;&nbsp;&middot;&nbsp;</span> `);
  const foot = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${NAVY}" background="${A.px("band-navy")}" class="b-navy" style="background-color:${NAVY};${NAVY_BAND}">
  <tr><td align="center" style="padding:0 12px;">
    <!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;">
      <tr><td class="px" style="padding:40px 32px 36px;">
        <img src="${A.logoTagra}" width="142" height="32" alt="TAGRA" style="display:block;width:142px;height:32px;border:0;margin:0 0 16px;" />
        <p class="t-onnavy" style="margin:0 0 4px;font-family:${FONT};font-size:13px;line-height:1.6;color:#c9d8ea;">${f.company}</p>
        <p class="t-onnavy" style="margin:0 0 18px;font-family:${FONT};font-size:13px;line-height:1.6;color:#c9d8ea;">${f.ids}</p>
        <p style="margin:0 0 22px;font-family:${FONT};font-size:13px;line-height:1.9;font-weight:600;">${links}</p>
        <div style="height:1px;line-height:1px;font-size:1px;background-color:#2a4e78;">&nbsp;</div>
        <p class="t-onnavy" style="margin:18px 0 0;font-family:${FONT};font-size:12px;line-height:1.6;color:#9fb4cc;">${m.reason || f.reason}</p>
      </td></tr>
    </table>
    <!--[if mso]></td></tr></table><![endif]-->
  </td></tr>
</table>`;

  return `<!DOCTYPE html>
<html lang="${common.html_lang}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<meta name="robots" content="noindex, nofollow" />
<title>${m.title}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style type="text/css">
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
  body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
  a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
  @media screen and (max-width: 600px) {
    .px { padding-left: 20px !important; padding-right: 20px !important; }
    .hero { padding-top: 36px !important; padding-bottom: 40px !important; }
    .h1 { font-size: 26px !important; line-height: 1.15 !important; }
    .col { display: block !important; width: auto !important; }
    .gap { display: block !important; width: 100% !important; height: 12px !important; }
    .topbar { text-align: left !important; font-size: 11px !important; }
    .sep { display: none !important; }
    .btn { display: block !important; padding: 0 20px !important; }
    .ico { display: none !important; }
  }
  @media (prefers-color-scheme: dark) {
    .b-white, .b-apple { background-color: #1e1e1e !important; }
    .b-box, .b-card { background-color: #2a2a2a !important; border-color: #3a3a3a !important; }
    .t-head { color: #ffffff !important; }
    .t-muted { color: #d0d6de !important; }
    .t-eb { color: #a8d14a !important; }
    .t-link, .t-muted a, .b-box a { color: #8cc3ff !important; }
    .t-muted strong { color: #ffffff !important; }
    .btn-light { background-color: #1e1e1e !important; color: #ffffff !important; }
  }
  [data-ogsb].b-white, [data-ogsb] .b-white, [data-ogsb].b-apple, [data-ogsb] .b-apple { background-color: #1e1e1e !important; background-image: url('${A.tile("dark")}') !important; }
  [data-ogsb].b-box, [data-ogsb] .b-box, [data-ogsb].b-card, [data-ogsb] .b-card { background-color: #2a2a2a !important; background-image: url('${A.tile("card")}') !important; border-color: #3a3a3a !important; }
  [data-ogsc].t-head, [data-ogsc] .t-head { color: #ffffff !important; }
  [data-ogsc].t-muted, [data-ogsc] .t-muted { color: #d0d6de !important; }
  [data-ogsc].t-eb, [data-ogsc] .t-eb { color: #a8d14a !important; }
  [data-ogsc].t-link, [data-ogsc] .t-link, [data-ogsc] .t-muted a, [data-ogsc] .b-box a { color: #8cc3ff !important; }
  [data-ogsc] .t-muted strong { color: #ffffff !important; }
</style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;" class="b-white">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#ffffff;opacity:0;">${m.preheader}${"&#847;&zwnj;&nbsp;".repeat(40)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" class="b-white" style="background-color:#ffffff;">
<tr><td>
${top}
${hero}
${content}
${help}
${foot}
</td></tr>
</table>
</body>
</html>
`;
}

/** content = obsah jednoho jazyka; vrací { název: html } */
function renderAll(content, lang) {
  const out = {};
  for (const [key, m] of Object.entries(content.mails)) out[key.replace("{lang}", lang)] = renderMail(m, content.common);
  return out;
}

module.exports = { renderMail, renderAll };
