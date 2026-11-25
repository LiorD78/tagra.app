/**
 * Netlify Function: email-hero
 * Hero fotka pro HTML e-maily (tdt.cz/tdt.sk i tagra.app) se ZAPEČENÝM tmavě modrým překryvem.
 * Důvod: Outlook (nový i Outlook.com) zahazuje CSS linear-gradient přes background-image,
 * takže bílý text ležel na světlé fotce a nebyl čitelný. Překryv je proto přímo v JPG.
 *
 * v2 (25. 11. 2026, Libor): světlejší překryv – fotka víc prosvítá, text zůstává čitelný.
 * Fotku si funkce bere z Netlify Image CDN webu tdt.cz (hero-poster, 760×329, JPG) a překryv
 * dopočítá sama (jpeg-js) – žádné base64 v repozitáři. Výsledek drží v paměti instance
 * a klienti ho mají v mezipaměti natrvalo; šablony volají /assets/img/email-hero-tdt.jpg?v=2.
 * Překryv: rgb(8,36,60), krytí shora dolů 0,62 → 0,52 (v 55 %) → 0,70, vpravo o 18 % slabší.
 */
const jpeg = require("jpeg-js");

const SRC = "https://www.tdt.cz/.netlify/images?url=/assets/img/hero-poster.avif&fm=jpg&w=760&h=329&fit=cover&q=85";
const TINT = [8, 36, 60];
let cached = null;

function alphaAt(x, y, W, H) {
  const t = y / H;
  const v = t < 0.55 ? 0.62 + (0.52 - 0.62) * (t / 0.55) : 0.52 + (0.70 - 0.52) * ((t - 0.55) / 0.45);
  return v * (1 - 0.18 * (x / W));
}

async function build() {
  const res = await fetch(SRC);
  if (!res.ok) throw new Error(`source ${res.status}`);
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

exports.handler = async () => {
  try {
    if (!cached) cached = await build();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
      body: cached,
      isBase64Encoded: true,
    };
  } catch (e) {
    console.error("email-hero:", e.message);
    return { statusCode: 302, headers: { Location: SRC, "Cache-Control": "no-store" }, body: "" };
  }
};
