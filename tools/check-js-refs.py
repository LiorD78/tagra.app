#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ověří, že identifikátory a třídy, na které se odkazuje JavaScript,
v HTML skutečně existují — a nejsou ani vytvářeny dynamicky.

Vzniklo 14. 8. 2026 poté, co na celém webu nešlo otevřít mobilní menu:
skript hledal seznam odkazů přes getElementById('nav-links'), ale element
měl jen třídu bez id. HTML bylo validní, JS bez chyby — a menu nefungovalo.
Statická validace takovou vazbu neodhalí, protože chyba leží mezi dvěma
vrstvami, ne uvnitř jedné.

Falešné poplachy se filtrují: pokud JS element sám vytváří (createElement,
innerHTML, insertAdjacentHTML), jeho nepřítomnost v HTML je v pořádku.

Použití:  python3 tools/check-js-refs.py
Návrat:   0 = čisté, 1 = nalezeny nefunkční odkazy
"""
import glob, re, sys, collections

def scripts_of(html):
    return ' '.join(re.findall(r'<script\b[^>]*>(.*?)</script>', html, flags=re.S | re.I))

def markup_of(html):
    """HTML bez <script> i <style> — jen skutečné značky."""
    h = re.sub(r'<script\b[^>]*>.*?</script>', '', html, flags=re.S | re.I)
    return re.sub(r'<style\b[^>]*>.*?</style>', '', h, flags=re.S | re.I)

def scan(path):
    html = open(path, encoding='utf-8').read()
    markup, js = markup_of(html), scripts_of(html)

    ids = set(re.findall(r'\bid="([^"]+)"', markup))
    classes = set()
    for m in re.finditer(r'\bclass="([^"]+)"', markup):
        classes.update(m.group(1).split())

    # co JS vytváří sám → nepřítomnost v HTML není chyba.
    # Hledáme název uvnitř řetězce, který nese HTML atribut class=" nebo id=".
    generated = set()
    for m in re.finditer(r'(?:class|id)=\\?["\']([^"\'\\]+)', js):
        generated.update(m.group(1).split())

    problems = []
    for wanted in sorted(set(re.findall(r"getElementById\(\s*['\"]([^'\"]+)['\"]", js))):
        if wanted in ids:
            continue
        if wanted in generated:
            continue
        guarded = re.search(r'if\s*\([^)]*\b' + re.escape(wanted.replace('-', '')) + r'|if\s*\(\s*\w+\s*&&', js, re.I)
        problems.append(('mrtvý kód' if guarded else 'ROZBITÉ') + f' getElementById("{wanted}")')

    for sel in sorted(set(re.findall(r"querySelector(?:All)?\(\s*['\"]([^'\"]+)['\"]", js))):
        if not re.fullmatch(r'[#.][\w-]+', sel):
            continue
        name, kind = sel[1:], sel[0]
        if name in (ids if kind == '#' else classes):
            continue
        if name in generated:
            continue
        problems.append(f'querySelector("{sel}")')

    return problems

def main():
    found = collections.OrderedDict()
    files = sorted(glob.glob('**/*.html', recursive=True))
    for f in files:
        p = scan(f)
        if p:
            found[f] = p

    print(f'prověřeno stránek: {len(files)}')
    if not found:
        print('nefunkční odkazy z JavaScriptu: žádné')
        return 0

    counts = collections.Counter()
    for probs in found.values():
        counts.update(probs)
    print(f'PODEZŘELÉ ODKAZY: {sum(counts.values())} na {len(found)} stránkách\n')
    for p, n in counts.most_common():
        print(f'  {n:>4}× {p}')
    print('\nprvních 5 dotčených stránek:')
    for f in list(found)[:5]:
        print(f'  {f}')
    return 1

if __name__ == '__main__':
    sys.exit(main())
