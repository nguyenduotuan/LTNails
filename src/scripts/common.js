// Shared: language, header/footer, shop data, contact block.
(function () {
  const ROOT = document.body.dataset.root || "";
  const LANGS = ["de", "en", "vi"];
  const LOCALES = { de: "de-DE", en: "en-GB", vi: "vi-VN" };
  const SOCIAL_LABELS = { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok" };
  const SOCIAL_ICONS = {
    instagram: '<svg class="social-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    facebook: '<svg class="social-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    tiktok: '<svg class="social-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>'
  };
  const NAV = [
    { key: "nav.home", href: "index.html" },
    { key: "nav.prices", href: "src/pages/prices.html" },
    { key: "nav.contact", href: "src/pages/contact.html" }
  ];

  const state = { lang: "de", shop: null };
  const listeners = [];

  function getLang() {
    const saved = localStorage.getItem("lang");
    return LANGS.includes(saved) ? saved : "de";
  }

  function t(key) {
    const dict = window.TRANSLATIONS[state.lang] || {};
    return dict[key] ?? window.TRANSLATIONS.de[key] ?? key;
  }

  async function loadJSON(name) {
    const res = await fetch(`${ROOT}src/data/${name}.json`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${name}`);
    return res.json();
  }

  function applyTranslations() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-label]").forEach((el) => {
      el.setAttribute("aria-label", t(el.dataset.i18nLabel));
    });
    const title = document.querySelector("title");
    if (title && state.shop) {
      const page = document.body.dataset.titleKey;
      title.textContent = page ? `${t(page)} – ${state.shop.name}` : state.shop.name;
    }
  }

  function setLang(lang) {
    state.lang = lang;
    localStorage.setItem("lang", lang);
    document.querySelectorAll(".lang-btn").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
    applyTranslations();
    renderContact();
    listeners.forEach((fn) => fn(lang));
  }

  function renderHeader() {
    const current = document.body.dataset.page;
    const header = document.getElementById("site-header");
    if (!header) return;
    header.innerHTML = `
      <div class="header-inner">
        <a class="brand" href="${ROOT}index.html" data-shop-name></a>
        <div class="lang-switch" role="group" data-i18n-label="lang.label">
          ${LANGS.map((l) => `<button type="button" class="lang-btn lang-${l}" data-lang="${l}" aria-label="${l.toUpperCase()}" aria-pressed="false"></button>`).join("")}
        </div>
        <nav class="main-nav">
          ${NAV.map((n) => `<a href="${ROOT}${n.href}" data-i18n="${n.key}" ${n.href.includes(current) || (current === "home" && n.href === "index.html") ? 'aria-current="page"' : ""}></a>`).join("")}
        </nav>
      </div>`;
    header.querySelectorAll(".lang-btn").forEach((b) => {
      b.addEventListener("click", () => setLang(b.dataset.lang));
    });
  }

  function renderFooter() {
    const footer = document.getElementById("site-footer");
    if (!footer) return;
    footer.innerHTML = `<p>© ${new Date().getFullYear()} <span data-shop-name></span>. <span data-i18n="footer.rights"></span></p>`;
  }

  function weekdayName(index) {
    // 2024-01-01 is a Monday.
    return new Date(2024, 0, 1 + index).toLocaleDateString(LOCALES[state.lang], { weekday: "long" });
  }

  function socialHandle(network, url) {
    try {
      const u = new URL(url);
      const segs = u.pathname.split("/").filter(Boolean);
      if (segs.length) {
        const handle = segs[0].replace(/^@/, "");
        return `@${handle}`;
      }
    } catch (e) {}
    return SOCIAL_LABELS[network] || network;
  }

  function renderContact() {
    const shop = state.shop;
    if (!shop) return;
    document.querySelectorAll("[data-shop-name]").forEach((el) => { el.textContent = shop.name; });

    const tel = shop.phone.replace(/[^\d+]/g, "");
    const socials = Object.entries(shop.social || {})
      .filter(([name, url]) => SOCIAL_LABELS[name] && /^https:\/\//.test(url));
    document.querySelectorAll("[data-contact]").forEach((box) => {
      box.innerHTML = `
        <div class="contact-details">
          <p><strong>${t("contact.phone")}</strong><br><a href="tel:${tel}"></a></p>
          <p><strong>${t("contact.address")}</strong><br>${shop.address.map(() => "<span></span>").join("<br>")}</p>
          ${socials.length ? `<p class="social"><strong>${t("contact.social")}</strong><br>${socials.map(([net]) => `<a class="social-link">${SOCIAL_ICONS[net] || ""}<span></span></a>`).join("")}</p>` : ""}
        </div>
        <div class="contact-divider" aria-hidden="true"></div>
        <div class="hours">
          <h3>${t("hours.title")}</h3>
          <ul>${shop.openingHours.map(() => "<li><span></span><span></span></li>").join("")}</ul>
        </div>`;
      // User-editable values are written as text, not HTML.
      box.querySelector(".contact-details a").textContent = shop.phone;
      box.querySelectorAll(".contact-details p:nth-child(2) span").forEach((s, i) => { s.textContent = shop.address[i]; });
      box.querySelectorAll(".social a").forEach((a, i) => {
        const [net, url] = socials[i];
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.setAttribute("aria-label", `${SOCIAL_LABELS[net]}: ${socialHandle(net, url)}`);
        const label = a.querySelector("span");
        if (label) label.textContent = socialHandle(net, url);
      });
      box.querySelectorAll(".hours li").forEach((li, i) => {
        li.children[0].textContent = weekdayName(i);
        li.children[1].textContent = shop.openingHours[i] || t("hours.closed");
      });
    });

    document.querySelectorAll("[data-call]").forEach((a) => {
      a.href = `tel:${tel}`;
    });

    const booking = /^https:\/\//.test(shop.bookingUrl || "") ? shop.bookingUrl : "";
    document.querySelectorAll("[data-book]").forEach((a) => {
      a.hidden = !booking;
      if (!booking) return;
      a.href = booking;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    });
  }

  window.Site = {
    t,
    loadJSON,
    get lang() { return state.lang; },
    onLangChange(fn) { listeners.push(fn); },
    pick(obj) { return obj?.[state.lang] ?? obj?.de ?? ""; }
  };

  document.addEventListener("DOMContentLoaded", async () => {
    renderHeader();
    renderFooter();
    try { state.shop = await loadJSON("shop"); } catch (e) { console.error(e); }
    setLang(getLang());
    document.dispatchEvent(new Event("site:ready"));
  });
})();
