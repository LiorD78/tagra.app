# TAGRA.EU

Multilingual marketing website for TAGRA tachograph software.

## Languages
- EN (English) — primary
- DE (Deutsch)
- PL (Polski)
- FR (Français)
- IT (Italiano)

## Structure
```
/               Homepage (EN)
/product/       Product page
/how-it-works/  How it works
/for-whom/      For whom
/faq/           FAQ
/contact/       Contact & Demo
/de/            Germany landing page
/pl/            Poland landing page
/fr/            France landing page
/it/            Italy landing page
```

## Sitemap

Po přidání nebo změně stránek spusť `node tools/sitemap_lastmod.js` před
commitem `sitemap.xml` — dopočítá `<lastmod>` z data posledního skutečného
obsahového commitu daného souboru (plošné patičkové/verzovací sweepy
ignoruje). Nikdy nepiš do sitemapy jednotné datum ručně; `--dry-run` vypíše
tabulku beze změny souboru.
