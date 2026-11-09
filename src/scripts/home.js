(function () {
  "use strict";

  var App = window.App;

  function initHero() {
    App.fetchShop().then(function (shop) {
      var nameEl = document.getElementById("hero-name");
      if (nameEl) nameEl.textContent = shop.name;
      var callBtn = document.getElementById("hero-call");
      if (callBtn) callBtn.href = "tel:" + shop.phone.replace(/[^\d+]/g, "");
      var bookBtn = document.getElementById("hero-book");
      if (bookBtn && shop.bookingUrl && shop.bookingUrl.indexOf("https://") === 0) {
        bookBtn.hidden = false;
        bookBtn.href = shop.bookingUrl;
        if (callBtn) callBtn.classList.add("btn-outline");
      }
    });
  }

  function initAnnouncement() {
    var section = document.getElementById("announcement");
    var msg = document.getElementById("announcement-text");
    if (!section || !msg) return;
    App.fetchJSON("src/data/announcement.json")
      .then(function (data) {
        function update() {
          var txt = App.text(data && data.text);
          if (txt && txt.trim()) {
            msg.textContent = txt;
            section.hidden = false;
          } else {
            section.hidden = true;
          }
        }
        update();
        document.addEventListener("langchange", update);
      })
      .catch(function () {
        section.hidden = true;
      });
  }

  function initGallery() {
    var banner = document.getElementById("gallery-banner");
    var bannerBg = document.getElementById("banner-bg");
    var overlay = document.getElementById("gallery-overlay");
    var grid = document.getElementById("overlay-grid");
    var emptyMsg = document.getElementById("overlay-empty");
    var closeBtn = document.getElementById("overlay-close");
    if (!banner || !overlay) return;
    var images = [];

    App.fetchJSON("src/data/gallery.json")
      .then(function (data) {
        images = (data && data.images) || [];
        if (data && data.cover && bannerBg) {
          bannerBg.style.backgroundImage = "url('" + App.root() + data.cover + "')";
          banner.classList.add("has-cover");
        }
      })
      .catch(function () {});

    function open() {
      grid.innerHTML = "";
      if (images.length === 0) {
        emptyMsg.hidden = false;
      } else {
        emptyMsg.hidden = true;
        images.forEach(function (src) {
          var cell = document.createElement("div");
          cell.className = "overlay-cell";
          var img = document.createElement("img");
          img.src = App.root() + src;
          img.alt = App.t("gallery.title");
          img.loading = "lazy";
          cell.appendChild(img);
          grid.appendChild(cell);
        });
      }
      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function close() {
      overlay.hidden = true;
      document.body.style.overflow = "";
      banner.focus();
    }

    banner.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlay.hidden) close();
    });
  }

  var STAR =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"/></svg>';

  function initReviews() {
    var section = document.getElementById("reviews");
    var track = document.getElementById("slider-track");
    var prev = document.getElementById("rev-prev");
    var next = document.getElementById("rev-next");
    if (!section || !track) return;
    var reviews = [];
    var index = 0;

    function go(i) {
      index = (i + reviews.length) % reviews.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
    }

    function checkOverflow() {
      track.querySelectorAll(".slide").forEach(function (slide) {
        var quote = slide.querySelector(".review-text");
        var more = slide.querySelector(".review-more");
        if (quote.classList.contains("expanded")) {
          more.hidden = false;
          return;
        }
        more.hidden = quote.scrollHeight <= quote.clientHeight + 1;
      });
    }

    function render() {
      track.innerHTML = "";
      reviews.forEach(function (rev) {
        var slide = App.el("div", "slide");
        var card = App.el("figure", "review-card");

        var stars = App.el("div", "stars");
        stars.setAttribute("role", "img");
        stars.setAttribute("aria-label", App.t("reviews.stars"));
        for (var s = 0; s < 5; s++) stars.innerHTML += STAR;

        var quote = App.el("blockquote", "review-text", App.text(rev.text));

        var more = App.el("button", "review-more", App.t("reviews.more"));
        more.type = "button";
        more.hidden = true;
        more.addEventListener("click", function () {
          var expanded = quote.classList.toggle("expanded");
          more.textContent = App.t(expanded ? "reviews.less" : "reviews.more");
        });

        card.appendChild(stars);
        card.appendChild(quote);
        card.appendChild(more);
        card.appendChild(App.el("figcaption", "review-name", rev.name || ""));
        slide.appendChild(card);
        track.appendChild(slide);
      });
      go(index);
      requestAnimationFrame(checkOverflow);
    }

    App.fetchJSON("src/data/reviews.json")
      .then(function (data) {
        reviews = Array.isArray(data) ? data : [];
        if (reviews.length === 0) {
          section.hidden = true;
          return;
        }
        section.hidden = false;
        render();
        document.addEventListener("langchange", render);
      })
      .catch(function () {
        section.hidden = true;
      });

    prev.addEventListener("click", function () {
      go(index - 1);
    });
    next.addEventListener("click", function () {
      go(index + 1);
    });

    var startX = null;
    track.addEventListener(
      "touchstart",
      function (e) {
        startX = e.touches[0].clientX;
      },
      { passive: true }
    );
    track.addEventListener("touchend", function (e) {
      if (startX == null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (dx > 40) go(index - 1);
      else if (dx < -40) go(index + 1);
      startX = null;
    });

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkOverflow, 150);
    });
  }

  function init() {
    initHero();
    initAnnouncement();
    initGallery();
    initReviews();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
