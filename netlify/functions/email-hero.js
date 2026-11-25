/**
 * Netlify Function: email-hero
 * Hero fotka pro HTML e-maily (tdt.cz/tdt.sk i tagra.app) se ZAPEČENÝM tmavě modrým překryvem.
 * Důvod: Outlook (nový i Outlook.com) zahazuje CSS linear-gradient přes background-image,
 * takže bílý text ležel na světlé fotce a nebyl čitelný. Překryv je proto přímo v JPG.
 *
 * v2 (25. 11. 2026, Libor): světlejší překryv – fotka víc prosvítá, text zůstává čitelný.
 * v3 (25. 11. 2026, Libor): SEZÓNNÍ – pozadí odpovídá hero videu daného období (jaro / léto / podzim / zima).
 *   Šablony volají /assets/img/email-hero-tdt.jpg?v=2-<obdobi> podle data odeslání (netlify/lib/season.js),
 *   takže každý odeslaný e-mail si svůj obrázek drží natrvalo. Bez období (staré e-maily ?v=2) = léto.
 * Fotku si funkce bere z Netlify Image CDN webu tdt.cz (hero-poster daného období, 760×329, JPG) a překryv
 * dopočítá sama (jpeg-js) – žádné base64 v repozitáři. Výsledek drží v paměti instance (zvlášť pro každé období)
 * a klienti ho mají v mezipaměti natrvalo.
 * Překryv: rgb(8,36,60), krytí shora dolů 0,62 → 0,52 (v 55 %) → 0,70, vpravo o 18 % slabší.
 */
const jpeg = require("jpeg-js");

const SEASONS = ["jaro", "leto", "podzim", "zima"];
const poster = (s) => (s === "leto" ? "/assets/img/hero-poster.avif" : `/assets/img/${s}/hero-poster.avif`);
const srcFor = (s) => `https://www.tdt.cz/.netlify/images?url=${poster(s)}&fm=jpg&w=760&h=329&fit=cover&q=85`;
const TINT = [8, 36, 60];
const cached = {};

function alphaAt(x, y, W, H) {
  const t = y / H;
  const v = t < 0.55 ? 0.62 + (0.52 - 0.62) * (t / 0.55) : 0.52 + (0.70 - 0.52) * ((t - 0.55) / 0.45);
  return v * (1 - 0.18 * (x / W));
}

async function build(season) {
  const res = await fetch(srcFor(season));
  if (!res.ok) throw new Error(`source ${season} ${res.status}`);
  const img = jpeg.decode(Buffer.from(await res.arrayBuffer()), { useTArray: true, formatAsRGBA: true });
  const { width: W, height: H, data } = img;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const a = alphaAt(x, y, W, H);
      const i = (y * W + x) * 4;
      for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c] * (1 - a) + TINT[c] * a);
    }
  }
  return jpeg.encode({ data, width: W, height: H }, 62).data.toString("base64");
}

exports.handler = async (event) => {
  const v = String((event && event.queryStringParameters && event.queryStringParameters.v) || "");
  const m = v.match(/(jaro|leto|podzim|zima)$/);
  const season = m && SEASONS.includes(m[1]) ? m[1] : "leto";
  try {
    if (!cached[season]) cached[season] = await build(season);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
      body: cached[season],
      isBase64Encoded: true,
    };
  } catch (e) {
    console.error("email-hero:", e.message);
    return { statusCode: 302, headers: { Location: srcFor(season), "Cache-Control": "no-store" }, body: "" };
  }
};
