/**
 * Netlify Function (v2): trial-templates – nové šablony e-mailů zkušební verze tagra.app.
 * Obsluhuje přímo adresy /try/email-preview/{název}.html pro jazyky, které už mají nový vzhled
 * (Libor 25. 11. 2026: schváleno v Outlooku, nasadit všechny jazyky). Funkce s config.path má přednost
 * před statickým souborem, takže trial-email.js (ostré odesílání) dostane nové HTML beze změny kódu.
 * Jazyky: en, de, pl, hu, it, fr, es, nl, ro, gr. Ostatní (cz, sk) dál čtou staré statické soubory.
 * Nový jazyk: netlify/lib/tagra-email/templates.js + jeho cesty sem do config.path.
 */
import lib from "../lib/tagra-email/templates.js";

export default async (req) => {
  const name = new URL(req.url).pathname.split("/").pop().replace(/\.html$/, "");
  const t = lib.renderTemplate(name);
  if (!t) return new Response("not found", { status: 404 });
  return new Response(t.html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache", "X-Robots-Tag": "noindex" },
  });
};

const LANGS = ["en", "de", "pl", "hu", "it", "fr", "es", "nl", "ro", "gr"];
const NAMES = (l) => [
  `${l}-fleet`, `${l}-driver`, `${l}-enforcement`,
  `email2-fleet-${l}`, `email2-driver-${l}`, `email4-fleet-${l}`, `email3-fleet-${l}`, `email5-fleet-${l}`,
  `email4-driver-${l}`, `email3-driver-${l}`, `email5-driver-${l}`,
];

export const config = {
  path: LANGS.flatMap((l) => NAMES(l).map((n) => `/try/email-preview/${n}.html`)),
};
