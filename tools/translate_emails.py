#!/usr/bin/env python3
"""
Přeloží email2 + email3 z EN do cz / sk / de / pl / gr.

Vstup:  try/email-preview/email{2,3}-{fleet,driver}-en.html
Výstup: try/email-preview/email{2,3}-{fleet,driver}-{lang}.html

Princip: deterministický walk přes textové uzly + <title> + alt="".
Segment se přeloží, jen pokud je ve slovníku; jinak zůstane (TAGRA,
čísla kroků, telefony, e-maily, názvy sítí).

CENY (roční licenční poplatek, bez DPH — ověřeno v TRUCKMALL-MASTER):
  cz          TAGRA 1/2/4/6 = 1 990 Kč · MAX = 3 490 Kč · TRUCKER = 490 Kč
  sk          TAGRA 1/2/4/6 = 83 EUR   · MAX = 145 EUR  · TRUCKER = 19 EUR
  de/pl/gr    dle tagra.app: od 79 €   · MAX = 139 €    · TRUCKER = 19 €

SK GATE: žádné ř / ě / ů. Kontroluje se automaticky na konci.
"""
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TPL = ROOT / "try" / "email-preview"
LANGS = ["cz", "sk", "de", "pl", "gr"]

# ── odkazy: privacy je lokalizovaná, ostatní stránky zatím ne ───────────
LINKS = {l: {"https://tagra.app/privacy/": f"https://tagra.app/privacy/{l}/"} for l in LANGS}

# ═══════════════════════════════════════════════════════════════════════
# SLOVNÍKY
# ═══════════════════════════════════════════════════════════════════════
TR = {}

# ─────────────────────────────── ČEŠTINA ───────────────────────────────
TR["cz"] = {
    # --- společné: hlavička, patička, podpis ---
    "30-day trial": "30denní zkušební verze",
    "5 days left": "zbývá 5 dní",
    "Best regards,": "S pozdravem,",
    "Ivan Szabó – Sales Director, Tachograph Data Specialist – TAGRA":
        "Ivan Szabó – obchodní ředitel, specialista na data z tachografu – TAGRA",
    "Truck Data Technology s.r.o., U Trati 886/52, 100&nbsp;00 Prague&nbsp;10":
        "Truck Data Technology s.r.o., U Trati 886/52, 100&nbsp;00 Praha&nbsp;10",
    "TAGRA &middot; Truck Data Technology, s.r.o. &middot; Prague, Czech Republic":
        "TAGRA &middot; Truck Data Technology, s.r.o. &middot; Praha, Česká republika",
    "Privacy policy": "Zásady ochrany osobních údajů",
    "You are receiving this email because you requested a TAGRA trial at tagra.app. We will only contact you about your trial and related products. If you don't want any more trial help emails, reply &quot;stop&quot;.":
        "Tento e-mail vám přišel, protože jste si na tagra.app vyžádali zkušební verzi programu TAGRA. Kontaktujeme vás pouze ohledně zkušební verze a souvisejících produktů. Pokud už další e-maily ke zkušební verzi nechcete, odpovězte „stop“.",

    # --- email2 FLEET ---
    "TAGRA quick start: import your files and run the first report":
        "Rychlý start s programem TAGRA: naimportujte soubory a spusťte první výkaz",
    "Three steps to your first infringement report — and two quick questions so I can recommend the right setup.":
        "Tři kroky k prvnímu výkazu přestupků — a dvě rychlé otázky, ať vám doporučím správné řešení.",
    "Quick start for your fleet": "Rychlý start pro váš vozový park",
    "Hi {NAME}, how is your trial going?": "Dobrý den {NAME}, jak vám jde zkušební verze?",
    "A few days ago you downloaded the TAGRA trial for your fleet — thank you. Most fleet managers start like this (about 10 minutes):":
        "Před pár dny jste si stáhli zkušební verzi programu TAGRA pro svůj vozový park — děkujeme. Většina dopravců začíná takto (asi 10 minut):",
    "Install and open TAGRA": "Nainstalujte a spusťte program TAGRA",
    "If the installation did not go smoothly, the guide below covers it step by step.":
        "Pokud instalace nešla hladce, návod níže ji provede krok za krokem.",
    "Import a few driver card or vehicle files": "Naimportujte pár souborů z karty řidiče nebo z vozidla",
    "TAGRA reads the files from your card reader or download key and evaluates them immediately.":
        "TAGRA načte soubory ze čtečky karet nebo ze stahovacího klíče a hned je vyhodnotí.",
    "Run your first infringement report": "Spusťte první výkaz přestupků",
    "This is the report inspectors ask for — TAGRA flags any driving time or rest period problems.":
        "Přesně tento výkaz po vás chce kontrola — TAGRA označí každý problém s dobou řízení i s odpočinkem.",
    "Open the step-by-step guide": "Otevřít návod krok za krokem",
    "Curious what fits your fleet?": "Nevíte, co se k vašemu parku hodí?",
    "We have the right solution for you — just reply to these two questions:":
        "Řešení pro vás máme — stačí odpovědět na dvě otázky:",
    "How do you download data from your tachographs today — card reader, download key, or not yet solved?":
        "Jak dnes stahujete data z tachografu — čtečkou karet, stahovacím klíčem, nebo to zatím nemáte vyřešené?",
    "How many vehicles do you manage?": "Kolik vozidel spravujete?",
    "I will suggest the right TAGRA edition and compatible hardware, so you don't pay for more than you need. I reply personally. If you manage a larger fleet, I can also arrange a guided setup consultation for you.":
        "Doporučím vám správnou verzi programu TAGRA i kompatibilní hardware, abyste neplatili za víc, než potřebujete. Odpovídám osobně. U většího vozového parku vám navíc rád zařídím konzultaci k nastavení.",

    # --- email2 DRIVER ---
    "Read your driver card in TAGRA — first steps":
        "Načtěte kartu řidiče do programu TAGRA — první kroky",
    "Three simple steps to read your driver card — and one quick question about your card reader.":
        "Tři jednoduché kroky k načtení karty řidiče — a jedna rychlá otázka ke čtečce.",
    "First steps for drivers": "První kroky pro řidiče",
    "A few days ago you downloaded the TAGRA trial — thank you. As a professional driver, you mainly need two things: to know about any infringements before an inspection finds them, and to keep your card data archived so you are covered at roadside checks. TAGRA also prepares your work reports and travel allowances from the same data. Here is how to get there (5–10 minutes):":
        "Před pár dny jste si stáhli zkušební verzi programu TAGRA — děkujeme. Jako profesionální řidič potřebujete hlavně dvě věci: vědět o přestupcích dřív, než je najde kontrola, a mít data z karty zálohovaná, abyste byli při silniční kontrole krytí. Ze stejných dat vám TAGRA připraví i výkazy práce a cestovní náhrady. Takto se k tomu dostanete (5–10 minut):",
    "Connect a USB card reader": "Připojte USB čtečku karet",
    "Any standard smart card reader works. TAGRA detects it automatically.":
        "Funguje každá běžná čtečka čipových karet. TAGRA ji rozpozná automaticky.",
    "Insert your driver card and read it in TAGRA": "Vložte kartu řidiče a načtěte ji do programu TAGRA",
    "TAGRA reads your card in seconds — it evaluates infringements, prepares work reports and travel allowances, and archives everything safely.":
        "TAGRA načte kartu během pár sekund — vyhodnotí přestupky, připraví výkazy práce i cestovní náhrady a vše bezpečně zálohuje.",
    "One practical question": "Jedna praktická otázka",
    "Do you have a USB card reader? Reply to this email with": "Máte USB čtečku karet? Odpovězte na tento e-mail slovem",
    "&quot;reader: yes&quot;": "„čtečka: ano“",
    "or": "nebo",
    "&quot;reader: no&quot;": "„čtečka: ne“",
    ". If you don't have one, I will recommend a compatible model — TAGRA TRUCKER ships with a reader included.":
        ". Pokud ji nemáte, doporučím vám kompatibilní model — TAGRA TRUCKER se dodává i se čtečkou.",
    "If you have any questions, please reply to this email. I read and answer every one.":
        "Máte-li jakýkoli dotaz, odpovězte na tento e-mail. Čtu je a odpovídám na všechny.",

    # --- email3 FLEET ---
    "Your TAGRA trial ends in 5 days — here is how to keep your data":
        "Zkušební verze programu TAGRA končí za 5 dní — o data nepřijdete",
    "Your licence activates inside the same software — nothing you imported gets lost. From €79 a year.":
        "Licenci aktivujete přímo v programu — nic z naimportovaných dat neztratíte. Od 1 990 Kč ročně.",
    "Your trial is ending": "Zkušební verze končí",
    "{NAME}, your trial ends in 5 days": "{NAME}, zkušební verze končí za 5 dní",
    "Your 30-day TAGRA trial expires in 5 days. If it has been doing its job, you don't need to reinstall anything or import your files again — the licence activates inside the same software you are already using, and everything you have imported stays where it is. It takes about two minutes:":
        "Vaše 30denní zkušební verze programu TAGRA vyprší za 5 dní. Pokud vám posloužila, nemusíte nic přeinstalovávat ani znovu importovat soubory — licenci aktivujete přímo v programu, který už používáte, a všechna naimportovaná data zůstanou na svém místě. Zabere to asi dvě minuty:",
    "Open the licence menu in TAGRA": "Otevřete v programu TAGRA licenční nabídku",
    "You are already inside the program — no new download, no reinstall, no re-import.":
        "Jste už uvnitř programu — žádné stahování, žádná reinstalace, žádný nový import.",
    "Choose the edition that matches your fleet": "Vyberte verzi podle svého vozového parku",
    "TAGRA 1, 2, 4 or 6 by number of vehicles — or MAX for an unlimited fleet. Not sure? Just reply, see below.":
        "TAGRA 1, 2, 4 nebo 6 podle počtu vozidel — nebo MAX pro neomezený park. Nejste si jistí? Stačí odpovědět, viz níže.",
    "Pay by QR code or bank transfer": "Zaplaťte QR kódem nebo převodem",
    "Your licence is activated immediately and you carry on in the same environment, with all your data.":
        "Licence se aktivuje okamžitě a vy pokračujete ve stejném prostředí i se všemi svými daty.",
    "See editions and pricing": "Zobrazit verze a ceny",
    "Not sure which edition you need?": "Nevíte, kterou verzi potřebujete?",
    "Don't overpay — the edition is set by your number of vehicles. Reply with these two and I will tell you which one to pick:":
        "Neplaťte zbytečně — verzi určuje počet vozidel. Odpovězte na tyto dvě otázky a řeknu vám, kterou zvolit:",
    "Is there anything in the trial that did not work the way you expected?":
        "Nefungovalo ve zkušební verzi něco tak, jak jste čekali?",
    "The annual licence fee starts at &euro;79 excl. VAT (TAGRA MAX &euro;139) and the first year is included in the purchase price — it covers updates and support. If something in the trial didn't work, tell me before it expires; I'd rather fix it than lose you over it. I reply personally.":
        "Roční licenční poplatek je 1 990 Kč bez DPH (TAGRA MAX 3 490 Kč) a první rok je zahrnutý v ceně — kryje aktualizace a technickou podporu. Pokud ve zkušební verzi něco nefungovalo, napište mi dřív, než vyprší; radši to spravím, než abych o vás kvůli tomu přišel. Odpovídám osobně.",

    # --- email3 DRIVER ---
    "Your TAGRA TRUCKER trial ends in 5 days": "Zkušební verze TAGRA TRUCKER končí za 5 dní",
    "Your licence activates inside the same software — your archived card data stays. €19 a year from year two.":
        "Licenci aktivujete přímo v programu — zálohovaná data z karty zůstanou. Od druhého roku 490 Kč ročně.",
    "Your 30-day TAGRA TRUCKER trial expires in 5 days. The archive you have built up over the past weeks is the thing that covers you at a roadside check — and you keep it. The licence activates inside the same software, so nothing is reinstalled and nothing is re-read. It takes about two minutes:":
        "Vaše 30denní zkušební verze TAGRA TRUCKER vyprší za 5 dní. Právě záloha, kterou jste za poslední týdny nasbírali, vás kryje při silniční kontrole — a zůstane vám. Licenci aktivujete přímo v programu, takže se nic nepřeinstalovává ani znovu nenačítá. Zabere to asi dvě minuty:",
    "You are already inside the program — no new download and no reinstall.":
        "Jste už uvnitř programu — žádné stahování ani reinstalace.",
    "Select TAGRA TRUCKER": "Zvolte TAGRA TRUCKER",
    "The edition for individual drivers — one driver card, full evaluation, archive, work reports and travel allowances.":
        "Verze pro jednotlivé řidiče — jedna karta řidiče, plné vyhodnocení, záloha, výkazy práce a cestovní náhrady.",
    "Your licence is activated immediately and your archived card data stays exactly where it is.":
        "Licence se aktivuje okamžitě a zálohovaná data z karty zůstanou přesně tam, kde jsou.",
    "See TAGRA TRUCKER pricing": "Zobrazit ceny TAGRA TRUCKER",
    "Before it expires — one question": "Než vyprší — jedna otázka",
    "Did anything in the trial not work the way you expected — reading the card, an infringement you disagree with, or the archive? Reply and tell me before it expires. I would rather fix it than have you leave over something that takes me five minutes to solve.":
        "Nefungovalo ve zkušební verzi něco tak, jak jste čekali — načtení karty, přestupek, se kterým nesouhlasíte, nebo záloha? Napište mi to, než vyprší. Radši to spravím, než abyste odešli kvůli něčemu, co mi zabere pět minut.",
    "TAGRA TRUCKER costs &euro;19 excl. VAT per year from the second year — the first year is included in the purchase price, and it covers updates and support. If you still don't have a USB card reader, reply and I will recommend a compatible model; TRUCKER ships with a reader included.":
        "TAGRA TRUCKER stojí od druhého roku 490 Kč bez DPH ročně — první rok je zahrnutý v ceně a kryje aktualizace i technickou podporu. Pokud pořád nemáte USB čtečku karet, odpovězte a doporučím vám kompatibilní model; TRUCKER se dodává i se čtečkou.",
}

# ─────────────────────────────── SLOVENŠTINA ───────────────────────────
TR["sk"] = {
    "30-day trial": "30-dňová skúšobná verzia",
    "5 days left": "zostáva 5 dní",
    "Best regards,": "S pozdravom,",
    "Ivan Szabó – Sales Director, Tachograph Data Specialist – TAGRA":
        "Ivan Szabó – obchodný riaditeľ, špecialista na dáta z tachografu – TAGRA",
    "Truck Data Technology s.r.o., U Trati 886/52, 100&nbsp;00 Prague&nbsp;10":
        "Truck Data Technology s.r.o., U Trati 886/52, 100&nbsp;00 Praha&nbsp;10",
    "TAGRA &middot; Truck Data Technology, s.r.o. &middot; Prague, Czech Republic":
        "TAGRA &middot; Truck Data Technology, s.r.o. &middot; Praha, Česká republika",
    "Privacy policy": "Zásady ochrany osobných údajov",
    "You are receiving this email because you requested a TAGRA trial at tagra.app. We will only contact you about your trial and related products. If you don't want any more trial help emails, reply &quot;stop&quot;.":
        "Tento e-mail vám prišiel, pretože ste si na tagra.app vyžiadali skúšobnú verziu programu TAGRA. Kontaktujeme vás iba ohľadom skúšobnej verzie a súvisiacich produktov. Ak už ďalšie e-maily k skúšobnej verzii nechcete, odpovedzte „stop“.",

    "TAGRA quick start: import your files and run the first report":
        "Rýchly štart s programom TAGRA: naimportujte súbory a spustite prvý výkaz",
    "Three steps to your first infringement report — and two quick questions so I can recommend the right setup.":
        "Tri kroky k prvému výkazu priestupkov — a dve rýchle otázky, aby som vám odporučil správne riešenie.",
    "Quick start for your fleet": "Rýchly štart pre váš vozový park",
    "Hi {NAME}, how is your trial going?": "Dobrý deň {NAME}, ako vám ide skúšobná verzia?",
    "A few days ago you downloaded the TAGRA trial for your fleet — thank you. Most fleet managers start like this (about 10 minutes):":
        "Pred pár dňami ste si stiahli skúšobnú verziu programu TAGRA pre svoj vozový park — ďakujeme. Väčšina dopravcov začína takto (asi 10 minút):",
    "Install and open TAGRA": "Nainštalujte a spustite program TAGRA",
    "If the installation did not go smoothly, the guide below covers it step by step.":
        "Ak inštalácia nešla hladko, návod nižšie vás prevedie krok za krokom.",
    "Import a few driver card or vehicle files": "Naimportujte pár súborov z karty vodiča alebo z vozidla",
    "TAGRA reads the files from your card reader or download key and evaluates them immediately.":
        "TAGRA načíta súbory z čítačky kariet alebo zo sťahovacieho kľúča a hneď ich vyhodnotí.",
    "Run your first infringement report": "Spustite prvý výkaz priestupkov",
    "This is the report inspectors ask for — TAGRA flags any driving time or rest period problems.":
        "Presne tento výkaz od vás žiada kontrola — TAGRA označí každý problém s časom jazdy aj s odpočinkom.",
    "Open the step-by-step guide": "Otvoriť návod krok za krokom",
    "Curious what fits your fleet?": "Neviete, čo sa k vášmu parku hodí?",
    "We have the right solution for you — just reply to these two questions:":
        "Riešenie pre vás máme — stačí odpovedať na dve otázky:",
    "How do you download data from your tachographs today — card reader, download key, or not yet solved?":
        "Ako dnes sťahujete dáta z tachografu — čítačkou kariet, sťahovacím kľúčom, alebo to zatiaľ nemáte vyriešené?",
    "How many vehicles do you manage?": "Koľko vozidiel spravujete?",
    "I will suggest the right TAGRA edition and compatible hardware, so you don't pay for more than you need. I reply personally. If you manage a larger fleet, I can also arrange a guided setup consultation for you.":
        "Odporučím vám správnu verziu programu TAGRA aj kompatibilný hardvér, aby ste neplatili za viac, než potrebujete. Odpovedám osobne. Pri väčšom vozovom parku vám rád zariadim aj konzultáciu k nastaveniu.",

    "Read your driver card in TAGRA — first steps":
        "Načítajte kartu vodiča do programu TAGRA — prvé kroky",
    "Three simple steps to read your driver card — and one quick question about your card reader.":
        "Tri jednoduché kroky k načítaniu karty vodiča — a jedna rýchla otázka k čítačke.",
    "First steps for drivers": "Prvé kroky pre vodičov",
    "A few days ago you downloaded the TAGRA trial — thank you. As a professional driver, you mainly need two things: to know about any infringements before an inspection finds them, and to keep your card data archived so you are covered at roadside checks. TAGRA also prepares your work reports and travel allowances from the same data. Here is how to get there (5–10 minutes):":
        "Pred pár dňami ste si stiahli skúšobnú verziu programu TAGRA — ďakujeme. Ako profesionálny vodič potrebujete najmä dve veci: vedieť o priestupkoch skôr, než ich nájde kontrola, a mať dáta z karty zálohované, aby ste boli pri cestnej kontrole krytí. Z rovnakých dát vám TAGRA pripraví aj výkazy práce a cestovné náhrady. Takto sa k tomu dostanete (5 – 10 minút):",
    "Connect a USB card reader": "Pripojte USB čítačku kariet",
    "Any standard smart card reader works. TAGRA detects it automatically.":
        "Funguje každá bežná čítačka čipových kariet. TAGRA ju rozpozná automaticky.",
    "Insert your driver card and read it in TAGRA": "Vložte kartu vodiča a načítajte ju do programu TAGRA",
    "TAGRA reads your card in seconds — it evaluates infringements, prepares work reports and travel allowances, and archives everything safely.":
        "TAGRA načíta kartu za pár sekúnd — vyhodnotí priestupky, pripraví výkazy práce aj cestovné náhrady a všetko bezpečne zálohuje.",
    "One practical question": "Jedna praktická otázka",
    "Do you have a USB card reader? Reply to this email with": "Máte USB čítačku kariet? Odpovedzte na tento e-mail slovom",
    "&quot;reader: yes&quot;": "„čítačka: áno“",
    "or": "alebo",
    "&quot;reader: no&quot;": "„čítačka: nie“",
    ". If you don't have one, I will recommend a compatible model — TAGRA TRUCKER ships with a reader included.":
        ". Ak ju nemáte, odporučím vám kompatibilný model — TAGRA TRUCKER sa dodáva aj s čítačkou.",
    "If you have any questions, please reply to this email. I read and answer every one.":
        "Ak máte akúkoľvek otázku, odpovedzte na tento e-mail. Čítam ich a odpovedám na všetky.",

    "Your TAGRA trial ends in 5 days — here is how to keep your data":
        "Skúšobná verzia programu TAGRA končí o 5 dní — o dáta neprídete",
    "Your licence activates inside the same software — nothing you imported gets lost. From €79 a year.":
        "Licenciu aktivujete priamo v programe — nič z naimportovaných dát nestratíte. Od 83 EUR ročne.",
    "Your trial is ending": "Skúšobná verzia sa končí",
    "{NAME}, your trial ends in 5 days": "{NAME}, skúšobná verzia končí o 5 dní",
    "Your 30-day TAGRA trial expires in 5 days. If it has been doing its job, you don't need to reinstall anything or import your files again — the licence activates inside the same software you are already using, and everything you have imported stays where it is. It takes about two minutes:":
        "Vaša 30-dňová skúšobná verzia programu TAGRA vyprší o 5 dní. Ak vám poslúžila, nemusíte nič preinštalovávať ani znovu importovať súbory — licenciu aktivujete priamo v programe, ktorý už používate, a všetky naimportované dáta zostanú na svojom mieste. Zaberie to asi dve minúty:",
    "Open the licence menu in TAGRA": "Otvorte v programe TAGRA licenčnú ponuku",
    "You are already inside the program — no new download, no reinstall, no re-import.":
        "Ste už vnútri programu — žiadne sťahovanie, žiadna reinštalácia, žiadny nový import.",
    "Choose the edition that matches your fleet": "Vyberte verziu podľa svojho vozového parku",
    "TAGRA 1, 2, 4 or 6 by number of vehicles — or MAX for an unlimited fleet. Not sure? Just reply, see below.":
        "TAGRA 1, 2, 4 alebo 6 podľa počtu vozidiel — alebo MAX pre neobmedzený park. Nie ste si istí? Stačí odpovedať, pozri nižšie.",
    "Pay by QR code or bank transfer": "Zaplaťte QR kódom alebo prevodom",
    "Your licence is activated immediately and you carry on in the same environment, with all your data.":
        "Licencia sa aktivuje okamžite a vy pokračujete v rovnakom prostredí aj so všetkými svojimi dátami.",
    "See editions and pricing": "Zobraziť verzie a ceny",
    "Not sure which edition you need?": "Neviete, ktorú verziu potrebujete?",
    "Don't overpay — the edition is set by your number of vehicles. Reply with these two and I will tell you which one to pick:":
        "Neplaťte zbytočne — verziu určuje počet vozidiel. Odpovedzte na tieto dve otázky a poviem vám, ktorú zvoliť:",
    "Is there anything in the trial that did not work the way you expected?":
        "Nefungovalo v skúšobnej verzii niečo tak, ako ste čakali?",
    "The annual licence fee starts at &euro;79 excl. VAT (TAGRA MAX &euro;139) and the first year is included in the purchase price — it covers updates and support. If something in the trial didn't work, tell me before it expires; I'd rather fix it than lose you over it. I reply personally.":
        "Ročný licenčný poplatok je 83 EUR bez DPH (TAGRA MAX 145 EUR) a prvý rok je zahrnutý v cene — kryje aktualizácie a technickú podporu. Ak v skúšobnej verzii niečo nefungovalo, napíšte mi skôr, než vyprší; radšej to opravím, než by som o vás kvôli tomu prišiel. Odpovedám osobne.",

    "Your TAGRA TRUCKER trial ends in 5 days": "Skúšobná verzia TAGRA TRUCKER končí o 5 dní",
    "Your licence activates inside the same software — your archived card data stays. €19 a year from year two.":
        "Licenciu aktivujete priamo v programe — zálohované dáta z karty zostanú. Od druhého roka 19 EUR ročne.",
    "Your 30-day TAGRA TRUCKER trial expires in 5 days. The archive you have built up over the past weeks is the thing that covers you at a roadside check — and you keep it. The licence activates inside the same software, so nothing is reinstalled and nothing is re-read. It takes about two minutes:":
        "Vaša 30-dňová skúšobná verzia TAGRA TRUCKER vyprší o 5 dní. Práve záloha, ktorú ste za posledné týždne nazbierali, vás kryje pri cestnej kontrole — a zostane vám. Licenciu aktivujete priamo v programe, takže sa nič nepreinštalováva ani znovu nenačítava. Zaberie to asi dve minúty:",
    "You are already inside the program — no new download and no reinstall.":
        "Ste už vnútri programu — žiadne sťahovanie ani reinštalácia.",
    "Select TAGRA TRUCKER": "Zvoľte TAGRA TRUCKER",
    "The edition for individual drivers — one driver card, full evaluation, archive, work reports and travel allowances.":
        "Verzia pre jednotlivých vodičov — jedna karta vodiča, plné vyhodnotenie, záloha, výkazy práce a cestovné náhrady.",
    "Your licence is activated immediately and your archived card data stays exactly where it is.":
        "Licencia sa aktivuje okamžite a zálohované dáta z karty zostanú presne tam, kde sú.",
    "See TAGRA TRUCKER pricing": "Zobraziť ceny TAGRA TRUCKER",
    "Before it expires — one question": "Skôr než vyprší — jedna otázka",
    "Did anything in the trial not work the way you expected — reading the card, an infringement you disagree with, or the archive? Reply and tell me before it expires. I would rather fix it than have you leave over something that takes me five minutes to solve.":
        "Nefungovalo v skúšobnej verzii niečo tak, ako ste čakali — načítanie karty, priestupok, s ktorým nesúhlasíte, alebo záloha? Napíšte mi to skôr, než vyprší. Radšej to opravím, než by ste odišli kvôli niečomu, čo mi zaberie päť minút.",
    "TAGRA TRUCKER costs &euro;19 excl. VAT per year from the second year — the first year is included in the purchase price, and it covers updates and support. If you still don't have a USB card reader, reply and I will recommend a compatible model; TRUCKER ships with a reader included.":
        "TAGRA TRUCKER stojí od druhého roka 19 EUR bez DPH ročne — prvý rok je zahrnutý v cene a kryje aktualizácie aj technickú podporu. Ak stále nemáte USB čítačku kariet, odpovedzte a odporučím vám kompatibilný model; TRUCKER sa dodáva aj s čítačkou.",
}

# ─────────────────────────────── NĚMČINA ───────────────────────────────
TR["de"] = {
    "30-day trial": "30-Tage-Testversion",
    "5 days left": "noch 5 Tage",
    "Best regards,": "Mit freundlichen Grüßen,",
    "Ivan Szabó – Sales Director, Tachograph Data Specialist – TAGRA":
        "Ivan Szabó – Vertriebsleiter, Spezialist für Tachographendaten – TAGRA",
    "Truck Data Technology s.r.o., U Trati 886/52, 100&nbsp;00 Prague&nbsp;10":
        "Truck Data Technology s.r.o., U Trati 886/52, 100&nbsp;00 Prag&nbsp;10",
    "TAGRA &middot; Truck Data Technology, s.r.o. &middot; Prague, Czech Republic":
        "TAGRA &middot; Truck Data Technology, s.r.o. &middot; Prag, Tschechien",
    "Privacy policy": "Datenschutzerklärung",
    "You are receiving this email because you requested a TAGRA trial at tagra.app. We will only contact you about your trial and related products. If you don't want any more trial help emails, reply &quot;stop&quot;.":
        "Sie erhalten diese E-Mail, weil Sie auf tagra.app eine TAGRA-Testversion angefordert haben. Wir kontaktieren Sie ausschließlich zu Ihrer Testversion und verwandten Produkten. Wenn Sie keine weiteren E-Mails zur Testversion wünschen, antworten Sie mit „stop“.",

    "TAGRA quick start: import your files and run the first report":
        "TAGRA-Schnellstart: Dateien importieren und den ersten Bericht erstellen",
    "Three steps to your first infringement report — and two quick questions so I can recommend the right setup.":
        "Drei Schritte zu Ihrem ersten Verstoßbericht — und zwei kurze Fragen, damit ich Ihnen die passende Lösung empfehlen kann.",
    "Quick start for your fleet": "Schnellstart für Ihren Fuhrpark",
    "Hi {NAME}, how is your trial going?": "Hallo {NAME}, wie läuft Ihre Testversion?",
    "A few days ago you downloaded the TAGRA trial for your fleet — thank you. Most fleet managers start like this (about 10 minutes):":
        "Vor einigen Tagen haben Sie die TAGRA-Testversion für Ihren Fuhrpark heruntergeladen — vielen Dank. Die meisten Fuhrparkleiter starten so (etwa 10 Minuten):",
    "Install and open TAGRA": "TAGRA installieren und öffnen",
    "If the installation did not go smoothly, the guide below covers it step by step.":
        "Falls die Installation nicht reibungslos lief, führt Sie die Anleitung unten Schritt für Schritt durch.",
    "Import a few driver card or vehicle files": "Einige Fahrerkarten- oder Fahrzeugdateien importieren",
    "TAGRA reads the files from your card reader or download key and evaluates them immediately.":
        "TAGRA liest die Dateien von Ihrem Kartenleser oder Download-Key und wertet sie sofort aus.",
    "Run your first infringement report": "Ihren ersten Verstoßbericht erstellen",
    "This is the report inspectors ask for — TAGRA flags any driving time or rest period problems.":
        "Genau diesen Bericht verlangen die Prüfer — TAGRA markiert jedes Problem bei Lenkzeiten und Ruhezeiten.",
    "Open the step-by-step guide": "Schritt-für-Schritt-Anleitung öffnen",
    "Curious what fits your fleet?": "Unsicher, was zu Ihrem Fuhrpark passt?",
    "We have the right solution for you — just reply to these two questions:":
        "Wir haben die passende Lösung für Sie — antworten Sie einfach auf diese zwei Fragen:",
    "How do you download data from your tachographs today — card reader, download key, or not yet solved?":
        "Wie laden Sie heute die Daten aus dem Tachographen herunter — Kartenleser, Download-Key oder noch gar nicht gelöst?",
    "How many vehicles do you manage?": "Wie viele Fahrzeuge verwalten Sie?",
    "I will suggest the right TAGRA edition and compatible hardware, so you don't pay for more than you need. I reply personally. If you manage a larger fleet, I can also arrange a guided setup consultation for you.":
        "Ich empfehle Ihnen die passende TAGRA-Version und kompatible Hardware, damit Sie nicht für mehr zahlen als nötig. Ich antworte persönlich. Bei einem größeren Fuhrpark organisiere ich Ihnen gerne auch eine begleitete Einrichtungsberatung.",

    "Read your driver card in TAGRA — first steps":
        "Fahrerkarte in TAGRA auslesen — die ersten Schritte",
    "Three simple steps to read your driver card — and one quick question about your card reader.":
        "Drei einfache Schritte zum Auslesen Ihrer Fahrerkarte — und eine kurze Frage zu Ihrem Kartenleser.",
    "First steps for drivers": "Erste Schritte für Fahrer",
    "A few days ago you downloaded the TAGRA trial — thank you. As a professional driver, you mainly need two things: to know about any infringements before an inspection finds them, and to keep your card data archived so you are covered at roadside checks. TAGRA also prepares your work reports and travel allowances from the same data. Here is how to get there (5–10 minutes):":
        "Vor einigen Tagen haben Sie die TAGRA-Testversion heruntergeladen — vielen Dank. Als Berufskraftfahrer brauchen Sie vor allem zwei Dinge: von Verstößen zu wissen, bevor eine Kontrolle sie findet, und Ihre Kartendaten archiviert zu haben, damit Sie bei Straßenkontrollen abgesichert sind. Aus denselben Daten erstellt TAGRA auch Ihre Arbeitsnachweise und Spesenabrechnungen. So kommen Sie dorthin (5–10 Minuten):",
    "Connect a USB card reader": "USB-Kartenleser anschließen",
    "Any standard smart card reader works. TAGRA detects it automatically.":
        "Jeder handelsübliche Chipkartenleser funktioniert. TAGRA erkennt ihn automatisch.",
    "Insert your driver card and read it in TAGRA": "Fahrerkarte einstecken und in TAGRA auslesen",
    "TAGRA reads your card in seconds — it evaluates infringements, prepares work reports and travel allowances, and archives everything safely.":
        "TAGRA liest Ihre Karte in Sekunden — wertet Verstöße aus, erstellt Arbeitsnachweise und Spesenabrechnungen und archiviert alles sicher.",
    "One practical question": "Eine praktische Frage",
    "Do you have a USB card reader? Reply to this email with": "Haben Sie einen USB-Kartenleser? Antworten Sie auf diese E-Mail mit",
    "&quot;reader: yes&quot;": "„Leser: ja“",
    "or": "oder",
    "&quot;reader: no&quot;": "„Leser: nein“",
    ". If you don't have one, I will recommend a compatible model — TAGRA TRUCKER ships with a reader included.":
        ". Falls Sie keinen haben, empfehle ich Ihnen ein kompatibles Modell — TAGRA TRUCKER wird inklusive Kartenleser geliefert.",
    "If you have any questions, please reply to this email. I read and answer every one.":
        "Bei Fragen antworten Sie einfach auf diese E-Mail. Ich lese und beantworte jede einzelne.",

    "Your TAGRA trial ends in 5 days — here is how to keep your data":
        "Ihre TAGRA-Testversion endet in 5 Tagen — so behalten Sie Ihre Daten",
    "Your licence activates inside the same software — nothing you imported gets lost. From €79 a year.":
        "Die Lizenz aktivieren Sie direkt in der Software — nichts von Ihren importierten Daten geht verloren. Ab 79 € pro Jahr.",
    "Your trial is ending": "Ihre Testversion endet",
    "{NAME}, your trial ends in 5 days": "{NAME}, Ihre Testversion endet in 5 Tagen",
    "Your 30-day TAGRA trial expires in 5 days. If it has been doing its job, you don't need to reinstall anything or import your files again — the licence activates inside the same software you are already using, and everything you have imported stays where it is. It takes about two minutes:":
        "Ihre 30-tägige TAGRA-Testversion läuft in 5 Tagen ab. Wenn sie ihren Zweck erfüllt hat, müssen Sie nichts neu installieren und keine Dateien erneut importieren — die Lizenz aktivieren Sie direkt in der Software, die Sie bereits nutzen, und alles Importierte bleibt erhalten. Das dauert etwa zwei Minuten:",
    "Open the licence menu in TAGRA": "Lizenzmenü in TAGRA öffnen",
    "You are already inside the program — no new download, no reinstall, no re-import.":
        "Sie sind bereits im Programm — kein Download, keine Neuinstallation, kein erneuter Import.",
    "Choose the edition that matches your fleet": "Version passend zu Ihrem Fuhrpark wählen",
    "TAGRA 1, 2, 4 or 6 by number of vehicles — or MAX for an unlimited fleet. Not sure? Just reply, see below.":
        "TAGRA 1, 2, 4 oder 6 je nach Fahrzeuganzahl — oder MAX für einen unbegrenzten Fuhrpark. Unsicher? Antworten Sie einfach, siehe unten.",
    "Pay by QR code or bank transfer": "Per QR-Code oder Überweisung bezahlen",
    "Your licence is activated immediately and you carry on in the same environment, with all your data.":
        "Ihre Lizenz wird sofort aktiviert und Sie arbeiten in derselben Umgebung weiter — mit allen Ihren Daten.",
    "See editions and pricing": "Versionen und Preise ansehen",
    "Not sure which edition you need?": "Unsicher, welche Version Sie brauchen?",
    "Don't overpay — the edition is set by your number of vehicles. Reply with these two and I will tell you which one to pick:":
        "Zahlen Sie nicht zu viel — die Version richtet sich nach der Fahrzeuganzahl. Antworten Sie auf diese beiden Fragen und ich sage Ihnen, welche Sie wählen sollten:",
    "Is there anything in the trial that did not work the way you expected?":
        "Hat in der Testversion etwas nicht so funktioniert, wie Sie es erwartet haben?",
    "The annual licence fee starts at &euro;79 excl. VAT (TAGRA MAX &euro;139) and the first year is included in the purchase price — it covers updates and support. If something in the trial didn't work, tell me before it expires; I'd rather fix it than lose you over it. I reply personally.":
        "Die jährliche Lizenzgebühr beginnt bei 79 € zzgl. MwSt. (TAGRA MAX 139 €), das erste Jahr ist im Kaufpreis enthalten — sie deckt Updates und Support ab. Wenn in der Testversion etwas nicht funktioniert hat, schreiben Sie mir, bevor sie abläuft; ich behebe es lieber, als Sie deswegen zu verlieren. Ich antworte persönlich.",

    "Your TAGRA TRUCKER trial ends in 5 days": "Ihre TAGRA-TRUCKER-Testversion endet in 5 Tagen",
    "Your licence activates inside the same software — your archived card data stays. €19 a year from year two.":
        "Die Lizenz aktivieren Sie direkt in der Software — Ihre archivierten Kartendaten bleiben erhalten. Ab dem zweiten Jahr 19 € jährlich.",
    "Your 30-day TAGRA TRUCKER trial expires in 5 days. The archive you have built up over the past weeks is the thing that covers you at a roadside check — and you keep it. The licence activates inside the same software, so nothing is reinstalled and nothing is re-read. It takes about two minutes:":
        "Ihre 30-tägige TAGRA-TRUCKER-Testversion läuft in 5 Tagen ab. Genau das Archiv, das Sie in den letzten Wochen aufgebaut haben, sichert Sie bei einer Straßenkontrolle ab — und es bleibt Ihnen erhalten. Die Lizenz aktivieren Sie in derselben Software, es wird also nichts neu installiert und nichts erneut ausgelesen. Das dauert etwa zwei Minuten:",
    "You are already inside the program — no new download and no reinstall.":
        "Sie sind bereits im Programm — kein Download und keine Neuinstallation.",
    "Select TAGRA TRUCKER": "TAGRA TRUCKER auswählen",
    "The edition for individual drivers — one driver card, full evaluation, archive, work reports and travel allowances.":
        "Die Version für einzelne Fahrer — eine Fahrerkarte, vollständige Auswertung, Archiv, Arbeitsnachweise und Spesenabrechnungen.",
    "Your licence is activated immediately and your archived card data stays exactly where it is.":
        "Ihre Lizenz wird sofort aktiviert und Ihre archivierten Kartendaten bleiben genau dort, wo sie sind.",
    "See TAGRA TRUCKER pricing": "Preise für TAGRA TRUCKER ansehen",
    "Before it expires — one question": "Bevor sie abläuft — eine Frage",
    "Did anything in the trial not work the way you expected — reading the card, an infringement you disagree with, or the archive? Reply and tell me before it expires. I would rather fix it than have you leave over something that takes me five minutes to solve.":
        "Hat in der Testversion etwas nicht so funktioniert, wie Sie es erwartet haben — das Auslesen der Karte, ein Verstoß, den Sie anders sehen, oder das Archiv? Schreiben Sie mir, bevor sie abläuft. Ich behebe es lieber, als dass Sie wegen etwas gehen, das mich fünf Minuten kostet.",
    "TAGRA TRUCKER costs &euro;19 excl. VAT per year from the second year — the first year is included in the purchase price, and it covers updates and support. If you still don't have a USB card reader, reply and I will recommend a compatible model; TRUCKER ships with a reader included.":
        "TAGRA TRUCKER kostet ab dem zweiten Jahr 19 € zzgl. MwSt. jährlich — das erste Jahr ist im Kaufpreis enthalten und deckt Updates und Support ab. Falls Sie noch keinen USB-Kartenleser haben, antworten Sie mir und ich empfehle Ihnen ein kompatibles Modell; TRUCKER wird inklusive Kartenleser geliefert.",
}

# ─────────────────────────────── POLŠTINA ──────────────────────────────
TR["pl"] = {
    "30-day trial": "30-dniowa wersja próbna",
    "5 days left": "zostało 5 dni",
    "Best regards,": "Z poważaniem,",
    "Ivan Szabó – Sales Director, Tachograph Data Specialist – TAGRA":
        "Ivan Szabó – dyrektor sprzedaży, specjalista ds. danych z tachografu – TAGRA",
    "Truck Data Technology s.r.o., U Trati 886/52, 100&nbsp;00 Prague&nbsp;10":
        "Truck Data Technology s.r.o., U Trati 886/52, 100&nbsp;00 Praga&nbsp;10",
    "TAGRA &middot; Truck Data Technology, s.r.o. &middot; Prague, Czech Republic":
        "TAGRA &middot; Truck Data Technology, s.r.o. &middot; Praga, Czechy",
    "Privacy policy": "Polityka prywatności",
    "You are receiving this email because you requested a TAGRA trial at tagra.app. We will only contact you about your trial and related products. If you don't want any more trial help emails, reply &quot;stop&quot;.":
        "Otrzymujesz tę wiadomość, ponieważ na tagra.app poprosiłeś o wersję próbną TAGRA. Kontaktujemy się wyłącznie w sprawie wersji próbnej i powiązanych produktów. Jeśli nie chcesz kolejnych wiadomości, odpowiedz „stop”.",

    "TAGRA quick start: import your files and run the first report":
        "Szybki start z TAGRA: zaimportuj pliki i uruchom pierwszy raport",
    "Three steps to your first infringement report — and two quick questions so I can recommend the right setup.":
        "Trzy kroki do pierwszego raportu naruszeń — i dwa krótkie pytania, bym mógł polecić właściwe rozwiązanie.",
    "Quick start for your fleet": "Szybki start dla Twojej floty",
    "Hi {NAME}, how is your trial going?": "Dzień dobry {NAME}, jak idzie wersja próbna?",
    "A few days ago you downloaded the TAGRA trial for your fleet — thank you. Most fleet managers start like this (about 10 minutes):":
        "Kilka dni temu pobrałeś wersję próbną TAGRA dla swojej floty — dziękujemy. Większość zarządzających flotą zaczyna tak (około 10 minut):",
    "Install and open TAGRA": "Zainstaluj i uruchom TAGRA",
    "If the installation did not go smoothly, the guide below covers it step by step.":
        "Jeśli instalacja nie poszła gładko, poniższa instrukcja przeprowadzi Cię krok po kroku.",
    "Import a few driver card or vehicle files": "Zaimportuj kilka plików z karty kierowcy lub z pojazdu",
    "TAGRA reads the files from your card reader or download key and evaluates them immediately.":
        "TAGRA odczyta pliki z czytnika kart lub klucza pobierającego i od razu je przeanalizuje.",
    "Run your first infringement report": "Uruchom pierwszy raport naruszeń",
    "This is the report inspectors ask for — TAGRA flags any driving time or rest period problems.":
        "Właśnie tego raportu żąda kontrola — TAGRA oznaczy każdy problem z czasem jazdy i odpoczynku.",
    "Open the step-by-step guide": "Otwórz instrukcję krok po kroku",
    "Curious what fits your fleet?": "Nie wiesz, co pasuje do Twojej floty?",
    "We have the right solution for you — just reply to these two questions:":
        "Mamy dla Ciebie właściwe rozwiązanie — wystarczy odpowiedzieć na dwa pytania:",
    "How do you download data from your tachographs today — card reader, download key, or not yet solved?":
        "Jak dziś pobierasz dane z tachografu — czytnikiem kart, kluczem pobierającym, czy nie masz tego jeszcze rozwiązanego?",
    "How many vehicles do you manage?": "Iloma pojazdami zarządzasz?",
    "I will suggest the right TAGRA edition and compatible hardware, so you don't pay for more than you need. I reply personally. If you manage a larger fleet, I can also arrange a guided setup consultation for you.":
        "Polecę Ci właściwą wersję TAGRA i kompatybilny sprzęt, żebyś nie płacił za więcej, niż potrzebujesz. Odpowiadam osobiście. Przy większej flocie chętnie zorganizuję też konsultację wdrożeniową.",

    "Read your driver card in TAGRA — first steps":
        "Odczytaj kartę kierowcy w TAGRA — pierwsze kroki",
    "Three simple steps to read your driver card — and one quick question about your card reader.":
        "Trzy proste kroki do odczytania karty kierowcy — i jedno krótkie pytanie o czytnik.",
    "First steps for drivers": "Pierwsze kroki dla kierowców",
    "A few days ago you downloaded the TAGRA trial — thank you. As a professional driver, you mainly need two things: to know about any infringements before an inspection finds them, and to keep your card data archived so you are covered at roadside checks. TAGRA also prepares your work reports and travel allowances from the same data. Here is how to get there (5–10 minutes):":
        "Kilka dni temu pobrałeś wersję próbną TAGRA — dziękujemy. Jako zawodowy kierowca potrzebujesz przede wszystkim dwóch rzeczy: wiedzieć o naruszeniach, zanim znajdzie je kontrola, i mieć zarchiwizowane dane z karty, żeby być zabezpieczonym podczas kontroli drogowej. Z tych samych danych TAGRA przygotuje też ewidencję czasu pracy i rozliczenie delegacji. Oto jak do tego dojść (5–10 minut):",
    "Connect a USB card reader": "Podłącz czytnik kart USB",
    "Any standard smart card reader works. TAGRA detects it automatically.":
        "Działa każdy standardowy czytnik kart chipowych. TAGRA wykryje go automatycznie.",
    "Insert your driver card and read it in TAGRA": "Włóż kartę kierowcy i odczytaj ją w TAGRA",
    "TAGRA reads your card in seconds — it evaluates infringements, prepares work reports and travel allowances, and archives everything safely.":
        "TAGRA odczyta kartę w kilka sekund — przeanalizuje naruszenia, przygotuje ewidencję czasu pracy i rozliczenie delegacji oraz wszystko bezpiecznie zarchiwizuje.",
    "One practical question": "Jedno praktyczne pytanie",
    "Do you have a USB card reader? Reply to this email with": "Masz czytnik kart USB? Odpowiedz na tę wiadomość słowem",
    "&quot;reader: yes&quot;": "„czytnik: tak”",
    "or": "lub",
    "&quot;reader: no&quot;": "„czytnik: nie”",
    ". If you don't have one, I will recommend a compatible model — TAGRA TRUCKER ships with a reader included.":
        ". Jeśli go nie masz, polecę kompatybilny model — TAGRA TRUCKER jest dostarczana razem z czytnikiem.",
    "If you have any questions, please reply to this email. I read and answer every one.":
        "Jeśli masz jakiekolwiek pytania, odpowiedz na tę wiadomość. Czytam je i odpowiadam na każde.",

    "Your TAGRA trial ends in 5 days — here is how to keep your data":
        "Wersja próbna TAGRA kończy się za 5 dni — nie stracisz danych",
    "Your licence activates inside the same software — nothing you imported gets lost. From €79 a year.":
        "Licencję aktywujesz w tym samym programie — nic z zaimportowanych danych nie przepadnie. Od 79 € rocznie.",
    "Your trial is ending": "Wersja próbna się kończy",
    "{NAME}, your trial ends in 5 days": "{NAME}, wersja próbna kończy się za 5 dni",
    "Your 30-day TAGRA trial expires in 5 days. If it has been doing its job, you don't need to reinstall anything or import your files again — the licence activates inside the same software you are already using, and everything you have imported stays where it is. It takes about two minutes:":
        "Twoja 30-dniowa wersja próbna TAGRA wygasa za 5 dni. Jeśli spełniła swoje zadanie, nie musisz niczego instalować od nowa ani ponownie importować plików — licencję aktywujesz w tym samym programie, którego już używasz, a wszystkie zaimportowane dane zostają na swoim miejscu. Zajmie to około dwóch minut:",
    "Open the licence menu in TAGRA": "Otwórz menu licencji w TAGRA",
    "You are already inside the program — no new download, no reinstall, no re-import.":
        "Jesteś już w programie — bez pobierania, bez ponownej instalacji, bez ponownego importu.",
    "Choose the edition that matches your fleet": "Wybierz wersję odpowiadającą Twojej flocie",
    "TAGRA 1, 2, 4 or 6 by number of vehicles — or MAX for an unlimited fleet. Not sure? Just reply, see below.":
        "TAGRA 1, 2, 4 lub 6 według liczby pojazdów — albo MAX dla nieograniczonej floty. Nie wiesz? Wystarczy odpowiedzieć, patrz niżej.",
    "Pay by QR code or bank transfer": "Zapłać kodem QR lub przelewem",
    "Your licence is activated immediately and you carry on in the same environment, with all your data.":
        "Licencja aktywuje się natychmiast, a Ty pracujesz dalej w tym samym środowisku, ze wszystkimi swoimi danymi.",
    "See editions and pricing": "Zobacz wersje i ceny",
    "Not sure which edition you need?": "Nie wiesz, której wersji potrzebujesz?",
    "Don't overpay — the edition is set by your number of vehicles. Reply with these two and I will tell you which one to pick:":
        "Nie przepłacaj — wersję wyznacza liczba pojazdów. Odpowiedz na te dwa pytania, a powiem Ci, którą wybrać:",
    "Is there anything in the trial that did not work the way you expected?":
        "Czy coś w wersji próbnej nie zadziałało tak, jak oczekiwałeś?",
    "The annual licence fee starts at &euro;79 excl. VAT (TAGRA MAX &euro;139) and the first year is included in the purchase price — it covers updates and support. If something in the trial didn't work, tell me before it expires; I'd rather fix it than lose you over it. I reply personally.":
        "Roczna opłata licencyjna zaczyna się od 79 € netto (TAGRA MAX 139 €), a pierwszy rok jest wliczony w cenę zakupu — obejmuje aktualizacje i wsparcie techniczne. Jeśli coś w wersji próbnej nie działało, napisz do mnie, zanim wygaśnie; wolę to naprawić, niż stracić Cię z tego powodu. Odpowiadam osobiście.",

    "Your TAGRA TRUCKER trial ends in 5 days": "Wersja próbna TAGRA TRUCKER kończy się za 5 dni",
    "Your licence activates inside the same software — your archived card data stays. €19 a year from year two.":
        "Licencję aktywujesz w tym samym programie — zarchiwizowane dane z karty zostają. Od drugiego roku 19 € rocznie.",
    "Your 30-day TAGRA TRUCKER trial expires in 5 days. The archive you have built up over the past weeks is the thing that covers you at a roadside check — and you keep it. The licence activates inside the same software, so nothing is reinstalled and nothing is re-read. It takes about two minutes:":
        "Twoja 30-dniowa wersja próbna TAGRA TRUCKER wygasa za 5 dni. To właśnie archiwum, które zbudowałeś przez ostatnie tygodnie, zabezpiecza Cię podczas kontroli drogowej — i zostaje przy Tobie. Licencję aktywujesz w tym samym programie, więc nic nie jest instalowane od nowa ani ponownie odczytywane. Zajmie to około dwóch minut:",
    "You are already inside the program — no new download and no reinstall.":
        "Jesteś już w programie — bez pobierania i bez ponownej instalacji.",
    "Select TAGRA TRUCKER": "Wybierz TAGRA TRUCKER",
    "The edition for individual drivers — one driver card, full evaluation, archive, work reports and travel allowances.":
        "Wersja dla pojedynczych kierowców — jedna karta kierowcy, pełna analiza, archiwum, ewidencja czasu pracy i rozliczenie delegacji.",
    "Your licence is activated immediately and your archived card data stays exactly where it is.":
        "Licencja aktywuje się natychmiast, a zarchiwizowane dane z karty zostają dokładnie tam, gdzie są.",
    "See TAGRA TRUCKER pricing": "Zobacz ceny TAGRA TRUCKER",
    "Before it expires — one question": "Zanim wygaśnie — jedno pytanie",
    "Did anything in the trial not work the way you expected — reading the card, an infringement you disagree with, or the archive? Reply and tell me before it expires. I would rather fix it than have you leave over something that takes me five minutes to solve.":
        "Czy coś w wersji próbnej nie zadziałało tak, jak oczekiwałeś — odczyt karty, naruszenie, z którym się nie zgadzasz, albo archiwum? Napisz do mnie, zanim wygaśnie. Wolę to naprawić, niż stracić Cię przez coś, co zajmie mi pięć minut.",
    "TAGRA TRUCKER costs &euro;19 excl. VAT per year from the second year — the first year is included in the purchase price, and it covers updates and support. If you still don't have a USB card reader, reply and I will recommend a compatible model; TRUCKER ships with a reader included.":
        "TAGRA TRUCKER kosztuje od drugiego roku 19 € netto rocznie — pierwszy rok jest wliczony w cenę zakupu i obejmuje aktualizacje oraz wsparcie techniczne. Jeśli wciąż nie masz czytnika kart USB, odpowiedz, a polecę kompatybilny model; TRUCKER jest dostarczana razem z czytnikiem.",
}

# ─────────────────────────────── ŘEČTINA ───────────────────────────────
TR["gr"] = {
    "30-day trial": "Δοκιμαστική έκδοση 30 ημερών",
    "5 days left": "απομένουν 5 ημέρες",
    "Best regards,": "Με εκτίμηση,",
    "Ivan Szabó – Sales Director, Tachograph Data Specialist – TAGRA":
        "Ivan Szabó – Διευθυντής Πωλήσεων, Ειδικός Δεδομένων Ταχογράφου – TAGRA",
    "Truck Data Technology s.r.o., U Trati 886/52, 100&nbsp;00 Prague&nbsp;10":
        "Truck Data Technology s.r.o., U Trati 886/52, 100&nbsp;00 Πράγα&nbsp;10",
    "TAGRA &middot; Truck Data Technology, s.r.o. &middot; Prague, Czech Republic":
        "TAGRA &middot; Truck Data Technology, s.r.o. &middot; Πράγα, Τσεχία",
    "Privacy policy": "Πολιτική απορρήτου",
    "You are receiving this email because you requested a TAGRA trial at tagra.app. We will only contact you about your trial and related products. If you don't want any more trial help emails, reply &quot;stop&quot;.":
        "Λαμβάνετε αυτό το email επειδή ζητήσατε δοκιμαστική έκδοση TAGRA στο tagra.app. Θα επικοινωνήσουμε μαζί σας μόνο για τη δοκιμαστική σας έκδοση και σχετικά προϊόντα. Αν δεν θέλετε άλλα email, απαντήστε «stop».",

    "TAGRA quick start: import your files and run the first report":
        "Γρήγορη εκκίνηση TAGRA: εισαγάγετε τα αρχεία σας και δημιουργήστε την πρώτη αναφορά",
    "Three steps to your first infringement report — and two quick questions so I can recommend the right setup.":
        "Τρία βήματα για την πρώτη σας αναφορά παραβάσεων — και δύο γρήγορες ερωτήσεις για να σας προτείνω τη σωστή λύση.",
    "Quick start for your fleet": "Γρήγορη εκκίνηση για τον στόλο σας",
    "Hi {NAME}, how is your trial going?": "Γεια σας {NAME}, πώς πάει η δοκιμαστική σας έκδοση;",
    "A few days ago you downloaded the TAGRA trial for your fleet — thank you. Most fleet managers start like this (about 10 minutes):":
        "Πριν από λίγες ημέρες κατεβάσατε τη δοκιμαστική έκδοση TAGRA για τον στόλο σας — σας ευχαριστούμε. Οι περισσότεροι διαχειριστές στόλου ξεκινούν έτσι (περίπου 10 λεπτά):",
    "Install and open TAGRA": "Εγκαταστήστε και ανοίξτε το TAGRA",
    "If the installation did not go smoothly, the guide below covers it step by step.":
        "Αν η εγκατάσταση δεν πήγε ομαλά, ο παρακάτω οδηγός σας καθοδηγεί βήμα προς βήμα.",
    "Import a few driver card or vehicle files": "Εισαγάγετε μερικά αρχεία κάρτας οδηγού ή οχήματος",
    "TAGRA reads the files from your card reader or download key and evaluates them immediately.":
        "Το TAGRA διαβάζει τα αρχεία από τον αναγνώστη καρτών ή το κλειδί λήψης και τα αξιολογεί αμέσως.",
    "Run your first infringement report": "Δημιουργήστε την πρώτη σας αναφορά παραβάσεων",
    "This is the report inspectors ask for — TAGRA flags any driving time or rest period problems.":
        "Ακριβώς αυτή την αναφορά ζητούν οι ελεγκτές — το TAGRA επισημαίνει κάθε πρόβλημα με τον χρόνο οδήγησης ή τις περιόδους ανάπαυσης.",
    "Open the step-by-step guide": "Άνοιγμα του αναλυτικού οδηγού",
    "Curious what fits your fleet?": "Δεν είστε σίγουροι τι ταιριάζει στον στόλο σας;",
    "We have the right solution for you — just reply to these two questions:":
        "Έχουμε τη σωστή λύση για εσάς — απλώς απαντήστε σε δύο ερωτήσεις:",
    "How do you download data from your tachographs today — card reader, download key, or not yet solved?":
        "Πώς κατεβάζετε σήμερα τα δεδομένα από τον ταχογράφο — με αναγνώστη καρτών, με κλειδί λήψης ή δεν το έχετε λύσει ακόμη;",
    "How many vehicles do you manage?": "Πόσα οχήματα διαχειρίζεστε;",
    "I will suggest the right TAGRA edition and compatible hardware, so you don't pay for more than you need. I reply personally. If you manage a larger fleet, I can also arrange a guided setup consultation for you.":
        "Θα σας προτείνω τη σωστή έκδοση TAGRA και συμβατό εξοπλισμό, ώστε να μην πληρώνετε περισσότερα από όσα χρειάζεστε. Απαντώ προσωπικά. Για μεγαλύτερο στόλο μπορώ να κανονίσω και καθοδηγούμενη συμβουλευτική εγκατάστασης.",

    "Read your driver card in TAGRA — first steps":
        "Διαβάστε την κάρτα οδηγού στο TAGRA — πρώτα βήματα",
    "Three simple steps to read your driver card — and one quick question about your card reader.":
        "Τρία απλά βήματα για να διαβάσετε την κάρτα οδηγού — και μία γρήγορη ερώτηση για τον αναγνώστη καρτών.",
    "First steps for drivers": "Πρώτα βήματα για οδηγούς",
    "A few days ago you downloaded the TAGRA trial — thank you. As a professional driver, you mainly need two things: to know about any infringements before an inspection finds them, and to keep your card data archived so you are covered at roadside checks. TAGRA also prepares your work reports and travel allowances from the same data. Here is how to get there (5–10 minutes):":
        "Πριν από λίγες ημέρες κατεβάσατε τη δοκιμαστική έκδοση TAGRA — σας ευχαριστούμε. Ως επαγγελματίας οδηγός χρειάζεστε κυρίως δύο πράγματα: να γνωρίζετε τις παραβάσεις πριν τις εντοπίσει ο έλεγχος και να έχετε αρχειοθετημένα τα δεδομένα της κάρτας σας ώστε να είστε καλυμμένοι στους οδικούς ελέγχους. Από τα ίδια δεδομένα το TAGRA ετοιμάζει και τις αναφορές εργασίας και τα οδοιπορικά σας. Δείτε πώς (5–10 λεπτά):",
    "Connect a USB card reader": "Συνδέστε έναν αναγνώστη καρτών USB",
    "Any standard smart card reader works. TAGRA detects it automatically.":
        "Λειτουργεί κάθε τυπικός αναγνώστης έξυπνων καρτών. Το TAGRA τον εντοπίζει αυτόματα.",
    "Insert your driver card and read it in TAGRA": "Εισαγάγετε την κάρτα οδηγού και διαβάστε την στο TAGRA",
    "TAGRA reads your card in seconds — it evaluates infringements, prepares work reports and travel allowances, and archives everything safely.":
        "Το TAGRA διαβάζει την κάρτα σας σε δευτερόλεπτα — αξιολογεί παραβάσεις, ετοιμάζει αναφορές εργασίας και οδοιπορικά και αρχειοθετεί τα πάντα με ασφάλεια.",
    "One practical question": "Μία πρακτική ερώτηση",
    "Do you have a USB card reader? Reply to this email with": "Έχετε αναγνώστη καρτών USB; Απαντήστε σε αυτό το email με",
    "&quot;reader: yes&quot;": "«αναγνώστης: ναι»",
    "or": "ή",
    "&quot;reader: no&quot;": "«αναγνώστης: όχι»",
    ". If you don't have one, I will recommend a compatible model — TAGRA TRUCKER ships with a reader included.":
        ". Αν δεν έχετε, θα σας προτείνω ένα συμβατό μοντέλο — το TAGRA TRUCKER παραδίδεται μαζί με αναγνώστη.",
    "If you have any questions, please reply to this email. I read and answer every one.":
        "Αν έχετε οποιαδήποτε ερώτηση, απαντήστε σε αυτό το email. Τα διαβάζω και απαντώ σε όλα.",

    "Your TAGRA trial ends in 5 days — here is how to keep your data":
        "Η δοκιμαστική έκδοση TAGRA λήγει σε 5 ημέρες — δεν θα χάσετε τα δεδομένα σας",
    "Your licence activates inside the same software — nothing you imported gets lost. From €79 a year.":
        "Η άδεια ενεργοποιείται μέσα στο ίδιο πρόγραμμα — τίποτα από όσα εισαγάγατε δεν χάνεται. Από 79 € τον χρόνο.",
    "Your trial is ending": "Η δοκιμαστική σας έκδοση λήγει",
    "{NAME}, your trial ends in 5 days": "{NAME}, η δοκιμαστική σας έκδοση λήγει σε 5 ημέρες",
    "Your 30-day TAGRA trial expires in 5 days. If it has been doing its job, you don't need to reinstall anything or import your files again — the licence activates inside the same software you are already using, and everything you have imported stays where it is. It takes about two minutes:":
        "Η 30ήμερη δοκιμαστική σας έκδοση TAGRA λήγει σε 5 ημέρες. Αν σας εξυπηρέτησε, δεν χρειάζεται να εγκαταστήσετε ξανά τίποτα ούτε να εισαγάγετε ξανά τα αρχεία σας — η άδεια ενεργοποιείται μέσα στο ίδιο πρόγραμμα που ήδη χρησιμοποιείτε και όλα όσα εισαγάγατε παραμένουν στη θέση τους. Χρειάζονται περίπου δύο λεπτά:",
    "Open the licence menu in TAGRA": "Ανοίξτε το μενού αδειών στο TAGRA",
    "You are already inside the program — no new download, no reinstall, no re-import.":
        "Είστε ήδη μέσα στο πρόγραμμα — καμία λήψη, καμία επανεγκατάσταση, καμία νέα εισαγωγή.",
    "Choose the edition that matches your fleet": "Επιλέξτε την έκδοση που ταιριάζει στον στόλο σας",
    "TAGRA 1, 2, 4 or 6 by number of vehicles — or MAX for an unlimited fleet. Not sure? Just reply, see below.":
        "TAGRA 1, 2, 4 ή 6 ανάλογα με τον αριθμό οχημάτων — ή MAX για απεριόριστο στόλο. Δεν είστε σίγουροι; Απλώς απαντήστε, δείτε παρακάτω.",
    "Pay by QR code or bank transfer": "Πληρώστε με κωδικό QR ή τραπεζικό έμβασμα",
    "Your licence is activated immediately and you carry on in the same environment, with all your data.":
        "Η άδειά σας ενεργοποιείται αμέσως και συνεχίζετε στο ίδιο περιβάλλον, με όλα τα δεδομένα σας.",
    "See editions and pricing": "Δείτε εκδόσεις και τιμές",
    "Not sure which edition you need?": "Δεν είστε σίγουροι ποια έκδοση χρειάζεστε;",
    "Don't overpay — the edition is set by your number of vehicles. Reply with these two and I will tell you which one to pick:":
        "Μην πληρώσετε παραπάνω — την έκδοση την καθορίζει ο αριθμός των οχημάτων. Απαντήστε σε αυτά τα δύο και θα σας πω ποια να επιλέξετε:",
    "Is there anything in the trial that did not work the way you expected?":
        "Υπήρξε κάτι στη δοκιμαστική έκδοση που δεν λειτούργησε όπως περιμένατε;",
    "The annual licence fee starts at &euro;79 excl. VAT (TAGRA MAX &euro;139) and the first year is included in the purchase price — it covers updates and support. If something in the trial didn't work, tell me before it expires; I'd rather fix it than lose you over it. I reply personally.":
        "Η ετήσια άδεια ξεκινά από 79 € χωρίς ΦΠΑ (TAGRA MAX 139 €) και ο πρώτος χρόνος περιλαμβάνεται στην τιμή αγοράς — καλύπτει ενημερώσεις και τεχνική υποστήριξη. Αν κάτι στη δοκιμαστική έκδοση δεν λειτούργησε, πείτε μου πριν λήξει· προτιμώ να το διορθώσω παρά να σας χάσω γι' αυτό. Απαντώ προσωπικά.",

    "Your TAGRA TRUCKER trial ends in 5 days": "Η δοκιμαστική έκδοση TAGRA TRUCKER λήγει σε 5 ημέρες",
    "Your licence activates inside the same software — your archived card data stays. €19 a year from year two.":
        "Η άδεια ενεργοποιείται μέσα στο ίδιο πρόγραμμα — τα αρχειοθετημένα δεδομένα της κάρτας σας παραμένουν. Από τον δεύτερο χρόνο 19 € ετησίως.",
    "Your 30-day TAGRA TRUCKER trial expires in 5 days. The archive you have built up over the past weeks is the thing that covers you at a roadside check — and you keep it. The licence activates inside the same software, so nothing is reinstalled and nothing is re-read. It takes about two minutes:":
        "Η 30ήμερη δοκιμαστική σας έκδοση TAGRA TRUCKER λήγει σε 5 ημέρες. Ακριβώς το αρχείο που χτίσατε τις τελευταίες εβδομάδες είναι αυτό που σας καλύπτει σε έναν οδικό έλεγχο — και σας μένει. Η άδεια ενεργοποιείται μέσα στο ίδιο πρόγραμμα, οπότε τίποτα δεν εγκαθίσταται ξανά και τίποτα δεν διαβάζεται ξανά. Χρειάζονται περίπου δύο λεπτά:",
    "You are already inside the program — no new download and no reinstall.":
        "Είστε ήδη μέσα στο πρόγραμμα — καμία λήψη και καμία επανεγκατάσταση.",
    "Select TAGRA TRUCKER": "Επιλέξτε TAGRA TRUCKER",
    "The edition for individual drivers — one driver card, full evaluation, archive, work reports and travel allowances.":
        "Η έκδοση για μεμονωμένους οδηγούς — μία κάρτα οδηγού, πλήρης αξιολόγηση, αρχειοθέτηση, αναφορές εργασίας και οδοιπορικά.",
    "Your licence is activated immediately and your archived card data stays exactly where it is.":
        "Η άδειά σας ενεργοποιείται αμέσως και τα αρχειοθετημένα δεδομένα της κάρτας σας παραμένουν ακριβώς εκεί που είναι.",
    "See TAGRA TRUCKER pricing": "Δείτε τις τιμές του TAGRA TRUCKER",
    "Before it expires — one question": "Πριν λήξει — μία ερώτηση",
    "Did anything in the trial not work the way you expected — reading the card, an infringement you disagree with, or the archive? Reply and tell me before it expires. I would rather fix it than have you leave over something that takes me five minutes to solve.":
        "Υπήρξε κάτι στη δοκιμαστική έκδοση που δεν λειτούργησε όπως περιμένατε — η ανάγνωση της κάρτας, μια παράβαση με την οποία διαφωνείτε ή η αρχειοθέτηση; Πείτε μου πριν λήξει. Προτιμώ να το διορθώσω παρά να φύγετε για κάτι που μου παίρνει πέντε λεπτά.",
    "TAGRA TRUCKER costs &euro;19 excl. VAT per year from the second year — the first year is included in the purchase price, and it covers updates and support. If you still don't have a USB card reader, reply and I will recommend a compatible model; TRUCKER ships with a reader included.":
        "Το TAGRA TRUCKER κοστίζει από τον δεύτερο χρόνο 19 € χωρίς ΦΠΑ ετησίως — ο πρώτος χρόνος περιλαμβάνεται στην τιμή αγοράς και καλύπτει ενημερώσεις και υποστήριξη. Αν εξακολουθείτε να μην έχετε αναγνώστη καρτών USB, απαντήστε και θα σας προτείνω ένα συμβατό μοντέλο· το TRUCKER παραδίδεται μαζί με αναγνώστη.",
}

# ═══════════════════════════════════════════════════════════════════════
# APLIKACE
# ═══════════════════════════════════════════════════════════════════════
SKIP = re.compile(r'^[\s|·—-]*$')
CZECHISMS = {"ř", "ě", "ů", "Ř", "Ě", "Ů"}
LANG_ATTR = {"cz": "cs", "sk": "sk", "de": "de", "pl": "pl", "gr": "el"}


def translate(html, table, lang):
    """Nahradí textové uzly, <title> a alt="" podle slovníku."""
    missed = []

    def node(m):
        raw = m.group(1)
        key = re.sub(r'\s+', ' ', raw.strip())
        if not key or SKIP.match(key) or key.startswith('&nbsp'):
            return m.group(0)
        if key in table:
            return '>' + raw.replace(key, table[key], 1) + '<' if raw.strip() == key else '>' + table[key] + '<'
        missed.append(key)
        return m.group(0)

    # <title>
    def title(m):
        key = m.group(1).strip()
        return f"<title>{table[key]}</title>" if key in table else m.group(0)

    html = re.sub(r'<title>(.*?)</title>', title, html, flags=re.S)

    # textové uzly — mimo <script>/<style>
    parts = re.split(r'(<(?:script|style)[^>]*>.*?</(?:script|style)>)', html, flags=re.S)
    for i in range(0, len(parts), 2):
        parts[i] = re.sub(r'>([^<>]+)<', node, parts[i])
    html = "".join(parts)

    # alt=""
    for en, tr in table.items():
        html = html.replace(f'alt="{en}"', f'alt="{tr}"')

    # odkazy
    for en, tr in LINKS[lang].items():
        html = html.replace(en, tr)

    # lang atribut
    html = re.sub(r'<html([^>]*)\slang="en"', rf'<html\1 lang="{LANG_ATTR[lang]}"', html)

    return html, missed


def sk_gate(text, label):
    """SK nesmí obsahovat ř / ě / ů (kontrola po codepointech, ne regexem)."""
    body = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', text, flags=re.S)
    visible = " ".join(re.findall(r'>([^<>]+)<', body))
    bad = sorted({c for c in visible if c in CZECHISMS})
    if bad:
        names = ", ".join(f"{c} ({unicodedata.name(c)})" for c in bad)
        sys.exit(f"  ✗ SK GATE {label}: nalezeny české znaky → {names}")
    return True


if __name__ == "__main__":
    print("Překládám mail #2 + #3 do cz / sk / de / pl / gr:\n")
    total, problems = 0, []

    for lang in LANGS:
        for mail in ["email2", "email3"]:
            for aud in ["fleet", "driver"]:
                src = TPL / f"{mail}-{aud}-en.html"
                dst = TPL / f"{mail}-{aud}-{lang}.html"
                out, missed = translate(src.read_text(encoding="utf-8"), TR[lang], lang)

                if lang == "sk":
                    sk_gate(out, dst.name)

                dst.write_text(out, encoding="utf-8")
                total += 1

                vals = set(TR[lang].values())
                real = [m for m in missed if m not in vals and m not in
                        ("TAGRA", "1", "2", "3", "1.", "2.", "Facebook", "LinkedIn",
                         "Instagram", "YouTube", "tagra.app", "sales@tagra.app", "&middot;")
                        and not m.startswith("+4") and "27381269" not in m]
                if real:
                    problems.append((dst.name, real))

    print(f"  ✓ vygenerováno {total} šablon")
    print(f"  ✓ SK gate čistý (žádné ř/ě/ů)")

    if problems:
        print("\n  ⚠ nepřeložené segmenty:")
        for name, segs in problems:
            print(f"    {name}:")
            for s in segs[:4]:
                print(f"      • {s[:90]}")
    else:
        print("  ✓ všechny obsahové segmenty přeloženy")
