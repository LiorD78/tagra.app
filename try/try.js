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
  const sourceUrl = document.getElementById('source_url');
  if (sourceUrl) {
    const ref = document.referrer || '(direct)';
    sourceUrl.value = ref + ' → ' + window.location.href;
  }

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
