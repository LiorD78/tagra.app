/**
 * Šablony e-mailů zkušební verze pro tdt.cz / tdt.sk.
 * Obsah: content-cz.json, content-sk.json (texty, odkazy). Tady vzhled + UI texty.
 *
 * Názvy (jako u tagra.app):
 *   {lang}-{aud}               #1 uvítací (zkušební verze)
 *   {lang}-existing-{aud}      #1 pro stávajícího zákazníka (placená licence)
 *   email2-{aud}-{lang}        #2 rychlý start (+3 dny)
 *   email3-{aud}-{lang}        #3 zkušební verze brzy končí
 * Předmět = <title>. Náhled: https://tagra.app/.netlify/functions/tdt-trial-email?preview=cz-driver
 *
 * VZOR NEWSLETTERU TDT (25. 11. 2026, Libor + crew GPT/Gemini/Grok)
 * Korporátní identita webu tdt.cz, pásy přes celou šířku, obsah v safe zóně 600 px:
 *   1. kontaktní pruh + hlavička (tmavě modrý gradient, bílá loga TDT + TAGRA)
 *   2. hero (fotka kamionu s tmavým překryvem ZAPEČENÝM v JPG – funkce email-hero;
 *      Outlook zahazuje CSS gradient, bílý text pak nebyl čitelný; fallback #0b2c4a, VML):
 *      zelený pill štítek, bílý nadpis VERZÁLKAMI, úvod, JEDNO zelené pill tlačítko
 *   3. obsah na bílé (kroky, karty s ikonami, světle modré infoboxy)
 *   4. „Potřebujete poradit?“ – lidé s fotkou (obchod + helpdesk), klikací tel/mail
 *   5. patička (tmavě modrý gradient, bílé logo, adresa, IČO/DIČ, sociální sítě, důvod e-mailu)
 * Denní i noční režim: explicitní tmavá paleta přes @media (prefers-color-scheme: dark)
 * (Apple Mail, iOS) a [data-ogsc]/[data-ogsb] (Outlook.com, nový Outlook), každý text
 * i podklad má vlastní barvu i třídu – nic se nepřebarví napůl.
 * Obrázky jako PNG/JPG přes Netlify Image CDN na tdt.cz (Outlook neumí WebP/SVG).
 */
const CONTENT = {
  cz: require("./content-cz.json"),
  sk: require("./content-sk.json"),
};

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const NAVY = "#0b2c4a";
const NAVY_DEEP = "#062035";
const BLUE = "#134a8e";
const GREEN = "#6e9b12"; // stejná zelená jako loga TAGRA a TDT (Outlook zahazuje gradient → plná barva)
const GREEN_LIGHT = "#7fb317";
const GREEN_TEXT = "#52760c";
const INK = "#1d1d1f";
const MUTED = "#515154";
const LINE = "#e3eaf2";
const APPLE_BG = "#eaf3f8";

const IMG = (p, q) => `https://www.tdt.cz/.netlify/images?url=${p}&amp;${q}`;
const A = {
  logoTdt: "https://tagra.app/assets/img/logo-tdt-email-v2.png", // zelená jako logo TAGRA
  logoTagra: "https://tagra.app/assets/img/logo-email-white.png",
  hero: "https://tagra.app/assets/img/email-hero-tdt.jpg", // překryv zapečený v JPG (Outlook zahazuje CSS gradient)
  icoLicence: IMG("/assets/img/ikony/qz-aktivace-licence.webp", "fm=png&amp;w=112"),
  icoKontakt: IMG("/assets/img/ikony/qz-kontakty.webp", "fm=png&amp;w=112"),
  icoStazeni: IMG("/assets/img/ikony/qz-ke-stazeni.webp", "fm=png&amp;w=112"),
  icoNavody: IMG("/assets/img/ikony/qz-navody.webp", "fm=png&amp;w=112"),
  icoDotazy: IMG("/assets/img/ikony/qz-caste-dotazy.webp", "fm=png&amp;w=112"),
  social: (n) => IMG(`/assets/img/social/${n}.webp`, "fm=png&amp;w=64"),
  team: (n) => IMG(`/assets/img/team/${n}.webp`, "fm=png&amp;w=160"),
};
const SOCIAL = [
  ["youtube", "YouTube", "https://www.youtube.com/@truckmall"],
  ["facebook", "Facebook", "https://www.facebook.com/truckmall.cz.truck.data.technology"],
  ["instagram", "Instagram", "https://www.instagram.com/truckmall.cz/"],
  ["linkedin", "LinkedIn", "https://www.linkedin.com/company/truckmall/"],
];

// UI texty šablony (obsah e-mailů je v content-*.json)
const UI = {
  cz: {
    obchod: "Obchod", helpdesk: "Helpdesk",
    help_eb: "Jsme tu pro vás", help_h: "Potřebujete poradit?",
    help_p: "Zavolejte nebo napište – v pracovní dny odpovídáme obvykle do pár hodin.",
    people: [
      { photo: "ivan-szabo", name: "Ivan Szabó", role: "obchod a varianty programu", tel: "+420739005345", telL: "+420&nbsp;739&nbsp;005&nbsp;345", mail: "obchod@tdt.cz" },
      { photo: "tomas-knizek-top", name: "Tomáš Knížek", role: "technická podpora (helpdesk)", tel: "+420274777390", telL: "+420&nbsp;274&nbsp;777&nbsp;390, volba&nbsp;1", mail: "helpdesk@tdt.cz" },
    ],
    links: [["Ke stažení", "https://www.tdt.cz/ke-stazeni"], ["Návody", "https://www.tdt.cz/navody"], ["Kontakty", "https://www.tdt.cz/kontakty"]],
    top_tel: ["+420739005345", "+420&nbsp;739&nbsp;005&nbsp;345"], top_help: ["+420274777390", "+420&nbsp;274&nbsp;777&nbsp;390"],
    ico_company: "IČO 27381269 &middot; DIČ CZ27381269",
    rights: "Truck Data Technology, s.r.o. &ndash; výrobce programu TAGRA",
  },
  sk: {
    obchod: "Obchod", helpdesk: "Helpdesk",
    help_eb: "Sme tu pre vás", help_h: "Potrebujete poradiť?",
    help_p: "Zavolajte alebo napíšte – v pracovné dni odpovedáme zvyčajne do pár hodín.",
    people: [
      { photo: "tomas-gajdos", name: "Ing. Tomáš Gajdoš", role: "obchod a varianty programu", tel: "+421917212796", telL: "+421&nbsp;917&nbsp;212&nbsp;796", mail: "obchod@tdt.sk" },
      { photo: "tomas-knizek-top", name: "Tomáš Knížek", role: "technická podpora (helpdesk)", tel: "+420274777390", telL: "+420&nbsp;274&nbsp;777&nbsp;390, voľba&nbsp;1", mail: "helpdesk@tdt.cz" },
    ],
    links: [["Na stiahnutie", "https://www.tdt.sk/k-stiahnutiu"], ["Návody", "https://www.tdt.sk/navody"], ["Kontakty", "https://www.tdt.sk/kontakty"]],
    top_tel: ["+421917212796", "+421&nbsp;917&nbsp;212&nbsp;796"], top_help: ["+420274777390", "+420&nbsp;274&nbsp;777&nbsp;390"],
    ico_company: "IČO 46127241 &middot; IČ DPH SK2023245741",
    rights: "Truck Data Technology, s.r.o. &ndash; výrobca programu TAGRA",
  },
};

const esc = (s) => String(s).replace(/&(?!(amp|nbsp|middot|ndash|mdash|quot|#\d+);)/g, "&amp;").replace(/"/g, "&quot;");

// Bulletproof pill tlačítko: VML pro Outlook (Windows), jinak gradient + zaoblení
function button(label, url, { w = 300, light = false } = {}) {
  const u = esc(url);
  const bg = light ? "#ffffff" : GREEN;
  const fg = light ? NAVY : "#ffffff";
  return `<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${u}" style="height:52px;v-text-anchor:middle;width:${w}px;" arcsize="50%" stroke="f" fillcolor="${bg}">
<w:anchorlock/><center style="color:${fg};font-family:Arial,sans-serif;font-size:17px;font-weight:bold;">${label}</center>
</v:roundrect>
<![endif]--><!--[if !mso]><!-- --><a href="${u}" target="_blank" rel="noopener" class="btn${light ? " btn-light" : ""}" style="display:inline-block;background-color:${bg};background-image:${light ? "none" : `linear-gradient(135deg,${GREEN_LIGHT} 0%,${GREEN} 100%)`};color:${fg};font-family:${FONT};font-size:17px;font-weight:700;line-height:52px;text-align:center;text-decoration:none;border-radius:99px;padding:0 34px;mso-hide:all;">${label}</a><!--<![endif]-->`;
}

const P = (s, { size = 16, mb = 14, cls = "t-muted", color = MUTED } = {}) =>
  `<p class="${cls}" style="margin:0 0 ${mb}px;font-family:${FONT};font-size:${size}px;line-height:1.6;color:${color};">${s}</p>`;

// Pás přes celou šířku + obsah v 600 px (MSO tabulka pro Outlook)
function band(inner, { bg = "#ffffff", cls = "b-white", pad = "40px 32px", style = "" } = {}) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${bg}" class="${cls}" style="background-color:${bg};${style}">
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

function eyebrow(text, onDark = false) {
  return `<p class="${onDark ? "t-eb-dark" : "t-eb"}" style="margin:0 0 10px;font-family:${FONT};font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${onDark ? "#a8d14a" : GREEN_TEXT};">${text}</p>`;
}
function heading(text, size = 24) {
  return `<h2 class="t-head" style="margin:0 0 16px;font-family:${FONT};font-size:${size}px;line-height:1.2;font-weight:800;text-transform:uppercase;letter-spacing:-0.01em;color:${NAVY};">${text}</h2>`;
}

function steps(list) {
  return list.map(([t, d], i) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 ${i === list.length - 1 ? 4 : 18}px;">
  <tr>
    <td width="44" valign="top" style="padding-right:14px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="36" height="36" align="center" bgcolor="${GREEN}" style="background-color:${GREEN};border-radius:50%;font-family:${FONT};font-size:16px;font-weight:800;line-height:36px;color:#ffffff;">${i + 1}</td>
      </tr></table>
    </td>
    <td valign="top">
      <p class="t-head" style="margin:6px 0 4px;font-family:${FONT};font-size:17px;font-weight:700;line-height:1.35;color:${NAVY};">${t}</p>
      <p class="t-muted" style="margin:0;font-family:${FONT};font-size:15px;line-height:1.55;color:${MUTED};">${d}</p>
    </td>
  </tr>
</table>`).join("\n");
}

// Karta s ikonou (jako dlaždice na tdt.cz)
function card(b, icon) {
  const body = b.body.map((x, i) => `<p class="t-muted" style="margin:${i ? "10px" : "0"} 0 0;font-family:${FONT};font-size:15px;line-height:1.6;color:${MUTED};">${x}</p>`).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${APPLE_BG}" class="b-box" style="background-color:${APPLE_BG};border:1px solid #d6e6f1;border-radius:16px;margin:0 0 14px;">
  <tr>
    ${icon ? `<td width="72" valign="top" class="ico" style="padding:20px 0 20px 20px;"><img src="${icon}" width="56" height="56" alt="" style="display:block;width:56px;height:56px;border:0;" /></td>` : ""}
    <td valign="top" style="padding:20px 22px 20px ${icon ? "8px" : "22px"};">
      <p class="t-head" style="margin:0 0 6px;font-family:${FONT};font-size:14px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:${NAVY};">${b.eyebrow}</p>
      ${body}
    </td>
  </tr>
</table>`;
}

function iconFor(eb) {
  const s = eb.toLowerCase();
  if (/koup|kúp|licenc|variant|cen/.test(s)) return A.icoLicence;
  if (/pomoc|podpor|nejde|nedarí|potíž/.test(s)) return A.icoKontakt;
  if (/čtečk|čítačk|stažen|stiahn/.test(s)) return A.icoStazeni;
  if (/proč|prečo|záleží/.test(s)) return A.icoNavody;
  return A.icoDotazy;
}

function person(p) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" class="b-white b-card" style="background-color:#ffffff;border:1px solid ${LINE};border-radius:16px;">
  <tr>
    <td width="84" valign="top" style="padding:18px 0 18px 18px;"><img src="${A.team(p.photo)}" width="66" height="66" alt="${p.name}" style="display:block;width:66px;height:66px;border-radius:50%;border:0;background-color:#dfe9f2;" /></td>
    <td valign="top" style="padding:18px 18px 18px 14px;">
      <p class="t-head" style="margin:0;font-family:${FONT};font-size:16px;font-weight:800;line-height:1.35;color:${NAVY};">${p.name}</p>
      <p class="t-muted" style="margin:0 0 8px;font-family:${FONT};font-size:13px;line-height:1.45;color:${MUTED};">${p.role}</p>
      <p style="margin:0;font-family:${FONT};font-size:14px;line-height:1.6;"><a href="tel:${p.tel}" class="t-link" style="color:${BLUE};text-decoration:none;font-weight:700;">${p.telL}</a><br /><a href="mailto:${p.mail}" class="t-link" style="color:${BLUE};text-decoration:underline;">${p.mail}</a></p>
    </td>
  </tr>
</table>`;
}

function renderMail(m, common, lang) {
  const ui = UI[lang];
  const f = common.footer;
  const cta = m.download || m.cta;
  const intro = m.intro.slice();
  const greeting = intro.length > 1 ? intro.shift() : "";

  // 1) kontaktní pruh + hlavička
  const top = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${NAVY}" class="b-navy" style="background-color:${NAVY};background-image:linear-gradient(90deg,${NAVY_DEEP} 0%,${NAVY} 35%,${BLUE} 100%);">
  <tr><td align="center" style="padding:0 12px;">
    <!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;">
      <tr><td class="px topbar" align="right" style="padding:10px 32px 0;font-family:${FONT};font-size:12px;line-height:1.5;color:#c9d8ea;">
        <span class="t-onnavy" style="color:#c9d8ea;">${ui.obchod}&nbsp;</span><a href="tel:${ui.top_tel[0]}" style="color:#ffffff;text-decoration:none;font-weight:700;">${ui.top_tel[1]}</a>
        <span style="color:#4d6f96;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <span class="t-onnavy" style="color:#c9d8ea;">${ui.helpdesk}&nbsp;</span><a href="tel:${ui.top_help[0]}" style="color:#ffffff;text-decoration:none;font-weight:700;">${ui.top_help[1]}</a>
      </td></tr>
      <tr><td class="px" style="padding:14px 32px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td valign="middle"><a href="${f.web}" target="_blank" style="text-decoration:none;"><img src="${A.logoTdt}" width="128" height="36" alt="Truck Data Technology" style="display:block;width:128px;height:36px;border:0;" /></a></td>
          <td valign="middle" align="right"><img src="${A.logoTagra}" width="120" height="27" alt="TAGRA" style="display:inline-block;width:120px;height:27px;border:0;" /></td>
        </tr></table>
      </td></tr>
    </table>
    <!--[if mso]></td></tr></table><![endif]-->
  </td></tr>
</table>`;

  // 2) hero s fotkou (VML pro Outlook)
  const heroInner = `
        <span class="pill" style="display:inline-block;background-color:${GREEN};color:#ffffff;font-family:${FONT};font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;border-radius:99px;padding:6px 14px;margin:0 0 16px;">${m.strip}</span>
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

  // 3) obsah
  const parts = [];
  if (m.steps) {
    parts.push((m.steps_title ? heading(m.steps_title, 22) : "") + steps(m.steps));
  }
  if (m.download && m.cta) parts.push(`<div style="margin:4px 0 0;">${button(m.cta.label, m.cta.url, { light: true })}</div>`);
  if ((m.boxes && m.boxes.length) || (m.outro && m.outro.length)) {
    const cards = (m.boxes || []).map((b) => card(b, iconFor(b.eyebrow))).join("\n");
    const outro = (m.outro || []).map((x) => P(x, { size: 15, mb: 10 })).join("");
    parts.push(cards + outro);
  }
  const sig = common.signatures[m.sign];
  if (sig) parts.push(`<p class="t-muted" style="margin:0 0 4px;font-family:${FONT};font-size:15px;line-height:1.5;color:${MUTED};">${sig.greeting}</p>
        <p class="t-head" style="margin:0;font-family:${FONT};font-size:16px;font-weight:800;line-height:1.4;color:${NAVY};">${sig.name}</p>
        <p class="t-muted" style="margin:0;font-family:${FONT};font-size:14px;line-height:1.5;color:${MUTED};">${sig.role}</p>`);
  const content = parts.length ? band(parts.join(`\n<div style="height:24px;line-height:24px;font-size:1px;">&nbsp;</div>\n`), { pad: "40px 32px 32px" }) : "";

  // 4) lidé
  const help = band(`${eyebrow(ui.help_eb)}${heading(ui.help_h, 24)}${P(ui.help_p, { size: 15, mb: 20 })}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td class="col" width="50%" valign="top" style="padding:0 7px 0 0;">${person(ui.people[0])}</td>
          <td class="col" width="50%" valign="top" style="padding:0 0 0 7px;">${person(ui.people[1])}</td>
        </tr></table>`, { bg: APPLE_BG, cls: "b-apple", pad: "40px 32px 44px" });

  // 5) patička
  const social = SOCIAL.map(([n, alt, url]) => `<a href="${url}" target="_blank" style="text-decoration:none;"><img src="${A.social(n)}" width="32" height="32" alt="${alt}" style="display:inline-block;width:32px;height:32px;border:0;margin:0 8px 0 0;" /></a>`).join("");
  const links = [[f.web_label, f.web], ...ui.links, [f.privacy_label, f.privacy]].map(([t, u]) => `<a href="${u}" target="_blank" style="color:#ffffff;text-decoration:none;white-space:nowrap;">${t}</a>`).join(`<span style="color:#4d6f96;">&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>`);
  const foot = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${NAVY}" class="b-navy" style="background-color:${NAVY};background-image:linear-gradient(90deg,${NAVY_DEEP} 0%,${NAVY} 35%,${BLUE} 100%);">
  <tr><td align="center" style="padding:0 12px;">
    <!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;">
      <tr><td class="px" style="padding:40px 32px 36px;">
        <img src="${A.logoTdt}" width="128" height="36" alt="Truck Data Technology" style="display:block;width:128px;height:36px;border:0;margin:0 0 16px;" />
        <p class="t-onnavy" style="margin:0 0 4px;font-family:${FONT};font-size:13px;line-height:1.6;color:#c9d8ea;">${f.company}</p>
        <p class="t-onnavy" style="margin:0 0 18px;font-family:${FONT};font-size:13px;line-height:1.6;color:#c9d8ea;">${ui.ico_company}</p>
        <p style="margin:0 0 20px;">${social}</p>
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
    .col { display: block !important; width: 100% !important; padding: 0 0 12px 0 !important; }
    .topbar { text-align: left !important; font-size: 11px !important; }
    .btn { display: block !important; padding: 0 20px !important; }
    .ico { display: none !important; }
  }
  /* Noční režim – Apple Mail, iOS, část Androidu */
  @media (prefers-color-scheme: dark) {
    .b-white { background-color: #0f1d2c !important; }
    .b-card { background-color: #13263a !important; border-color: #234262 !important; }
    .b-apple { background-color: #0b1825 !important; }
    .b-box { background-color: #13263a !important; border-color: #234262 !important; }
    .t-head { color: #ffffff !important; }
    .t-muted { color: #c3cfdc !important; }
    .t-eb { color: #a8d14a !important; }
    .t-link, .t-muted a, .b-box a { color: #8cc3ff !important; }
    .t-muted strong { color: #ffffff !important; }
  }
  /* Noční režim – Outlook.com a nový Outlook */
  [data-ogsb] .b-white { background-color: #0f1d2c !important; }
  [data-ogsb] .b-card, [data-ogsb] .b-box { background-color: #13263a !important; border-color: #234262 !important; }
  [data-ogsb] .b-apple { background-color: #0b1825 !important; }
  [data-ogsc] .t-head { color: #ffffff !important; }
  [data-ogsc] .t-muted { color: #c3cfdc !important; }
  [data-ogsc] .t-eb { color: #a8d14a !important; }
  [data-ogsc] .t-link, [data-ogsc] .t-muted a, [data-ogsc] .b-box a { color: #8cc3ff !important; }
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

/** Název šablony → HTML. Neznámý název → null. */
function render(name) {
  const lang = /(^|-)sk($|-)/.test(name) ? "sk" : /(^|-)cz($|-)/.test(name) ? "cz" : null;
  if (!lang) return null;
  const data = CONTENT[lang];
  for (const [key, m] of Object.entries(data.mails)) {
    if (key.replace("{lang}", lang) === name) return renderMail(m, data.common, lang);
  }
  return null;
}

function names() {
  const out = [];
  for (const lang of Object.keys(CONTENT)) for (const key of Object.keys(CONTENT[lang].mails)) out.push(key.replace("{lang}", lang));
  return out;
}

module.exports = { render, names };
