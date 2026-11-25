// bal. 90 RO: zrcadlo PR #368 (NL) – RO JS vrstva shopu ze zdrojů tools/i18n-src/shop-ro/ro_js_part1-3.json.
// Spouštět v kořeni repa tagra.app: node /home/claude/work/build_ro.mjs
import fs from 'node:fs';
const S = 'tools/i18n-src/';
const ld = (l) => Object.assign({}, ...[1, 2, 3].map(p => JSON.parse(fs.readFileSync(`${S}shop-${l}/${l}_js_part${p}.json`, 'utf8'))));
const NLJ = ld('nl'), ROJ = ld('ro');
const rd = (f) => fs.readFileSync(f, 'utf8'), wr = (f, s) => fs.writeFileSync(f, s);
const log = [];
function must(cond, msg) { if (!cond) { console.error('FAIL: ' + msg); process.exit(1); } }
function rep1(s, a, b, label) { const n = s.split(a).length - 1; must(n === 1, `${label}: očekáván 1 výskyt, nalezeno ${n}: ${a.slice(0, 90)}`); return s.replace(a, () => b); }

// --- balanced block extraction (string-aware) starting at index of '{'
function block(s, i) {
  let depth = 0, q = null;
  for (let j = i; j < s.length; j++) {
    const c = s[j];
    if (q) { if (c === '\\') { j++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return j + 1; }
  }
  must(false, 'nevyvážený blok');
}

// --- 1) dictionaries: add ro next to nl
function addRoDicts(file) {
  let s = rd(file); const base = file.split('/').pop();
  const re = /(["']?)nl\1\s*:\s*\{/g; let m, out = '', last = 0, count = 0;
  const objs = [...new Set(Object.keys(ROJ).filter(k => k.startsWith(base + '::')).map(k => k.split('::')[1].split('.')[0]))];
  while ((m = re.exec(s))) {
    const st = m.index + m[0].length - 1, en = block(s, st);
    const txt = s.slice(st, en);
    let obj; try { obj = Function('return (' + txt + ')')(); } catch (e) { continue; }
    if (typeof obj !== 'object') continue;
    const keys = Object.keys(obj);
    let O = objs.find(o => keys.every(k => (`${base}::${o}.${k}`) in ROJ));
    let ro = {};
    if (O) { for (const k of keys) ro[k] = ROJ[`${base}::${O}.${k}`]; }
    else {
      // map by NL value -> RO value via nl_js/ro_js (same key)
      const inv = {}; for (const k in NLJ) if (!(NLJ[k] in inv)) inv[NLJ[k]] = k;
      const miss = [];
      for (const k of keys) { const v = obj[k]; const kk = inv[v]; if (kk && ROJ[kk] !== undefined) ro[k] = ROJ[kk]; else miss.push(k); }
      if (miss.length) { log.push(`${file}: blok nl bez RO pro klíče: ${miss.join(', ')}`); ro.__MISS__ = miss.map(k => [k, obj[k]]); }
    }
    const roTxt = JSON.stringify(ro);
    const key = m[1] ? `${m[1]}ro${m[1]}` : 'ro';
    // insert ",ro:{…}" right after the nl block
    out += s.slice(last, en) + ',' + key + ':' + roTxt; last = en; count++;
  }
  out += s.slice(last);
  log.push(`${file}: +${count} RO slovník(ů)`);
  wr(file, out); return count;
}

// --- 2) shop.ro.js from shop.nl.js
function buildShopRo() {
  let s = rd('assets/js/shop.nl.js');
  const ks = Object.keys(NLJ).filter(k => k.startsWith('shop.js::')).sort((a, b) => NLJ[b].length - NLJ[a].length);
  let done = 0;
  for (const k of ks) {
    const a = NLJ[k], b = ROJ[k]; must(b !== undefined, 'chybí RO ' + k);
    const forms = [[a, b], [JSON.stringify(a).slice(1, -1), JSON.stringify(b).slice(1, -1)], [a.replace(/'/g, "\\'"), b.replace(/'/g, "\\'")], [JSON.stringify(a).slice(1, -1).replace(/'/g, "\\'"), JSON.stringify(b).slice(1, -1).replace(/'/g, "\\'")]];
    let hit = false;
    for (const [x, y] of forms) { if (x && s.includes(x)) { s = s.split(x).join(y); hit = true; break; } }
    if (hit) done++; else log.push('shop.ro.js: nenalezen literál ' + k);
  }
  s = s.replace(/^\/\* [^\n]*?\| {1,2}89 \(24\. 11\. 2026\): shop\.nl\.js = [^\n]*?\*\//, (h) => h.replace(/89 \(24\. 11\. 2026\): shop\.nl\.js = shop\.fr\.js struktura \+ NL literály z nl_js_part3\.json \(crew GPT \+ Gemini\); načítá shop\.js při <html lang="nl">/, '90 (25. 11. 2026): shop.ro.js = shop.nl.js struktura + RO literály z ro_js_part3.json (crew GPT + Gemini + Grok); načítá shop.js při <html lang="ro">'));
  // url / slug / locale mapping
  const pairs = [['https://tagra.app/nl/gratis-proefversie/', 'https://tagra.app/ro/incercare-gratuita/'], ["'nl-NL'", "'ro-RO'"], ['"nl-NL"', '"ro-RO"']];
  for (const [x, y] of pairs) s = s.split(x).join(y);
  wr('assets/js/shop.ro.js', s); log.push(`shop.ro.js: ${done}/${ks.length} literálů`);
}

// --- 3) code branches (mirror of NL diff)
function codeEdits() {
  // shop.js loader
  let f = 'assets/js/shop.js', s = rd(f);
  const nlLine = s.split('\n').find(l => l.includes("/^nl/i.test("));
  must(nlLine, 'shop.js nl loader');
  s = rep1(s, nlLine, nlLine + '\n' + nlLine.replace('/^nl/i', '/^ro/i').replace("'shop.nl.js'", "'shop.ro.js'").replace("shop.fr.js';document", "shop.ro.js';document"), f); wr(f, s);

  for (f of ['assets/js/shop-cro.js', 'assets/js/shop-fleet.js', 'assets/js/shop-variant.js']) {
    s = rd(f);
    s = rep1(s, "DU=LG==='nl',NL=DE||HU||PL||ES||IT||FR||DU,PFX=HU?'/hu':PL?'/pl':ES?'/es':IT?'/it':FR?'/fr':DU?'/nl':", "DU=LG==='nl',RO=LG==='ro',NL=DE||HU||PL||ES||IT||FR||DU||RO,PFX=HU?'/hu':PL?'/pl':ES?'/es':IT?'/it':FR?'/fr':DU?'/nl':RO?'/ro':", f);
    if (s.includes("DU?'/nl/cart/':")) s = rep1(s, "DU?'/nl/cart/':", "DU?'/nl/cart/':RO?'/ro/cos/':", f);
    wr(f, s);
  }
  f = 'assets/js/shop-cro.js'; s = rd(f);
  s = rep1(s, ":/^Add to cart\\s*/i,'')", ":RO?/^(Add to cart|(Adaugă )?[îi]n co[șsş]( de cumpărături)?)\\s*:?\\s*/i:/^Add to cart\\s*/i,'')", f);
  s = rep1(s, "DU?'https://tagra.app/nl/gratis-proefversie/':", "DU?'https://tagra.app/nl/gratis-proefversie/':RO?'https://tagra.app/ro/incercare-gratuita/':", f);
  wr(f, s);
  f = 'assets/js/shop-fleet.js'; s = rd(f);
  s = rep1(s, "DU?/ voertuig(en)?/:", "DU?/ voertuig(en)?/:RO?/ vehicul(e)?/:", f); wr(f, s);
  f = 'assets/js/shop-dev.js'; s = rd(f);
  s = rep1(s, "L==='nl'?'/nl':''", "L==='nl'?'/nl':L==='ro'?'/ro':''", f); wr(f, s);
  f = 'assets/js/shop2.js'; s = rd(f);
  s = rep1(s, "DU=LG==='nl',NL=HU||DE||PL||ES||IT||FR||DU,", "DU=LG==='nl',RO=LG==='ro',NL=HU||DE||PL||ES||IT||FR||DU||RO,", f);
  s = rep1(s, "DU?'https://tagra.app/nl/':'https://tagra.app/'", "DU?'https://tagra.app/nl/':RO?'https://tagra.app/ro/':'https://tagra.app/'", f);
  s = rep1(s, "DU?'/nl/login/':", "DU?'/nl/login/':RO?'/ro/login/':", f);
  s = rep1(s, "DU?'/nl':DE?'/de':'')+'/how-to-buy/'", "DU?'/nl':RO?'/ro':DE?'/de':'')+'/how-to-buy/'", f);
  wr(f, s);
  f = 'assets/js/shop3.js'; s = rd(f);
  const nlSL = '"nl":{"phone_langs":"Tel.: Engels · Tsjechisch · Slowaaks","chat_line":"E-mail en chat 24/7 in het Nederlands","contact_lang":"Telefonisch in het Engels, Tsjechisch en Slowaaks. Antwoorden per e-mail en chat in het Nederlands."}';
  s = rep1(s, nlSL, nlSL + ',"ro":{"phone_langs":"Tel.: engleză · cehă · slovacă","chat_line":"E-mail și chat 24/7 în limba română","contact_lang":"Telefonic în engleză, cehă și slovacă. Răspunsuri prin e-mail și chat în limba română."}', f);
  wr(f, s);
  f = 'assets/js/tagra-selector.js'; s = rd(f);
  s = rep1(s, "fr:'/fr',nl:'/nl'}", "fr:'/fr',nl:'/nl',ro:'/ro'}", f); wr(f, s);
  f = 'assets/js/mobile-bridge.js'; s = rd(f);
  s = rep1(s, "nl: 'https://shop.tagra.app/nl/tagra-trucker/' };", "nl: 'https://shop.tagra.app/nl/tagra-trucker/', ro: 'https://shop.tagra.app/ro/tagra-trucker/' };", f); wr(f, s);
  f = 'tools/code_cta/ai_driver.js'; s = rd(f);
  s = rep1(s, "nl: 'https://shop.tagra.app/nl/tagra-trucker/' };", "nl: 'https://shop.tagra.app/nl/tagra-trucker/', ro: 'https://shop.tagra.app/ro/tagra-trucker/' };", f); wr(f, s);
  f = 'tools/code_cta/bridge.js'; s = rd(f);
  s = rep1(s, "  nl: 'https://shop.tagra.app/nl/tagra-trucker/'\n", "  nl: 'https://shop.tagra.app/nl/tagra-trucker/',\n  ro: 'https://shop.tagra.app/ro/tagra-trucker/'\n", f); wr(f, s);
}

// --- 4) CSS
function css() {
  const f = 'assets/css/shop.css'; let s = rd(f);
  const R = JSON.parse(fs.readFileSync(S + 'shop-ro/ro_css.json', 'utf8'));
  s = s.split('.in-carrello,.in-winkelwagen)').join('.in-carrello,.in-winkelwagen,.in-cos-de-cumparaturi)');
  s = s.split(',.in-cesta)').join(',.in-cesta,.in-cos-de-cumparaturi)');
  const esc = (t) => t.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\u00a0/g, '\\0000a0');
  let lines = ['/* RO (90) */'];
  for (const [sel, val] of Object.entries(R)) {
    const prop = sel.includes('::') ? 'content' : null; must(prop, 'css selektor bez pseudo: ' + sel);
    lines.push(`${sel.replace(/\.in-cesta\)/g, '.in-cesta,.in-cos-de-cumparaturi)')}{content:"${esc(val)}"}`);
  }
  s = s.replace(/\| v6\.8 \(24\. 11\. 2026\): NL blok \(89\) =====/, '| v6.8 (24. 11. 2026): NL blok (89) | v6.9 (25. 11. 2026): RO blok (90) =====');
  s = s.replace(/\n*$/, '\n') + lines.join('\n') + '\n';
  wr(f, s); log.push(`shop.css: +${lines.length - 1} RO pravidel`);
}

buildShopRo();
for (const f of ['assets/js/shop-ai.js', 'assets/js/shop-cro.js', 'assets/js/shop-dev.js', 'assets/js/shop-fleet.js', 'assets/js/shop-variant.js', 'assets/js/shop2.js', 'assets/js/sfi.js']) addRoDicts(f);
codeEdits();
css();
console.log(log.join('\n'));
