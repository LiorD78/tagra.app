# TAGRA III fleet page – review notes (DE, FR, IT, NL, PL, HU, RO, EL)

Datum: 2026-10-31 · Zdroj: `en_tr.json` (104 klíčů) · Výstup: `<lang>.json` (104 klíčů, stejné pořadí)

## Postup
- Překlad: GPT `gpt-6.1-sol`, reasoning `low`, 4 chunky na jazyk (32 / 28 / 26 / 18 položek; fragmentové skupiny s019–s023, s025–s026, s027–s031, s097–s102 vždy v jednom chunku). Všechny odpovědi přišly synchronně (žádný job_id).
- Kontrola: Gemini (stejné 4 chunky, EN + překlad + glosář klíčových termínů daného jazyka + nálezy validátoru) → JSON s opravami.
- Opravy Gemini aplikovány, pokud dávaly smysl; zamítnuté níže. U sporů zůstala verze GPT.
- Cílené dopřeklady GPT (ne Gemini) tam, kde Gemini problém nevyřešil.
- Mechanická oprava orchestrátorem: FR s102 – odstraněna koncová tečka (stránka ji přidává za `</strong>`).
- Validace (python): všechny klíče, žádné prázdné hodnoty, „TAGRA III“ všude, kde je v EN; 561/2006, 165/2014, 2002/15, AETR, EUR-Lex, PDF, Windows zachovány; s001/s107 ≤ 65, s000/s002 ≤ 165 znaků; fragmenty nezačínají „-“/„,“ a nekončí apostrofem; s102 bez tečky; EL řeckým písmem (latinka jen v chráněných tokenech); RO bez ş/ţ s cedilou. **Výsledek: všech 8 souborů OK.**

## Opravy podle jazyka

| jazyk | # oprav Gemini přijato | klíče (Gemini) | sloučení / dopřeklad GPT |
|---|---|---|---|
| de | 7 | s009, s028, s029, s069, s095, s099, s101 | — |
| fr | 5 | s009, s051, s069, s076, s107 | s039, s064 |
| it | 8 | s000, s009, s021, s022, s033, s064, s069, s076 | s025, s026, s101, s106 |
| nl | 8 | s003, s004, s011, s012, s014, s064, s069, s076 | s049, s095 |
| pl | 4 | s014, s056, s095, s109 | — |
| hu | 7 | s003, s004, s009, s011, s063, s069, s095 | — |
| ro | 9 | s038, s039, s063, s064, s067, s073, s076, s077, s084 | s000 |
| el | 13 | s009, s013, s033, s046, s048, s051, s055, s058, s069, s095, s097, s101, s106 | s049 |

## Zamítnuté návrhy Gemini (ponechán GPT)
- **NL s049**: Gemini změnil report „Onbekende tijd“ (Unknown time) na „Onverantwoorde tijd“ (Unaccounted time) – jde o dva různé pojmy → zamítnuto; převzata jen harmonizace „Bestuurdersbeoordeling“ → „Bestuurdersevaluatie“.
- **NL s095/s109**: „voertuigunits“ → „voertuigeenheden“ – NL znění 165/2014 používá „voertuigunit“ → zamítnuto; v s095 převzata jen harmonizace „niet-verantwoorde tijd“ → „onverantwoorde tijd“.
- **IT s099–s101**: návrh Gemini fragmenty dál rozbíjel (s099 končí apostrofem, s101 začíná čárkou) → zamítnuto, opraveno cíleným dopřekladem GPT („… e dell'accordo AETR nonché registrazioni …“).
- **HU s074**: „Járművezető kiértékelése jelentés.“ je negramatické → ponecháno „Járművezető-értékelési jelentés.“
- **RO s000**: Gemini zkrátil na telegrafické „program tahografe flote“ → zamítnuto, délku vyřešil GPT (157 zn.; vypadlo slovo „flotei“). **RO s031** (stylistická změna + odchylka od oficiálního „unitatea montată pe vehicul“) a **RO s101** (čárka před „și“) zamítnuto.
- **RO kalibrace – spor**: Gemini v chunku 2/4 sjednocoval na „etalonare“, v chunku 3 na „calibrare“. Ponecháno „calibrare“ (většina výskytů GPT); s051/s095/s109 beze změny, s067/s084 převedeny na „calibrare“.
- **EL report – spor**: Gemini chunk 2 a 4 sjednotil na „έκθεση“, chunk 3 naopak na „αναφορά“ (+ zpět „νυκτερινή“). Ponecháno „έκθεση“ (většina) → změny s064, s065, s074, s076, s077, s078 zamítnuty; **EL s049** – Gemini zaměnil „Άγνωστος χρόνος“ (Unknown time) za „Μη τεκμηριωμένος χρόνος“ → zamítnuto, převzato jen „Συνολική έκθεση“.

## Cílené dopřeklady GPT
- **IT** s101 (fragment začínal čárkou), s025/s026 („Molto più del semplice / scaricamento dei dati“ místo negramatického „Non solo scaricamento dei dati“), s106 („report“ → „rapporto“ kvůli konzistenci).
- **FR** s039 („bande“ → „bandeau « Pays et services »“), s064 záložka „Rapport d’activité“ → „Rapport de travail“ (shodně s s013/s046/s076).
- **RO** s000 (166 → 157 znaků).

## Nejdůležitější opravy (věcné)
1. **Fragmenty po spojení**: DE s101 začínal „-Übereinkommen“ (render „AETR -Übereinkommen“), IT s021 končil „l'“ a s101 začínal čárkou → všechny opraveny; FR s102 bez tečky.
2. **Konzistence „Unaccounted time“** sjednocena ve všech jazycích (DE „nicht belegte Zeiten“, FR „temps non justifié“, IT „tempo non giustificato“, NL „onverantwoorde tijd“, HU „elszámolatlan idő“, EL „μη τεκμηριωμένος χρόνος“); „Unknown time“ zůstává samostatný název reportu.
3. **Formální oslovení**: PL s056 „Zobacz, jak to działa“ (tykání) → „Program w działaniu“.
4. **Délky SEO**: IT s000 a RO s000 přesahovaly 165 znaků → zkráceno.
5. **Názvy reportů/záložek** sjednoceny (IT/NL/RO „Work report“ = „Rapporto di lavoro“ / „Arbeidsrapport“ / „Raport de lucru“; HU „Járművezető kiértékelése“; RO „schimburi“, „grafic“, „conducător auto“ místo „ture“, „diagramă“, „șofer“).

## Otevřené body (nechány dle GPT, doporučuji rodilou kontrolu)
- **DE**: mix „Fahrtenschreiber“ (oficiální termín EUR-Lex) a „Tachograph(en)software“ (s095, s107–s109); s073 „Bereich“ vs. jinde „Leiste „Länder & Schichten““.
- **HU**: mix „értékelés“ / „kiértékelés“ (i v s012/s074 „Járművezető-értékelési jelentés“ vs. záložka s063 „Járművezető kiértékelése“).
- **RO s001**: „Program pentru tahografe digitale și flote“ („… a flotily“) je významově mírně posunuté (EN: for fleets). RO s000 po zkrácení neobsahuje „flotă“.
- **NL s035** „Beoordeling“ vs. jinde „evaluatie“; s039 „strook“ vs. s004/s073 „balk“ (Landen en diensten).
- **Oficiální název formuláře „attestation of activities“** (DE „Bescheinigung von Tätigkeiten“, FR „attestation d’activités“, IT „attestazione di attività“, NL „verklaring van activiteiten“, PL „zaświadczenie o działalności“, HU „tevékenységigazoló lap“, RO „adeverință privind activitățile“, EL „βεβαίωση δραστηριοτήτων“) – Gemini nic nenamítal, proti PDF rozhodnutí 2009/959/EU v jednotlivých jazycích ověřeno nebylo.
- s109 obsahuje „Ready for vans from July 2026“ – přeloženo, protože je v EN zdroji (nic nepřidáno).
- s055/s106: jazyková sada programu přeložena beze změny (EN, DE, IT, FR, CZ, SK); u NL/PL/HU/RO/EL nic nepřidáno.
