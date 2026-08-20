# -*- coding: utf-8 -*-
"""Vygeneruje HU šablony z EN předloh: nahradí textové uzly, lokalizuje odkazy.

Jednorázový generátor k issue truckmall-ops#41. Spustit z try/email-preview/:
    python3 build_hu_emails.py
Po vygenerování a kontrole tento soubor z repa smazat.

Překlad prošel kontrolou crew (GPT + Gemini + Mistral, 20. 8. 2026);
implementována shoda 2:1 / 3:0 — viz CREW_FIX.
"""
import re, html, sys, io

COMMON = {
    "TAGRA · Truck Data Technology, s.r.o. · Prague, Czech Republic":
        "TAGRA · Truck Data Technology, s.r.o. · Prága, Csehország",
    "Privacy policy": "Adatvédelmi tájékoztató",
    "Privacy": "Adatvédelem",
    "You received this email because you requested a TAGRA trial at tagra.app. We will only contact you about your trial and related products.":
        "Azért kapta ezt az e-mailt, mert próbaverziót igényelt a tagra.app oldalon. Kizárólag a próbaverzióval és a kapcsolódó termékekkel kapcsolatban keressük meg Önt.",
    "You are receiving this email because you requested a TAGRA trial at tagra.app. We will only contact you about your trial and related products. If you don't want any more trial help emails, reply \"stop\".":
        "Azért kapta ezt az e-mailt, mert próbaverziót igényelt a tagra.app oldalon. Kizárólag a próbaverzióval és a kapcsolódó termékekkel kapcsolatban keressük meg Önt. Ha nem kér több segítő e-mailt a próbaverzióhoz, válaszoljon a „stop” szóval.",
    "Best regards,": "Üdvözlettel,",
    "30-Day Free Trial": "30 napos ingyenes próbaverzió",
    "30-day trial": "30 napos próbaverzió",
    "Next steps": "Következő lépések",
    "Truck Data Technology s.r.o., U Trati 886/52, 100 00 Prague 10":
        "Truck Data Technology s.r.o., U Trati 886/52, 100 00 Prága 10",
    "Open the step-by-step guide": "Lépésről lépésre útmutató megnyitása",
    "Install and open TAGRA": "Telepítse és indítsa el a TAGRA-t",
    "If the installation did not go smoothly, the guide below covers it step by step.":
        "Ha a telepítés nem ment simán, az alábbi útmutató lépésről lépésre végigvezeti.",
    "1.": "1.",
    "2.": "2.",
}

FILES = {
# ─────────────────────────── #1 UVÍTACÍ ───────────────────────────
"en-fleet.html": ("hu-fleet.html", {
 "Your TAGRA trial is ready — Download inside":
   "A TAGRA próbaverziója készen áll — a letöltési link belül",
 "Your 30-day TAGRA trial is ready to install. Download link inside, plus next steps.":
   "A 30 napos TAGRA próbaverzió telepítésre kész. A letöltési link és a következő lépések belül.",
 "Your trial is ready": "A próbaverziója készen áll",
 "Welcome to TAGRA, {NAME}": "Üdvözöljük a TAGRA-nál, {NAME}!",
 "Your 30-day TAGRA trial is ready. Click the button below to download the installer for Windows. Full functionality, no credit card required.":
   "A 30 napos TAGRA próbaverziója készen áll. Az alábbi gombra kattintva letöltheti a Windows telepítőt. Teljes funkcionalitás, bankkártya nélkül.",
 "Download TAGRA (Windows, 156 MB)": "TAGRA letöltése (Windows, 156 MB)",
 "ZIP archive containing the installer. Compatible with Windows 10 and 11.":
   "ZIP archívum a telepítővel. Windows 10 és 11 rendszerrel kompatibilis.",
 "Install TAGRA": "Telepítse a TAGRA-t",
 "Unzip the file and run the installer. Follow the on-screen instructions — installation takes about 2 minutes.":
   "Csomagolja ki a fájlt, és futtassa a telepítőt. Kövesse a képernyőn megjelenő utasításokat — a telepítés körülbelül 2 percet vesz igénybe.",
 "Activate trial": "Aktiválja a próbaverziót",
 "Open TAGRA and choose \"30-day trial\". No license key required. All features are unlocked.":
   "Indítsa el a TAGRA-t, és válassza a „30 napos próbaverzió” lehetőséget. Licenckulcs nem szükséges, minden funkció elérhető.",
 "Connect your data": "Töltse be az adatait",
 "Import your first driver card or tachograph download. TAGRA evaluates it instantly and flags any compliance issues.":
   "Importálja az első sofőrkártya- vagy tachográf-letöltését. A TAGRA azonnal kiértékeli, és jelzi a szabálysértéseket.",
 "Why this matters": "Miért fontos ez?",
 "EU Regulation 165/2014 places the duty to download tachograph data on the transport undertaking — at least every 28 days for driver cards and every 90 days for vehicle units (Reg 581/2010). TAGRA automates this and keeps you compliant.":
   "Az (EU) 165/2014 rendelet a tachográfadatok letöltésének kötelezettségét a fuvarozó vállalkozásra rója — a sofőrkártyáról legalább 28 naponta, a jármű egységéből legalább 90 naponta (581/2010/EU rendelet). A TAGRA ezt automatizálja, így Ön megfelel az előírásoknak.",
 "Need help?": "Segítségre van szüksége?",
 "Reply to this email or contact us at sales@tagra.app / +420 274 777 390. Our team responds within hours during business days.":
   "Válaszoljon erre az e-mailre, vagy forduljon közvetlenül hivatalos magyarországi forgalmazónkhoz: Rukon Kft., Varga Katalin, +36 30 474 2540, rukon@rukon.hu. Munkanapokon néhány órán belül válaszolunk.",
}),

"en-driver.html": ("hu-driver.html", {
 "Your TAGRA TRUCKER trial is ready — Download inside":
   "A TAGRA TRUCKER próbaverziója készen áll — a letöltési link belül",
 "Your TAGRA TRUCKER trial is ready. Download link inside, plus your next steps.":
   "A TAGRA TRUCKER próbaverziója készen áll. A letöltési link és a következő lépések belül.",
 "Your trial is ready": "A próbaverziója készen áll",
 "Welcome to TAGRA TRUCKER, {NAME}": "Üdvözöljük a TAGRA TRUCKER-nél, {NAME}!",
 "Your 30-day TAGRA TRUCKER trial is ready. Click the button below to download the installer for Windows. Full functionality, no credit card required.":
   "A 30 napos TAGRA TRUCKER próbaverziója készen áll. Az alábbi gombra kattintva letöltheti a Windows telepítőt. Teljes funkcionalitás, bankkártya nélkül.",
 "Download TAGRA TRUCKER (Windows, 153 MB)": "TAGRA TRUCKER letöltése (Windows, 153 MB)",
 "ZIP archive containing the installer. Compatible with Windows 10 and 11. You will need a standard USB card reader.":
   "ZIP archívum a telepítővel. Windows 10 és 11 rendszerrel kompatibilis. Szüksége lesz egy szokványos USB-s kártyaolvasóra.",
 "Install TAGRA TRUCKER": "Telepítse a TAGRA TRUCKER-t",
 "Unzip the file and run the installer. Follow the on-screen instructions — installation takes about 2 minutes.":
   "Csomagolja ki a fájlt, és futtassa a telepítőt. Kövesse a képernyőn megjelenő utasításokat — a telepítés körülbelül 2 percet vesz igénybe.",
 "Activate trial": "Aktiválja a próbaverziót",
 "Open TAGRA TRUCKER and choose \"30-day trial\". No license key required.":
   "Indítsa el a TAGRA TRUCKER-t, és válassza a „30 napos próbaverzió” lehetőséget. Licenckulcs nem szükséges.",
 "Download your card": "Olvassa be a kártyáját",
 "Insert your driver card into a USB card reader and use TAGRA TRUCKER to download and archive your data.":
   "Helyezze a sofőrkártyáját egy USB-s kártyaolvasóba, és a TAGRA TRUCKER segítségével töltse le és archiválja az adatait.",
 "Self-employed driver?": "Egyéni vállalkozó sofőr?",
 "If you are also the transport undertaking (owner-operator), EU law requires you to download both driver card AND vehicle unit data. TAGRA TRUCKER covers only the driver card — for full compliance you need at least TAGRA 1. Questions? Just reply to this email.":
   "Ha Ön egyben a fuvarozó vállalkozás is (saját jogon fuvarozó), az uniós jog szerint a sofőrkártya ÉS a jármű egységének adatait is le kell töltenie. A TAGRA TRUCKER csak a sofőrkártyát kezeli — a teljes megfeleléshez legalább TAGRA 1 szükséges. Kérdése van? Válaszoljon erre az e-mailre.",
 "Need help?": "Segítségre van szüksége?",
 "Just reply to this email — we read every reply. Our team responds within hours during business days.":
   "Válaszoljon erre az e-mailre — minden választ elolvasunk. Magyarországon hivatalos forgalmazónk, a Rukon Kft. is segít: Varga Katalin, +36 30 474 2540, rukon@rukon.hu. Munkanapokon néhány órán belül válaszolunk.",
}),

"en-enforcement.html": ("hu-enforcement.html", {
 "Thank you for your interest in TAGRA Control": "Köszönjük érdeklődését a TAGRA Control iránt",
 "We received your enforcement enquiry. Our team will contact you within one business day.":
   "Megkaptuk hatósági megkeresését. Kollégánk egy munkanapon belül felveszi Önnel a kapcsolatot.",
 "Request received": "Megkeresés fogadva",
 "Thank you, {NAME}": "Köszönjük, {NAME}!",
 "We received your enquiry about TAGRA Control. Our team will contact you within one business day with demo access and details for your authority.":
   "Megkaptuk a TAGRA Control iránti érdeklődését. Kollégánk egy munkanapon belül felveszi Önnel a kapcsolatot a bemutató hozzáféréssel és a hatóságára szabott részletekkel.",
 "Explore TAGRA Control": "Ismerje meg a TAGRA Control-t",
 "While you wait, you can read more about the features and supported tachograph generations.":
   "Amíg vár, elolvashatja a funkciók és a támogatott tachográf-generációk leírását.",
 "We contact you": "Felvesszük Önnel a kapcsolatot",
 "Our specialist will reach out within one business day with details tailored to your authority.":
   "Szakértőnk egy munkanapon belül jelentkezik a hatóságára szabott részletekkel.",
 "Demo access": "Bemutató hozzáférés",
 "You will receive a guided demo of TAGRA Control — roadside checks, company inspections, violation analysis.":
   "Vezetett bemutatót kap a TAGRA Control-ról — közúti ellenőrzés, telephelyi ellenőrzés, szabálysértések elemzése.",
 "Training": "Képzés",
 "Training is available in English. Materials and certification can be arranged for your team.":
   "A képzés angol nyelven érhető el. Az oktatási anyagok és a tanúsítás a csapata számára külön egyeztethető.",
 "Trusted by enforcement authorities": "Ellenőrző hatóságok bizalmát élvezi",
 "TAGRA Control is used by Czech Police, Customs Administrations, Labour Inspectorates and ministries of transport across Central Europe. Roadside and company inspection support, full Schema.org compliance with EU 561/2006, 1054/2020 and AETR.":
   "A TAGRA Control-t Közép-Európa-szerte használja a cseh rendőrség, a vámhatóságok, a munkaügyi felügyelőségek és a közlekedési minisztériumok. Támogatja a közúti és a telephelyi ellenőrzést, teljes összhangban az 561/2006/EK, az 1054/2020/EU rendelettel és az AETR-rel.",
 "Have questions before we contact you?": "Kérdése van, mielőtt jelentkeznénk?",
 "Reply to this email or call us at +420 739 005 345. Our enforcement specialist is happy to discuss your needs.":
   "Válaszoljon erre az e-mailre, vagy hívjon minket a +420 739 005 345 számon. Hatósági szakértőnk szívesen egyeztet az igényeiről.",
}),

# ─────────────────────────── #2 QUICK START ───────────────────────────
"email2-fleet-en.html": ("email2-fleet-hu.html", {
 "TAGRA quick start: import your files and run the first report":
   "TAGRA gyorsindítás: fájlok importálása és az első jelentés elkészítése",
 "Three steps to your first infringement report — and two quick questions so I can recommend the right setup.":
   "Három lépés az első szabálysértési jelentésig — és két rövid kérdés, hogy a megfelelő megoldást ajánlhassuk.",
 "Quick start for your fleet": "Gyorsindítás a járműparkjához",
 "Hi {NAME}, how is your trial going?": "Kedves {NAME}, hogy halad a próbaverzióval?",
 "A few days ago you downloaded the TAGRA trial for your fleet — thank you. Most fleet managers start like this (about 10 minutes):":
   "Néhány napja letöltötte a TAGRA próbaverziót a járműparkjához — köszönjük. A legtöbb flottakezelő így kezdi (körülbelül 10 perc):",
 "Import a few driver card or vehicle files": "Importáljon néhány sofőrkártya- vagy járműfájlt",
 "TAGRA reads the files from your card reader or download key and evaluates them immediately.":
   "A TAGRA beolvassa a fájlokat a kártyaolvasóból vagy a letöltőkulcsból, és azonnal kiértékeli azokat.",
 "Run your first infringement report": "Készítse el az első szabálysértési jelentését",
 "This is the report inspectors ask for — TAGRA flags any driving time or rest period problems.":
   "Pontosan ezt a jelentést kérik az ellenőrök — a TAGRA megjelöl minden vezetési idővel és pihenőidővel kapcsolatos problémát.",
 "Curious what fits your fleet?": "Kíváncsi, mi illik a járműparkjához?",
 "We have the right solution for you — just reply to these two questions:":
   "Megvan a megfelelő megoldás — csak válaszoljon erre a két kérdésre:",
 "How do you download data from your tachographs today — card reader, download key, or not yet solved?":
   "Hogyan tölti le ma az adatokat a tachográfokból — kártyaolvasóval, letöltőkulccsal, vagy még nincs megoldva?",
 "How many vehicles do you manage?": "Hány járművet kezel?",
 "I will suggest the right TAGRA edition and compatible hardware, so you don't pay for more than you need. I reply personally. If you manage a larger fleet, I can also arrange a guided setup consultation for you.":
   "Javasoljuk a megfelelő TAGRA verziót és a kompatibilis hardvert, hogy ne fizessen többért, mint amennyire szüksége van. Személyesen válaszolunk. Nagyobb járműpark esetén vezetett beállítási konzultációt is szervezünk Önnek.",
}),

"email2-driver-en.html": ("email2-driver-hu.html", {
 "Read your driver card in TAGRA — first steps":
   "Olvassa be sofőrkártyáját a TAGRA-ban — első lépések",
 "Three simple steps to read your driver card — and one quick question about your card reader.":
   "Három egyszerű lépés a sofőrkártya beolvasásához — és egy rövid kérdés a kártyaolvasójáról.",
 "First steps for drivers": "Első lépések sofőröknek",
 "Hi {NAME}, how is your trial going?": "Kedves {NAME}, hogy halad a próbaverzióval?",
 "A few days ago you downloaded the TAGRA trial — thank you. As a professional driver, you mainly need two things: to know about any infringements before an inspection finds them, and to keep your card data archived so you are covered at roadside checks. TAGRA also prepares your work reports and travel allowances from the same data. Here is how to get there (5–10 minutes):":
   "Néhány napja letöltötte a TAGRA próbaverziót — köszönjük. Hivatásos sofőrként főként két dologra van szüksége: tudni a szabálysértésekről, mielőtt az ellenőrzés találná meg őket, és archiválva tartani a kártyaadatait, hogy közúti ellenőrzéskor fedve legyen. A TAGRA ugyanezekből az adatokból elkészíti a munkaidő-kimutatásokat és a kiküldetési elszámolásokat is. Így juthat el idáig (5–10 perc):",
 "Connect a USB card reader": "Csatlakoztasson egy USB-s kártyaolvasót",
 "Any standard smart card reader works. TAGRA detects it automatically.":
   "Bármelyik szokványos chipkártya-olvasó megfelel. A TAGRA automatikusan felismeri.",
 "Insert your driver card and read it in TAGRA":
   "Helyezze be a sofőrkártyáját, és olvassa be a TAGRA-ban",
 "TAGRA reads your card in seconds — it evaluates infringements, prepares work reports and travel allowances, and archives everything safely.":
   "A TAGRA másodpercek alatt beolvassa a kártyát — kiértékeli a szabálysértéseket, elkészíti a munkaidő-kimutatásokat és a kiküldetési elszámolásokat, és mindent biztonságosan archivál.",
 "One practical question": "Egy gyakorlati kérdés",
 "Do you have a USB card reader? Reply to this email with":
   "Van USB-s kártyaolvasója? Válaszoljon erre az e-mailre így:",
 "\"reader: yes\"": "„olvasó: igen”",
 "or": "vagy",
 "\"reader: no\"": "„olvasó: nem”",
 ". If you don't have one, I will recommend a compatible model.":
   ". Ha nincs, ajánlunk egy kompatibilis típust.",
 "If you have any questions, please reply to this email. I read and answer every one.":
   "Ha bármilyen kérdése van, válaszoljon erre az e-mailre. Minden választ elolvasunk és megválaszolunk.",
}),

# ─────────────────────────── #3 KONEC TRIALU ───────────────────────────
"email3-fleet-en.html": ("email3-fleet-hu.html", {
 "Your TAGRA trial ends in 5 days — here is how to keep your data":
   "A TAGRA próbaverziója 5 nap múlva lejár — így tarthatja meg az adatait",
 "Your licence activates inside the same software — nothing you imported gets lost. From €79 a year.":
   "A licencet ugyanabban a szoftverben aktiválja — semmi sem vész el abból, amit importált. Évi 79 eurótól.",
 "5 days left": "még 5 nap",
 "Your trial is ending": "A próbaverziója lejár",
 "{NAME}, your trial ends in 5 days": "{NAME}, a próbaverziója 5 nap múlva lejár",
 "Your 30-day TAGRA trial expires in 5 days. If it has been doing its job, you don't need to reinstall anything or import your files again — the licence activates inside the same software you are already using, and everything you have imported stays where it is. It takes about two minutes:":
   "A 30 napos TAGRA próbaverziója 5 nap múlva lejár. Ha bevált, semmit sem kell újratelepítenie, és a fájlokat sem kell újra importálnia — a licencet ugyanabban a szoftverben aktiválja, amelyet már használ, és minden importált adat a helyén marad. Ez körülbelül két perc:",
 "Open the licence menu in TAGRA": "Nyissa meg a licenc menüt a TAGRA-ban",
 "You are already inside the program — no new download, no reinstall, no re-import.":
   "Már a programban van — nincs új letöltés, nincs újratelepítés, nincs újbóli importálás.",
 "Choose the edition that matches your fleet": "Válassza a járműparkjához illő verziót",
 "TAGRA 1, 2, 4 or 6 by number of vehicles — or MAX for an unlimited fleet. Not sure? Just reply, see below.":
   "TAGRA 1, 2, 4 vagy 6 a járművek száma szerint — vagy MAX a korlátlan járműparkhoz. Bizonytalan? Válaszoljon, lásd lent.",
 "Pay by QR code or bank transfer": "Fizessen QR-kóddal vagy banki átutalással",
 "Your licence is activated immediately and you carry on in the same environment, with all your data.":
   "A licence azonnal aktiválódik, és ugyanabban a környezetben dolgozhat tovább, az összes adatával.",
 "See editions and pricing": "Verziók és árak megtekintése",
 "Not sure which edition you need?": "Nem biztos benne, melyik verzióra van szüksége?",
 "Don't overpay — the edition is set by your number of vehicles. Reply with these two and I will tell you which one to pick:":
   "Ne fizessen többet a kelleténél — a verziót a járművek száma határozza meg. Válaszoljon erre a kettőre, és megmondjuk, melyiket válassza:",
 "How many vehicles do you manage?": "Hány járművet kezel?",
 "Is there anything in the trial that did not work the way you expected?":
   "Volt olyan a próbaverzióban, ami nem úgy működött, ahogy várta?",
 "The annual licence fee starts at €79 excl. VAT (TAGRA MAX €139) and the first year is included in the purchase price — it covers updates and support. If something in the trial didn't work, tell me before it expires; I'd rather fix it than lose you over it. I reply personally.":
   "Az éves licencdíj 79 eurótól indul (áfa nélkül; TAGRA MAX 139 euró), az első év pedig a vételár része — a díj a frissítéseket és a támogatást fedezi. Ha valami nem működött a próbaverzióban, írja meg, mielőtt lejár; szívesebben javítjuk ki, mint hogy emiatt veszítsük el Önt. Személyesen válaszolunk.",
}),

"email3-driver-en.html": ("email3-driver-hu.html", {
 "Your TAGRA TRUCKER trial ends in 5 days": "A TAGRA TRUCKER próbaverziója 5 nap múlva lejár",
 "Your licence activates inside the same software — your archived card data stays. €19 a year from year two.":
   "A licencet ugyanabban a szoftverben aktiválja — az archivált kártyaadatai megmaradnak. A második évtől évi 19 euró.",
 "5 days left": "még 5 nap",
 "Your trial is ending": "A próbaverziója lejár",
 "{NAME}, your trial ends in 5 days": "{NAME}, a próbaverziója 5 nap múlva lejár",
 "Your 30-day TAGRA TRUCKER trial expires in 5 days. The archive you have built up over the past weeks is the thing that covers you at a roadside check — and you keep it. The licence activates inside the same software, so nothing is reinstalled and nothing is re-read. It takes about two minutes:":
   "A 30 napos TAGRA TRUCKER próbaverziója 5 nap múlva lejár. Az elmúlt hetekben felépített archívum az, ami közúti ellenőrzéskor fedezi Önt — és ez megmarad. A licencet ugyanabban a szoftverben aktiválja, így semmit sem kell újratelepíteni és újra beolvasni. Ez körülbelül két perc:",
 "Open the licence menu in TAGRA": "Nyissa meg a licenc menüt a TAGRA-ban",
 "You are already inside the program — no new download and no reinstall.":
   "Már a programban van — nincs új letöltés és nincs újratelepítés.",
 "Select TAGRA TRUCKER": "Válassza a TAGRA TRUCKER-t",
 "The edition for individual drivers — one driver card, full evaluation, archive, work reports and travel allowances.":
   "Az egyéni sofőröknek szánt verzió — egy sofőrkártya, teljes kiértékelés, archívum, munkaidő-kimutatás és kiküldetési elszámolás.",
 "Pay by QR code or bank transfer": "Fizessen QR-kóddal vagy banki átutalással",
 "Your licence is activated immediately and your archived card data stays exactly where it is.":
   "A licence azonnal aktiválódik, és az archivált kártyaadatai pontosan ott maradnak, ahol vannak.",
 "See TAGRA TRUCKER pricing": "TAGRA TRUCKER árak megtekintése",
 "Before it expires — one question": "Mielőtt lejár — egy kérdés",
 "Did anything in the trial not work the way you expected — reading the card, an infringement you disagree with, or the archive? Reply and tell me before it expires. I would rather fix it than have you leave over something that takes me five minutes to solve.":
   "Volt olyan a próbaverzióban, ami nem úgy működött, ahogy várta — a kártya beolvasása, egy szabálysértés, amellyel nem ért egyet, vagy az archívum? Válaszoljon, és írja meg, mielőtt lejár. Szívesebben javítjuk ki, mint hogy olyasmi miatt veszítsük el Önt, ami öt perc alatt megoldható.",
 "TAGRA TRUCKER costs €19 excl. VAT per year from the second year — the first year is included in the purchase price, and it covers updates and support. If you still don't have a USB card reader, reply and I will recommend a compatible model.":
   "A TAGRA TRUCKER a második évtől évi 19 euróba kerül (áfa nélkül) — az első év a vételár része, és a díj a frissítéseket és a támogatást fedezi. Ha még mindig nincs USB-s kártyaolvasója, válaszoljon, és ajánlunk egy kompatibilis típust.",
}),
}

# Lokalizace odkazů EN → HU
LINKS = {
    "https://tagra.app/privacy/": "https://tagra.app/hu/adatvedelmi-tajekoztato/",
    "https://tagra.app/manuals/how-to-install-tagra/": "https://tagra.app/hu/kezikonyvek/tagra-telepitese/",
    "https://tagra.app/fleet/": "https://tagra.app/hu/fuvarozoknak/",
    "https://tagra.app/driver/": "https://tagra.app/hu/soforoknek/",
    "https://tagra.app/enforcement/": "https://tagra.app/hu/hatosagoknak/",
}

ALT = {
    "Ivan Szabó – Sales Director, Tachograph Data Specialist – TAGRA":
        "Ivan Szabó – értékesítési igazgató, tachográfadat-szakértő – TAGRA",
}


# ── Opravy podle crew (ask_all 20. 8. 2026): shoda 2:1 / 3:0 ──────────────
CREW_FIX = [
    ("a letöltési link belül", "a letöltési linket alább találja"),
    ("A 30 napos TAGRA próbaverziója készen áll", "A TAGRA 30 napos próbaverziója készen áll"),
    ("A 30 napos TAGRA TRUCKER próbaverziója készen áll", "A TAGRA TRUCKER 30 napos próbaverziója készen áll"),
    ("A 30 napos TAGRA próbaverziója 5 nap múlva lejár", "A TAGRA 30 napos próbaverziója 5 nap múlva lejár"),
    ("A 30 napos TAGRA TRUCKER próbaverziója 5 nap múlva lejár", "A TAGRA TRUCKER 30 napos próbaverziója 5 nap múlva lejár"),
    ("a jármű egységéből", "a járműegységből"),
    ("a jármű egységének adatait", "a járműegység adatait"),
    ("Importálja az első sofőrkártya- vagy tachográf-letöltését.",
     "Importálja az első letöltött sofőrkártya- vagy tachográfadatait."),
    ("bankkártya nélkül", "bankkártya megadása nélkül"),
    ("egy USB-s kártyaolvasóba", "USB-kártyaolvasóba"),
    ("egy USB-s kártyaolvasót", "USB-kártyaolvasót"),
    ("USB-s kártyaolvasója", "USB-kártyaolvasója"),
]

# Magyarországi hivatalos forgalmazó – doplnuje se do podpisu #2/#3
RUKON_ROW = (
    '<tr>\n<td style="padding:8px 0 2px 0; font-size:14px; line-height:1.6; color:#515154;">'
    'Magyarországi hivatalos forgalmazó: <strong>Rukon Kft.</strong> — Varga Katalin, '
    '<a href="tel:+36304742540" style="color:#1f2d3d; text-decoration:none;">+36&nbsp;30&nbsp;474&nbsp;2540</a>, '
    '<a href="mailto:rukon@rukon.hu" style="color:#005baa; text-decoration:none;">rukon@rukon.hu</a>'
    '</td>\n</tr>\n'
)

def postprocess(path):
    s = io.open(path, encoding="utf-8").read()
    for a, b in CREW_FIX:
        s = s.replace(a, b)
    # madarska typografie: gondolatjel (en dash), ne em dash — jen v textovych uzlech
    s = re.sub(r">([^<>]+)<",
               lambda m: ">" + m.group(1).replace("—", "–").replace("&mdash;", "&ndash;") + "<", s)
    # Rukon kontakt do podpisoveho bloku navazujicich mailu
    if "email2-" in path or "email3-" in path:
        m = re.search(r'<tr>\s*<td[^>]*>\s*<a href="mailto:sales@tagra\.app".*?</td>\s*</tr>\s*', s, re.S)
        if m and "rukon@rukon.hu" not in s:
            s = s[:m.end()] + RUKON_ROW + s[m.end():]
    io.open(path, "w", encoding="utf-8").write(s)

def build(src, dst, mapping):
    s = io.open(src, encoding="utf-8").read()
    table = dict(COMMON); table.update(mapping)
    # normalizovaný lookup: klíč bez ohledu na whitespace a entity
    norm = {}
    for en, hu in table.items():
        norm[re.sub(r"\s+", " ", html.unescape(en)).strip()] = hu
    used = set()

    def repl(m):
        raw = m.group(1)
        key = re.sub(r"[\s\u00a0]+", " ", html.unescape(raw)).strip()
        if key in norm:
            used.add(key)
            lead = raw[:len(raw) - len(raw.lstrip())]
            tail = raw[len(raw.rstrip()):]
            return ">" + lead + html.escape(norm[key], quote=False) + tail + "<"
        return m.group(0)

    s = re.sub(r">([^<>]+)<", repl, s)
    misses = [k for k in norm if k not in used]
    for en, hu in ALT.items():
        s = s.replace('alt="%s"' % en, 'alt="%s"' % hu)
    for a, b in LINKS.items():
        s = s.replace('"%s"' % a, '"%s"' % b)
    s = re.sub(r'<html([^>]*)lang="en"', r'<html\1lang="hu"', s)
    io.open(dst, "w", encoding="utf-8").write(s)
    return misses

if __name__ == "__main__":
    import os
    base = os.path.dirname(os.path.abspath(__file__))
    for src, (dst, m) in FILES.items():
        src_p = os.path.join(base, src)
        dst_p = os.path.join(base, dst)
        miss = build(src_p, dst_p, m)
        postprocess(dst_p)
        print("%-24s -> %-24s  nenahrazeno: %d" % (src, dst, len(miss)))
        for x in miss:
            print("      MISS:", x[:90])
