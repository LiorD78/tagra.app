/* =====================================================================
   CLEANEE – skript Horní informační lišty (cleanee.cz, BSSHOP 0780)
   Načítá se z HeaderInfoPanel v BSADMIN:
     <script src="https://tagra.app/assets/cleanee/cln-lista.js?v=…" defer></script>
   Vzor: assets/truckmall/tmx-lista-cz.js (bloky 0, 2, 6), doplněno o dopravu zdarma v náhledu košíku.
   v1 · 19. 11. 2026
   ===================================================================== */

/* Blok 0 – panel lišty nesmí mít pevnou výšku z šablony */
try {
  (function () {
    var p = document.getElementById("HeaderInfoPanel");
    if (!p) return;
    p.style.setProperty("height", "auto", "important");
    p.style.setProperty("max-height", "none", "important");
    p.style.setProperty("overflow", "visible", "important");
  })();
} catch (e) {
  window.console && console.warn && console.warn("cln-lista blok 0", e);
}

/* Blok 1 – náhled košíku: kolik zbývá do dopravy zdarma (jen maloobchod v Kč) */
try {
  (function () {
    var LIMIT = 2000;

    function num(t) {
      var n = parseFloat(String(t || "").replace(/[^0-9,]/g, "").replace(",", "."));
      return isNaN(n) ? NaN : n;
    }
    function fmt(n) {
      return String(Math.ceil(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Kč";
    }
    function enhance(d) {
      if (!d || d.querySelector(".cln-free")) return;
      if (!document.body.classList.contains("anonymous")) return; // přihlášení (i velkoobchod) mají vlastní podmínky
      var tp = d.querySelector(".basketCompoundInfo .price .value");
      if (!tp || !/Kč/.test(tp.textContent)) return;
      var total = num(tp.textContent);
      if (!(total > 0)) return;
      var box = document.createElement("div");
      box.className = "cln-free";
      box.setAttribute("aria-live", "polite");
      var pct = Math.min(100, Math.round((total / LIMIT) * 100));
      if (total >= LIMIT) {
        box.innerHTML = "<b>Doprava zdarma</b> – objednávka je nad 2 000 Kč.";
      } else {
        box.innerHTML = "Do <b>dopravy zdarma</b> zbývá " + fmt(LIMIT - total) + ".";
      }
      var bar = document.createElement("div");
      bar.className = "cln-free__bar";
      bar.setAttribute("aria-hidden", "true");
      var fill = document.createElement("i");
      fill.style.width = "0%";
      bar.appendChild(fill);
      box.appendChild(bar);
      var content = d.querySelector(".content") || d;
      content.appendChild(box);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          fill.style.width = pct + "%";
        });
      });
      try {
        (window.dataLayer = window.dataLayer || []).push({
          event: "cln_basket_dialog",
          cln_free_shipping_gap: total >= LIMIT ? 0 : Math.ceil(LIMIT - total)
        });
      } catch (e) {}
    }
    function scan() {
      enhance(document.getElementById("BasketResultDialog"));
    }
    function start() {
      scan();
      if (!window.MutationObserver) return;
      var t = 0;
      new MutationObserver(function () {
        if (t) return;
        t = setTimeout(function () {
          t = 0;
          scan();
        }, 120);
      }).observe(document.body, { childList: true, subtree: true });
    }
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start) : start();
  })();
} catch (e) {
  window.console && console.warn && console.warn("cln-lista blok 1", e);
}

/* Blok 2 – košík krok 1: klik na Pokračovat bez vybrané dopravy/platby
   odroluje k sekci, zvýrazní ji a vloží výzvu (převzato z TRUCKMALL) */
try {
  (function () {
    if (location.pathname.indexOf("/objednat-krok1") !== 0) return;
    var MSG_DEL = "Vyberte prosím způsob dopravy",
      MSG_PAY = "Vyberte prosím způsob platby",
      state = null;

    function chosen(id) {
      var el = document.getElementById(id);
      return !el || !!el.querySelector("input[type=radio]:checked");
    }
    function clear() {
      ["DeliverySelector", "PaymentSelector"].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.classList.remove("cln-need");
        var m = el.querySelector(".cln-need-msg");
        m && m.parentNode && m.parentNode.removeChild(m);
      });
    }
    function paint() {
      if (!state) return;
      var el = document.getElementById(state.id);
      if (!el) return;
      if (chosen(state.id)) {
        state = null;
        clear();
        return;
      }
      if (!el.querySelector(".cln-need-msg")) {
        var m = document.createElement("div");
        m.className = "cln-need-msg";
        m.setAttribute("role", "alert");
        m.textContent = state.txt;
        m.style.setProperty("order", "25", "important");
        el.appendChild(m);
      }
      state.ring ? el.classList.add("cln-need") : el.classList.remove("cln-need");
    }
    function flag(id, txt, kind) {
      var el = document.getElementById(id);
      if (!el) return;
      clear();
      state = { id: id, txt: txt, ring: true };
      paint();
      var hdr = document.querySelector(".dcHeader"),
        off = (hdr ? Math.max(0, hdr.getBoundingClientRect().bottom) : 0) + 16,
        reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.pageYOffset - off,
        behavior: reduce ? "auto" : "smooth"
      });
      try {
        (window.dataLayer = window.dataLayer || []).push({ event: "checkout_missing_choice", checkout_missing: kind });
      } catch (e) {}
      [500, 1000, 1600, 2400, 3500, 5000].forEach(function (ms) {
        setTimeout(paint, ms);
      });
      setTimeout(function () {
        if (state) {
          state.ring = false;
          paint();
        }
      }, 6000);
    }
    document.addEventListener(
      "click",
      function (ev) {
        if (!(ev.target && ev.target.closest && ev.target.closest(".xta_nextStep"))) return;
        var noDel = !chosen("DeliverySelector"),
          noPay = !noDel && !chosen("PaymentSelector");
        if (noDel || noPay)
          setTimeout(function () {
            noDel ? flag("DeliverySelector", MSG_DEL, "doprava") : flag("PaymentSelector", MSG_PAY, "platba");
          }, 350);
      },
      true
    );
    document.addEventListener(
      "change",
      function (ev) {
        var t = ev.target;
        if (t && t.type === "radio" && t.closest && t.closest("#DeliverySelector,#PaymentSelector")) {
          state = null;
          clear();
        }
      },
      true
    );
  })();
} catch (e) {
  window.console && console.warn && console.warn("cln-lista blok 2", e);
}

/* Blok 3 – pojistka: když se styly šablony (Resource.ashx) nenačtou a hlavička
   se rozpadne, načíst je znovu (převzato z TRUCKMALL) */
try {
  (function () {
    var done = 0;
    function retry() {
      var h = document.getElementById("Header");
      if (!h || window.getComputedStyle(h).display === "grid" || done) return;
      done = 1;
      var links = document.querySelectorAll('link[rel="stylesheet"]'),
        stamp = Math.floor(Date.now() / 36e5);
      for (var i = 0; i < links.length; i++) {
        var l = links[i];
        if (!/Resource\.ashx/.test(l.href) || /clnr=/.test(l.href)) continue;
        if (l.media && window.matchMedia && !window.matchMedia(l.media).matches) continue;
        var n = document.createElement("link");
        n.rel = "stylesheet";
        n.type = "text/css";
        if (l.media) n.media = l.media;
        n.href = l.href + (l.href.indexOf("?") > -1 ? "&" : "?") + "clnr=" + stamp;
        l.parentNode.insertBefore(n, l.nextSibling);
      }
      try {
        (window.dataLayer = window.dataLayer || []).push({ event: "cln_css_retry" });
      } catch (e) {}
    }
    var all = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < all.length; i++)
      if (/Resource\.ashx/.test(all[i].href))
        all[i].addEventListener("error", function () {
          setTimeout(retry, 50);
        });
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", retry) : retry();
    window.addEventListener("load", retry);
  })();
} catch (e) {
  window.console && console.warn && console.warn("cln-lista blok 3", e);
}
