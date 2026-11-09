#!/usr/bin/env node
/* TAGRA version selector – static (no-JS) markup generator, v1.1 (8. 11. 2026; v1.0 7. 11. 2026).

   Regenerates the selector blocks between these markers in the /fleet/ and /driver/ pages of all 9 languages:
     <!-- tsel:fleet-hero --> ... <!-- /tsel:fleet-hero -->   fleet hero: vehicles only, price + buy CTA
     <!-- tsel:fleet -->      ... <!-- /tsel:fleet -->        fleet pricing: vehicles + download device
     <!-- tsel:driver -->     ... <!-- /tsel:driver -->       driver pricing: 1 driver / 2 drivers in a pair
   The homepage of each language (index.html, de/index.html, …) carries the same fleet + driver blocks in its
   pricing section (v1.1, 8. 11. 2026), wrapped in <div class="tsel-home">.
   Prices come from assets/js/tagra-prices.js (single source, shared with shop-fleet.js), texts from
   tools/i18n/tagra-selector.json. assets/js/tagra-selector.js re-renders the same blocks from the same prices at runtime.

   Run after a price or text change:  node tools/tagra-selector.mjs           (writes the pages)
                                      node tools/tagra-selector.mjs --check   (exit 1 if a page is out of date) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

/* lang: fleet page, driver page, price format, decimal separator, inquiry base (HU = Rukon Kft., never the e-shop) */
export const LANGS = {
  en: { fleet: 'fleet', driver: 'driver', fmt: '€{n}', dec: '.' },
  de: { fleet: 'de/fuhrpark', driver: 'de/fahrer', fmt: '{n} €', dec: ',', shop: '/de' },
  fr: { fleet: 'fr/entreprises', driver: 'fr/conducteurs', fmt: '{n} €', dec: ',' },
  it: { fleet: 'it/per-aziende', driver: 'it/per-autisti', fmt: '{n} €', dec: ',' },
  nl: { fleet: 'nl/voor-transportbedrijven', driver: 'nl/voor-chauffeurs', fmt: '€{n}', dec: ',' },
  pl: { fleet: 'pl/dla-przewoznikow', driver: 'pl/dla-kierowcow', fmt: '{n} €', dec: ',' },
  hu: { fleet: 'hu/fuvarozoknak', driver: 'hu/soforoknek', fmt: '{n} €', dec: ',', base: '/hu/kapcsolat/?product=' },
  ro: { fleet: 'ro/pentru-firme', driver: 'ro/pentru-conducatori', fmt: '{n} €', dec: ',' },
  el: { fleet: 'el/stolos', driver: 'el/odigoi', fmt: '{n} €', dec: ',' },
};

export function loadPrices() {
  const src = fs.readFileSync(path.join(ROOT, 'assets/js/tagra-prices.js'), 'utf8');
  return JSON.parse(src.split('/*JSON*/')[1]);
}
export function loadTexts() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/i18n/tagra-selector.json'), 'utf8'));
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' })[c]);
}
export function money(c, n) {
  const s = Math.round(n * 100) % 100 === 0 ? String(Math.round(n)) : n.toFixed(2);
  return c.fmt.replace('{n}', s.replace('.', c.dec));
}
export function fill(tpl, kw) {
  return tpl.replace(/\{(\w+)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(kw, k) ? String(kw[k]) : m));
}
/* href of a product: HU -> inquiry with Rukon, TRUCKER 2 -> /go/ redirect (one line in _redirects), else the shop product */
function link(P, c, item, key, p) {
  if (c.base) return c.base + key;
  if (c.shop) return P.shop + c.shop + p;   /* language version of the shop (DE live 9. 11. 2026) */
  if (item.href) return item.href;
  return P.shop + p;
}
function attrs(c, T, ctaKey, aria) {
  let a = ` data-fmt="${esc(c.fmt)}" data-dec="${esc(c.dec)}" data-fee="${esc(T.fee)}" data-cta="${esc(c.base ? T.cta_hu_offer : T[ctaKey])}"`;
  if (c.base) a += ` data-base="${esc(c.base)}"`;
  return a + ` role="group" aria-label="${esc(aria)}"`;
}
const ext = (c) => (c.base || c.shop ? '' : ' hreflang="en"');

export function fleetBlock(P, c, T, hero) {
  const t0 = P.tiers[0];
  const caps = [T.f_cap1, T.f_cap2, T.f_cap4, T.f_cap6, T.f_capmax];
  const opts = P.tiers.map((t, i) =>
    `<a class="tsel__o${t === t0 ? ' is-on' : ''}" href="${esc(link(P, c, t, t.key, t.path))}" data-k="${t.id}" data-cap="${esc(caps[i])}"` +
    `${t === t0 ? ' aria-current="true"' : ''}${ext(c)}><b>${esc(t.band)}</b><small>${esc(t.name)}</small></a>`).join('');
  let h = `<div class="tsel ${hero ? 'tsel--hero' : 'tsel--fleet'}" data-tsel="fleet"${hero ? '' : ' id="tagra-selector"'}${attrs(c, T, 'f_cta', T.aria_fleet)}>`;
  if (!hero) h += `<p class="tsel__t">${esc(T.f_title)}</p>`;
  h += `<p class="tsel__q">${esc(T.f_q_veh)}</p><div class="tsel__row tsel__row--5">${opts}</div>`;
  if (!hero) {
    const save = money(c, t0.price + P.box.price - t0.bundle.price);
    h += `<p class="tsel__q">${esc(T.f_q_dev)}</p><div class="tsel__row tsel__row--2">` +
      `<a class="tsel__o is-on" href="${esc(link(P, c, t0, t0.key, t0.path))}" data-dev="none" aria-current="true"${ext(c)}><b>${esc(T.f_dev_none)}</b></a>` +
      `<a class="tsel__o" href="${esc(link(P, c, t0, t0.bundle.key, t0.bundle.path))}" data-dev="box"${ext(c)}><b>${esc(T.f_dev_box)}</b>` +
      `<small data-save="${esc(T.f_dev_save)}">${esc(fill(T.f_dev_save, { save }))}</small></a></div>`;
  }
  h += `<div class="tsel__res" aria-live="polite"><div class="tsel__head"><span class="tsel__lbl">${esc(T.lbl)}</span>` +
    `<strong class="tsel__name">${esc(t0.name)}</strong><span class="tsel__cap">${esc(caps[0])}</span></div>` +
    `<p class="tsel__price"><span class="tsel__amt">${esc(money(c, t0.price))}</span><span class="tsel__vat">${esc(T.vat)}</span></p>` +
    `<p class="tsel__fee">${esc(fill(T.fee, { fee: money(c, t0.fee) }))}</p>`;
  if (!hero) h += '<p class="tsel__note" hidden></p>';
  const cta = fill(c.base ? T.cta_hu_offer : T.f_cta, { name: t0.name });
  h += `<div class="tsel__acts"><a class="btn-cta tsel__cta" href="${esc(link(P, c, t0, t0.key, t0.path))}" data-product="${t0.key}"${ext(c)}>${esc(cta)}</a></div>`;
  if (!hero) h += `<p class="tsel__more">${esc(T.f_more_q)} <a href="/${c.driver}/">${esc(T.f_more_link)}</a></p>`;
  h += '</div></div>';
  if (!hero) h = h.replace('data-cta="', () => `data-note-box="${esc(T.f_note_box)}" data-cta="`);
  return h;
}

export function driverBlock(P, c, T) {
  const tr = P.trucker, t2 = P.trucker2;
  const note = c.base ? '' : T.d_note; /* HU: delivery handled by Rukon Kft. */
  const items = [[tr, T.d_o1, T.d_cap1], [t2, T.d_o2, T.d_cap2]];
  const opts = items.map(([it, o, cap]) =>
    `<a class="tsel__o${it === tr ? ' is-on' : ''}" href="${esc(link(P, c, it, it.key, it.path))}" data-k="${it.id}" data-cap="${esc(cap)}" data-note="${esc(note)}"` +
    `${it === tr ? ' aria-current="true"' : ''}${it.href ? '' : ext(c)}><b>${esc(o)}</b><small>${esc(it.name)}</small></a>`).join('');
  let h = `<div class="tsel tsel--driver" data-tsel="driver" id="tagra-trucker-selector"${attrs(c, T, 'd_cta', T.aria_driver)}>`;
  h += `<p class="tsel__t">${esc(T.d_title)}</p><p class="tsel__q">${esc(T.d_q)}</p><div class="tsel__row tsel__row--2">${opts}</div>`;
  h += `<div class="tsel__res" aria-live="polite"><div class="tsel__head"><span class="tsel__lbl">${esc(T.lbl)}</span>` +
    `<strong class="tsel__name">${esc(tr.name)}</strong><span class="tsel__cap">${esc(T.d_cap1)}</span></div>` +
    `<p class="tsel__price"><span class="tsel__amt">${esc(money(c, tr.price))}</span><span class="tsel__vat">${esc(T.vat)}</span></p>` +
    `<p class="tsel__fee">${esc(fill(T.fee, { fee: money(c, tr.fee) }))}</p><p class="tsel__note"${note ? '' : ' hidden'}>${esc(fill(note, { ship: money(c, P.shipping) }))}</p>`;
  const cta = fill(c.base ? T.cta_hu_offer : T.d_cta, { name: tr.name });
  h += `<div class="tsel__acts"><a class="btn-cta tsel__cta" href="${esc(link(P, c, tr, tr.key, tr.path))}" data-product="${tr.key}"${ext(c)}>${esc(cta)}</a></div></div></div>`;
  return h;
}

function replaceBlock(src, name, block) {
  const re = new RegExp(`(<!-- tsel:${name} -->)([\\s\\S]*?)(<!-- /tsel:${name} -->)`);
  return src.replace(re, (m, a, b, z) => `${a}\n${block}\n${z}`);
}

export function main(check = false) {
  const P = loadPrices(), I = loadTexts(), stale = [];
  for (const [lang, c] of Object.entries(LANGS)) {
    const T = I[lang];
    const pages = [
      [c.fleet, [['fleet-hero', fleetBlock(P, c, T, true)], ['fleet', fleetBlock(P, c, T, false)]]],
      [c.driver, [['driver', driverBlock(P, c, T)]]],
      [lang === 'en' ? '' : lang, [['fleet', fleetBlock(P, c, T, false)], ['driver', driverBlock(P, c, T)]]],
    ];
    for (const [page, blocks] of pages) {
      const file = path.join(ROOT, page, 'index.html');
      const src = fs.readFileSync(file, 'utf8');
      let out = src;
      for (const [name, block] of blocks) out = replaceBlock(out, name, block);
      if (out !== src) {
        stale.push(page || '/');
        if (!check) fs.writeFileSync(file, out);
      }
    }
  }
  console.log((check ? 'out of date: ' : 'updated: ') + (stale.join(', ') || 'nothing'));
  return check && stale.length ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.includes('--check'));
}
