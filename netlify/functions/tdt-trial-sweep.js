/**
 * Netlify Scheduled Function: tdt-trial-sweep (denně, viz netlify.toml)
 *
 * Spouští denní úklid funkce tdt-trial-email: kdo si během zkušební verze
 * koupil licenci TAGRA, tomu se zruší naplánované e-maily #2/#3
 * („zkušební verze brzy končí"). Logika je v tdt-trial-email (GET ?sweep=1),
 * aby šla otestovat i ručně.
 */
exports.handler = async () => {
  const key = process.env.TDT_SWEEP_KEY || process.env.TDT_WEBHOOK_SECRET;
  if (!key) {
    console.error("[tdt-trial-sweep] TDT_SWEEP_KEY / TDT_WEBHOOK_SECRET není nastaven");
    return { statusCode: 500 };
  }
  try {
    const r = await fetch("https://tagra.app/.netlify/functions/tdt-trial-email?sweep=1", {
      headers: { "X-Sweep-Key": key },
    });
    const body = await r.text();
    console.log(`[tdt-trial-sweep] ${r.status} ${body.slice(0, 300)}`);
    return { statusCode: 200 };
  } catch (e) {
    console.error(`[tdt-trial-sweep] ${e.message}`);
    return { statusCode: 500 };
  }
};
