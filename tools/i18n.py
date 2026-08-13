#!/usr/bin/env python3
"""
i18n pipeline pro tagra.app  (v2 — slugmap-driven, architektura /{lang}/{slug}/)

  extract  <page_id>              -> tools/i18n/<page_id>.en.json
  todo     <page_id> <lang>       -> tools/i18n/<page_id>.todo.<lang>.json   (co glosář nepokrývá)
  merge    <page_id> <lang>       -> tools/i18n/<page_id>.<lang>.json        (glosář + .tr.<lang>.json)
  apply    <page_id> <lang>       -> <slug z i18n/slugmap.json>/index.html
  hreflang <page_id>              -> doplní reciproční hreflang do EN originálu
  langmenu                        -> sjednotí jazykový přepínač na všech stránkách

Segmenty se párují podle POŘADÍ deterministického walku (index) — stejný walk
v extract i apply, mapování 1:1.
"""
import json, os, re, sys
from bs4 import BeautifulSoup, NavigableString, Comment, Doctype

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
I18N = os.path.join(ROOT, 'tools', 'i18n')
SLUGMAP = json.load(open(os.path.join(ROOT, 'i18n', 'slugmap.json'), encoding='utf-8'))
SKIP_TAGS = {'script', 'style', 'noscript', 'title'}

META_KEYS = {'description', 'keywords',
             'og:title', 'og:description', 'og:site_name', 'og:image:alt',
             'twitter:title', 'twitter:description', 'twitter:image:alt'}

LD_KEYS = {'name', 'description', 'text', 'headline', 'alternateName',
           'about', 'articleSection', 'jobTitle', 'caption'}

LANGS = {
    'de': {'code': 'de', 'label': 'DE', 'native': 'Deutsch',   'locale': 'de_DE'},
    'pl': {'code': 'pl', 'label': 'PL', 'native': 'Polski',    'locale': 'pl_PL'},
    'el': {'code': 'el', 'label': 'EL', 'native': 'Ελληνικά',  'locale': 'el_GR'},
    # 'hu' přidat zpět při spuštění HU fáze (adresář /hu/ zatím neexistuje)
}
EXTERNAL_LANGS = [('cs', 'Čeština', 'https://www.tdt.cz/'),
                  ('sk', 'Slovenčina', 'https://www.tdt.sk/')]


def en_path(page_id):
    return SLUGMAP[page_id]['en'].strip('/')


def lang_path(page_id, lang):
    return SLUGMAP[page_id].get(lang, '').strip('/')


def src_file(page_id):
    p = en_path(page_id)
    return os.path.join(ROOT, p, 'index.html') if p else os.path.join(ROOT, 'index.html')


def dst_file(page_id, lang):
    return os.path.join(ROOT, lang_path(page_id, lang), 'index.html')


def exists_loc(page_id, lang):
    return lang_path(page_id, lang) and os.path.exists(dst_file(page_id, lang))


def url_of(page_id, lang=None):
    p = en_path(page_id) if lang in (None, 'en') else lang_path(page_id, lang)
    return f"https://tagra.app/{p + '/' if p else ''}"


# EN cesta -> page_id (pro přepis interních odkazů)
EN2ID = {en_path(pid): pid for pid in SLUGMAP}


def walk(doc):
    items = []
    if doc.title and doc.title.string:
        items.append(('title', doc.title, None, doc.title.string.strip()))
    for tag in doc.find_all('meta'):
        key = tag.get('name') or tag.get('property')
        if key in META_KEYS and tag.get('content'):
            items.append(('meta', tag, 'content', tag['content'].strip()))
    for node in doc.find_all(string=True):
        if isinstance(node, (Comment, Doctype)):
            continue
        if node.parent.name in SKIP_TAGS:
            continue
        txt = str(node)
        if txt.strip() and any(c.isalpha() for c in txt):
            items.append(('text', node, None, txt.strip()))
    for tag in doc.find_all(True):
        for attr in ('alt', 'aria-label', 'placeholder'):
            v = tag.get(attr)
            if v and isinstance(v, str) and v.strip() and any(c.isalpha() for c in v):
                items.append(('attr', tag, attr, v.strip()))
    return items


def ld_walk(obj, out):
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
        for v in obj:
            if isinstance(v, str):
                continue
            ld_apply(v, tr, idx)


def cmd_extract(page_id):
    doc = BeautifulSoup(open(src_file(page_id), encoding='utf-8').read(), 'lxml')
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
    dst = os.path.join(I18N, f'{page_id}.en.json')
    json.dump({'page': page_id, 'segments': segs, 'ld': lds},
              open(dst, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f"  {dst}  ({len(segs)} segmentů, {len(lds)} ld+json bloků)")


def localize_href(href, lang):
    """Přepiš interní EN odkaz na lokalizovanou variantu, pokud existuje."""
    if not href or not href.startswith('/'):
        return href
    body = href.split('?')[0].split('#')[0]
    tail = href[len(body):]
    clean = body.strip('/')
    pid = EN2ID.get(clean)
    if pid and exists_loc(pid, lang):
        p = lang_path(pid, lang)
        return f"/{p}/" + tail
    return href


def build_nav(doc, page_id, lang):
    for a in doc.find_all('a', href=True):
        if a.find_parent(class_='nav-lang-menu'):
            continue
        a['href'] = localize_href(a['href'], lang)
    set_langmenu(doc, lang)
    return doc


def set_langmenu(doc, lang):
    """Sjednoť jazykový přepínač: EN + všechny jazyky se stránkou + externí CZ/SK."""
    summ = doc.select_one('.nav-lang summary')
    if summ:
        label = 'EN' if lang == 'en' else LANGS[lang]['label']
        summ.string = label
        summ['aria-label'] = f"Language: {label}"
    menu = doc.select_one('.nav-lang-menu')
    if not menu:
        return doc
    for a in menu.find_all('a'):
        a.decompose()
    rows = [('en', 'English', '/')] + [(l, LANGS[l]['native'], f"/{l}/") for l in LANGS]
    for code, native, href in rows:
        a = doc.new_tag('a', href=href)
        a['hreflang'] = code
        a.string = native
        if code == lang:
            a['class'] = 'active'
            a['aria-current'] = 'page'
        menu.append(a)
    for code, native, href in EXTERNAL_LANGS:
        a = doc.new_tag('a', href=href, target='_blank', rel='noopener')
        a['hreflang'] = code
        a.string = native
        menu.append(a)
    return doc


def set_hreflang(doc, page_id, self_lang=None):
    for tag in doc.find_all('link', rel='alternate'):
        if tag.get('hreflang'):
            tag.decompose()
    alts = [('en', url_of(page_id))]
    for l in LANGS:
        if exists_loc(page_id, l) or l == self_lang:
            alts.append((l, url_of(page_id, l)))
    alts.append(('x-default', url_of(page_id)))
    for hl, href in alts:
        t = doc.new_tag('link', rel='alternate', href=href)
        t['hreflang'] = hl
        doc.head.append(t)
    return doc


def cmd_apply(page_id, lang):
    tf = os.path.join(I18N, f'{page_id}.{lang}.json')
    if not os.path.exists(tf):
        sys.exit(f"  ✗ chybí překlad: {tf}")
    tr = json.load(open(tf, encoding='utf-8'))
    doc = BeautifulSoup(open(src_file(page_id), encoding='utf-8').read(), 'lxml')
    items = walk(doc)
    segs = tr['segments']
    if len(segs) != len(items):
        sys.exit(f"  ✗ NESOULAD: stránka má {len(items)} segmentů, překlad {len(segs)}")

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

    doc.html['lang'] = LANGS[lang]['code']
    url = url_of(page_id, lang)
    can = doc.find('link', rel='canonical')
    if can:
        can['href'] = url
    for tag in doc.find_all('meta', property='og:url'):
        tag['content'] = url
    for tag in doc.find_all('meta', property='og:locale'):
        tag['content'] = LANGS[lang]['locale']

    doc = set_hreflang(doc, page_id, self_lang=lang)
    doc = build_nav(doc, page_id, lang)

    dst = dst_file(page_id, lang)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    out = str(doc)
    open(dst, 'w', encoding='utf-8').write(out)
    print(f"  ✅ /{lang_path(page_id, lang)}/  ({len(out)//1024} KB, {len(segs)} segmentů)")


def load_dict(lang):
    d = {}
    p = os.path.join(I18N, f'_common.{lang}.json')
    if os.path.exists(p):
        d.update(json.load(open(p, encoding='utf-8')))
    return d


def cmd_todo(page_id, lang):
    src = json.load(open(os.path.join(I18N, f'{page_id}.en.json'), encoding='utf-8'))
    gl = load_dict(lang)
    pf = os.path.join(I18N, f'{page_id}.tr.{lang}.json')
    if os.path.exists(pf):
        gl.update(json.load(open(pf, encoding='utf-8')))
    todo, seen = [], set()
    pool = [s['en'] for s in src['segments']]
    for blk in src.get('ld', []):
        pool += blk
    for en in pool:
        if en in gl or en in seen:
            continue
        seen.add(en)
        todo.append(en)
    json.dump(todo, open(os.path.join(I18N, f'{page_id}.todo.{lang}.json'),
                         'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f"  {page_id}/{lang}: k překladu {len(todo)} unikátních segmentů")


def cmd_merge(page_id, lang):
    src = json.load(open(os.path.join(I18N, f'{page_id}.en.json'), encoding='utf-8'))
    gl = load_dict(lang)
    pf = os.path.join(I18N, f'{page_id}.tr.{lang}.json')
    if os.path.exists(pf):
        gl.update(json.load(open(pf, encoding='utf-8')))
    miss, segs = [], []
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
        print(f"  ⚠️  {len(miss)} nepřeložených:")
        for m in miss[:15]:
            print(f"      {m[:80]}")
    json.dump({'page': page_id, 'segments': segs, 'ld': lds},
              open(os.path.join(I18N, f'{page_id}.{lang}.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(f"  ✅ merge {page_id}/{lang} — {len(segs) - len([m for m in miss])}/{len(segs)}")


def cmd_hreflang(page_id):
    src = src_file(page_id)
    doc = BeautifulSoup(open(src, encoding='utf-8').read(), 'lxml')
    doc = set_hreflang(doc, page_id)
    doc = set_langmenu(doc, 'en')
    open(src, 'w', encoding='utf-8').write(str(doc))
    print(f"  ✅ EN /{en_path(page_id)}/ hreflang + langmenu")


def cmd_langmenu():
    """Sjednoť jazykový přepínač napříč VŠEMI stránkami (vč. článků a návodů)."""
    n = 0
    for dirpath, _, files in os.walk(ROOT):
        if any(x in dirpath for x in ('.git', 'tools', 'tmp', 'email-preview')):
            continue
        if 'index.html' not in files:
            continue
        p = os.path.join(dirpath, 'index.html')
        html = open(p, encoding='utf-8').read()
        if 'nav-lang-menu' not in html:
            continue
        rel = os.path.relpath(dirpath, ROOT).replace(os.sep, '/')
        rel = '' if rel == '.' else rel
        lang = 'en'
        for l in LANGS:
            if rel == l or rel.startswith(l + '/'):
                lang = l
        doc = BeautifulSoup(html, 'lxml')
        set_langmenu(doc, lang)
        open(p, 'w', encoding='utf-8').write(str(doc))
        n += 1
    print(f"  ✅ jazykový přepínač sjednocen na {n} stránkách")


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'extract':   cmd_extract(sys.argv[2])
    elif cmd == 'todo':    cmd_todo(sys.argv[2], sys.argv[3])
    elif cmd == 'merge':   cmd_merge(sys.argv[2], sys.argv[3])
    elif cmd == 'apply':   cmd_apply(sys.argv[2], sys.argv[3])
    elif cmd == 'hreflang':cmd_hreflang(sys.argv[2])
    elif cmd == 'langmenu':cmd_langmenu()
    else: sys.exit('neznámý příkaz')
