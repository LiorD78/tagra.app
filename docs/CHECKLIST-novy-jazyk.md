# Kontrolní seznam — zavedení nové jazykové verze na tagra.app

Vznikl 13. 8. 2026 po auditu, který odhalil, že maďarská verze byla spuštěná
s 211 odkazy do anglické sekce, bez `hreflang` na 61 stránkách a s 1 542
chybějícími mezerami. Všechny ty chyby by tenhle seznam zachytil předem.

Aktualizováno 12. 9. 2026 o překladovou pipeline a stav lokalizací (sekce 12–13).

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
- [ ] **Výjimka pro rozpracovaný jazyk:** dokud `/{L}/` nemá plnou sadu stránek,
      platí konvence stubu — **lokalizované popisky, anglické hrefy** u toho, co
      ještě neexistuje. Lepší než 404 nebo falešná stránka. Zapiš do sekce 12,
      které cesty jsou zatím anglické, ať se na to nezapomene.

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
- [ ] **Endonym se nikdy nepřekládá** — Deutsch zůstává Deutsch, Français zůstává
      Français, i na maďarské stránce
- [ ] Popisek přepínače (`<summary aria-label="Langue : XX">XX</summary>`) musí
      odpovídat jazyku stránky — snadno se zapomene, protože je to jen dva znaky
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

## 12. Stav lokalizací (ověřeno proti repu 12. 9. 2026)

**Tahle tabulka je jediný zdroj pravdy o tom, co existuje.** Zjištění z auditu:
externí poznámky o stavu jazyků zastarávaly rychleji, než se četly, a dvakrát
poslaly práci na něco, co už bylo hotové. Před jakoukoli lokalizační prací
**ověř `ls` v repu**, ne dokument.

| Jazyk | Stav | Poznámka |
|---|---|---|
| en | plný | zdroj pravdy pro překlad |
| de, pl, hu, el | plné | symbols + články + money-pages |
| it | **plný** | 13 sekcí, 6 článků, `per-aziende` + `per-autisti` přeložené, CTA neuniká na EN |
| fr | **částečný** | `/fr/`, `/fr/conducteurs/`, `/fr/articles/symboles-tachygraphe/` |
| nl, da, ro, tr | neexistují | prokázaná error-poptávka v GSC long-tailu |

**Anglické cesty zatím ve FR** (úmyslně, konvence stubu ze sekce 2):
`/articles/` (hub), `/fleet/`, `/enforcement/`, `/manuals/`, `/faq/`, `/contact/`,
`/privacy/`, `/try/`. Odpadají s dalším FR obsahem.

**Pořadí dalších jazyků** podle kliků v GSC: **NL → RO → ES**
(NL 928 impresí + Belgie 334, silný dotaz „vu interne fout tacho").
Sleeper: chorvatština — jeden obsah pokryje HR + SR + BIH.

Money-pages po překladu **spí** (PL fleet pos 22, driver 45, DE fleet 0 impresí).
Kliky nosí informační symbols/error obsah. Proto se u nového jazyka dělá
**nejdřív symbols článek**, money-page až potom.

---

## 13. Překladová pipeline (ověřena na FR 12. 9. 2026)

Symbols článek má ~139 KB, **1 212 unikátních stringů / 11 629 slov**, 18 tabulek,
21 accordionů, 200+ chybových kódů. Ruční psaní per jazyk je neudržitelné.
Struktura je napříč locales identická — mění se jen textové uzly.

### Princip

**Offset-based replacement na RAW stringu, NIKDY reserializace přes bs4/lxml.**
Reserializace přeformátuje celý dokument → obří diff a riziko rozbití.

- spany se nahrazují **zprava doleva** → žádné kolize indexů
- round-trip s identity mapou musí vrátit **BYTE-IDENTICAL**; dokud nevrátí,
  pipeline se nepouští na ostro

### Extrahované jednotky

| Kód | Co |
|---|---|
| `T` | textové uzly mimo `<script>`/`<style>` |
| `A` | atributy `alt`, `title`, `aria-label`, `placeholder` |
| `M` | `<title>` + meta `description` / `og:*` / `twitter:*` |
| `J` | hodnoty stringů v `application/ld+json` (name, headline, description, text…) |

### Verbatim — nepřekládat

Automaticky se odfiltruje ~167 stringů: čisté kódy a čísla, řetězce celé
VERZÁLKAMI (display-hlášení přístroje typu `! security breach xx`), přípony
`.DDD/.C1B/.V1B`, akronymy (VDO, DTCO, GNSS, DSRC, ITS, CAN, AETR),
reference manuálů, cesty v menu přístroje (`print → driver 1 → activities`).

### Překlad

Crew přes multi-LLM worker, model **gpt-5.6-luna**, `reasoning_effort: none`,
dávky **110 stringů**, JSON dovnitř i ven, **glosář v system promptu**.
Glosář se staví z úředního znění nařízení (EU) 165/2014 v cílovém jazyce —
ne z volného překladu. U FR to je např. `fault` → *anomalie* (nikdy *défaut*),
`tachograph` → *tachygraphe* (nikdy *chronotachygraphe*), `workshop` → *atelier agréé*.

**Worker se dá volat přímo z shellu** přes JSON-RPC `tools/call`, takže payload
vůbec neprojde kontextem konverzace. 11 tisíc slov se přeloží bez zátěže.

> **Past:** egress proxy vrací **403** na hlavičku `User-Agent: Python-urllib/3.x`.
> Nastav `User-Agent: curl/8.5.0`, jinak to vypadá jako výpadek workeru.

### QA gate (automatický, před injekcí)

- **entity match** — `&amp;`, `&nbsp;`, `&rarr;` musí sedět 1:1 zdroj vs. překlad
  (model je nesmí dekódovat ani přidat)
- **unchanged** — >3slovný string identický se zdrojem = podezřelý.
  Pozor: display-hlášení a reference manuálů se tu hlásí **správně**, nejsou to chyby
- **length** — překlad >2,6× delší než zdroj = podezřelý
- **tag-inject** — model vložil HTML tag do čistého textu
- **coverage** — musí sedět 100 %, jinak zůstane anglický ostrůvek

### Strukturální vrstva (pipeline ji neudělá, dělá se zvlášť)

1. cesta dle konvence locale: `/de/ratgeber/…`, `/pl/poradnik/…`, `/hu/cikkek/…`,
   `/el/arthra/…`, `/it/articoli/…`, `/fr/articles/…`
2. `<html lang>`, canonical, `og:url`, `og:locale`, breadcrumb (HTML **i** schema),
   `inLanguage`
3. logo v navigaci → `/{L}/` (globální náhrada URL ho mine, je relativní)
4. **self-link v patičce** — globální náhrada absolutní URL mine relativní variantu
   `/articles/digital-tachograph-symbols/`; hledej obě
5. hreflang doplnit do **všech** sourozeneckých locales, ne jen do nové stránky
6. endonym do přepínače ve všech locales + popisek přepínače
7. sitemap.xml + prolinky z hubu

> **Postup při globální náhradě URL:** hreflang blok nejdřív nahraď zástupkou,
> pak proveď globální náhradu, pak blok vrať. Jinak si přepíšeš `hreflang="en"`
> a `x-default` na novou jazykovou verzi a rozbiješ celou skupinu.
