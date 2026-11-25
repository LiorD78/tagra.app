/**
 * Netlify Scheduled Function: hero-season-check (repo tagra.app)
 *
 * Každých 10 minut na pozadí (mimo návštěvníky) zkontroluje tagra.app, tdt.cz a tdt.sk:
 * když se období v /assets/hero-season.json liší od aktuálního (nastala rovnodennost / slunovrat),
 * zavolá build hook daného webu → Netlify web znovu sestaví a tools/hero-season-build.mjs
 * přepíše hero video na nové období. Mezi změnami jen 3 malé GET požadavky každých 10 minut.
 *
 * Netlify env (tagra.app, scope Functions): HERO_HOOK_TAGRA, HERO_HOOK_TDT_CZ, HERO_HOOK_TDT_SK
 * (URL build hooků: Site configuration → Build & deploy → Build hooks, název „hero-season“).
 */
const { seasonAt } = require("../lib/season.js");

const SITES = [
  { url: "https://tagra.app", hook: "HERO_HOOK_TAGRA" },
  { url: "https://www.tdt.cz", hook: "HERO_HOOK_TDT_CZ" },
  { url: "https://www.tdt.sk", hook: "HERO_HOOK_TDT_SK" },
];

exports.handler = async () => {
  const want = seasonAt();
  const log = [];
  for (const s of SITES) {
    try {
      const r = await fetch(`${s.url}/assets/hero-season.json?t=${Date.now()}`, { headers: { "cache-control": "no-cache" } });
      if (!r.ok) { log.push(`${s.url}: json ${r.status}`); continue; }
      const j = await r.json();
      if (j.season === want) { log.push(`${s.url}: ${j.season} OK`); continue; }
      const hook = process.env[s.hook];
      if (!hook) { log.push(`${s.url}: ${j.season} → ${want}, chybí ${s.hook}`); continue; }
      const h = await fetch(`${hook}?trigger_title=${encodeURIComponent(`hero-season: ${j.season} → ${want}`)}`, { method: "POST" });
      log.push(`${s.url}: ${j.season} → ${want}, build hook ${h.status}`);
    } catch (e) {
      log.push(`${s.url}: chyba ${e.message}`);
    }
  }
  console.log("hero-season-check:", log.join(" | "));
  return { statusCode: 200, body: log.join("\n") };
};
