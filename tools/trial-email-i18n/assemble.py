#!/usr/bin/env python3
"""Sestaví netlify/lib/tagra-email/content-{lang}.json z překladu.
Vstup: raw/{lang}.json (přeložený to-translate.json, stejné klíče 0–162, tokeny <aN> a <b>…</b> beze změny)
       urls/{lang}.json (html_lang, formát ceny, náhrady URL – vzor urls/de.json)
Spuštění z kořene repa:  python3 tools/trial-email-i18n/assemble.py pl
"""
import json, re, sys, copy, os
H = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.join(H, "..", "..", "netlify", "lib", "tagra-email")
lang = sys.argv[1]
J = lambda p: json.load(open(p, encoding="utf-8"))
raw = J(f"{H}/raw/{lang}.json"); en = J(f"{LIB}/content-en.json")
order = J(f"{H}/order.json"); aliases = J(f"{H}/aliases.json"); tok = J(f"{H}/tokens.json"); URL = J(f"{H}/urls/{lang}.json")
missing = [str(i) for i in range(len(order)) if str(i) not in raw]
if missing: sys.exit(f"chybí klíče: {missing[:20]}")
tr = {k: raw[str(i)] for i, k in enumerate(order)}
def restore(v):
    v = re.sub(r"<a\d+>", lambda m: tok[m.group(0)], v)
    return v.replace("<b>", '<strong class="dm-text" style="color:#0b2c4a;">').replace("</b>", "</strong>")
d = copy.deepcopy(en)
def setp(o, path, val):
    for p in path[:-1]: o = o[int(p)] if isinstance(o, list) else o[p]
    if isinstance(o, list): o[int(path[-1])] = val
    else: o[path[-1]] = val
for k in order: setp(d, k.split("/"), restore(tr[k]))
for k, src in aliases.items(): setp(d, k.split("/"), restore(tr[src]))  # stejný text použitý na více místech
d["common"]["html_lang"] = URL["html_lang"]
s = json.dumps(d, ensure_ascii=False)
for a, b in URL["replace"]: s = s.replace(a, b)
s = re.sub(r"€(\d+)", URL["euro"], s)
d = json.loads(s)
out = f"{LIB}/content-{lang}.json"
json.dump(d, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=2); open(out, "a").write("\n")
print("zapsáno", out)
print("zbylé tokeny", re.findall(r"<a\d+>|<b>", s))
print("EN adresy navíc", [u for u in re.findall(r'https://[^"\\]+', s) if "-en" in u or ("shop.tagra.app/" in u and f"/{lang}/" not in u)])
