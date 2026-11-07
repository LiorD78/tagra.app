/* TAGRA prices – single source of truth (EUR, excl. VAT)
   Used by: tagra.app version selector (assets/js/tagra-selector.js),
            shop.tagra.app fleet calculator (assets/js/shop-fleet.js),
            generator of the static (no-JS) selector markup (tools/tagra-selector.mjs).
   Rule: EU prices excl. VAT = truckmall.sk prices excl. VAT (SK VAT 23 %), checked 7. 11. 2026:
     TRUCKER 60.27/1.23 = 49 · TRUCKER 2 109/1.23 = 88.62 · TAGRA 1 183/1.23 ≈ 149 · TAGRA 2 368/1.23 ≈ 299
     TAGRA 4 491/1.23 ≈ 399 · TAGRA 6 675/1.23 ≈ 549 · TAGRA MAX 921/1.23 ≈ 749 · DOWNLOAD BOX II S 368/1.23 ≈ 299
   Vehicles -> tier: 1 / 2 / 3–4 / 5–6 / 7+ = TAGRA 1 / 2 / 4 / 6 / MAX. Drivers: 1 = TRUCKER, 2 in a pair = TRUCKER 2.
   TAGRA TRUCKER 2 is live in shop.tagra.app (product/priceId 93, 7. 11. 2026). Links go to /go/tagra-trucker-2/,
   a single line in _redirects (-> https://shop.tagra.app/tagra-trucker-2/).
   "href" is relative to tagra.app.
   Keep the JSON between the markers valid (the generator parses it). */
window.TAGRA_PRICES=/*JSON*/{
  "version": "2026-11-07",
  "currency": "EUR",
  "shop": "https://shop.tagra.app",
  "tiers": [
    {"id": "t1",  "key": "tagra-1",   "name": "TAGRA 1",   "band": "1",   "max": 1,    "price": 149, "fee": 79,  "priceId": 48, "path": "/tagra-1/",   "bundle": {"key": "tagra-1-download-box-ii-s",   "price": 399, "priceId": 75, "path": "/tagra-1-download-box-ii-s/"}},
    {"id": "t2",  "key": "tagra-2",   "name": "TAGRA 2",   "band": "2",   "max": 2,    "price": 299, "fee": 79,  "priceId": 51, "path": "/tagra-2/",   "bundle": {"key": "tagra-2-download-box-ii-s",   "price": 549, "priceId": 78, "path": "/tagra-2-download-box-ii-s/"}},
    {"id": "t4",  "key": "tagra-4",   "name": "TAGRA 4",   "band": "3–4", "max": 4,    "price": 399, "fee": 99,  "priceId": 54, "path": "/tagra-4/",   "bundle": {"key": "tagra-4-download-box-ii-s",   "price": 649, "priceId": 81, "path": "/tagra-4-download-box-ii-s/"}},
    {"id": "t6",  "key": "tagra-6",   "name": "TAGRA 6",   "band": "5–6", "max": 6,    "price": 549, "fee": 99,  "priceId": 57, "path": "/tagra-6/",   "bundle": {"key": "tagra-6-download-box-ii-s",   "price": 799, "priceId": 84, "path": "/tagra-6-download-box-ii-s/"}},
    {"id": "max", "key": "tagra-max", "name": "TAGRA MAX", "band": "7+",  "max": null, "price": 749, "fee": 149, "priceId": 60, "path": "/tagra-max/", "bundle": {"key": "tagra-max-download-box-ii-s", "price": 999, "priceId": 87, "path": "/tagra-max-download-box-ii-s/"}}
  ],
  "trucker":  {"id": "tr1", "key": "tagra-trucker",   "name": "TAGRA TRUCKER",   "drivers": 1, "price": 49,    "fee": 19, "priceId": 45,   "path": "/tagra-trucker/"},
  "trucker2": {"id": "tr2", "key": "tagra-trucker-2", "name": "TAGRA TRUCKER 2", "drivers": 2, "price": 88.62, "fee": 29, "priceId": 93,   "path": "/tagra-trucker-2/", "href": "/go/tagra-trucker-2/"},
  "box": {"name": "DOWNLOAD BOX II S", "price": 299, "path": "/download-box-ii-s/"},
  "shipping": 9.90
}/*JSON*/;
