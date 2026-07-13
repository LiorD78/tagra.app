#!/usr/bin/env python3
"""
Sesynchronizuje _redirects a sitemap.xml se skutečně existujícími lokalizovanými stránkami.

- odstraní 302 /X/{de,pl}/ -> /X/  pro stránky, které UŽ lokalizované jsou
- ponechá 302 jen tam, kde překlad zatím není (uživatel neskončí na 404)
- doplní lokalizované URL do sitemap.xml
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANGS = ('de', 'pl')


def exists(page, lang):
    return os.path.exists(os.path.join(ROOT, page, lang, 'index.html'))


def sync_redirects():
    p = os.path.join(ROOT, '_redirects')
    lines = open(p, encoding='utf-8').read().splitlines()
    out, removed = [], []
    for ln in lines:
        m = re.match(r'^(/\S+?)/(de|pl)/\s+\S+\s+302\s*$', ln.strip())
        if m:
            page = m.group(1).lstrip('/')
            lang = m.group(2)
            if '*' not in page and exists(page, lang):
                removed.append(f'/{page}/{lang}/')
                continue
        out.append(ln)
    open(p, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    print(f"  _redirects: odstraněno {len(removed)} zbytečných 302")
    for r in removed:
        print(f"    − {r}")
    return removed


def sync_sitemap():
    p = os.path.join(ROOT, 'sitemap.xml')
    s = open(p, encoding='utf-8').read()
    have = set(re.findall(r'<loc>([^<]+)</loc>', s))

    add = []
    pages = ['fleet', 'driver', 'enforcement', 'how-it-works', 'for-whom', 'faq',
             'contact', 'manuals', 'articles', 'integrations/dkv-live',
             'manuals/how-to-install-tagra']
    art = os.path.join(ROOT, 'articles')
    if os.path.isdir(art):
        pages += [f'articles/{d}' for d in os.listdir(art)
                  if os.path.isdir(os.path.join(art, d)) and d not in LANGS]

    for page in pages:
        for lang in LANGS:
            if exists(page, lang):
                url = f'https://tagra.app/{page}/{lang}/'
                if url not in have:
                    add.append(url)

    if add:
        entries = ''.join(
            f'  <url>\n    <loc>{u}</loc>\n    <changefreq>monthly</changefreq>\n'
            f'    <priority>0.7</priority>\n  </url>\n' for u in sorted(add))
        s = s.replace('</urlset>', entries + '</urlset>')
        open(p, 'w', encoding='utf-8').write(s)

    total = len(re.findall(r'<loc>', s))
    print(f"  sitemap.xml: +{len(add)} URL (celkem {total})")
    for u in add:
        print(f"    + {u}")


if __name__ == '__main__':
    sync_redirects()
    sync_sitemap()
