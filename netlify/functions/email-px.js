/**
 * Netlify Function: email-px – jednobarevné dlaždice (4×4 PNG) pro noční režim e-mailů.
 * Outlook v nočním režimu přebarvuje barvy pozadí, ale obrázky ne – proto pozadí drží dlaždice.
 * Libor 25. 11. 2026: noční pozadí nemá být čistě černé, ale přesně jako okolí v Outlooku
 * (změřeno ze snímku nového Outlooku: #1e1e1e), aby e-mail splýval.
 *   /.netlify/functions/email-px/dark.png  → #1e1e1e (pozadí stránky)
 *   /.netlify/functions/email-px/card.png  → #2a2a2a (světlé karty v nočním režimu)
 */
const TILES = {
  dark: "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAADklEQVR42mOQQwIMxHEAknQFoS+V/1AAAAAASUVORK5CYII=",
  card: "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAADklEQVR42mPQQgIMxHEAzPQH4ZgSzYIAAAAASUVORK5CYII=",
};

exports.handler = async (event) => {
  const name = (event.path || "").split("/").pop().replace(/\.png$/, "");
  const b64 = TILES[name] || TILES.dark;
  return {
    statusCode: 200,
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" },
    body: b64,
    isBase64Encoded: true,
  };
};
