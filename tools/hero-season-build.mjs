#!/usr/bin/env node
/**
 * hero-season-build.mjs – sezónní hero video BEZ zátěže pro návštěvníka (tagra.app, tdt.cz, tdt.sk)
 *
 * Spouští se jako build command na Netlify (ne v prohlížeči, ne při každém požadavku):
 *   node tools/hero-season-build.mjs [publishDir]      (výchozí "."; tagra.app)
 *   node hero-season-build.mjs . --self-delete        (tdt.cz / tdt.sk – skript je v dist/<web>/ a po běhu se smaže)
 *
 * Co dělá:
 *  1. Spočítá aktuální roční období přesně podle okamžiku rovnodennosti / slunovratu
 *     (J. Meeus, Astronomical Algorithms, kap. 27; přesnost ~1 min). 2026: 20. 3. 15:45, 21. 6. 10:24, 23. 9. 2:05, 21. 12. 21:50 (Praha).
 *  2. Ve stránkách s hero videem přepíše cesty jen ve značkách <video>, <source>, <img>, <link> (og:image a JSON-LD ne):
 *       /assets/video/hero-*       → /assets/video/<obdobi>/hero-*
 *       /assets/img/hero-poster.*  → /assets/img/<obdobi>/hero-poster.*   (i v preload a srcset /.netlify/images?url=…)
 *     Léto = původní soubory, cesty se nemění. Na <html> doplní data-season="<obdobi>" (dráha slunce v tdt.js).
 *  3. Zapíše /assets/hero-season.json { season, next } – podle něj plánovaná funkce hero-season-check
 *     pozná, že nastalo nové období, a spustí nové sestavení přes build hook.
 *
 * Soubory v gitu zůstávají letní; přepis se děje jen v sestaveném webu. Test: HERO_SEASON=zima node tools/hero-season-build.mjs
 */
import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const TERMS = [
  [485, 324.96, 1934.136], [203, 337.23, 32964.467], [199, 342.08, 20.186], [182, 27.85, 445267.112],
  [156, 73.14, 45036.886], [136, 171.52, 22518.443], [77, 222.54, 65928.934], [74, 296.72, 3034.906],
  [70, 243.58, 9037.513], [58, 119.81, 33718.147], [52, 297.17, 150.678], [50, 21.02, 2281.226],
  [45, 247.54, 29929.562], [44, 325.15, 31555.956], [29, 60.93, 4443.417], [18, 155.12, 67555.328],
  [17, 288.79, 4562.452], [16, 198.04, 62894.029], [14, 199.76, 31436.921], [12, 95.39, 14577.848],
  [12, 287.11, 31931.756], [12, 320.81, 34777.259], [9, 227.73, 1222.114], [8, 15.45, 16859.074],
];
const MEAN = [
  [2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057],
  [2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030],
  [2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078],
  [2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032],
];
const RAD = Math.PI / 180;
const SEASONS = ["jaro", "leto", "podzim", "zima"];

export function seasonStart(year, k) {
  const Y = (year - 2000) / 1000, a = MEAN[k];
  const jde0 = a[0] + a[1] * Y + a[2] * Y * Y + a[3] * Y ** 3 + a[4] * Y ** 4;
  const T = (jde0 - 2451545.0) / 36525;
  const W = (35999.373 * T - 2.47) * RAD;
  const dl = 1 + 0.0334 * Math.cos(W) + 0.0007 * Math.cos(2 * W);
  let S = 0;
  for (const [A, B, C] of TERMS) S += A * Math.cos((B + C * T) * RAD);
  return ((jde0 + (0.00001 * S) / dl) - 2440587.5) * 86400000 - 69000; // TT → UTC
}

export function seasonAt(t = Date.now()) {
  const y = new Date(t).getUTCFullYear();
  if (t < seasonStart(y, 0)) return { season: "zima", next: seasonStart(y, 0) };
  if (t < seasonStart(y, 1)) return { season: "jaro", next: seasonStart(y, 1) };
  if (t < seasonStart(y, 2)) return { season: "leto", next: seasonStart(y, 2) };
  if (t < seasonStart(y, 3)) return { season: "podzim", next: seasonStart(y, 3) };
  return { season: "zima", next: seasonStart(y + 1, 0) };
}

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === "netlify" || name === ".netlify") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* htmlFiles(p);
    else if (name.endsWith(".html")) yield p;
  }
}

function main() {
  const root = process.argv[2] || ".";
  const now = seasonAt();
  const forced = process.env.HERO_SEASON;
  const season = SEASONS.includes(forced) ? forced : now.season;
  let changed = 0;
  for (const f of htmlFiles(root)) {
    const html = readFileSync(f, "utf8");
    if (!html.includes("/assets/video/hero-")) continue; // jen stránky s hero videem
    let out = html.replace(/<html(?![^>]*data-season)(\s|>)/i, `<html data-season="${season}"$1`);
    if (season !== "leto") {
      // Přepisují se JEN značky videa a obrázku (<video>, <source>, <img>, <link rel=preload>).
      // og:image, twitter:image a JSON-LD zůstávají letní – stabilní pro SEO a náhledy při sdílení.
      out = out.replace(/<(video|source|img|link)\b[^>]*>/gi, (tag) =>
        tag.split("/assets/video/hero-").join(`/assets/video/${season}/hero-`)
           .split("/assets/img/hero-poster.").join(`/assets/img/${season}/hero-poster.`));
    }
    if (out !== html) { writeFileSync(f, out); changed++; }
  }
  mkdirSync(join(root, "assets"), { recursive: true });
  writeFileSync(join(root, "assets", "hero-season.json"),
    JSON.stringify({ season, next: new Date(now.next).toISOString(), built: new Date().toISOString() }) + "\n");
  // tdt.cz/tdt.sk: skript leží v publikované složce → po doběhnutí se smaže, aby se nepublikoval
  if (process.argv.includes("--self-delete")) { try { unlinkSync(fileURLToPath(import.meta.url)); } catch {} }
  console.log(`hero-season: ${season} (další změna ${new Date(now.next).toISOString()}), upraveno stránek: ${changed}`);
}

main();
