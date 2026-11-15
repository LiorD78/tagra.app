# Testy souhlasu v2 + ads.js (balíček 38)

Playwright, bez sítě (externí domény se zachytí a vrací prázdnou odpověď, počítají se požadavky).

```
mkdir /tmp/pw && cd /tmp/pw && npm init -y && npm i playwright && npx playwright install chromium
NODE_PATH=/tmp/pw/node_modules node tests/consent-v2/consent-v2.test.js
```
Pokrývá (a)–(g) ze zadání: bez volby / jen nutné, Přijmout vše s ADS_ENABLED=false, ADS_ENABLED=true (ads.js se v testu
přepíše za běhu, repo zůstává s `false`), 11 jazyků + screenshoty, migrace v1→v2, CLS, click ID v trial formuláři.
Screenshoty a `results.txt` jdou do `tests/consent-v2/shots/` (nebo `TMX_SHOTS`).
