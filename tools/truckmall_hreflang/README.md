# TRUCKMALL hreflang sitemapy (CZ ↔ SK)

BS Shop neumí upravit `<head>` ani robots.txt, takže truckmall.cz a truckmall.sk
(stejná ID, jiné slugy) nemají mezi sebou hreflang. Dodáváme ho přes sitemapy
hostované na tagra.app (cross-site submission v Google Search Console).

Výstup:
- `sitemaps/truckmall-hreflang-cz.xml` (`<loc>` = CZ URL)
- `sitemaps/truckmall-hreflang-sk.xml` (`<loc>` = SK URL)

Každé `<url>` obsahuje reciproční `hreflang="cs-CZ"` a `hreflang="sk-SK"` (včetně sebe), bez x-default.

## Spuštění

```
python tools/truckmall_hreflang/build.py
```

Jen stdlib. Skript stáhne sitemapy obou shopů, vynechá URL s `?`, páruje podle ID
(`-[acp]\d+/`) a vypíše počty (páry, p/c/a, vynechané, nespárované).

**Pouštět 1× měsíčně** (nové produkty), změněné XML commitnout.

## Search Console

Sitemapy jsou odeslané v GSC property truckmall.cz a truckmall.sk
(všechny 3 property jsou ve stejném účtu, proto funguje cross-site submission).
Nepřidávají se do hlavní sitemapy tagra.app ani do robots.txt tagra.app.
