#!/usr/bin/env python3
"""Rozhodnutí 19. 9. 2026 (varianta B): telefonní čísla v podpisu jen v e-mailech
pro firmy (email{2,3}-fleet-*). Z navazujících e-mailů pro řidiče
(email{2,3}-driver-*, všechny jazyky) se řádek s telefony odstraní — kanál pro
řidiče je samoobslužný, dotazy jdou odpovědí na e-mail (reply-to sales@tagra.app).
Idempotentní. Spuštění z kořene repa:  python3 tools/email_l10n/driver_no_phone.py
"""
import glob
import re
import sys

ROW = re.compile(r"\n[ \t]*<tr>\s*<td[^>]*>\s*<a href=\"tel:\+420739005345\"[^>]*>[^<]*</a>\s*"
                 r"(?:<span[^>]*>[^<]*</span>\s*<a href=\"tel:\+421905190653\"[^>]*>[^<]*</a>\s*)?</td>\s*</tr>")
IVAN = ("tel:+420739005345", "tel:+421905190653")  # jen Ivanova čísla; HU distributor Rukon zůstává
changed = problems = 0
for path in sorted(glob.glob("try/email-preview/email[23]-driver-*.html")):
    s = open(path, encoding="utf-8").read()
    if not any(n in s for n in IVAN):
        print("SKIP", path)
        continue
    new, n = ROW.subn("", s, count=1)
    if n != 1 or any(x in new for x in IVAN):
        print("PROBLEM", path)
        problems += 1
        continue
    open(path, "w", encoding="utf-8").write(new)
    changed += 1
    print("CHANGED", path)
print(f"changed={changed} problems={problems}")
sys.exit(1 if problems else 0)
