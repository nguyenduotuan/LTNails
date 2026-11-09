(function () {
  "use strict";

  var LANGS = ["de", "en", "vi"];
  var LOCALES = { de: "de-DE", en: "en-GB", vi: "vi-VN" };
  var DEFAULT_LANG = "de";
  var shopPromise = null;

  function root() {
    return document.body.getAttribute("data-root") || "";
  }

  function getLang() {
    var stored = null;
    try {
      stored = localStorage.getItem("lang");
    } catch (e) {
      stored = null;
    }
    return LANGS.indexOf(stored) !== -1 ? stored : DEFAULT_LANG;
  }

  function t(key) {
    var packs = window.TRANSLATIONS || {};
    var pack = packs[getLang()] || {};
    if (Object.prototype.hasOwnProperty.call(pack, key)) return pack[key];
    var fallback = packs[DEFAULT_LANG] || {};
    if (Object.prototype.hasOwnProperty.call(fallback, key)) return fallback[key];
    return key;
  }

  // Reads a per-language data field ({ "de": ..., "en": ... }) or a plain string.
  function text(field) {
    if (field == null) return "";
    if (typeof field === "string") return field;
    var lang = getLang();
    return field[lang] || field[DEFAULT_LANG] || "";
  }

  function locale() {
    return LOCALES[getLang()] || LOCALES[DEFAULT_LANG];
  }

  function fetchJSON(path) {
    return fetch(root() + path).then(function (res) {
      if (!res.ok) throw new Error("Failed to load " + path);
      return res.json();
    });
  }

  function fetchShop() {
    if (!shopPromise) shopPromise = fetchJSON("src/data/shop.json");
    return shopPromise;
  }

  function el(tag, className, txt) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (txt != null) node.textContent = txt;
    return node;
  }

  function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-label]").forEach(function (node) {
      node.setAttribute("aria-label", t(node.getAttribute("data-i18n-label")));
    });
  }

  function updateTitle(shop) {
    var page = document.body.getAttribute("data-page");
    var name = shop ? shop.name : "";
    if (page === "home") {
      document.title = name;
    } else {
      var key = page === "prices" ? "prices.title" : "contact.title";
      document.title = t(key) + " – " + name;
    }
  }

  function setLang(lang) {
    if (LANGS.indexOf(lang) === -1) lang = DEFAULT_LANG;
    try {
      localStorage.setItem("lang", lang);
    } catch (e) {
      /* storage unavailable */
    }
    document.documentElement.lang = lang;
    applyI18n();
    fetchShop().then(updateTitle);
    document.querySelectorAll(".lang-switch .flag").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === getLang());
    });
    document.dispatchEvent(new CustomEvent("langchange"));
  }

  function renderHeader() {
    var header = document.getElementById("site-header");
    if (!header) return;
    fetchShop().then(function (shop) {
      header.innerHTML = "";
      header.classList.add("site-header");
      var inner = el("div", "header-inner");

      var brand = el("a", "brand", shop.name);
      brand.href = root() + "index.html";
      inner.appendChild(brand);

      var nav = el("nav", "nav");
      var links = [
        { page: "home", key: "nav.home", href: root() + "index.html" },
        { page: "prices", key: "nav.prices", href: root() + "src/pages/prices.html" },
        { page: "contact", key: "nav.contact", href: root() + "src/pages/contact.html" }
      ];
      var current = document.body.getAttribute("data-page");
      links.forEach(function (link) {
        var a = el("a", "nav-link");
        a.href = link.href;
        a.setAttribute("data-i18n", link.key);
        if (link.page === current) a.setAttribute("aria-current", "page");
        nav.appendChild(a);
      });
      inner.appendChild(nav);

      var langSwitch = el("div", "lang-switch");
      langSwitch.setAttribute("role", "group");
      langSwitch.setAttribute("data-i18n-label", "lang.label");
      var labels = { de: "Deutsch", en: "English", vi: "Tiếng Việt" };
      LANGS.forEach(function (code) {
        var btn = el("button", "flag flag-" + code);
        btn.type = "button";
        btn.setAttribute("data-lang", code);
        btn.setAttribute("aria-label", labels[code]);
        if (code === getLang()) btn.classList.add("active");
        btn.addEventListener("click", function () {
          setLang(code);
        });
        langSwitch.appendChild(btn);
      });
      inner.appendChild(langSwitch);

      header.appendChild(inner);
      applyI18n();
    });
  }

  function renderFooter() {
    var footer = document.getElementById("site-footer");
    if (!footer) return;
    fetchShop().then(function (shop) {
      footer.innerHTML = "";
      footer.classList.add("site-footer");
      var p = el("p", "footer-text", "© " + new Date().getFullYear() + " " + shop.name + ". ");
      var rights = el("span");
      rights.setAttribute("data-i18n", "footer.rights");
      p.appendChild(rights);
      footer.appendChild(p);
      applyI18n();
    });
  }

  var ICONS = {
    instagram:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>',
    facebook:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21.5v-7.2h2.5l.4-3h-2.9V9.4c0-.9.3-1.5 1.6-1.5h1.5V5.2c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.4v7.2h3.1z"/></svg>',
    tiktok:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.6 3c.4 2.1 1.9 3.7 4 4v3a7 7 0 0 1-4-1.3v5.9c0 3.5-2.7 5.9-5.9 5.9a5.5 5.5 0 0 1-5.6-5.5c0-3.2 2.6-5.7 5.9-5.7.3 0 .7 0 1 .1v3.1a2.7 2.7 0 0 0-1-.2 2.7 2.7 0 0 0-2.7 2.7 2.7 2.7 0 0 0 2.7 2.7c1.6 0 2.8-1.3 2.8-2.9V3h2.8z"/></svg>'
  };

  function isHttps(url) {
    return typeof url === "string" && url.indexOf("https://") === 0;
  }

  function socialLabel(url, platform) {
    try {
      var parts = url.split("/").filter(Boolean);
      var last = parts[parts.length - 1] || "";
      last = decodeURIComponent(last).replace(/-\d{10,}$/, "");
      if (platform === "instagram") return "@" + last.replace(/\.$/, "");
      return last.replace(/[-_]+/g, " ").trim() || platform;
    } catch (e) {
      return platform;
    }
  }

  function renderContactBlock(block) {
    if (!block) return;
    fetchShop().then(function (shop) {
      block.innerHTML = "";
      var card = el("div", "contact-card");

      var details = el("div", "contact-details");

      var phoneRow = el("div", "contact-row");
      var phoneLabel = el("h3", "contact-label");
      phoneLabel.setAttribute("data-i18n", "contact.phone");
      phoneRow.appendChild(phoneLabel);
      var phoneLink = el("a", "contact-value contact-phone", shop.phone);
      phoneLink.href = "tel:" + shop.phone.replace(/[^\d+]/g, "");
      phoneRow.appendChild(phoneLink);
      details.appendChild(phoneRow);

      if (shop.email) {
        var emailRow = el("div", "contact-row");
        var emailLabel = el("h3", "contact-label");
        emailLabel.setAttribute("data-i18n", "contact.email");
        emailRow.appendChild(emailLabel);
        var emailLink = el("a", "contact-value", shop.email);
        emailLink.href = "mailto:" + shop.email;
        emailRow.appendChild(emailLink);
        details.appendChild(emailRow);
      }

      var addrRow = el("div", "contact-row");
      var addrLabel = el("h3", "contact-label");
      addrLabel.setAttribute("data-i18n", "contact.address");
      addrRow.appendChild(addrLabel);
      var addrValue = el("div", "contact-value");
      (shop.address || []).forEach(function (line) {
        addrValue.appendChild(el("span", "address-line", line));
      });
      addrRow.appendChild(addrValue);
      details.appendChild(addrRow);

      if (isHttps(shop.mapUrl)) {
        var mapRow = el("div", "contact-row");
        var mapLink = el("a", "contact-value map-link");
        mapLink.setAttribute("data-i18n", "contact.map");
        mapLink.href = shop.mapUrl;
        mapLink.target = "_blank";
        mapLink.rel = "noopener noreferrer";
        mapRow.appendChild(mapLink);
        details.appendChild(mapRow);
      }

      var social = shop.social || {};
      var platforms = ["instagram", "facebook", "tiktok"];
      var socialLinks = platforms.filter(function (p) {
        return isHttps(social[p]);
      });
      if (socialLinks.length > 0) {
        var socialRow = el("div", "contact-row");
        var socialHeading = el("h3", "contact-label");
        socialHeading.setAttribute("data-i18n", "contact.social");
        socialRow.appendChild(socialHeading);
        var socialWrap = el("div", "social-links");
        socialLinks.forEach(function (platform) {
          var a = el("a", "social-link");
          a.href = social[platform];
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.innerHTML = ICONS[platform];
          a.appendChild(el("span", null, socialLabel(social[platform], platform)));
          socialWrap.appendChild(a);
        });
        socialRow.appendChild(socialWrap);
        details.appendChild(socialRow);
      }

      card.appendChild(details);

      var divider = el("div", "contact-divider");
      divider.setAttribute("aria-hidden", "true");
      card.appendChild(divider);

      var hours = el("div", "contact-hours");
      var hoursLabel = el("h3", "contact-label");
      hoursLabel.setAttribute("data-i18n", "hours.title");
      hours.appendChild(hoursLabel);
      var list = el("div", "hours-list");
      var openingHours = shop.openingHours || [];
      for (var i = 0; i < 7; i++) {
        var row = el("div", "hours-row");
        var day = new Date(2024, 0, 1 + i); // 2024-01-01 was a Monday
        row.style.setProperty("--n", i);
        row.appendChild(
          el("span", "hours-day", day.toLocaleDateString(locale(), { weekday: "long" }))
        );
        var value = openingHours[i];
        var time = el("span", "hours-time" + (value ? "" : " closed"), value || t("hours.closed"));
        row.appendChild(time);
        list.appendChild(row);
      }
      hours.appendChild(list);
      card.appendChild(hours);

      block.appendChild(card);
      applyI18n();
    });
  }

  function initAmbient() {
    var layer = el("div", "ambient");
    layer.setAttribute("aria-hidden", "true");
    for (var o = 1; o <= 4; o++) layer.appendChild(el("span", "orb orb-" + o));
    var query = window.matchMedia("(prefers-reduced-motion: reduce)");

    function addDust() {
      if (layer.querySelector(".dust")) return;
      for (var i = 0; i < 16; i++) {
        var star = i % 3 === 0;
        var dust = el("span", "dust" + (star ? " star" : ""));
        dust.style.setProperty("--x", ((i * 37 + 11) % 96) + "%");
        dust.style.setProperty("--s", (star ? 0.8 + (i % 4) * 0.12 : 0.35 + (i % 5) * 0.08) + "rem");
        dust.style.setProperty("--dur", 16 + ((i * 5) % 11) + "s");
        dust.style.setProperty("--dl", "-" + ((i * 3.1) % 20).toFixed(1) + "s");
        dust.style.setProperty("--sway", (i % 2 ? 1 : -1) * (1.5 + (i % 4)) + "rem");
        layer.appendChild(dust);
      }
    }

    function applyMotionPreference() {
      if (query.matches) {
        layer.querySelectorAll(".dust").forEach(function (d) {
          d.remove();
        });
        layer.style.setProperty("--sy", 0);
      } else {
        addDust();
      }
    }

    applyMotionPreference();
    document.body.insertBefore(layer, document.body.firstChild);
    if (query.addEventListener) query.addEventListener("change", applyMotionPreference);

    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking || query.matches) return;
        ticking = true;
        requestAnimationFrame(function () {
          layer.style.setProperty("--sy", window.scrollY);
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  function initReveal() {
    if (!("IntersectionObserver" in window)) return;
    var targets = document.querySelectorAll(".section-inner, .page > *");
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -4% 0px" }
    );
    targets.forEach(function (node) {
      node.classList.add("reveal");
      observer.observe(node);
    });
  }

  function init() {
    document.documentElement.lang = getLang();
    initAmbient();
    initReveal();
    renderHeader();
    renderFooter();
    fetchShop().then(function (shop) {
      updateTitle(shop);
      var callBtn = document.getElementById("contact-call");
      if (callBtn) callBtn.href = "tel:" + shop.phone.replace(/[^\d+]/g, "");
      var bookBtn = document.getElementById("contact-book");
      if (bookBtn && isHttps(shop.bookingUrl)) {
        bookBtn.hidden = false;
        bookBtn.href = shop.bookingUrl;
        if (callBtn) callBtn.classList.add("btn-outline");
      }
    });
    applyI18n();
    var contactBlock = document.getElementById("contact-block");
    if (contactBlock) {
      renderContactBlock(contactBlock);
      document.addEventListener("langchange", function () {
        renderContactBlock(contactBlock);
      });
    }
  }

  window.App = {
    t: t,
    text: text,
    getLang: getLang,
    locale: locale,
    root: root,
    el: el,
    fetchJSON: fetchJSON,
    fetchShop: fetchShop
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
