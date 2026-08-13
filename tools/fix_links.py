#!/usr/bin/env python3
"""Opraví interní odkazy na lokalizovaných stránkách: EN cesta -> lokalizovaná
(pokud pro daný jazyk existuje). Jazykový přepínač se nedotýká."""
import json,os,sys
from bs4 import BeautifulSoup
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SM=json.load(open(os.path.join(ROOT,'i18n','slugmap.json'),encoding='utf-8'))
EN2ID={m['en'].strip('/'):pid for pid,m in SM.items()}
LANGS=('de','pl','el','hu')

def exists(pid,l):
    p=SM[pid].get(l,'').strip('/')
    return p and os.path.exists(os.path.join(ROOT,p,'index.html'))

def loc(href,l):
    if not href.startswith('/'): return href
    body=href.split('?')[0].split('#')[0]; tail=href[len(body):]
    pid=EN2ID.get(body.strip('/'))
    if pid and exists(pid,l): return f"/{SM[pid][l].strip('/')}/"+tail
    return href

total=0
for l in LANGS:
    for pid,m in SM.items():
        p=m.get(l,'').strip('/')
        f=os.path.join(ROOT,p,'index.html') if p else None
        if not f or not os.path.exists(f): continue
        html=open(f,encoding='utf-8').read()
        d=BeautifulSoup(html,'lxml')
        n=0
        for a in d.find_all('a',href=True):
            if a.find_parent(class_='nav-lang-menu'): continue
            new=loc(a['href'],l)
            if new!=a['href']: a['href']=new; n+=1
        if n:
            open(f,'w',encoding='utf-8').write(str(d)); total+=n
            print(f"  /{p}/  {n} odkazů")
print(f"celkem opraveno: {total}")
