/* TAGRA mobilní most + TRUCKER CTA na mobilu (balíček 42, 15. 11. 2026).
   Jen články (vkládá se skriptem handoff/…), jen mobil: (max-width:820px) a (pointer:coarse). Na desktopu nedělá nic.
   A) „Pošlete si odkaz do PC": e-mail → /.netlify/functions/send-link (po první sekci a na konci článku).
   B) TRUCKER box (data-tr="1" na <script>): tlačítko do shopu, měření shop_click s cta_position=mobile_trucker
      zajišťuje analytics.js přes data-cta.
   GA4: mobile_bridge_view (jednou), mobile_bridge_submit (po úspěchu). Jen gtag – Consent Mode v2 se respektuje,
   bez souhlasu gtag nic neodešle. Žádné cookies, e-mail se do GA nikdy neposílá.
   Texty doslova z brain/fronta/2026-11-15-42-mobil-i18n.json. */
(function () {
  'use strict';
  var W = window, D = document;
  if (!W.matchMedia || !W.fetch || !W.matchMedia('(max-width: 820px) and (pointer: coarse)').matches) return;
  var me = D.currentScript;
  var wantTrucker = !!(me && me.getAttribute('data-tr') === '1');
  var lang = (D.documentElement.getAttribute('lang') || 'en').slice(0, 2).toLowerCase();
  var TX = {
   "en": {
    "mb_title": "On your phone? TAGRA runs on a Windows PC.",
    "mb_text": "Send yourself the download link and a short setup guide – install it later on your computer.",
    "mb_email": "Your e-mail",
    "mb_btn": "Send link to my PC",
    "mb_ok": "Done! Check your inbox (and spam folder).",
    "mb_err": "Please enter a valid e-mail address.",
    "mb_note": "We only send the link and setup tips. No newsletter without your consent.",
    "tr_title": "Driver? Check your own driving and rest times.",
    "tr_text": "TAGRA TRUCKER reads your driver card – the USB card reader is included free with the licence.",
    "tr_btn": "Buy TAGRA TRUCKER"
   },
   "de": {
    "mb_title": "Am Handy? TAGRA läuft auf einem Windows-PC.",
    "mb_text": "Senden Sie sich den Downloadlink und eine kurze Anleitung – und installieren Sie TAGRA später am PC.",
    "mb_email": "Ihre E-Mail-Adresse",
    "mb_btn": "Link an meinen PC senden",
    "mb_ok": "Erledigt! Prüfen Sie Ihr Postfach (auch den Spamordner).",
    "mb_err": "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
    "mb_note": "Wir senden nur den Link und Einrichtungstipps. Kein Newsletter ohne Ihre Zustimmung.",
    "tr_title": "Als Fahrer unterwegs? Prüfen Sie Ihre Lenk- und Ruhezeiten.",
    "tr_text": "TAGRA TRUCKER liest Ihre Fahrerkarte aus – ein USB-Kartenleser ist kostenlos bei der Lizenz dabei.",
    "tr_btn": "TAGRA TRUCKER kaufen"
   },
   "pl": {
    "mb_title": "Na telefonie? TAGRA działa na komputerze z Windows.",
    "mb_text": "Wyślij link do pobrania i krótką instrukcję na swój e-mail – program można zainstalować później na komputerze.",
    "mb_email": "Adres e-mail",
    "mb_btn": "Wyślij link na komputer",
    "mb_ok": "Gotowe! Link jest w skrzynce (warto sprawdzić też spam).",
    "mb_err": "Należy podać poprawny adres e-mail.",
    "mb_note": "Wysyłamy tylko link i wskazówki dotyczące instalacji. Bez newslettera bez zgody.",
    "tr_title": "Dla kierowców: kontrola własnego czasu jazdy i odpoczynku.",
    "tr_text": "TAGRA TRUCKER odczytuje kartę kierowcy – czytnik kart USB jest dołączony do licencji gratis.",
    "tr_btn": "Kup TAGRA TRUCKER"
   },
   "hu": {
    "mb_title": "Telefonon böngészik? A TAGRA Windows PC-n fut.",
    "mb_text": "Küldje el magának a letöltési linket és a rövid útmutatót – később telepítheti a számítógépén.",
    "mb_email": "Az Ön e-mail-címe",
    "mb_btn": "Link küldése a gépemre",
    "mb_ok": "Kész! Nézze meg a beérkező leveleket (és a spam mappát).",
    "mb_err": "Kérjük, adjon meg érvényes e-mail-címet.",
    "mb_note": "Csak a linket és a telepítési tippeket küldjük el. Hírlevelet csak a hozzájárulásával küldünk.",
    "tr_title": "Sofőr? Ellenőrizze saját vezetési és pihenőidejét.",
    "tr_text": "A TAGRA TRUCKER kiolvassa a járművezetői kártyáját – a licenchez ingyenes USB-s kártyaolvasó jár.",
    "tr_btn": "TAGRA TRUCKER vásárlása"
   },
   "el": {
    "mb_title": "Από κινητό; Το TAGRA λειτουργεί σε υπολογιστή με Windows.",
    "mb_text": "Στείλτε στον εαυτό σας τον σύνδεσμο λήψης και έναν σύντομο οδηγό – εγκαταστήστε το αργότερα στον υπολογιστή σας.",
    "mb_email": "Το e-mail σας",
    "mb_btn": "Αποστολή συνδέσμου στον Η/Υ",
    "mb_ok": "Έγινε! Ελέγξτε τα εισερχόμενα (και τα ανεπιθύμητα).",
    "mb_err": "Εισαγάγετε έγκυρη διεύθυνση e-mail.",
    "mb_note": "Στέλνουμε μόνο τον σύνδεσμο και συμβουλές εγκατάστασης. Κανένα newsletter χωρίς τη συγκατάθεσή σας.",
    "tr_title": "Οδηγός; Ελέγξτε τους χρόνους οδήγησης και ανάπαυσής σας.",
    "tr_text": "Το TAGRA TRUCKER διαβάζει την κάρτα οδηγού σας – η συσκευή ανάγνωσης USB παρέχεται δωρεάν με την άδεια χρήσης.",
    "tr_btn": "Αγορά TAGRA TRUCKER"
   },
   "it": {
    "mb_title": "È sul telefono? TAGRA funziona su PC Windows.",
    "mb_text": "Si invii il link per il download e una breve guida: potrà installare TAGRA più tardi sul computer.",
    "mb_email": "La sua e-mail",
    "mb_btn": "Invia il link al mio PC",
    "mb_ok": "Fatto! Controlli la posta in arrivo (e lo spam).",
    "mb_err": "Inserisca un indirizzo e-mail valido.",
    "mb_note": "Inviamo solo il link e i consigli per l'installazione. Nessuna newsletter senza il suo consenso.",
    "tr_title": "È un conducente? Verifichi i suoi tempi di guida e riposo.",
    "tr_text": "TAGRA TRUCKER legge la sua carta conducente: il lettore USB è incluso gratis nella licenza.",
    "tr_btn": "Acquista TAGRA TRUCKER"
   },
   "fr": {
    "mb_title": "Sur mobile ? TAGRA fonctionne sur PC Windows.",
    "mb_text": "Recevez le lien de téléchargement et un guide rapide par e-mail, puis installez TAGRA plus tard sur votre ordinateur.",
    "mb_email": "Votre e-mail",
    "mb_btn": "Envoyer le lien à mon PC",
    "mb_ok": "C'est envoyé ! Vérifiez vos e-mails (et les spams).",
    "mb_err": "Veuillez saisir une adresse e-mail valide.",
    "mb_note": "Nous envoyons uniquement le lien et des conseils d'installation. Aucune newsletter sans votre accord.",
    "tr_title": "Conducteur ? Vérifiez vos temps de conduite et de repos.",
    "tr_text": "TAGRA TRUCKER lit votre carte conducteur : le lecteur USB est offert avec la licence.",
    "tr_btn": "Acheter TAGRA TRUCKER"
   },
   "nl": {
    "mb_title": "Op uw telefoon? TAGRA werkt op een Windows-pc.",
    "mb_text": "Stuur uzelf de downloadlink en een korte installatiegids – installeer TAGRA later op uw computer.",
    "mb_email": "Uw e-mailadres",
    "mb_btn": "Stuur de link naar mijn pc",
    "mb_ok": "Verzonden! Controleer uw inbox (en spammap).",
    "mb_err": "Voer een geldig e-mailadres in.",
    "mb_note": "We sturen alleen de link en installatietips. Geen nieuwsbrief zonder uw toestemming.",
    "tr_title": "Chauffeur? Controleer uw eigen rij- en rusttijden.",
    "tr_text": "TAGRA TRUCKER leest uw bestuurderskaart uit – de USB-kaartlezer krijgt u gratis bij de licentie.",
    "tr_btn": "TAGRA TRUCKER kopen"
   },
   "ro": {
    "mb_title": "Pe telefon? TAGRA rulează pe un PC cu Windows.",
    "mb_text": "Trimiteți-vă linkul de descărcare și un scurt ghid de instalare – instalați programul mai târziu pe computer.",
    "mb_email": "Adresa dvs. de e-mail",
    "mb_btn": "Trimite linkul pe PC",
    "mb_ok": "Gata! Verificați mesajele primite (și folderul spam).",
    "mb_err": "Introduceți o adresă de e-mail validă.",
    "mb_note": "Trimitem doar linkul și sfaturi de instalare. Fără newsletter fără acordul dvs.",
    "tr_title": "Sunteți șofer? Verificați-vă timpii de conducere și odihnă.",
    "tr_text": "TAGRA TRUCKER citește cardul dvs. de șofer – cititorul de carduri USB este inclus gratuit cu licența.",
    "tr_btn": "Cumpărați TAGRA TRUCKER"
   }
  };
  var t = TX[lang] || TX.en;
  // Shop: en/de/pl/hu mají vlastní jazykovou verzi; ostatní → EN shop s poznámkou „(EN)".
  var SHOP = { en: 'https://shop.tagra.app/tagra-trucker/', de: 'https://shop.tagra.app/de/tagra-trucker/',
    pl: 'https://shop.tagra.app/pl/tagra-trucker/', hu: 'https://shop.tagra.app/hu/tagra-software/' };
  var shopHref = SHOP[lang] || SHOP.en;
  var shopNote = SHOP[lang] ? '' : ' (EN)';
  var main = D.getElementById('main-content');
  if (!main) return;

  function el(tag, attrs, text) {
    var e = D.createElement(tag);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }
  function ev(name, p) { try { if (typeof W.gtag === 'function') W.gtag('event', name, p || {}); } catch (x) {} }

  var css = el('style', {});
  css.textContent =
    '.mb{box-sizing:border-box;margin:28px 0;padding:20px;border-radius:16px;background:#eef4fb;border:1px solid #c9dcf0;color:#1d1d1f}' +
    '.mb *{box-sizing:border-box}.mb h3{margin:0 0 8px;font-size:19px;line-height:1.3;color:#0b2c4a}' +
    '.mb p{margin:0 0 12px;font-size:16px;line-height:1.5}.mb form{display:grid;gap:10px;margin:0}' +
    '.mb input[type=email]{width:100%;font:inherit;font-size:16px;padding:12px 14px;border-radius:12px;border:1.5px solid #9db8d4;background:#fff}' +
    '.mb button,.mb .mb-btn{display:flex;justify-content:center;align-items:center;width:100%;min-height:48px;border:0;border-radius:99px;font:inherit;font-weight:600;font-size:16px;padding:12px 20px;color:#fff;cursor:pointer;text-decoration:none;' +
    'background:linear-gradient(135deg,#6E9B12,#5C820F)}.mb button[disabled]{opacity:.7;cursor:default}' +
    '.mb .mb-note{font-size:13px;color:#4a5a6a;margin:0}.mb .mb-msg{font-weight:600;margin:0}.mb .mb-msg:empty{display:none}' +
    '.mb .mb-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}.mb .is-err{outline:3px solid #f5a623;outline-offset:2px}' +
    '.mb.is-done form>:not(.mb-msg){display:none}.mb-tr{background:#f3f8ec;border-color:#cfe2b0}.mb-tr h3{color:#3d5a0a}';
  D.head.appendChild(css);

  var viewed = false;
  var io = ('IntersectionObserver' in W) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting && !viewed) { viewed = true; ev('mobile_bridge_view', { page_language: lang, page_path: location.pathname }); io.disconnect(); }
    });
  }, { threshold: 0.5 }) : null;

  function bridge(pos) {
    var box = el('aside', { 'class': 'mb mb-bridge', 'data-mb': pos, 'aria-label': t.mb_title });
    box.appendChild(el('h3', {}, t.mb_title));
    box.appendChild(el('p', {}, t.mb_text));
    var f = el('form', { novalidate: '' });
    var em = el('input', { type: 'email', name: 'email', required: '', autocomplete: 'email', inputmode: 'email', placeholder: t.mb_email, 'aria-label': t.mb_email });
    var hpw = el('div', { 'class': 'mb-hp', 'aria-hidden': 'true' });
    hpw.appendChild(el('input', { type: 'text', name: 'website', tabindex: '-1', autocomplete: 'off' }));
    var btn = el('button', { type: 'submit' }, t.mb_btn);
    var msg = el('p', { 'class': 'mb-msg', role: 'status', 'aria-live': 'polite' });
    f.appendChild(em); f.appendChild(hpw); f.appendChild(btn); f.appendChild(msg);
    box.appendChild(f);
    box.appendChild(el('p', { 'class': 'mb-note' }, t.mb_note));
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      em.classList.remove('is-err'); msg.textContent = '';
      if (!em.checkValidity() || !em.value.trim()) { em.classList.add('is-err'); msg.textContent = t.mb_err; try { em.focus(); } catch (x) {} return; }
      btn.disabled = true;
      fetch('/.netlify/functions/send-link', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em.value.trim(), lang: lang, page: location.pathname, website: f.elements.website.value })
      }).then(function (r) {
        if (r.status === 400) { em.classList.add('is-err'); msg.textContent = t.mb_err; btn.disabled = false; return; }
        if (!r.ok) throw new Error('HTTP ' + r.status);
        box.classList.add('is-done'); msg.textContent = t.mb_ok;
        ev('mobile_bridge_submit', { page_language: lang, page_path: location.pathname, position: pos });
      }).catch(function () { btn.disabled = false; msg.textContent = t.mb_err; });
    });
    if (io) io.observe(box);
    return box;
  }

  function trucker() {
    var box = el('aside', { 'class': 'mb mb-tr', 'data-cta': 'mobile_trucker', 'aria-label': t.tr_title });
    box.appendChild(el('h3', {}, t.tr_title));
    box.appendChild(el('p', {}, t.tr_text));
    box.appendChild(el('a', { 'class': 'mb-btn', href: shopHref, rel: 'noopener' }, t.tr_btn + shopNote));
    return box;
  }

  /* Vložení: bez posunu viditelného obsahu (CLS 0). Kotva pod viditelnou částí se vloží hned,
     kotva nad/uvnitř viditelné části až po odscrollování pryč (scroll anchoring drží pozici). */
  function place(anchor, node, before) {
    function put() { anchor.parentNode.insertBefore(node, before ? anchor : anchor.nextSibling); }
    var r = anchor.getBoundingClientRect();
    if ((before ? r.top : r.bottom) > W.innerHeight + 40) { put(); return; }
    function onScroll() {
      var q = anchor.getBoundingClientRect();
      if ((before ? q.top : q.bottom) < -40) { W.removeEventListener('scroll', onScroll); put(); }
    }
    W.addEventListener('scroll', onScroll, { passive: true });
  }

  function init() {
    var sections = main.querySelectorAll(':scope > section');
    if (!sections.length) return;
    if (D.querySelector('.mb-bridge')) return;
    var first = sections[0], last = sections[sections.length - 1];
    var wrapFirst = el('div', { 'class': 'container art-body' });
    wrapFirst.appendChild(bridge('first'));
    var holderFirst = el('section', { 'class': 'band' }); holderFirst.appendChild(wrapFirst);
    place(first, holderFirst, false);
    var holderEnd = el('section', { 'class': 'band' });
    var wrapEnd = el('div', { 'class': 'container art-body' });
    if (wantTrucker) wrapEnd.appendChild(trucker());
    wrapEnd.appendChild(bridge('end'));
    holderEnd.appendChild(wrapEnd);
    place(last, holderEnd, false);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})();
