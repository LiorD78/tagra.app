#!/usr/bin/env python3
"""Generuje hreflang sitemapy TRUCKMALL CZ<->SK (jen stdlib)."""
import re, sys, time, urllib.request, gzip, os
import xml.etree.ElementTree as ET
from xml.sax.saxutils import escape

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")
CZ_ROOT, SK_ROOT = "https://www.truckmall.cz/", "https://www.truckmall.sk/"
ID_RE = re.compile(r"-([acp]\d+)/$")
MAX_URLS = 50000
MAX_BYTES = 45 * 1024 * 1024
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "sitemaps")


def fetch(url):
    for i in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Encoding": "gzip"})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
                if r.headers.get("Content-Encoding") == "gzip" or data[:2] == b"\x1f\x8b":
                    data = gzip.decompress(data)
                return data
        except Exception as e:
            print(f"  pokus {i+1} selhal pro {url}: {e}", file=sys.stderr)
            time.sleep(2 * (i + 1))
    raise SystemExit(f"Nelze stáhnout {url}")


def locs(xml_bytes):
    root = ET.fromstring(xml_bytes)
    kind = root.tag.split("}")[-1]
    out = [e.text.strip() for e in root.iter() if e.tag.split("}")[-1] == "loc" and e.text]
    return kind, out


def collect(root_sitemap):
    kind, items = locs(fetch(root_sitemap))
    if kind != "sitemapindex":
        return items
    urls = []
    for sm in items:
        k, sub = locs(fetch(sm))
        urls.extend(sub)
    return urls


def id_map(urls):
    m, skipped, dup = {}, 0, 0
    for u in urls:
        if "?" in u:
            skipped += 1
            continue
        mt = ID_RE.search(u)
        if not mt:
            continue
        if mt.group(1) in m:
            dup += 1
            continue
        m[mt.group(1)] = u
    return m, skipped, dup


def write_files(name, pairs, self_idx):
    """pairs: [(cz, sk)], self_idx 0=CZ, 1=SK. Vrací seznam souborů."""
    def entry(p):
        s = ["  <url>", f"    <loc>{escape(p[self_idx])}</loc>",
             f'    <xhtml:link rel="alternate" hreflang="cs-CZ" href="{escape(p[0])}"/>',
             f'    <xhtml:link rel="alternate" hreflang="sk-SK" href="{escape(p[1])}"/>',
             "  </url>\n"]
        return "\n".join(s)
    head = ('<?xml version="1.0" encoding="UTF-8"?>\n<urlset '
            'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
            'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n')
    tail = "</urlset>\n"
    chunks, cur, size = [], [], len(head) + len(tail)
    for p in pairs:
        e = entry(p)
        b = len(e.encode())
        if cur and (len(cur) >= MAX_URLS or size + b > MAX_BYTES):
            chunks.append(cur); cur, size = [], len(head) + len(tail)
        cur.append(e); size += b
    chunks.append(cur)
    files = []
    for i, c in enumerate(chunks, 1):
        fn = f"{name}.xml" if len(chunks) == 1 else f"{name}-{i}.xml"
        with open(os.path.join(OUT, fn), "w", encoding="utf-8") as f:
            f.write(head + "".join(c) + tail)
        files.append(fn)
    return files


def main():
    os.makedirs(OUT, exist_ok=True)
    print("Stahuji CZ sitemapu…")
    cz_all = collect(CZ_ROOT + "sitemap.xml")
    print("Stahuji SK sitemapu…")
    sk_all = collect(SK_ROOT + "sitemap.xml")
    cz, cz_skip, cz_dup = id_map(cz_all)
    sk, sk_skip, sk_dup = id_map(sk_all)
    ids = sorted(i for i in cz if i in sk)
    pairs = [(CZ_ROOT, SK_ROOT)] + [(cz[i], sk[i]) for i in ids]
    files = write_files("truckmall-hreflang-cz", pairs, 0) + write_files("truckmall-hreflang-sk", pairs, 1)
    cnt = {t: sum(1 for i in ids if i[0] == t) for t in "pca"}
    print(f"Párů celkem (bez HP): {len(ids)}  + HP = {len(pairs)}")
    print(f"  p={cnt['p']} c={cnt['c']} a={cnt['a']}")
    print(f"Vynechaných URL s '?': CZ {cz_skip}, SK {sk_skip}")
    print(f"Nespárovaných: CZ {len(set(cz)-set(sk))}, SK {len(set(sk)-set(cz))}")
    print(f"Duplicitních ID (ignorováno): CZ {cz_dup}, SK {sk_dup}")
    print("Soubory:", ", ".join(files))


if __name__ == "__main__":
    main()
