#!/usr/bin/env python3
"""
i18n pipeline pro tagra.app

  extract  <page>                  -> tools/i18n/<slug>.en.json   (segmenty k překladu)
  apply    <page> <lang>           -> <page>/<lang>/index.html    (vygeneruje lokalizovanou stránku)

Segmenty se párují podle POŘADÍ deterministického walku (index). Stejný walk
se použije v extract i apply, takže mapování sedí 1:1.

Lokalizuje: textové uzly, title, meta description/og/twitter, alt, aria-label,
placeholder, ld+json schema (rekurzivně vybrané klíče).
Přepisuje: <html lang>, canonical, og:url, hreflang, navigaci, jazykový přepínač.
"""
import json, os, re, sys
from bs4 import BeautifulSoup, NavigableString, Comment, Doctype

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
I18N = os.path.join(ROOT, 'tools', 'i18n')
SKIP_TAGS = {'script', 'style', 'noscript', 'title'}  # title řešen zvlášť

# meta tagy, jejichž content se překládá
META_KEYS = {'description', 'keywords',
             'og:title', 'og:description', 'og:site_name', 'og:image:alt',
             'twitter:title', 'twitter:description', 'twitter:image:alt'}

# klíče uvnitř ld+json, které se překládají
LD_KEYS = {'name', 'description', 'text', 'headline', 'alternateName',
           'about', 'articleSection', 'jobTitle', 'caption'}

LANGS = {
    'de': {'code': 'de', 'label': 'DE'},
    'pl': {'code': 'pl', 'label': 'PL'},
}

# které stránky mají lokalizovanou variantu (pro přepis odkazů v navigaci)
# doplňuje se, jak se stránky překládají
LOCALIZED = {
    'de': set(),
    'pl': set(),
}


def load_localized():
    """Zjisti z disku, které lokalizované stránky reálně existují."""
    for lang in LANGS:
        found = set()
        for page in ('fleet', 'driver', 'enforcement', 'how-it-works', 'for-whom',
                     'faq', 'contact', 'manuals', 'articles', 'privacy',
                     'integrations/dkv-live', 'manuals/how-to-install-tagra'):
            if os.path.exists(os.path.join(ROOT, page, lang, 'index.html')):
                found.add(page)
        # články mají vlastní podadresáře
        art = os.path.join(ROOT, 'articles')
        if os.path.isdir(art):
            for d in os.listdir(art):
                p = os.path.join(art, d, lang, 'index.html')
                if os.path.exists(p):
                    found.add(f'articles/{d}')
        LOCALIZED[lang] = found


def walk(doc):
    """Deterministický seznam překladatelných položek."""
    items = []

    # 1) title
    if doc.title and doc.title.string:
        items.append(('title', doc.title, None, doc.title.string.strip()))

    # 2) meta
    for tag in doc.find_all('meta'):
        key = tag.get('name') or tag.get('property')
        if key in META_KEYS and tag.get('content'):
            items.append(('meta', tag, 'content', tag['content'].strip()))

    # 3) textové uzly
    for node in doc.find_all(string=True):
        if isinstance(node, (Comment, Doctype)):
            continue
        if node.parent.name in SKIP_TAGS:
            continue
        txt = str(node)
        if txt.strip() and any(c.isalpha() for c in txt):
            items.append(('text', node, None, txt.strip()))

    # 4) atributy
    for tag in doc.find_all(True):
        for attr in ('alt', 'aria-label', 'placeholder'):
            v = tag.get(attr)
            if v and isinstance(v, str) and v.strip() and any(c.isalpha() for c in v):
                items.append(('attr', tag, attr, v.strip()))

    return items


def ld_walk(obj, out):
    """Posbírej překladatelné stringy z ld+json."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in LD_KEYS and isinstance(v, str) and any(c.isalpha() for c in v):
                out.append(v)
            else:
                ld_walk(v, out)
    elif isinstance(obj, list):
        for v in obj:
            ld_walk(v, out)


def ld_apply(obj, tr, idx):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in LD_KEYS and isinstance(v, str) and any(c.isalpha() for c in v):
                obj[k] = tr[idx[0]] if idx[0] < len(tr) else v
                idx[0] += 1
            else:
                ld_apply(v, tr, idx)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            if isinstance(v, str):
                continue
            ld_apply(v, tr, idx)


def page_slug(page):
    return page.strip('/').replace('/', '__') or 'home'


def cmd_extract(page):
    src = os.path.join(ROOT, page, 'index.html')
    doc = BeautifulSoup(open(src, encoding='utf-8').read(), 'lxml')

    items = walk(doc)
    segs = [{'i': i, 'k': kind, 'en': val} for i, (kind, _, _, val) in enumerate(items)]

    lds = []
    for sc in doc.find_all('script', type='application/ld+json'):
        try:
            data = json.loads(sc.string)
        except Exception:
            continue
        out = []
        ld_walk(data, out)
        lds.append(out)

    os.makedirs(I18N, exist_ok=True)
    dst = os.path.join(I18N, page_slug(page) + '.en.json')
    json.dump({'page': page, 'segments': segs, 'ld': lds},
              open(dst, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f"  {dst}  ({len(segs)} segmentů, {len(lds)} ld+json bloků)")


def build_nav(doc, page, lang):
    """Přepiš navigaci, přepínač jazyků, CTA a interní odkazy na lokalizované verze."""
    loc = LOCALIZED[lang]

    def localize(href):
        if not href or not href.startswith('/'):
            return href
        clean = href.split('?')[0].split('#')[0].strip('/')
        if clean in loc:
            q = href[len(clean) + 1:] if len(href) > len(clean) + 1 else ''
            q = q[1:] if q.startswith('/') else q
            return f"/{clean}/{lang}/" + (q if q.startswith(('?', '#')) else '')
        if clean == 'try':
            rest = href[len('/try/'):] if href.startswith('/try/') else ''
            return f"/try/{lang}/" + rest
        if clean == '':
            return f"/{lang}/"
        return href

    for a in doc.select('nav a[href], .site-footer a[href], .sticky-cta a[href]'):
        a['href'] = localize(a['href'])

    # jazykový přepínač: aktivní stav
    summ = doc.select_one('.nav-lang summary')
    if summ:
        summ.string = LANGS[lang]['label']
        summ['aria-label'] = f"Language: {LANGS[lang]['label']}"

    for a in doc.select('.nav-lang-menu a'):
        a.attrs.pop('class', None)
        a.attrs.pop('aria-current', None)

    return doc


def cmd_apply(page, lang):
    src = os.path.join(ROOT, page, 'index.html')
    tf = os.path.join(I18N, f'{page_slug(page)}.{lang}.json')
    if not os.path.exists(tf):
        sys.exit(f"  ✗ chybí překlad: {tf}")

    tr = json.load(open(tf, encoding='utf-8'))
    doc = BeautifulSoup(open(src, encoding='utf-8').read(), 'lxml')
    items = walk(doc)

    segs = tr['segments']
    if len(segs) != len(items):
        sys.exit(f"  ✗ NESOULAD: stránka má {len(items)} segmentů, překlad {len(segs)}")

    # aplikuj segmenty
    for (kind, tag, attr, orig), s in zip(items, segs):
        new = s.get(lang) or s.get('t')
        if not new:
            continue
        if kind == 'title':
            tag.string = new
        elif kind in ('meta', 'attr'):
            tag[attr] = new
        elif kind == 'text':
            tag.replace_with(NavigableString(new))

    # ld+json
    lds = tr.get('ld', [])
    for n, sc in enumerate(doc.find_all('script', type='application/ld+json')):
        if n >= len(lds):
            break
        try:
            data = json.loads(sc.string)
        except Exception:
            continue
        ld_apply(data, lds[n], [0])
        sc.string = json.dumps(data, ensure_ascii=False, indent=2)

    # lang atribut
    doc.html['lang'] = LANGS[lang]['code']

    # canonical + og:url
    url = f"https://tagra.app/{page.strip('/')}/{lang}/"
    can = doc.find('link', rel='canonical')
    if can:
        can['href'] = url
    for tag in doc.find_all('meta', property='og:url'):
        tag['content'] = url
    for tag in doc.find_all('meta', property='og:locale'):
        tag['content'] = {'de': 'de_DE', 'pl': 'pl_PL'}[lang]

    # hreflang
    for tag in doc.find_all('link', rel='alternate'):
        if tag.get('hreflang'):
            tag.decompose()
    head = doc.head
    base = f"https://tagra.app/{page.strip('/')}/"
    alts = [('en', base), ('x-default', base)]
    for l in LANGS:
        if page.strip('/') in LOCALIZED[l] or l == lang:
            alts.insert(-1, (l, f"{base}{l}/"))
    for hl, href in alts:
        t = doc.new_tag('link', rel='alternate', href=href)
        t['hreflang'] = hl
        head.append(t)

    doc = build_nav(doc, page, lang)

    dst_dir = os.path.join(ROOT, page, lang)
    os.makedirs(dst_dir, exist_ok=True)
    out = str(doc)
    open(os.path.join(dst_dir, 'index.html'), 'w', encoding='utf-8').write(out)
    print(f"  ✅ /{page}/{lang}/  ({len(out)//1024} KB, {len(segs)} segmentů)")


def load_dict(lang):
    """Glosář + případný per-page slovník."""
    d = {}
    p = os.path.join(I18N, f'_common.{lang}.json')
    if os.path.exists(p):
        d.update(json.load(open(p, encoding='utf-8')))
    return d


def cmd_todo(page, lang):
    """Vypíše segmenty, které glosář nepokrývá — ty je potřeba přeložit."""
    ef = os.path.join(I18N, page_slug(page) + '.en.json')
    src = json.load(open(ef, encoding='utf-8'))
    gl = load_dict(lang)
    todo, seen = [], set()
    pool = [s['en'] for s in src['segments']]
    for blk in src.get('ld', []):        # ld+json schema patří taky do překladu
        pool += blk
    for en in pool:
        if en in gl or en in seen:
            continue
        seen.add(en)
        todo.append(en)
    print(f"  glosář pokryl {len(src['segments']) - sum(1 for s in src['segments'] if s['en'] not in gl)}"
          f"/{len(src['segments'])} segmentů")
    print(f"  k překladu: {len(todo)} unikátních\n")
    json.dump(todo, open(os.path.join(I18N, f"{page_slug(page)}.todo.{lang}.json"),
                         'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for t in todo:
        print(f"    {t}")


def cmd_merge(page, lang):
    """Slije glosář + per-page překlady do finálního <slug>.<lang>.json."""
    ef = os.path.join(I18N, page_slug(page) + '.en.json')
    src = json.load(open(ef, encoding='utf-8'))
    gl = load_dict(lang)

    pf = os.path.join(I18N, f'{page_slug(page)}.tr.{lang}.json')
    if os.path.exists(pf):
        gl.update(json.load(open(pf, encoding='utf-8')))

    miss = []
    segs = []
    for s in src['segments']:
        t = gl.get(s['en'])
        if t is None:
            miss.append(s['en'])
            t = s['en']
        segs.append({'i': s['i'], 'k': s['k'], lang: t})

    lds = []
    for blk in src['ld']:
        row = []
        for v in blk:
            t = gl.get(v)
            if t is None:
                miss.append(v)
                t = v
            row.append(t)
        lds.append(row)

    if miss:
        print(f"  ⚠️  {len(miss)} nepřeložených segmentů (zůstávají anglicky):")
        for m in miss[:12]:
            print(f"      {m[:70]}")
    json.dump({'page': page, 'segments': segs, 'ld': lds},
              open(os.path.join(I18N, f'{page_slug(page)}.{lang}.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(f"  ✅ merge hotov — {len(segs) - len(miss)}/{len(segs)} přeloženo")


def cmd_hreflang(page):
    """Doplní RECIPROČNÍ hreflang do anglického originálu."""
    src = os.path.join(ROOT, page, 'index.html')
    doc = BeautifulSoup(open(src, encoding='utf-8').read(), 'lxml')
    for t in doc.find_all('link', rel='alternate'):
        if t.get('hreflang'):
            t.decompose()
    base = f"https://tagra.app/{page.strip('/')}/"
    alts = [('en', base)]
    for l in LANGS:
        if os.path.exists(os.path.join(ROOT, page, l, 'index.html')):
            alts.append((l, f"{base}{l}/"))
    alts.append(('x-default', base))
    for hl, href in alts:
        t = doc.new_tag('link', rel='alternate', href=href)
        t['hreflang'] = hl
        doc.head.append(t)
    open(src, 'w', encoding='utf-8').write(str(doc))
    print(f"  ✅ /{page}/ hreflang → {[a[0] for a in alts]}")


if __name__ == '__main__':
    load_localized()
    cmd = sys.argv[1]
    if cmd == 'extract':
        cmd_extract(sys.argv[2])
    elif cmd == 'todo':
        cmd_todo(sys.argv[2], sys.argv[3])
    elif cmd == 'merge':
        cmd_merge(sys.argv[2], sys.argv[3])
    elif cmd == 'apply':
        cmd_apply(sys.argv[2], sys.argv[3])
    elif cmd == 'hreflang':
        cmd_hreflang(sys.argv[2])
    else:
        sys.exit('extract <page> | todo <page> <lang> | merge <page> <lang> | apply <page> <lang>')
