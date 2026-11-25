/**
 * Netlify Function (v2): trial-templates – nové šablony e-mailů zkušební verze tagra.app.
 * Obsluhuje přímo adresy /try/email-preview/{název}.html pro jazyky, které už mají nový vzhled
 * (Libor 25. 11. 2026: schváleno v Outlooku, nasadit všechny jazyky). Funkce s config.path má přednost
 * před statickým souborem, takže trial-email.js (ostré odesílání) dostane nové HTML beze změny kódu.
 * Jazyky: en, de, pl, hu, it, fr, es, nl, ro, gr. Ostatní (cz, sk) dál čtou staré statické soubory.
 * Nový jazyk: netlify/lib/tagra-email/templates.js + jeho cesty sem do config.path.
 * config.path musí být doslovný seznam – Netlify ho čte staticky při buildu.
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
    "/try/email-preview/en-fleet.html", "/try/email-preview/en-driver.html", "/try/email-preview/en-enforcement.html", "/try/email-preview/email2-fleet-en.html", "/try/email-preview/email2-driver-en.html", "/try/email-preview/email4-fleet-en.html", "/try/email-preview/email3-fleet-en.html", "/try/email-preview/email5-fleet-en.html", "/try/email-preview/email4-driver-en.html", "/try/email-preview/email3-driver-en.html", "/try/email-preview/email5-driver-en.html",
    "/try/email-preview/de-fleet.html", "/try/email-preview/de-driver.html", "/try/email-preview/de-enforcement.html", "/try/email-preview/email2-fleet-de.html", "/try/email-preview/email2-driver-de.html", "/try/email-preview/email4-fleet-de.html", "/try/email-preview/email3-fleet-de.html", "/try/email-preview/email5-fleet-de.html", "/try/email-preview/email4-driver-de.html", "/try/email-preview/email3-driver-de.html", "/try/email-preview/email5-driver-de.html",
    "/try/email-preview/pl-fleet.html", "/try/email-preview/pl-driver.html", "/try/email-preview/pl-enforcement.html", "/try/email-preview/email2-fleet-pl.html", "/try/email-preview/email2-driver-pl.html", "/try/email-preview/email4-fleet-pl.html", "/try/email-preview/email3-fleet-pl.html", "/try/email-preview/email5-fleet-pl.html", "/try/email-preview/email4-driver-pl.html", "/try/email-preview/email3-driver-pl.html", "/try/email-preview/email5-driver-pl.html",
    "/try/email-preview/hu-fleet.html", "/try/email-preview/hu-driver.html", "/try/email-preview/hu-enforcement.html", "/try/email-preview/email2-fleet-hu.html", "/try/email-preview/email2-driver-hu.html", "/try/email-preview/email4-fleet-hu.html", "/try/email-preview/email3-fleet-hu.html", "/try/email-preview/email5-fleet-hu.html", "/try/email-preview/email4-driver-hu.html", "/try/email-preview/email3-driver-hu.html", "/try/email-preview/email5-driver-hu.html",
    "/try/email-preview/it-fleet.html", "/try/email-preview/it-driver.html", "/try/email-preview/it-enforcement.html", "/try/email-preview/email2-fleet-it.html", "/try/email-preview/email2-driver-it.html", "/try/email-preview/email4-fleet-it.html", "/try/email-preview/email3-fleet-it.html", "/try/email-preview/email5-fleet-it.html", "/try/email-preview/email4-driver-it.html", "/try/email-preview/email3-driver-it.html", "/try/email-preview/email5-driver-it.html",
    "/try/email-preview/fr-fleet.html", "/try/email-preview/fr-driver.html", "/try/email-preview/fr-enforcement.html", "/try/email-preview/email2-fleet-fr.html", "/try/email-preview/email2-driver-fr.html", "/try/email-preview/email4-fleet-fr.html", "/try/email-preview/email3-fleet-fr.html", "/try/email-preview/email5-fleet-fr.html", "/try/email-preview/email4-driver-fr.html", "/try/email-preview/email3-driver-fr.html", "/try/email-preview/email5-driver-fr.html",
    "/try/email-preview/es-fleet.html", "/try/email-preview/es-driver.html", "/try/email-preview/es-enforcement.html", "/try/email-preview/email2-fleet-es.html", "/try/email-preview/email2-driver-es.html", "/try/email-preview/email4-fleet-es.html", "/try/email-preview/email3-fleet-es.html", "/try/email-preview/email5-fleet-es.html", "/try/email-preview/email4-driver-es.html", "/try/email-preview/email3-driver-es.html", "/try/email-preview/email5-driver-es.html",
    "/try/email-preview/nl-fleet.html", "/try/email-preview/nl-driver.html", "/try/email-preview/nl-enforcement.html", "/try/email-preview/email2-fleet-nl.html", "/try/email-preview/email2-driver-nl.html", "/try/email-preview/email4-fleet-nl.html", "/try/email-preview/email3-fleet-nl.html", "/try/email-preview/email5-fleet-nl.html", "/try/email-preview/email4-driver-nl.html", "/try/email-preview/email3-driver-nl.html", "/try/email-preview/email5-driver-nl.html",
    "/try/email-preview/ro-fleet.html", "/try/email-preview/ro-driver.html", "/try/email-preview/ro-enforcement.html", "/try/email-preview/email2-fleet-ro.html", "/try/email-preview/email2-driver-ro.html", "/try/email-preview/email4-fleet-ro.html", "/try/email-preview/email3-fleet-ro.html", "/try/email-preview/email5-fleet-ro.html", "/try/email-preview/email4-driver-ro.html", "/try/email-preview/email3-driver-ro.html", "/try/email-preview/email5-driver-ro.html",
    "/try/email-preview/gr-fleet.html", "/try/email-preview/gr-driver.html", "/try/email-preview/gr-enforcement.html", "/try/email-preview/email2-fleet-gr.html", "/try/email-preview/email2-driver-gr.html", "/try/email-preview/email4-fleet-gr.html", "/try/email-preview/email3-fleet-gr.html", "/try/email-preview/email5-fleet-gr.html", "/try/email-preview/email4-driver-gr.html", "/try/email-preview/email3-driver-gr.html", "/try/email-preview/email5-driver-gr.html",
  ],
};
