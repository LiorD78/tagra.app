#!/usr/bin/env node
/* Most článek → nákup (79-1, 21. 11. 2026) — jediný generátor horního boxu, koncového boxu
 * a mobilní lišty na chybových článcích a článcích se symboly (10 jazyků).
 *
 * Proč Node a ne Python (brief říká bridge.py): v sandboxu GitHub Action je zápis souborů
 * přes python3 blokovaný (viz CLAUDE.md truckmall-ops); chování je stejné jako v zadání.
 *
 * Rozsah: index.html s driver CTA `audience=driver&amp;src=<id>`, které mají starý horní box
 * (data-cc=) nebo src=symbols. Mimo: src=driver, driver-card, article-shopbox, /try/, e-mailové náhledy.
 * Idempotence: stránka s data-bridge-v="2" se přeskočí; starý cc-top se nahradí, ne zdvojí.
 * Texty: tools/code_cta/bridge-strings.json (crew, beze změn); formulář: tools/code_cta/strings.json
 * (+ es doplněné z /es/ článků a /es/prueba-gratis/).
 *
 * Spuštění z kořene repa:  node tools/code_cta/bridge.js [--dry-run]
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry-run');
const B = JSON.parse(fs.readFileSync('tools/code_cta/bridge-strings.json', 'utf8'));
const F = JSON.parse(fs.readFileSync('tools/code_cta/strings.json', 'utf8'));
F.es = {
  name: 'Nombre', email: 'Correo electrónico', mbtn: 'Enviar el enlace por correo electrónico',
  sending: 'Enviando…',
  ok: '¡Listo! Revisa tu bandeja de entrada y abre el correo en el ordenador para descargar TAGRA.',
  err: 'Algo ha salido mal. Vuelve a intentarlo o utiliza el', errlink: 'formulario completo', langval: 'es',
  gdpr: 'Consiento el tratamiento de mis datos personales para que se pongan en contacto conmigo en relación con TAGRA. Más información en la <a href="/privacy/" rel="noopener noreferrer" target="_blank">política de privacidad</a>.',
  try: '/es/prueba-gratis/'
};

/* Mapa shopu (až budou jazykové shopy, změní se jen tady a sweep se pustí znovu). */
const SHOP = {
  de: 'https://shop.tagra.app/de/tagra-trucker/',
  pl: 'https://shop.tagra.app/pl/tagra-trucker/',
  hu: 'https://shop.tagra.app/hu/tagra-trucker/'
};
const SHOP_DEFAULT = 'https://shop.tagra.app/tagra-trucker/';
/* Stránka pro firmy v jazyce (z navigace jazyka) — jen pro fleet_link u symbolů. */
const FLEET = {
  en: '/fleet/', de: '/de/fuhrpark/', pl: '/pl/dla-przewoznikow/', hu: '/hu/fuvarozoknak/', ro: '/ro/pentru-firme/',
  fr: '/fr/entreprises/', el: '/el/stolos/', it: '/it/per-aziende/', nl: '/nl/voor-transportbedrijven/', es: '/es/empresas/'
};
const NAV_V = '20261121a', CSS_V = '20261121b';
const SPARK_ICON = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>';
const aiRow = (lang) => `<p class="br-ai">${SPARK_ICON}<span>${esc(B[lang].ai)}</span></p>\n`;
const READER_ICON = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="13" height="10" rx="2"/><path d="M16 10h3a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-3"/><path d="M7 11h5M7 13.5h3"/></svg>';

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const langOf = (p) => { const f = p.split('/')[0]; return f === 'articles' ? 'en' : f; };

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.name === 'index.html') out.push(p);
  }
  return out;
}

/* Index za uzavíracím </div> pro <div> začínající na `start`. */
function divEnd(doc, start) {
  const re = /<div\b|<\/div>/g;
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(doc))) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) return m.index + m[0].length;
  }
  return -1;
}

const shopUrl = (lang) => SHOP[lang] || SHOP_DEFAULT;
const trialUrl = (lang, src) => `${F[lang].try}?audience=driver&amp;src=${esc(src)}-bridge`;

function link(cls, pos, cta, href, text) {
  return `<a class="${cls}" data-bridge="${pos}" data-cta="${cta}" href="${href}"${cta === 'buy' ? ' rel="noopener"' : ''}>${text}</a>`;
}

function topBox(lang, src, kind) {
  const t = B[lang], f = F[lang], pos = kind + '-top';
  return `<div class="cta-box cc-top br-box br-top" data-bridge-v="2" data-br-box="${pos}" data-cc="${esc(src)}" data-src="${esc(src)}">
<div class="br-eyebrow">${esc(t.eyebrow)}</div>
<h3>${esc(t['title_' + kind])}</h3>
<p>${esc(t['text_' + kind])}</p>
<p class="br-price">${esc(t.price)}</p>
<p class="br-perk">${READER_ICON}<span>${esc(t.perk)}</span></p>
${aiRow(lang)}${link('cta-btn br-buy', pos, 'buy', shopUrl(lang), esc(t.btn_buy))}
${link('br-trial br-desk', pos, 'trial', trialUrl(lang, src), esc(t.btn_trial))}
<details class="br-mail">
<summary data-bridge="${pos}" data-cta="mail">${esc(t.mail_toggle)}</summary>
<form action="${f.try}" class="cc-mail" data-err="${esc(f.err)}" data-errlink="${esc(f.errlink)}" data-ok="${esc(f.ok)}" data-sending="${esc(f.sending)}" data-try="${f.try}?audience=driver&amp;src=${esc(src)}-mail" method="POST">
<input name="form-name" type="hidden" value="tagra-trial"/>
<input name="audience" type="hidden" value="driver"/>
<input name="language" type="hidden" value="${f.langval}"/>
<input class="cc-src" name="source_url" type="hidden" value=""/>
<p class="cc-hp" hidden=""><input autocomplete="off" name="bot-field" tabindex="-1"/></p>
<input aria-label="${esc(f.name)}" autocomplete="given-name" minlength="2" name="name" placeholder="${esc(f.name)}" required="" type="text"/>
<input aria-label="${esc(f.email)}" autocomplete="email" inputmode="email" name="email" placeholder="${esc(f.email)}" required="" type="email"/>
<label class="cc-gdpr"><input name="gdpr_consent" required="" type="checkbox" value="yes"/> <span>${f.gdpr}</span></label>
<button class="cta-btn cc-send" type="submit">${esc(f.mbtn)}</button>
<p aria-live="polite" class="cc-msg" role="status"></p>
</form>
</details>
<blockquote class="br-review">${esc(t.review)}<cite>${esc(t.review_src)}</cite></blockquote>
</div>
`;
}

function endBox(lang, src, kind, prefix) {
  const t = B[lang], pos = kind + '-end';
  return `<div class="cta-box br-box br-end" data-bridge-v="2" data-br-box="${pos}" data-src="${esc(src)}">
${prefix}<p class="br-price">${esc(t.price)}</p>
${link('cta-btn br-buy', pos, 'buy', shopUrl(lang), esc(t.btn_buy))}
${link('br-trial', pos, 'trial', trialUrl(lang, src), esc(t.btn_trial))}
${kind === 'sym' ? link('br-fleet', pos, 'fleet', FLEET[lang], esc(t.fleet_link)) + '\n' : ''}</div>
`;
}

function bar(lang, src) {
  const t = B[lang];
  return `<div aria-label="TAGRA TRUCKER" class="br-bar" data-bridge-v="2" data-src="${esc(src)}" id="brBar" role="complementary">
<div class="br-bar-inner">
<span class="br-bar-text">${esc(t.sticky_text)}</span>
${link('br-bar-btn', 'sticky', 'buy', shopUrl(lang), esc(t.sticky_btn))}
<button aria-label="${esc(t.close)}" class="br-bar-x" type="button">×</button>
</div>
</div>
`;
}

const changed = [], skipped = [], problems = [];
const stats = {};

for (const p of walk('.', []).map((x) => x.replace(/^\.\//, '')).sort()) {
  if (p.startsWith('try/email-preview')) continue;
  let doc = fs.readFileSync(p, 'utf8');
  const m = doc.match(/audience=driver&amp;src=([\w-]+)/);
  if (!m) continue;
  const symbols = m[1] === 'symbols';
  const hasCc = doc.includes('data-cc="');
  if (['driver', 'driver-card', 'article-shopbox'].includes(m[1]) || (!symbols && !hasCc)) continue;
  const lang = langOf(p);
  if (!B[lang] || !F[lang]) { problems.push([p, 'lang ' + lang]); continue; }
  if (doc.includes('data-bridge-v="2"')) {
    /* 79-10: hotové stránky jen dostanou řádek AI pod perk */
    if (!doc.includes('class="br-ai"')) {
      const re = /(<p class="br-perk">[\s\S]*?<\/p>\n)/;
      if (!re.test(doc)) { problems.push([p, 'no br-perk']); continue; }
      doc = doc.replace(re, (x) => x + aiRow(lang));
      changed.push(p); stats[lang + '/ai'] = (stats[lang + '/ai'] || 0) + 1;
      if (!DRY) fs.writeFileSync(p, doc);
    } else skipped.push(p);
    continue;
  }
  const kind = symbols ? 'sym' : 'err';
  const src = m[1];
  const main = doc.search(/<main\b/);
  if (main < 0) { problems.push([p, 'no <main>']); continue; }

  /* 1) koncový box (dřív než horní, aby indexy seděly) */
  let endStart = -1;
  const trialRe = new RegExp(`<a class="cta-btn" href="[^"]*audience=driver&amp;src=${src}"`);
  const boxRe = /<div class="cta-box"[^>]*>/g;
  boxRe.lastIndex = main;
  let bm, cands = [];
  while ((bm = boxRe.exec(doc))) {
    const e = divEnd(doc, bm.index);
    if (e > 0 && trialRe.test(doc.slice(bm.index, e))) cands.push([bm.index, e]);
  }
  /* chybový článek: první takový box po horním boxu (druhá sekce); symboly: poslední */
  const topOld = doc.indexOf('<div class="cta-box cc-top"');
  if (!symbols) cands = cands.filter((c) => c[0] > topOld);
  const end = symbols ? cands[cands.length - 1] : cands[0];
  if (!end) { problems.push([p, 'no end box']); continue; }
  const endHtml = doc.slice(end[0], end[1]);
  const open = endHtml.match(/^<div class="cta-box"[^>]*>\n?/)[0];
  const aIdx = endHtml.search(/<a class="cta-btn"/);
  const prefix = endHtml.slice(open.length, aIdx);
  if (/<a\b/.test(prefix) || !/<h3>/.test(prefix)) { problems.push([p, 'end box prefix']); continue; }
  const newEnd = endBox(lang, src, kind, prefix);

  /* 2) horní box */
  let topS, topE;
  if (symbols) {
    topS = doc.indexOf('<div class="cta-box">', main);
    if (topS < 0 || topS > end[0] || (topS === end[0])) { problems.push([p, 'no top box']); continue; }
    topE = divEnd(doc, topS);
  } else {
    topS = topOld;
    if (topS < 0) { problems.push([p, 'no cc-top']); continue; }
    topE = divEnd(doc, topS);
  }
  if (topE > end[0] && topS < end[0]) { problems.push([p, 'overlap']); continue; }
  if (doc[topE] === '\n') topE++;
  const eEnd = doc[end[1]] === '\n' ? end[1] + 1 : end[1];

  /* sestavit od konce, ať indexy platí */
  const parts = [[end[0], eEnd, newEnd], [topS, topE, topBox(lang, src, kind)]].sort((a, b) => b[0] - a[0]);
  for (const [s, e, h] of parts) doc = doc.slice(0, s) + h + doc.slice(e);

  /* 3) lišta; u symbolů starou .sticky-cta nahradit */
  if (symbols) {
    const sm = doc.match(/<div [^>]*id="stickyCta"[^>]*>/);
    const si = sm ? sm.index : -1;
    if (si < 0) { problems.push([p, 'no old sticky']); continue; }
    const se = divEnd(doc, si);
    doc = doc.slice(0, si) + doc.slice(se).replace(/^\n/, '');
    const before = doc.length;
    doc = doc.replace(/\/\* STICKY CTA BAR \*\/\s*\(function\(\)\{[\s\S]*?\n\}\)\(\);\n?/, '');
    if (doc.length === before || doc.includes('stickyCta')) { problems.push([p, 'old sticky js']); continue; }
  }
  const bi = doc.lastIndexOf('</body>');
  if (bi < 0) { problems.push([p, 'no </body>']); continue; }
  /* lišta před první <script> za patičkou, aby zůstala v těle před skripty */
  const footEnd = doc.lastIndexOf('</footer>');
  const at = footEnd > 0 ? footEnd + '</footer>'.length : bi;
  doc = doc.slice(0, at) + '\n' + bar(lang, src).trimEnd() + doc.slice(at);

  /* 4) verze souborů, ať si je prohlížeč stáhne znovu */
  doc = doc.replace(/(\/assets\/js\/nav\.js\?v=)[0-9a-z]+/, '$1' + NAV_V)
    .replace(/(\/assets\/js\/analytics\.js\?v=)[0-9a-z]+/, '$1' + NAV_V)
    .replace(/(\/assets\/css\/core\.bundle\.css\?v=)[0-9a-z]+/, '$1' + CSS_V);

  const k = `${lang}/${kind}`;
  stats[k] = (stats[k] || 0) + 1;
  changed.push(p);
  if (!DRY) fs.writeFileSync(p, doc);
}

/* Sdílené CSS / JS (idempotentně podle značky) */
function appendOnce(target, snippetFile, marker, afterText) {
  let cur = fs.readFileSync(target, 'utf8');
  if (cur.includes(marker)) { skipped.push(target); return; }
  const add = fs.readFileSync(snippetFile, 'utf8');
  if (afterText) {
    const i = cur.indexOf(afterText);
    if (i < 0) { problems.push([target, 'anchor missing']); return; }
    const at = i + afterText.length;
    cur = cur.slice(0, at) + '\n' + add.trimEnd() + cur.slice(at);
  } else {
    cur = cur.replace(/\n*$/, '\n') + add;
  }
  changed.push(target);
  if (!DRY) fs.writeFileSync(target, cur);
}
const ccCss = fs.readFileSync('tools/code_cta/cc.css', 'utf8').trim();
appendOnce('assets/css/components.css', 'tools/code_cta/bridge.css', '.br-eyebrow', ccCss);
appendOnce('assets/css/core.bundle.css', 'tools/code_cta/bridge.css', '.br-eyebrow', ccCss);
appendOnce('assets/js/nav.js', 'tools/code_cta/bridge-bar.js', 'brBar');
appendOnce('assets/js/analytics.js', 'tools/code_cta/bridge-analytics.js', 'bridge_click', "W.gtag('event', 'shop_click', params);\n    } catch (x) {}\n  }, true);\n");

/* Chat bublina se zvedá i nad novou lištou; shop_click rozliší pozici mostu */
function patch(target, from, to) {
  const cur = fs.readFileSync(target, 'utf8');
  if (cur.includes(to)) return;
  if (!cur.includes(from)) { problems.push([target, 'patch anchor ' + from.slice(0, 30)]); return; }
  changed.push(target + ' (patch)');
  if (!DRY) fs.writeFileSync(target, cur.replace(from, to));
}
patch('assets/js/nav.js', "function bar()  { return document.getElementById('stickyCta'); }",
  "function bar()  { return document.getElementById('stickyCta') || document.getElementById('brBar'); }");
patch('assets/js/analytics.js', "    var v = c && c.getAttribute('data-cta');\n    if (v) return v;",
  "    var v = c && c.getAttribute('data-cta');\n    if (a.hasAttribute('data-bridge')) return 'bridge_' + a.getAttribute('data-bridge');\n    if (v) return v;");

console.log('změněno souborů:', changed.length, '(stránky:', Object.values(stats).reduce((a, b) => a + b, 0) + ')');
console.log(JSON.stringify(stats));
for (const s of skipped) console.log('SKIP (už hotovo)', s);
for (const x of problems) console.log('PROBLEM', ...x);
process.exit(problems.length ? 1 : 0);
