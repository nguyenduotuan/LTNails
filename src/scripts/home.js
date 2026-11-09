// Homepage: announcement, gallery banner + overlay, review slider.
document.addEventListener("site:ready", () => {
  initAnnouncement();
  initGallery();
  initReviews();
});

async function initAnnouncement() {
  const section = document.getElementById("notice");
  const text = document.getElementById("notice-text");
  try {
    const data = await Site.loadJSON("announcement");
    const render = () => {
      const msg = Site.pick(data.text).trim();
      section.hidden = !msg;
      text.textContent = msg;
    };
    render();
    Site.onLangChange(render);
  } catch (e) {
    section.hidden = true;
  }
}

async function initGallery() {
  const banner = document.getElementById("gallery-banner");
  const overlay = document.getElementById("gallery-overlay");
  const grid = document.getElementById("gallery-grid");
  const empty = document.getElementById("gallery-empty");
  let data = { cover: "", images: [] };
  try { data = await Site.loadJSON("gallery"); } catch (e) { console.error(e); }

  if (data.cover) banner.style.backgroundImage = `url("${encodeURI(data.cover)}")`;
  data.images.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.loading = "lazy";
    grid.appendChild(img);
  });
  empty.hidden = data.images.length > 0;

  const open = () => { overlay.hidden = false; document.body.classList.add("no-scroll"); };
  const close = () => { overlay.hidden = true; document.body.classList.remove("no-scroll"); };
  banner.addEventListener("click", open);
  overlay.querySelector(".overlay-close").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !overlay.hidden) close(); });
}

async function initReviews() {
  const section = document.getElementById("reviews");
  const track = document.getElementById("review-track");
  let reviews = [];
  try { reviews = await Site.loadJSON("reviews"); } catch (e) { console.error(e); }
  if (!reviews.length) return;
  section.hidden = false;

  reviews.forEach((r) => {
    const card = document.createElement("article");
    card.className = "review";
    card.innerHTML = `
      <div class="stars" role="img" aria-label="">★★★★★</div>
      <p class="review-text"></p>
      <button type="button" class="review-toggle" hidden></button>
      <p class="review-name"></p>`;
    card.querySelector(".review-name").textContent = r.name;
    card.reviewText = r.text;
    track.appendChild(card);
  });

  const cards = [...track.children];
  let index = 0;

  const show = (i) => {
    index = (i + cards.length) % cards.length;
    track.style.transform = `translateX(-${index * 100}%)`;
  };

  const updateToggles = () => {
    cards.forEach((card) => {
      const text = card.querySelector(".review-text");
      const btn = card.querySelector(".review-toggle");
      const expanded = text.classList.contains("expanded");
      text.classList.remove("expanded");
      const overflowing = text.scrollHeight > text.clientHeight + 1;
      if (expanded) text.classList.add("expanded");
      btn.hidden = !overflowing && !expanded;
      btn.textContent = Site.t(expanded ? "reviews.less" : "reviews.more");
    });
  };

  cards.forEach((card) => {
    const text = card.querySelector(".review-text");
    card.querySelector(".review-toggle").addEventListener("click", () => {
      text.classList.toggle("expanded");
      updateToggles();
    });
  });

  const labels = () => {
    cards.forEach((card) => {
      const msg = card.reviewText;
      card.querySelector(".review-text").textContent = typeof msg === "string" ? msg : Site.pick(msg);
    });
    section.querySelectorAll(".stars").forEach((s) => s.setAttribute("aria-label", Site.t("reviews.stars")));
    updateToggles();
  };
  labels();
  Site.onLangChange(labels);
  window.addEventListener("resize", updateToggles);

  document.getElementById("review-prev").addEventListener("click", () => show(index - 1));
  document.getElementById("review-next").addEventListener("click", () => show(index + 1));

  let startX = null;
  track.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });
}
