/**
 * Roční období pro sezónní hero (e-maily tdt.cz/tdt.sk/tagra.app). Stejný výpočet jako edge funkce hero-season:
 * přepíná se přesně v okamžiku rovnodennosti / slunovratu (J. Meeus, Astronomical Algorithms, kap. 27; ~1 min).
 * Vrací "jaro" | "leto" | "podzim" | "zima".
 */
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

function seasonStart(year, k) {
  const Y = (year - 2000) / 1000, a = MEAN[k];
  const jde0 = a[0] + a[1] * Y + a[2] * Y * Y + a[3] * Y ** 3 + a[4] * Y ** 4;
  const T = (jde0 - 2451545.0) / 36525;
  const W = (35999.373 * T - 2.47) * RAD;
  const dl = 1 + 0.0334 * Math.cos(W) + 0.0007 * Math.cos(2 * W);
  let S = 0;
  for (const [A, B, C] of TERMS) S += A * Math.cos((B + C * T) * RAD);
  return ((jde0 + (0.00001 * S) / dl) - 2440587.5) * 86400000 - 69000;
}

function seasonAt(t = Date.now()) {
  const year = new Date(t).getUTCFullYear();
  if (t < seasonStart(year, 0)) return "zima";
  if (t < seasonStart(year, 1)) return "jaro";
  if (t < seasonStart(year, 2)) return "leto";
  if (t < seasonStart(year, 3)) return "podzim";
  return "zima";
}

module.exports = { seasonAt, seasonStart };
