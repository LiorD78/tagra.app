# Překlad e-mailů zkušební verze tagra.app (v2, TAGRA III)

Živě v novém vzhledu: **EN, DE** (`netlify/lib/tagra-email/content-en.json`, `content-de.json`).
Ostatní jazyky zatím posílají staré šablony z `/try/email-preview/`.

## Postup pro nový jazyk `xx`
1. Přeložit `to-translate.json` (163 řetězců, klíče 0–162) přes crew → `raw/xx.json` se **stejnými klíči**.
   - Tokeny `<a1>`…`<a19>`, `</a>`, `<b>`, `</b>`, `{NAME}`, `&nbsp;`, `&middot;` nechat beze změny (jen přesunout ve větě).
   - Ceny `€149` apod. nechat ve tvaru `€číslo` – formát doplní `urls/xx.json`.
2. Založit `urls/xx.json` podle `urls/de.json`: `html_lang`, formát ceny (`\\1 €` = „149 €“), náhrady adres na skutečné lokalizované stránky tagra.app a shop.tagra.app (ověřit, že vrací 200).
3. Z kořene repa: `python3 tools/trial-email-i18n/assemble.py xx` → zapíše `netlify/lib/tagra-email/content-xx.json` a vypíše zbylé tokeny a anglické adresy (obojí musí být prázdné).
4. Zapojit: řádek `xx: require("./content-xx.json")` do `netlify/lib/tagra-email/templates.js` a 11 cest `/try/email-preview/…-xx.html` do `config.path` v `netlify/functions/trial-templates.mjs`.
5. Náhled `https://tagra.app/.netlify/functions/trial-email-v2?preview=list`.

Kód jazyka = kód v `trial-email.js` (`gr` pro řečtinu, `cz` pro češtinu).
`aliases.json` = místa, kde se stejný text použije vícekrát (nepřekládá se zvlášť).
