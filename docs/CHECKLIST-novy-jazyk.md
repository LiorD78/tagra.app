# Kontrolní seznam — zavedení nové jazykové verze na tagra.app

Vznikl 13. 8. 2026 po auditu, který odhalil, že maďarská verze byla spuštěná
s 211 odkazy do anglické sekce, bez `hreflang` na 61 stránkách a s 1 542
chybějícími mezerami. Všechny ty chyby by tenhle seznam zachytil předem.

Zkratka: `{L}` = kód jazyka (de, pl, el, hu…), `{X}` = existující jazyk pro srovnání.

---

## 1. Struktura a obsah

- [ ] Adresář `/{L}/` s lokalizovanými slugy (ne anglické cesty)
- [ ] Všech 19 stránek přeloženo — porovnej `ls */` proti `ls {X}/`
- [ ] Strojová kontrola jazyka těla, ne jen názvu adresáře:
      `langdetect` na text mezi `<main>` — musí vyjít `{L}` s jistotou > 0,95
- [ ] `<html lang="{L}">` na každé stránce
- [ ] Žádné zbytky zdrojového jazyka: hledej „Updated", „Read more", „Contact us"

## 2. Prolinkování — nejčastější zdroj chyb

- [ ] **Žádný odkaz nesmí vést do cizí jazykové sekce.** Kontrola:
      pro každý `<a href="/…">` na stránce v `/{L}/` musí cesta začínat `/{L}/`
      (výjimky: `/assets/`, `/`, soubory)
- [ ] Patička: odkaz na zásady ochrany údajů míří na `/{L}/…`, ne na `/privacy/`
- [ ] Hub článků odkazuje na lokalizované články, ne na `/articles/…`
- [ ] Integrace, návody, FAQ — všechno v rámci `/{L}/`
- [ ] Žádný mrtvý odkaz: každý cíl musí existovat jako soubor

## 3. hreflang — musí být obousměrný

- [ ] Nová verze přidána do **všech** existujících jazyků, ne jen do angličtiny
- [ ] Každá hreflang skupina má identickou sadu na všech svých členech
      (různé sady = Google celou skupinu zahodí)
- [ ] Self-reference: stránka odkazuje i sama na sebe
- [ ] `x-default` míří na anglickou verzi
- [ ] `cs`/`sk` jen tam, kde skutečně existuje 1:1 ekvivalent

## 4. Navigace a hlavička

- [ ] Popisky menu totožné na všech stránkách daného jazyka (jedna varianta, ne tři)
- [ ] Jazykový přepínač: `hreflang="en"` → `/`, `hreflang="{L}"` → `/{L}/`
      — **pozor, `hreflang` bývá až za `href`**, filtry na to musí být připravené
- [ ] Aktivní jazyk označen `aria-current="page"`
- [ ] Tlačítko v menu míří na lokalizovanou zkušební verzi s `?audience=…`
- [ ] Zkušební a děkovací stránka tlačítko v menu **nemají** (odkazovalo by samo na sebe)
- [ ] Názvy edic **TRUCKER / COMPANY / CONTROL se nepřekládají**

## 5. Média a soubory

- [ ] Žádné relativní cesty k obrázkům a videím — lokalizovaná stránka je v jiném
      adresáři a relativní cesta skončí 404 (černý blok místo videa)
- [ ] Ověř každý `src`/`poster` HTTP kódem, ne jen okem
- [ ] Vlastní obrázek pro sdílení (`og:image`), ne obecný

## 6. Typografie a lokalizace

- [ ] **Mezery kolem `<strong>`, `<em>`, `<a>`** — překladové skripty je požírají.
      Kontrola: v angličtině je výskytů 0, v lokalizaci musí být taky 0
- [ ] Uvozovky, pomlčky a desetinné oddělovače podle zvyklostí jazyka
- [ ] Ceny ve správné měně, telefonní čísla s předvolbou země
- [ ] Odborná terminologie ověřená proti úřednímu znění nařízení, ne volný překlad
- [ ] Diakritika: u slovenštiny scan na `ř/ě/ů`, u maďarštiny na `ő/ű`

## 7. Strukturovaná data

- [ ] `Article` + `FAQPage` + `BreadcrumbList` na každém článku
- [ ] `inLanguage` odpovídá jazyku stránky
- [ ] Data publikace souhlasí s viditelným textem v hlavičce článku
- [ ] JSON-LD se parsuje (`json.loads` na každý blok)

## 8. Kontakty a obchodní logika

- [ ] Kontakty odpovídají zemi — ne český telefon na maďarské stránce
- [ ] Odkazy vedou na tagra.app, ne na tdt.cz (kromě záměrných výjimek)
- [ ] Sliby tlačítek odpovídají tomu, co se stane
      (stažení × poptávka — u edice Control odpovídá člověk)
- [ ] Sekvence e-mailů zná nové publikum i jazyk

## 9. Indexace

- [ ] Sitemap doplněna o nové URL
- [ ] Bez `noindex`
- [ ] Google Search Console: property ověřena
- [ ] IndexNow: nové URL odeslány
- [ ] Přesměrování ze starých cest, pokud se slug mění

## 10. Před nasazením a po něm

- [ ] HTML se parsuje, párování `<div>`, `<section>`, `<main>`, `<li>`
- [ ] Verze sdíleného CSS zvýšena (`?v=…`), jinak změnu nikdo neuvidí
- [ ] Po nasazení ověřit **živě**, ne jen v kódu
- [ ] Alespoň jednu cestu proklikat ručně v prohlížeči

---

## 11. Vazby mezi HTML a JavaScriptem

Nejzrádnější kategorie chyb. HTML je validní, JavaScript bez chyby, odkazy fungují —
a přesto něco nejde. Chyba leží **mezi** dvěma vrstvami, ne uvnitř jedné, takže ji
běžná validace nenajde.

- [ ] **Spustit `python3 tools/check-js-refs.py`** — ověří, že každý identifikátor
      a třída, na kterou se skript odkazuje, v HTML skutečně existuje
- [ ] Výsledek **ROZBITÉ** = funkce nefunguje, opravit před nasazením
- [ ] Výsledek **mrtvý kód** = odkaz je chráněný podmínkou, nic se nerozbije,
      ale kód se zbytečně stahuje — uklidit při nejbližší příležitosti
- [ ] Nové stránky vždy porovnat s **funkčním vzorem téhož typu**, ne s cizojazyčnou
      předlohou — kostra (navigace, patička, obslužné skripty) se musí brát ze stránky
      v cílovém jazyce

### Proč tato sekce vznikla

**14. 8. 2026: na celém webu nešlo otevřít mobilní menu.** Obslužný skript hledal
seznam odkazů přes `getElementById('nav-links')`, ale element měl jen
`class="nav-links"` bez `id`. Podmínka `if (toggle && links)` neprošla, posluchač
kliknutí se nenavěsil a hamburger nedělal nic. Postihovalo to **96 ze 110 stránek**
ve všech jazycích a nikdo si toho nevšiml, protože:

- HTML validní ✓
- JavaScript bez syntaktické chyby ✓
- odkazy, hreflang, strukturovaná data, kontrast, mezery — vše čisté ✓
- na desktopu se hamburger vůbec nezobrazuje, takže při běžné kontrole není vidět

Odhalil to až uživatel na mobilu. **Defenzivní `if (element)` je dobrý zvyk, ale
způsobuje tiché selhání** — funkce prostě přestane existovat, aniž by cokoli
zahlásilo chybu. Proto je potřeba kontrolovat vazby staticky.

---

## Poučení z 13. 8. 2026

**Hromadné úpravy HTML regulárními výrazy jsou nejrizikovější operace na webu.**
Toho dne rozbily hreflang bloky (zachyceno před nasazením) a jazykový přepínač
(dvě hodiny na produkci). Pravidla:

1. Parsuj DOM, ne text — vždy, když jde o atributy nebo strukturu.
2. Filtry piš na celý tag, ne na to, co je před `href`.
3. Po každém hromadném zásahu spusť sadu kontrol znovu **celou**, ne jen tu,
   které se změna týkala.
4. Indexy do řetězce přepočítej po každé úpravě, která do něj vkládá text.
5. Nasazuj po malých commitech, ať jde regrese izolovat.
