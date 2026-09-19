#!/usr/bin/env python3
"""Sweep: horní CTA + mobilní „pošlete mi odkaz na PC" na stránkách chybových kódů.

Proč (19. 9. 2026): z 90 registrací zkušební verze nepřišla ani jedna z článku,
78 % kliků na články je z mobilu a program běží na Windows. Nový blok stojí
hned za první sekcí s odpovědí (~10–13 % stránky). Na desktopu vede tlačítkem
na zkušební verzi, na mobilu nabídne jméno + e-mail a odkaz ke stažení pošle
e-mailem (stejný Netlify formulář `tagra-trial`, stejná sekvence trial-email).

Pravidla:
- stránky = všechny index.html s driver CTA `audience=driver&amp;src=<id>`,
  kromě src=driver (landing /driver/), src=symbols (má vlastní CTA nahoře)
  a src=driver-card (články o žádosti o kartu — hook o varování nesedí)
- vložení: na konec první <section> uvnitř <main> (před její poslední </div>)
- idempotentní: stránka s `data-cc=` se přeskočí
- texty: tools/code_cta/strings.json (GDPR text převzatý z jazykové /try/ stránky)
- CSS a JS: připojí tools/code_cta/cc.css → assets/css/components.css
  a tools/code_cta/cc.js → assets/js/nav.js (jen pokud tam ještě nejsou)
- navíc: oprava zdvojené „Datenschutzerklärung" v souhlasu na /de/testen/

Spuštění z kořene repa:  python3 tools/code_cta/sweep.py [--dry-run]
"""
import glob
import html
import json
import re
import sys

DRY = "--dry-run" in sys.argv
S = json.load(open("tools/code_cta/strings.json", encoding="utf-8"))
SKIP_SRC = {"driver", "symbols", "driver-card"}


def lang_of(path):
    first = path.split("/")[0]
    return "en" if first == "articles" else first


def esc(t):
    return html.escape(t, quote=True)


def block(lang, src):
    t = S[lang]
    return f'''<div class="cta-box cc-top" data-cc="{esc(src)}">
<h3>{esc(t["title"])}</h3>
<p>{esc(t["text"])}</p>
<a class="cta-btn cc-desk" href="{t["try"]}?audience=driver&amp;src={esc(src)}-top">{esc(t["btn"])}</a>
<form action="{t["try"]}" class="cc-mail" data-err="{esc(t["err"])}" data-errlink="{esc(t["errlink"])}" data-ok="{esc(t["ok"])}" data-sending="{esc(t["sending"])}" data-try="{t["try"]}?audience=driver&amp;src={esc(src)}-mail" method="POST">
<p class="cc-lead">{esc(t["mlead"])}</p>
<input name="form-name" type="hidden" value="tagra-trial"/>
<input name="audience" type="hidden" value="driver"/>
<input name="language" type="hidden" value="{t["langval"]}"/>
<input class="cc-src" name="source_url" type="hidden" value=""/>
<p class="cc-hp" hidden=""><input autocomplete="off" name="bot-field" tabindex="-1"/></p>
<input aria-label="{esc(t["name"])}" autocomplete="given-name" minlength="2" name="name" placeholder="{esc(t["name"])}" required="" type="text"/>
<input aria-label="{esc(t["email"])}" autocomplete="email" inputmode="email" name="email" placeholder="{esc(t["email"])}" required="" type="email"/>
<label class="cc-gdpr"><input name="gdpr_consent" required="" type="checkbox" value="yes"/> <span>{t["gdpr"]}</span></label>
<button class="cta-btn cc-send" type="submit">{esc(t["mbtn"])}</button>
<p aria-live="polite" class="cc-msg" role="status"></p>
</form>
</div>
'''


def insert_point(doc):
    """Index před poslední </div> první <section> v <main>."""
    m = re.search(r"<main\b", doc)
    if not m:
        return None
    first = doc.find("<section", m.end())
    if first < 0:
        return None
    end = doc.find("</section>", first)
    if end < 0:
        return None
    div = doc.rfind("</div>", first, end)
    return div if div > first else None


changed, skipped, problems = [], [], []
for path in sorted(glob.glob("**/index.html", recursive=True)):
    if path.startswith(("node_modules", "try/email-preview")):
        continue
    doc = open(path, encoding="utf-8").read()
    m = re.search(r"audience=driver&amp;src=([\w-]+)", doc)
    if not m or m.group(1) in SKIP_SRC:
        continue
    lang = lang_of(path)
    if lang not in S:
        problems.append((path, "lang " + lang))
        continue
    if "data-cc=" in doc:
        skipped.append(path)
        continue
    pos = insert_point(doc)
    if pos is None:
        problems.append((path, "no insert point"))
        continue
    new = doc[:pos] + block(lang, m.group(1)) + doc[pos:]
    changed.append((path, lang, m.group(1), round(pos / len(doc) * 100)))
    if not DRY:
        open(path, "w", encoding="utf-8").write(new)

# Zdvojené „Datenschutzerklärung" v souhlasu na /de/testen/
de_try = "de/testen/index.html"
d = open(de_try, encoding="utf-8").read()
bad = "Details finden Sie in der Datenschutzerklärung. <a"
if bad in d:
    changed.append((de_try, "de", "gdpr-fix", 0))
    if not DRY:
        open(de_try, "w", encoding="utf-8").write(d.replace(bad, "Details finden Sie in der <a"))

# Sdílené CSS a JS (idempotentně podle značky)
for snip, target, marker in (("tools/code_cta/cc.css", "assets/css/components.css", ".cc-top .cc-mail"),
                             ("tools/code_cta/cc.js", "assets/js/nav.js", "cc-mail")):
    cur = open(target, encoding="utf-8").read()
    if marker in cur:
        skipped.append(target)
        continue
    add = open(snip, encoding="utf-8").read()
    changed.append((target, "-", "append", 0))
    if not DRY:
        open(target, "w", encoding="utf-8").write(cur.rstrip("\n") + "\n" + add)

for c in changed:
    print("CHANGED", *c)
for s in skipped:
    print("SKIP (already)", s)
for p in problems:
    print("PROBLEM", *p)
print(f"total changed={len(changed)} skipped={len(skipped)} problems={len(problems)}")
sys.exit(1 if problems else 0)
