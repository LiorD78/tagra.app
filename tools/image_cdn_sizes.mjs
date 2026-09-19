#!/usr/bin/env node
/*
 * Oprava PR #179 (Netlify Image CDN): srcset/sizes podle skutečné šířky na stránce.
 *
 * Proč (19. 9. 2026): všechny <picture> měly sizes="100vw" a nejvýš 800w. Velký
 * screenshot TAGRA Control se na desktopu vykresluje v šířce 1132 px, takže by
 * dostal 800px variantu a byl rozmazaný. Změřeno v prohlížeči (390 / 768 / 1024 /
 * 1440 / 1920 px) a sizes nastavené podle toho; nejvyšší varianta = originál
 * (CDN nezvětšuje nad originál).
 *
 * Přepíše jen bloky <picture style="display:contents">…</picture> vytvořené PR
 * #179; <img> uvnitř (fallback) nechává beze změny. Idempotentní.
 * Spuštění z kořene repa:  node tools/image_cdn_sizes.mjs
 */
import fs from "node:fs";

const FILES = [
  "de/kontrollbehoerden/index.html", "el/eleghos/index.html", "enforcement/index.html",
  "fr/autorites-de-controle/index.html", "hu/hatosagoknak/index.html", "hu/letoltokulcs/index.html",
  "hu/tavoli-letoltes/index.html", "it/organi-di-controllo/index.html", "nl/handhaving/index.html",
  "pl/organy-kontrolne/index.html", "ro/autoritati-de-control/index.html",
];

// widths = varianty v srcset (poslední = originální šířka), sizes = změřené vykreslení
function rule(file, imgWidthAttr) {
  const base = file.split("/").pop();
  if (base === "tagra-control-screenshot.webp") {
    return imgWidthAttr === "400"
      ? { widths: [400, 800, 1080], sizes: "(min-width: 1024px) 320px, 100vw" }                     // malá karta
      : { widths: [400, 800, 1080], sizes: "(min-width: 1180px) 1132px, calc(100vw - 48px)" };  // velký screenshot
  }
  if (base === "dbiis-produkt.webp") return { widths: [400, 800, 1200], sizes: "(min-width: 1024px) 550px, calc(100vw - 48px)" };
  if (base === "dbiis-komplet.webp") return { widths: [400, 800, 1080], sizes: "(min-width: 1024px) 550px, calc(100vw - 48px)" };
  if (base === "dbr-technik.webp") return { widths: [400, 800, 1200], sizes: "(min-width: 1024px) 550px, calc(100vw - 48px)" };
  if (base === "tagra-max-box.jpg") return { widths: [280, 560, 840], sizes: "280px" };
  if (base === "od-technik.webp") return { widths: [150, 300, 450], sizes: "150px" };
  return null;
}

const PICTURE = /<picture style="display:contents">([\s\S]*?)<\/picture>/g;
let changed = 0, blocks = 0, problems = 0;

for (const f of FILES) {
  const s = fs.readFileSync(f, "utf8");
  const next = s.replace(PICTURE, (whole, inner) => {
    const img = (inner.match(/<img[^>]*>/) || [])[0];
    const url = (inner.match(/url=([^&"]+)/) || [])[1];
    if (!img || !url) { problems++; console.log("PROBLEM parse", f); return whole; }
    const widthAttr = (img.match(/\swidth="(\d+)"/) || [])[1];
    const r = rule(url, widthAttr);
    if (!r) { problems++; console.log("PROBLEM no rule", f, url); return whole; }
    const q = inner.includes("q=80") ? "&amp;q=80" : "";
    const set = (fm) => r.widths.map((w) => `/.netlify/images?url=${url}&amp;w=${w}&amp;fm=${fm}${q} ${w}w`).join(", ");
    blocks++;
    return `<picture style="display:contents"><source type="image/avif" sizes="${r.sizes}" srcset="${set("avif")}"/>` +
           `<source type="image/webp" sizes="${r.sizes}" srcset="${set("webp")}"/>${img}</picture>`;
  });
  if (next !== s) { fs.writeFileSync(f, next); changed++; console.log("CHANGED", f); }
}
console.log(`files_changed=${changed} blocks=${blocks} problems=${problems}`);
process.exit(problems ? 1 : 0);
