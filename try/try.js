/* TAGRA.EU /try/ — Trial form JS
 *
 * Responsibilities:
 * 1. Prefill `audience` radio: priority is (a) ?audience= URL param,
 *    then (b) detect from document.referrer path (/fleet/ -> fleet,
 *    /driver/ -> driver, /enforcement/ -> enforcement).
 * 2. Set hidden `source_url` field for admin notification context.
 * 3. Mobile nav toggle.
 * 4. Loading state on submit button.
 * 5. Store audience+lang in sessionStorage so thanks page reads them
 *    (form action stays clean, no query string).
 * 6. (7. 11. 2026) Hidden `country` with data-prefill="lang" (short DE/PL
 *    form) is filled from the browser region (de-AT → AT), else page lang.
 * 7. (7. 11. 2026) Mobile only (≤ 720 px): short "e-mail me the link for my
 *    PC" box above the full form. Same Netlify form `tagra-trial` and the
 *    same trial-email.js welcome mail as the full form; GA4 generate_lead
 *    with method=mobile_send, form_variant=mobile-send.
 */

(function () {
  'use strict';

  // ─── 1. Audience prefill ───
  function detectAudience() {
    // Priority 1: explicit URL param (CTA from /fleet/?audience=fleet works)
    const params = new URLSearchParams(window.location.search);
    const fromParam = params.get('audience');
    if (fromParam && ['fleet', 'driver', 'enforcement'].includes(fromParam)) {
      return fromParam;
    }
    // Priority 2: detect from referrer path
    const ref = document.referrer || '';
    try {
      const refUrl = new URL(ref);
      // Only trust referrer if it's the same origin (or netlify staging)
      const sameSite = refUrl.host === window.location.host
        || refUrl.host === 'tagra.app'
        || refUrl.host === 'www.tagra.app'
        || refUrl.host === 'tagra.app'
        || refUrl.host === 'www.tagra.app'
        || refUrl.host.endsWith('.netlify.app');
      if (sameSite) {
        const path = refUrl.pathname.toLowerCase();
        if (path.includes('/fleet')) return 'fleet';
        if (path.includes('/driver')) return 'driver';
        if (path.includes('/enforcement')) return 'enforcement';
      }
    } catch (e) { /* invalid referrer URL */ }
    return null;
  }

  const audience = detectAudience();
  if (audience) {
    const radio = document.querySelector('input[name="audience"][value="' + audience + '"]');
    if (radio) radio.checked = true;
  }

  // ─── 1b. Company field — hidden for drivers (they don't have one) ───
  function updateCompanyVisibility() {
    const wrap = document.getElementById('field-company');
    if (!wrap) return;
    const checked = document.querySelector('input[name="audience"]:checked');
    const isDriver = !!checked && checked.value === 'driver';
    wrap.hidden = isDriver;
    if (isDriver) {
      const input = wrap.querySelector('input[name="company"]');
      if (input) input.value = '';
    }
  }
  updateCompanyVisibility();
  document.querySelectorAll('input[name="audience"]').forEach((radio) => {
    radio.addEventListener('change', updateCompanyVisibility);
  });

  // ─── 2. Source URL tracking (for admin notification email) ───
  // src atribuce: ?src= z odkazu (přežije novou kartu), jinak vstupní stránka
  // ze sessionStorage (tagra_landing, plní nav.js).
  let srcValue = new URLSearchParams(window.location.search).get('src') || '';
  if (!srcValue) {
    try {
      srcValue = (JSON.parse(sessionStorage.getItem('tagra_landing') || 'null') || {}).p || '';
    } catch (e) { /* bez src */ }
  }
  const sourceUrl = document.getElementById('source_url');
  if (sourceUrl) {
    const ref = document.referrer || '(direct)';
    let landing = '';
    try {
      const l = JSON.parse(sessionStorage.getItem('tagra_landing') || 'null');
      if (l && l.p) {
        landing = ' | landing: ' + l.p + (l.s ? ' src=' + l.s : '') +
          ' via ' + (l.r || '(direct/internal)') + ' @' + l.t;
      }
    } catch (e) { /* bez atribuce */ }
    sourceUrl.value = ref + ' → ' + window.location.href + landing + (srcValue ? ' | src: ' + srcValue : '');
  }
  const srcField = document.getElementById('src');
  if (srcField) srcField.value = srcValue;

  // ─── 3. Mobile nav toggle ───
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // ─── 4. Submit handling ───
  const form = document.getElementById('trialForm');
  if (!form) return;

  // Nativní validace je v HTML záměrně zapnutá — když se tenhle skript
  // nenačte, prohlížeč nepustí odeslání s prázdným e-mailem. Až tady ji
  // vypínáme, protože dál si chyby zvýrazňujeme sami (.has-error).
  form.setAttribute('novalidate', '');

  form.addEventListener('submit', function (e) {
    if (!form.checkValidity()) {
      e.preventDefault();
      const firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) {
        firstInvalid.closest('.form-field, .audience-picker, .gdpr-check')?.classList.add('has-error');
        firstInvalid.focus({ preventScroll: false });
      }
      return;
    }

    // 5. Store audience + language for thanks page
    const chosenAudience = form.querySelector('input[name="audience"]:checked')?.value || 'fleet';
    const language = form.querySelector('input[name="language"]')?.value || 'en';
    try {
      sessionStorage.setItem('tagra_audience', chosenAudience);
      sessionStorage.setItem('tagra_language', language);
      sessionStorage.setItem('tagra_src', srcValue); // pro generate_lead na thanks stránce (nav.js)
    } catch (e) { /* private mode — thanks page falls back to defaults */ }

    // 6. Ochrana proti kolizi query stringu s polem formuláře.
    // Inline skript na stránce přepisuje action na "?audience=...", což je
    // stejný název jako pole formuláře — Netlify pak obě hodnoty slije do
    // pole a uloží audience jako '["fleet", "fleet"]'. Přejmenujeme na "a=";
    // stránka poděkování si audience vezme ze sessionStorage (viz krok 5).
    // TODO: až se budou upravovat stránky /try/*, přesunout přepis action
    // z inline skriptu sem a v poděkování číst i ?a= — teď je to na dvou místech.
    const action = form.getAttribute('action') || '';
    if (action.indexOf('audience=') !== -1) {
      form.setAttribute('action', action.replace(/([?&])audience=/, '$1a='));
    }

    // Loading state
    const btn = form.querySelector('.btn-submit');
    const btnText = btn?.querySelector('.btn-text');
    const btnLoading = btn?.querySelector('.btn-loading');
    if (btn && btnText && btnLoading) {
      btn.disabled = true;
      btnText.hidden = true;
      btnLoading.hidden = false;
    }
  });

  // Clear has-error on input
  form.querySelectorAll('input, select, textarea').forEach((el) => {
    const clearError = () => el.closest('.form-field, .audience-picker, .gdpr-check')?.classList.remove('has-error');
    el.addEventListener('input', clearError);
    el.addEventListener('change', clearError);
  });
})();

/* ─── 6. Country prefill for the short form (7. 11. 2026) ─── */
var tagraGuessCountry = (function () {
  'use strict';
  var EU = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','CH','GB'];
  var BY_LANG = { de: 'DE', pl: 'PL', cz: 'CZ', sk: 'SK', hu: 'HU', it: 'IT', fr: 'FR', nl: 'NL', ro: 'RO', gr: 'GR', en: 'OTHER' };
  return function (lang) {
    var list = [];
    try { list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || '']; } catch (e) { /* no navigator */ }
    for (var i = 0; i < list.length; i++) {
      var m = /^[a-z]{2,3}-([A-Z]{2})$/i.exec(String(list[i] || ''));
      if (m && EU.indexOf(m[1].toUpperCase()) !== -1) return m[1].toUpperCase();
    }
    return BY_LANG[lang] || 'OTHER';
  };
})();
(function () {
  'use strict';
  var form = document.getElementById('trialForm');
  if (!form) return;
  var c = form.querySelector('input[type="hidden"][name="country"][data-prefill]');
  if (!c) return;
  var l = form.querySelector('input[name="language"]');
  c.value = tagraGuessCountry(l ? l.value : 'en');
})();

/* ─── 7. Mobile "e-mail me the link for my PC" (7. 11. 2026) ───
 * Program runs on Windows, mobile visitors (≈ 85 % of organic traffic) had
 * 0 leads in 28 days. Short box: role + e-mail + consent. POST to Netlify
 * form `tagra-trial` (fields identical to the full form, so trial-email.js
 * sends the usual welcome mail with the download link). Texts reuse the
 * localized quick-mail strings from the error-code articles; role labels,
 * legend and consent text are cloned from the page's own full form. */
(function () {
  'use strict';
  var form = document.getElementById('trialForm');
  if (!form || !window.matchMedia || !window.fetch) return;
  if (!window.matchMedia('(max-width: 720px)').matches) return;
  var section = document.querySelector('.try-form-section');
  if (!section || document.getElementById('mobileSend')) return;

  var langEl = form.querySelector('input[name="language"]');
  var lang = langEl ? (langEl.value || 'en') : 'en';
  var S = {
    en: { lead: 'On your phone? We’ll email you the download link for your PC.', btn: 'Email me the link', ph: 'Email', sending: 'Sending…',
          ok: 'Done! Check your inbox and open the email on your PC to download TAGRA.', err: 'Something went wrong. Please try again or use the', errlink: 'full form' },
    de: { lead: 'Am Smartphone? Wir senden Ihnen den Download-Link für Ihren PC per E-Mail.', btn: 'Link per E-Mail senden', ph: 'E-Mail', sending: 'Wird gesendet…',
          ok: 'Erledigt! Prüfen Sie Ihren Posteingang und öffnen Sie die E-Mail am PC, um TAGRA herunterzuladen.', err: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder nutzen Sie das', errlink: 'vollständige Formular' },
    pl: { lead: 'Korzystają Państwo z telefonu? Wyślemy link do pobrania na komputer na e-mail.', btn: 'Wyślij link e-mailem', ph: 'E-mail', sending: 'Wysyłanie…',
          ok: 'Gotowe! Proszę sprawdzić skrzynkę i otworzyć e-mail na komputerze, aby pobrać TAGRA.', err: 'Coś poszło nie tak. Proszę spróbować ponownie lub skorzystać z', errlink: 'pełnego formularza' },
    hu: { lead: 'Telefonról böngészik? Elküldjük e-mailben a letöltési linket a számítógépéhez.', btn: 'Kérem a linket e-mailben', ph: 'E-mail', sending: 'Küldés…',
          ok: 'Kész! Ellenőrizze postafiókját, és nyissa meg az e-mailt a PC-jén a TAGRA letöltéséhez.', err: 'Valami hiba történt. Próbálja újra, vagy használja a', errlink: 'teljes űrlapot' },
    it: { lead: 'È al telefono? Le invieremo via e-mail il link per il download sul Suo PC.', btn: 'Invia il link via e-mail', ph: 'E-mail', sending: 'Invio in corso…',
          ok: 'Fatto! Controlli la posta in arrivo e apra l’e-mail sul PC per scaricare TAGRA.', err: 'Qualcosa è andato storto. Riprovi o utilizzi il', errlink: 'modulo completo' },
    fr: { lead: 'Sur votre téléphone ? Nous vous enverrons le lien de téléchargement pour votre PC par e-mail.', btn: 'M’envoyer le lien par e-mail', ph: 'E-mail', sending: 'Envoi en cours…',
          ok: 'C’est fait ! Consultez votre boîte de réception et ouvrez l’e-mail sur votre PC pour télécharger TAGRA.', err: 'Un problème est survenu. Réessayez ou utilisez le', errlink: 'formulaire complet' },
    nl: { lead: 'Gebruikt u een telefoon? We sturen u de downloadlink voor uw pc per e-mail.', btn: 'Stuur mij de link per e-mail', ph: 'E-mail', sending: 'Verzenden…',
          ok: 'Klaar! Controleer uw inbox en open de e-mail op uw pc om TAGRA te downloaden.', err: 'Er is iets misgegaan. Probeer het opnieuw of gebruik het', errlink: 'volledige formulier' },
    ro: { lead: 'Sunteți pe telefon? Vă vom trimite pe e-mail linkul de descărcare pentru PC.', btn: 'Trimiteți-mi linkul pe e-mail', ph: 'E-mail', sending: 'Se trimite…',
          ok: 'Gata! Verificați-vă inboxul și deschideți e-mailul pe PC pentru a descărca TAGRA.', err: 'Ceva nu a funcționat. Vă rugăm să încercați din nou sau să folosiți', errlink: 'formularul complet' },
    gr: { lead: 'Είστε στο κινητό; Θα σας στείλουμε με e-mail τον σύνδεσμο λήψης για τον υπολογιστή σας.', btn: 'Στείλτε μου τον σύνδεσμο με e-mail', ph: 'E-mail', sending: 'Αποστολή…',
          ok: 'Έτοιμο! Ελέγξτε τα εισερχόμενά σας και ανοίξτε το e-mail στον υπολογιστή σας για να κατεβάσετε το TAGRA.', err: 'Κάτι πήγε στραβά. Δοκιμάστε ξανά ή χρησιμοποιήστε τη', errlink: 'πλήρη φόρμα' },
    cz: { lead: 'Jste na mobilu? Odkaz ke stažení do počítače vám pošleme e-mailem.', btn: 'Poslat odkaz e-mailem', ph: 'E-mail', sending: 'Odesílám…',
          ok: 'Hotovo! Zkontrolujte schránku a e-mail otevřete na počítači, kde si TAGRA stáhnete.', err: 'Něco se nepovedlo. Zkuste to znovu, nebo použijte', errlink: 'celý formulář' },
    sk: { lead: 'Ste na mobile? Odkaz na stiahnutie do počítača vám pošleme e-mailom.', btn: 'Poslať odkaz e-mailom', ph: 'E-mail', sending: 'Odosiela sa…',
          ok: 'Hotovo! Skontrolujte si schránku a otvorte e-mail na počítači, kde si TAGRA stiahnete.', err: 'Niečo sa nepodarilo. Skúste to znova alebo použite', errlink: 'celý formulár' }
  };
  var t = S[lang] || S.en;

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }
  function hidden(name, value) { return el('input', { type: 'hidden', name: name, value: value || '' }); }

  var css = el('style', {});
  css.textContent =
    '.tms{margin:0 auto 8px;padding:0 20px}' +
    '.tms__box{box-sizing:border-box;max-width:560px;margin:0 auto;padding:20px;border-radius:20px;color:#fff;' +
    'background:linear-gradient(120deg,var(--blue-dark,#0b2c4a),var(--blue-mid,#134a8e) 62%,var(--blue-light,#1f5fa6));box-shadow:0 8px 24px rgba(16,42,74,.18)}' +
    '.tms form{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;min-width:0;margin:0}' +
    '.tms__lead{margin:0;font-weight:600;font-size:17px;line-height:1.4;color:#fff}' +
    '.tms__role{border:0;margin:0;padding:0;min-width:0;min-inline-size:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}' +
    '.tms__role legend{font-size:13px;opacity:.85;margin-bottom:6px;padding:0}' +
    '.tms__role label{display:flex;align-items:center;gap:8px;min-width:0;box-sizing:border-box;padding:10px;border-radius:12px;background:rgba(255,255,255,.12);border:1.5px solid rgba(255,255,255,.3);font-size:14px;font-weight:600;line-height:1.25;cursor:pointer}' +
    '.tms__role input{width:18px;height:18px;flex:0 0 auto;margin:0}' +
    '.tms__role span{min-width:0;overflow-wrap:anywhere;-webkit-hyphens:auto;hyphens:auto}' +
    '.tms input[type="email"]{width:100%;max-width:100%;margin:0;box-sizing:border-box;font:inherit;font-size:16px;padding:12px 14px;border-radius:12px;border:1.5px solid rgba(255,255,255,.35);background:#fff;color:#1d1d1f}' +
    '.tms__gdpr{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.45;color:rgba(255,255,255,.85)}' +
    '.tms__gdpr input{margin-top:2px;width:18px;height:18px;flex:0 0 auto}' +
    '.tms__gdpr a{color:#fff;text-decoration:underline}.tms__gdpr em{font-style:normal}' +
    '.tms button{box-sizing:border-box;margin:0;display:inline-flex;justify-content:center;align-items:center;width:100%;border:0;cursor:pointer;font:inherit;font-weight:600;font-size:16px;padding:13px 24px;border-radius:99px;color:#fff;' +
    'background:linear-gradient(135deg,var(--green-brand,#6E9B12) 0%,var(--green-cta,#5C820F) 100%);box-shadow:0 6px 18px rgba(110,155,18,.30),0 1px 0 rgba(255,255,255,.25) inset}' +
    '.tms button[disabled]{opacity:.7;cursor:default}' +
    '.tms__msg{margin:0;font-weight:600;color:#fff}.tms__msg:empty{display:none}.tms__msg a{color:#fff;text-decoration:underline}' +
    '.tms .is-err{outline:3px solid #f5a623;outline-offset:2px}' +
    '.tms.is-done form>*:not(.tms__msg){display:none}' +
    '@media(min-width:721px){.tms{display:none}}';

  var wrap = el('div', { 'class': 'tms', id: 'mobileSend' });
  var box = el('div', { 'class': 'tms__box' });
  var f = el('form', { method: 'POST', action: form.getAttribute('action') || '/try/thanks/', novalidate: '' });
  f.appendChild(el('p', { 'class': 'tms__lead' }, t.lead));
  f.appendChild(hidden('form-name', 'tagra-trial'));
  f.appendChild(hidden('language', lang));
  f.appendChild(hidden('name', ''));
  f.appendChild(hidden('company', ''));
  f.appendChild(hidden('message', ''));
  f.appendChild(hidden('country', tagraGuessCountry(lang)));
  var srcUrl = hidden('source_url', '');
  var srcFld = hidden('src', '');
  f.appendChild(srcUrl);
  f.appendChild(srcFld);
  var hp = el('p', { hidden: '' });
  hp.appendChild(el('input', { name: 'bot-field', tabindex: '-1', autocomplete: 'off' }));
  f.appendChild(hp);

  // Role: fleet / driver, labels and legend cloned from the full form
  var fs = el('fieldset', { 'class': 'tms__role' });
  var lg = form.querySelector('.audience-picker legend');
  fs.appendChild(el('legend', {}, lg ? lg.textContent.trim() : ''));
  var pre = form.querySelector('input[name="audience"]:checked');
  ['fleet', 'driver'].forEach(function (v) {
    var src = form.querySelector('input[name="audience"][value="' + v + '"]');
    var strong = src ? src.closest('label') && src.closest('label').querySelector('strong') : null;
    var lab = el('label', {});
    var r = el('input', { type: 'radio', name: 'audience', value: v, required: '' });
    if (pre && pre.value === v) r.checked = true;
    lab.appendChild(r);
    lab.appendChild(el('span', {}, strong ? strong.textContent.trim() : v));
    fs.appendChild(lab);
  });
  f.appendChild(fs);

  var em = el('input', { type: 'email', name: 'email', required: '', autocomplete: 'email', inputmode: 'email', placeholder: t.ph, 'aria-label': t.ph });
  f.appendChild(em);

  var g = form.querySelector('.gdpr-check span');
  var gl = el('label', { 'class': 'tms__gdpr' });
  var gc = el('input', { type: 'checkbox', name: 'gdpr_consent', value: 'yes', required: '' });
  gl.appendChild(gc);
  var gs = el('span', {});
  if (g) gs.innerHTML = g.innerHTML;
  gl.appendChild(gs);
  f.appendChild(gl);

  var btn = el('button', { type: 'submit' }, t.btn);
  f.appendChild(btn);
  var msg = el('p', { 'class': 'tms__msg', role: 'status', 'aria-live': 'polite' });
  f.appendChild(msg);

  box.appendChild(f);
  wrap.appendChild(css);
  wrap.appendChild(box);
  section.parentNode.insertBefore(wrap, section);

  f.addEventListener('change', function (e) {
    var x = e.target && e.target.closest ? e.target.closest('.is-err') : null;
    if (x) x.classList.remove('is-err');
  });

  function landing() {
    try { return JSON.parse(sessionStorage.getItem('tagra_landing') || 'null') || {}; } catch (e) { return {}; }
  }

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = null;
    if (!f.querySelector('input[name="audience"]:checked')) bad = fs;
    else if (!em.checkValidity()) bad = em;
    else if (!gc.checked) bad = gl;
    if (bad) {
      bad.classList.add('is-err');
      if (bad.focus) try { bad.focus(); } catch (x) { /* fieldset */ }
      return;
    }
    var l = landing();
    var srcVal = new URLSearchParams(location.search).get('src') || l.p || '';
    srcFld.value = srcVal;
    srcUrl.value = (document.referrer || '(direct)') + ' → ' + location.href.split('#')[0] +
      (l.p ? ' | landing: ' + l.p + (l.s ? ' src=' + l.s : '') + ' via ' + (l.r || '(direct/internal)') + ' @' + l.t : '') +
      (srcVal ? ' | src: ' + srcVal : '') + ' | method: mobile_send';
    var aud = f.querySelector('input[name="audience"]:checked').value;
    btn.disabled = true;
    btn.textContent = t.sending;
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(f)).toString()
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      wrap.classList.add('is-done');
      msg.textContent = t.ok;
      try {
        var KEY = 'tagra_lead_tracked_mobile-send';
        if (!sessionStorage.getItem(KEY)) {
          sessionStorage.setItem(KEY, '1');
          var ai = sessionStorage.getItem('tagra_ai_source') || 'none';
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'generate_lead', {
              audience: aud, language: lang, src: srcVal, ai_source: ai,
              landing_page: l.p || '', landing_referrer: l.r || '',
              form_variant: 'mobile-send', method: 'mobile_send'
            });
          }
          if (typeof window.clarity === 'function') {
            window.clarity('event', 'trial_lead');
            window.clarity('set', 'audience', aud);
          }
        }
      } catch (x) { /* tracking must not break the form */ }
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = t.btn;
      msg.textContent = t.err + ' ';
      var a = el('a', { href: '#trialForm' }, t.errlink);
      msg.appendChild(a);
      msg.appendChild(document.createTextNode('.'));
    });
  });
})();
