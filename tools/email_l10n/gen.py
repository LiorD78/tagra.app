#!/usr/bin/env python3
"""RO + NL e-mailové šablony zkušební verze (19. 9. 2026).

Vygeneruje 14 šablon v try/email-preview/ z anglických originálů:
  {ro,nl}-{driver,fleet,enforcement}.html            (#1 uvítací)
  email2-{driver,fleet}-{ro,nl}.html                  (#2 +3 dny)
  email3-{driver,fleet}-{ro,nl}.html                  (#3 +25 dní)
a doplní ro/nl do netlify/functions/trial-email.js (VALID_LANGS,
LANG_URL_SEGMENTS, předměty #1). Do té doby RO/NL zájemci dostávali EN.

Texty: tools/email_l10n/{ro,nl}.json (překlad GPT + Gemini, formální oslovení
jako na webu), klíče = indexy anglických textů v pořadí, v jakém je _segments()
najde v EN šablonách (pokud se EN šablony změní, indexy se posunou — hlídá to
kontrola missing a první segment musí být předmět #1). Odkazy vedou na RO/NL stránky.
Idempotentní — šablony se přepíšou stejným obsahem, funkce se patchne jen jednou.

Spuštění z kořene repa:  python3 tools/email_l10n/gen.py
"""
import html
import json
import re
import sys

D = "tools/email_l10n/"
EP = "try/email-preview/"
FN = "netlify/functions/trial-email.js"


def _segments():
    """Anglické texty v pevném pořadí — indexy = klíče v {ro,nl}.json."""
    uniq = []
    for f in ("en-driver", "en-fleet", "en-enforcement", "email2-driver-en",
              "email2-fleet-en", "email3-driver-en", "email3-fleet-en"):
        s = open(EP + f + ".html", encoding="utf-8").read()
        found = []
        for m in re.finditer(r"<(style|script)\b.*?</\1>|>([^<]+)<", s, re.S):
            if m.group(2) and re.search(r"[A-Za-z]{2}", m.group(2)):
                t = html.unescape(m.group(2)).strip()
                if t and t not in ("tagra.app", "sales@tagra.app", "TAGRA"):
                    found.append(t)
        found += [html.unescape(m.group(2)) for m in re.finditer(r'\b(alt|title)="([^"]+)"', s)]
        for t in found:
            if t not in uniq:
                uniq.append(t)
    return uniq


SEGS = _segments()
IDX = {t: str(i) for i, t in enumerate(SEGS)}
KEEP = {"1"}  # segment 1 = CSS z <head>, nepřekládá se

LINKS = {
    "ro": {"https://tagra.app/": "https://tagra.app/ro/",
           "https://tagra.app/privacy/": "https://tagra.app/ro/confidentialitate/",
           "https://tagra.app/fleet/": "https://tagra.app/ro/pentru-firme/",
           "https://tagra.app/enforcement/": "https://tagra.app/ro/autoritati-de-control/",
           "https://tagra.app/manuals/how-to-install-tagra/": "https://tagra.app/ro/manuale/instalare-tagra/",
           "https://tagra.app/driver/": "https://tagra.app/ro/pentru-conducatori/"},
    "nl": {"https://tagra.app/": "https://tagra.app/nl/",
           "https://tagra.app/privacy/": "https://tagra.app/nl/privacy/",
           "https://tagra.app/fleet/": "https://tagra.app/nl/voor-transportbedrijven/",
           "https://tagra.app/enforcement/": "https://tagra.app/nl/handhaving/",
           "https://tagra.app/manuals/how-to-install-tagra/": "https://tagra.app/nl/handleidingen/tagra-installeren/",
           "https://tagra.app/driver/": "https://tagra.app/nl/voor-chauffeurs/"},
}
FILES = [("en-driver", "{L}-driver"), ("en-fleet", "{L}-fleet"), ("en-enforcement", "{L}-enforcement"),
         ("email2-driver-en", "email2-driver-{L}"), ("email2-fleet-en", "email2-fleet-{L}"),
         ("email3-driver-en", "email3-driver-{L}"), ("email3-fleet-en", "email3-fleet-{L}")]


def translate(src, tx, lang):
    out, pos, missing = [], 0, []
    for m in re.finditer(r"<(style|script)\b.*?</\1>|>([^<]+)<", src, re.S):
        out.append(src[pos:m.start()])
        pos = m.end()
        if m.group(1):
            out.append(m.group(0))
            continue
        raw = m.group(2)
        t = html.unescape(raw).strip()
        k = IDX.get(t)
        if not t or k is None or k in KEEP:
            out.append(m.group(0))
            continue
        if k not in tx:
            missing.append(t)
            out.append(m.group(0))
            continue
        lead = re.match(r"\s*", raw).group(0)
        trail = re.search(r"\s*$", raw).group(0)
        out.append(">" + lead + html.escape(tx[k], quote=False) + trail + "<")
    out.append(src[pos:])
    s = "".join(out)

    def attr(m):
        k = IDX.get(html.unescape(m.group(2)))
        return f'{m.group(1)}="{html.escape(tx[k], quote=True)}"' if k and k in tx else m.group(0)

    s = re.sub(r'\b(alt|title)="([^"]+)"', attr, s)
    s = s.replace('<html lang="en"', f'<html lang="{lang}"')
    for a, b in LINKS[lang].items():
        s = re.sub(r'href="' + re.escape(a) + r'(\?[^"]*)?"', lambda m, b=b: f'href="{b}{m.group(1) or ""}"', s)
    s = re.sub(r"(src=email[23]-(?:driver|fleet))-en\b", r"\1-" + lang, s)
    return s, missing


problems = 0
for lang in ("ro", "nl"):
    tx = json.load(open(D + lang + ".json", encoding="utf-8"))
    for src, dst in FILES:
        s, missing = translate(open(EP + src + ".html", encoding="utf-8").read(), tx, lang)
        name = EP + dst.format(L=lang) + ".html"
        open(name, "w", encoding="utf-8").write(s)
        print("WROTE", name, "missing=%d" % len(missing))
        problems += len(missing)

# trial-email.js — ro/nl (jen jednou)
fn = open(FN, encoding="utf-8").read()
if '"ro", "nl"]' not in fn:
    a = 'const VALID_LANGS     = ["en", "de", "pl", "cz", "sk", "gr", "hu", "it", "fr"];'
    b = 'it: "it", fr: "fr" };'
    c = '    enforcement: "Merci pour votre intérêt pour TAGRA Control",\n  },\n};'
    if fn.count(a) != 1 or fn.count(b) != 1 or fn.count(c) != 1:
        print("PROBLEM trial-email.js anchors not found")
        sys.exit(1)
    q = lambda x: json.dumps(x, ensure_ascii=False)
    blocks = ""
    for lang in ("ro", "nl"):
        t = json.load(open(D + lang + ".json", encoding="utf-8"))
        blocks += (f"  {lang}: {{\n    fleet:       {q(t['25'])},\n    driver:      {q(t['0'])},\n"
                   f"    enforcement: {q(t['38'])},\n  }},\n")
    fn = fn.replace(a, a.replace('"fr"];', '"fr", "ro", "nl"];'))
    fn = fn.replace(b, 'it: "it", fr: "fr", ro: "ro", nl: "nl" };')
    fn = fn.replace(c, c[:-3] + blocks + "};")
    open(FN, "w", encoding="utf-8").write(fn)
    print("PATCHED", FN)
else:
    print("SKIP", FN, "(already patched)")

print("problems=%d" % problems)
sys.exit(1 if problems else 0)
