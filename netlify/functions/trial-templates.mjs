/**
 * Netlify Function (v2): trial-templates – nové šablony e-mailů zkušební verze tagra.app.
 * Obsluhuje přímo adresy /try/email-preview/{název}.html pro jazyky, které už mají nový vzhled
 * (Libor 25. 11. 2026: schváleno v Outlooku, nasadit). Funkce s config.path má přednost před
 * statickým souborem, takže trial-email.js (ostré odesílání) dostane nové HTML beze změny kódu.
 * Ostatní jazyky dál čtou staré statické soubory. Nový jazyk: content-{lang}.json + řádek
 * v netlify/lib/tagra-email/templates.js + jeho cesty sem do config.path.
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

export const config = {
  path: [
    "/try/email-preview/en-fleet.html",
    "/try/email-preview/en-driver.html",
    "/try/email-preview/en-enforcement.html",
    "/try/email-preview/email2-fleet-en.html",
    "/try/email-preview/email2-driver-en.html",
    "/try/email-preview/email4-fleet-en.html",
    "/try/email-preview/email3-fleet-en.html",
    "/try/email-preview/email5-fleet-en.html",
    "/try/email-preview/email4-driver-en.html",
    "/try/email-preview/email3-driver-en.html",
    "/try/email-preview/email5-driver-en.html",
    "/try/email-preview/de-fleet.html",
    "/try/email-preview/de-driver.html",
    "/try/email-preview/de-enforcement.html",
    "/try/email-preview/email2-fleet-de.html",
    "/try/email-preview/email2-driver-de.html",
    "/try/email-preview/email4-fleet-de.html",
    "/try/email-preview/email3-fleet-de.html",
    "/try/email-preview/email5-fleet-de.html",
    "/try/email-preview/email4-driver-de.html",
    "/try/email-preview/email3-driver-de.html",
    "/try/email-preview/email5-driver-de.html",
  ],
};
