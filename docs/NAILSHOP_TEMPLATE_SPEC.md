# Nail Shop Website: Agent Template Spec

Purpose: a self-contained brief for an AI coding agent to build (or adapt) a static, multi-language nail studio website. Point the agent at this file, then add a short "Overrides" message (see [How to use](#how-to-use)). Anything the user states in the prompt overrides the defaults in this file.

Reference implementation (optional): this repository (`index.html`, `src/`). If available, follow its structure and conventions; if not, build from this spec alone.

---

## How to use

Prompt template:

```text
Read docs/NAILSHOP_TEMPLATE_SPEC.md and build the website in an empty folder / adapt the existing one.
Overrides:
- Shop name: Studio Aurora
- Languages: de (default), en, fr   (remove vi)
- Phone: +49 30 1234567
- Email: hello@aurora.example
- Address: Hauptstraße 5, 10115 Berlin
- Opening hours: Mon-Fri 09:00-18:00, Sat 10:00-14:00, Sun closed
- Prices: Manicure 25 EUR, Gel polish 35 EUR, Refill 40 EUR ...
- Colour theme: sage green and gold instead of blush and rose
- Social: add Instagram link
- Booking: Planity link https://www.planity.com/...
- Images: folder with photos provided (cover image + gallery)
- Reviews: pasted real reviews (with translations)
- Services: besides nails, also offer eyelash extensions, waxing and massage (price categories + wording adapted)
```

Rules for the agent:

1. **Complete intake for a new project**: When asked to use this spec for a new project, collect the information in every step below unless the user has already explicitly provided it or says to use a default. Ask about optional features too, so the user can choose them or decline them; do not silently assume an optional feature is unwanted. The Overrides block above is only an example, not project data.
2. **Step-by-step interactive workflow**: Work incrementally. At each step, ask for all inputs for that step that the user has not already supplied, then wait for the user's response before implementing or moving to the next step. Do not build everything silently in one batch. Follow the development steps outlined below.
3. Apply every override. If an answer is contradictory or unclear, ask the user to resolve it rather than guessing.
4. If the user explicitly asks to skip questions or use the defaults, follow that direction and clearly identify any remaining placeholders.
5. Do not add features outside this spec, and never add the excluded features below.
6. Finish by running the validation checklist and reporting what you could not verify (e.g. visual checks).

---

## Step-by-step development process (agent must follow)

At each step, the agent must inspect current state, ask the user for any needed data or choices if not yet provided, apply the changes, validate them, and confirm before moving forward:

1. **Step 1 — Shop identity & contact**:
   - Ask or verify: studio name, phone number, physical address, 7-day opening hours.
   - Ask for optional contact links: email, social profiles (Instagram, Facebook, TikTok), map URL, and an external booking page (Planity, Treatwell, etc.). Ask whether there are other official links the user wants included; if so, add an appropriate data field and render it as a safe, accessible link.
   - Strip URL tracking parameters (`igsh`, `utm_*`, `fbclid`) from social URLs. For external links, allow only `https://` and open in a new tab with `rel="noopener noreferrer"`.
   - Update `src/data/shop.json`, page titles, and header brand references.

2. **Step 2 — Services & scope beyond nails**:
   - Ask whether the salon offers services beyond nail care (lashes, eyebrows, waxing, massages, facials, etc.).
   - Ask which services and prices should appear; do not invent prices. Use clearly marked placeholders only if the user agrees.
   - Adapt `hero.eyebrow`, `hero.tagline`, and `about.text` across all supported languages in `src/scripts/translations.js`.
   - Update `src/data/prices.json` with service categories and items (or collect price inputs).

3. **Step 3 — Images & gallery**:
   - Ask for or inspect supplied image files.
   - Clean filenames to URL-safe names (e.g., `nails-01.png`), pick a suitable landscape `cover.png` for the gallery banner, and populate `src/data/gallery.json`.

4. **Step 4 — Customer reviews**:
   - Ask for real customer review text, reviewer names, and a source link or permission to look them up. If the source cannot be accessed or verified, ask the user to paste the reviews; never invent or paraphrase reviews as real. Include only reviews the user selects.
   - Provide translations across all active languages in `src/data/reviews.json` (`text` as `{ "de", "en", "vi" }`).

5. **Step 5 — Theming & styling**:
   - Ask for preferred color scheme, accent hues, or font choices if different from the default blush/rose palette.
   - Update CSS variables on `:root` in `src/styles/main.css`.

6. **Step 6 — Final validation & summary**:
   - Run the validation checklist (JSON validity, script checks, translation parity, link checks).
   - Report placeholders, external links, and visual checks that require review.

---

## Scope

### Included (public, user-facing)

- Home page, price list page, contact page.
- Language switcher (default German).
- Gallery banner with overlay, review slider, About text, contact details with opening hours, optional homepage announcement.
- Phone call links (`tel:`) as the only way to get in touch for visits.

### Excluded (do not build)

- Booking, appointment forms, calendars, schedulers, availability.
- Admin pages, login, dashboards, staff management.
- Any backend, database, API or server code. The site must be fully static.
- Contact forms that send data (a `mailto:` link is allowed if an email is provided).
- Third-party trackers, analytics, cookie banners that are not needed. Do not load external fonts or scripts (privacy, GDPR); use system/fallback fonts.

Where a booking CTA would normally be, use a "Call now" button.

Exception: if the user supplies an external booking page (e.g. Planity, Treatwell, Google Reserve), set it as `bookingUrl` in `shop.json` and render a prominent "Book online" primary button linking to it (new tab, `rel="noopener noreferrer"`, `https://` only). The site still builds no booking functionality of its own; the call button stays as the secondary (outlined) action. Mention to the user that visitors leave the site and the third party's privacy policy applies. Without `bookingUrl`, the button is hidden and the rules above apply unchanged.

---

## Tech stack and conventions

- Plain HTML, CSS and vanilla JavaScript. No framework, no build step, no dependencies.
- Must work when served by any static file server (`python3 -m http.server`). Content is loaded with `fetch` from JSON, so `file://` is not supported; say so in the README.
- Shared code in one script, page-specific code in separate scripts, one stylesheet, content in JSON files, UI strings in one translations file.
- Relative paths only, so the site works from the server root. Pages in subfolders use a `data-root` attribute on `<body>` (e.g. `../../`) to resolve data and links.
- Text from data files is always inserted with `textContent` (never `innerHTML`) to avoid injection.
- Semantic HTML, `lang` attribute updated on language change, `aria-label`s on icon-only buttons, visible focus styles, `prefers-reduced-motion` respected, entrance animations must always end visible.
- Responsive: desktop, tablet, phone. Root font size 100%, 112.5% from 1280px, 125% from 1680px; size everything in `rem`.
- 2-space indent, UTF-8, LF line endings.

---

## File structure

```text
index.html                    Home
src/pages/prices.html         Price list
src/pages/contact.html        Contact and opening hours
src/scripts/translations.js   window.TRANSLATIONS = { de:{}, en:{}, ... }
src/scripts/common.js         Header, footer, language switch, shop data, contact block
src/scripts/home.js           Announcement, gallery overlay, review slider
src/scripts/prices.js         Price list rendering
src/styles/main.css           All styles + CSS variables
src/data/shop.json            Name, phone, email, address, hours, social
src/data/reviews.json         Reviews
src/data/gallery.json         Cover + image list
src/data/announcement.json    Optional homepage notice
src/data/prices.json          Price list
images/                       Photos (gallery cover and gallery images)
README.md  .gitignore  .gitattributes  .editorconfig
```

---

## Navigation

Sticky header on every page. Tabs, in order:

| Tab (DE / EN / VI) | Target |
| --- | --- |
| Startseite / Home / Trang chủ | `index.html` |
| Preisliste / Price list / Bảng giá | `src/pages/prices.html` |
| Kontakt / Contact / Liên hệ | `src/pages/contact.html` |

- Brand name (from `shop.json`) links to home. Current tab has `aria-current="page"`.
- Language buttons are flags (inline SVG data URIs, no image files) with the active one highlighted.
- Footer: `© <year> <shop name>. <All rights reserved.>` (translated).
- Header and footer are rendered by `common.js` into `#site-header` and `#site-footer` so they are not duplicated per page.
- Mobile (<= 900px): brand and flags on one row, nav tabs on a second row; the brand must never wrap.

---

## Languages (i18n)

- Default: German (`de`). Others by default: English (`en`), Vietnamese (`vi`). The user may add or remove languages in the overrides.
- Selected language is saved in `localStorage` under `lang`; fall back to `de` if the value is unknown.
- All UI strings live in `translations.js` under flat keys (`nav.home`, `hero.cta`, ...). Elements use `data-i18n="key"` (text) and `data-i18n-label="key"` (aria-label).
- Every language must have exactly the same keys. A missing key falls back to German, then to the key itself.
- Data files with translatable text use an object per language: `{ "de": "...", "en": "..." }`. Reading code uses the current language, falling back to German.
- Weekday names are generated with `toLocaleDateString(locale, { weekday: "long" })` using locales `de-DE`, `en-GB`, `vi-VN` (add one per new language).
- The page `<title>` is `<Page title> – <Shop name>` (home: shop name only) and updates on language change.
- To add a language: add its translations block, a flag button + CSS flag, a locale mapping, and translate every data file field. Machine translations are acceptable but must be flagged to the user for review.

### UI string keys (all languages must define these)

```text
nav.home nav.prices nav.contact lang.label
hero.eyebrow hero.tagline hero.cta book.cta
notice.title
gallery.title gallery.empty gallery.close
reviews.title reviews.stars reviews.prev reviews.next reviews.more reviews.less
about.title about.text
contact.title contact.intro contact.phone contact.address contact.social contact.call
hours.title hours.closed
prices.title prices.intro prices.empty
footer.rights
```

Add `contact.email` if an email is configured.

---

## Pages and behaviour

### Home (`index.html`, `<body class="home">`)

Sections in this order:

1. **Hero**: small uppercase eyebrow ("Nagelstudio"), large shop name (`h1`), tagline, "Call now" pill button (`tel:` link built from `shop.phone`). If `bookingUrl` is set, a "Book online" primary pill button sits before it and the call button turns outlined. Right side: decorative artwork of five polished nails drawn with CSS (rounded capsule shapes, gradients, gloss highlight, slow floating animation). On mobile the art moves above the text and shrinks.
2. **Announcement** (optional): hidden unless the current language's text in `announcement.json` is non-empty. Shows small label ("Hinweis") and the message in a large display serif; preserves line breaks.
3. **Gallery banner**: full-width clickable button, `min-height ~18rem`, with `cover` image under a dark tint and a centred pill-outlined "Galerie" title. Hover: gentle zoom and lighten. Click opens an overlay (modal) with a grid of all images; closes via the close button, backdrop click or Esc; page scroll is locked while open. If `images` is empty the overlay shows "Pictures coming soon". If `cover` is empty the banner shows a solid dark colour.
4. **Reviews**: section hidden when `reviews.json` is empty. A slider (one review per slide) with prev/next buttons, wrap-around, and touch swipe (threshold 40px). Each review: five gold stars (accessible label "5 out of 5 stars"), quote, name. Review text is clamped to 5 lines; a "Read more" / "Show less" toggle appears only if the text overflows, re-checked on resize and language change.
5. **About**: heading on the left, text on the right (stacked and centred on mobile). Text is a short, personal story of the owner (see Content).
6. **Contact**: heading plus the shared contact block (details left, thin vertical divider, opening hours right; stacked with a horizontal divider on mobile).

### Price list (`src/pages/prices.html`)

- Title, intro line, then one card per category with a heading and rows of `name ... price`.
- Category and item names are per-language objects; `price` is a plain string (so currency formats like `25 €`, `from 30 €`, `€25` all work).
- Empty list shows "price list coming soon".
- Re-renders on language change.

### Contact (`src/pages/contact.html`)

- Title, intro ("We look forward to your call..."), the shared contact block (phone as `tel:` link, address, opening hours, plus email / social links when configured), and a "Call" button.
- No form.

### Shared contact block

- Phone: link `tel:` with non-digit characters (except `+`) stripped.
- Address: one line per entry in the `address` array.
- Opening hours: 7 rows Monday to Sunday, localised weekday names, `null` renders the translated "Closed". Small tabular-number text.
- All values inserted as text.

---

## Data schemas

### `shop.json`

```json
{
  "name": "Nagelstudio 27",
  "phone": "+49 000 0000000",
  "email": "",
  "address": ["Musterstraße 27", "00000 Musterstadt"],
  "openingHours": ["10:00 – 18:00", "10:00 – 18:00", "10:00 – 18:00", "10:00 – 18:00", "10:00 – 18:00", "10:00 – 14:00", null],
  "social": { "instagram": "", "facebook": "", "tiktok": "" },
  "mapUrl": "",
  "bookingUrl": ""
}
```

- `openingHours`: exactly 7 entries, Monday first. Split shifts as a single string, e.g. `"09:00 – 12:00, 14:00 – 18:00"`.
- `email`, `social`, `mapUrl`, `bookingUrl` are optional. The reference implementation renders `name`, `phone`, `address`, `openingHours`, `social` (Instagram, Facebook, TikTok links in the contact block under a translated "Social media" heading; render each link with its inline SVG icon followed by the page handle/name, e.g. `<svg> @lt.nails.nurnberg`, clickable as a single link opening in a new tab with `rel="noopener noreferrer"`; only `https://` URLs are rendered) and `bookingUrl` (see Scope). Strip tracking parameters (`igsh`, `utm_*`, `fbclid`) from profile URLs the user supplies, and mention that you did. If the user supplies the other optional fields, the agent must render them: email as a `mailto:` link in the contact block; `mapUrl` as an "Open in maps" link (do not embed third-party iframes unless the user asks, and then mention the privacy implication).

### `reviews.json`

```json
[{ "name": "Anna M.", "text": { "de": "Bewertungstext.", "en": "Review text.", "vi": "Nội dung đánh giá." } }]
```

Reviews are translated like other data files: `text` is a per-language object, `name` is a plain string. A plain string `text` is also accepted and shown in every language. Keep the original wording and language of each real review in its own language key, and flag any machine translations to the user for review. Use realistic placeholders, clearly flagged as placeholders, and never present invented reviews as real.

### `gallery.json`

```json
{ "cover": "images/nails-01.png", "images": ["images/nails-01.png", "images/nails-02.png"] }
```

Paths are relative to the site root. Add `alt` support only if requested.

If the user provides pictures (an `images/` folder or uploaded files), the agent must integrate them:

1. Rename files with spaces, parentheses or other special characters to clean, lowercase, URL-safe names (e.g. `Pasted image (3).png` becomes `nails-03.png`). Keep the original extension and tell the user about the renames.
2. List every picture in `images`, in numeric/alphabetical order; pick one landscape picture as `cover` (it may also appear in `images`).
3. Do not re-encode, crop or resize the files; the overlay grid crops to squares with CSS (`object-fit: cover`), and images use `loading="lazy"`.
4. If a picture is large (over about 1 MB), mention it to the user as a performance note.

### `announcement.json`

```json
{ "text": { "de": "", "en": "", "vi": "" } }
```

### `prices.json`

```json
[
  {
    "category": { "de": "Maniküre", "en": "Manicure", "vi": "Làm móng tay" },
    "items": [
      { "name": { "de": "Gel-Lack", "en": "Gel polish", "vi": "Sơn gel" }, "price": "35 €" }
    ]
  }
]
```

---

## Content defaults (German first; translate to every language)

Tone: warm, personal, professional, no hype. Address visitors formally in German ("Sie").

- **Tagline:** Pflege, Schönheit und individuelles Nageldesign
- **Hero CTA:** Jetzt anrufen; booking CTA (only with `bookingUrl`): Online Termin buchen
- **About:** A woman with nearly 20 years of nail-care experience stands behind the studio; wide variety of treatments (classic manicure, extensions, custom designs); invitation to call for flexible, personal service. Mention that besides nail care, further services are offered and can be asked about by phone.
- **Contact intro:** We look forward to your call. For questions, requests and arranging a visit, reach us by phone.
- **Services beyond nails:** The studio is nail-focused by default, but the user may state in the overrides that it offers other services too (e.g. eyelashes, brows, waxing, massage, facials). If so, add them as extra categories in `prices.json` and adapt `hero.eyebrow`, `hero.tagline` and `about.text` in every language so they no longer describe nails only, keeping the "call us" wording. The default About copy already says further services are available by phone; reword or remove that sentence if the shop offers nails only.
- **Price intro:** Prices at a glance; for individual requests, call us.
- **Typical price categories (suggestions):** Manicure, Pedicure, Gel polish, Nail extensions (new set, refill), Nail art, Removal. Only include what the user supplies; use obvious placeholder prices (`00 €`) otherwise.

Do not mention online booking, appointments via a form, or an admin anywhere in the copy (the optional external "Book online" button from `bookingUrl` is the only exception). Where visits are discussed, direct people to call.

---

## Design

Feel: a calm, feminine, luxurious nail studio. Airy, generous whitespace, soft colours, thin lines, rounded cards, elegant serif headings with spaced uppercase small labels. Inspiration: high-end salon sites (blush/nude palettes, rose-gold accents, minimal ornament, big imagery).

### Design tokens (CSS variables on `:root`)

```css
--blush: #f8ebe8;       /* tinted section background */
--cream: #fffaf7;       /* page background */
--rose: #b76e79;        /* primary accent, buttons */
--rose-dark: #9c5560;   /* hover, links, prices */
--gold: #c9a27a;        /* stars, rules */
--plum: #3a2a30;        /* text, footer */
--muted: #7a6a6e;       /* secondary text */
--line: rgba(58, 42, 48, 0.12);
--serif: "Cormorant Garamond", "Playfair Display", Georgia, "Times New Roman", serif;
--sans: "Helvetica Neue", "Segoe UI", system-ui, -apple-system, Roboto, sans-serif;
--shadow: 0 10px 30px rgba(120, 70, 80, 0.12);
```

To re-theme, change only these variables (and the hero nail gradients). Keep text/background contrast at WCAG AA or better.

### Component rules

- **Header:** sticky, translucent cream with blur, 1px bottom line. Brand in serif, nav links small uppercase with `0.18em` letter-spacing and a thin accent underline on hover/active.
- **Buttons:** pill shape (`border-radius: 999px`), accent background, white uppercase text with `0.15em` letter-spacing, soft coloured shadow, lift on hover.
- **Section titles:** serif, centred, with a short 1px gold gradient rule beneath. Home titles larger (about 2.75rem); About title left-aligned on desktop.
- **Cards** (reviews, contact, price categories, overlay): white, `20px` radius, `--shadow`.
- **Hero:** blush background with two soft radial gradients; five CSS nails in rose/peach/mauve/gold tones, fanned with slight rotations, floating animation offset per nail. No image files needed.
- **Sections:** alternate cream and blush backgrounds. Section padding 5rem desktop, 3rem mobile.
- **Footer:** plum background, light small text.
- **Motion:** subtle only (hover lifts, slider slide, float, a 0.7s fade-up on page content). All disabled under `prefers-reduced-motion`.
- Breakpoints: 900px (header compact), 800px (hero stacks), 700px (sections and contact stack).

---

## Customisation cheatsheet (where each override goes)

| Override | Edit |
| --- | --- |
| Name, phone, email, address, hours, social, booking link | `src/data/shop.json` |
| Add / remove a language | `translations.js`, flag buttons and CSS flags, locale map in `common.js`, every per-language field in `prices.json` and `announcement.json` |
| Prices | `src/data/prices.json` |
| Services beyond nails | categories in `src/data/prices.json`; `hero.eyebrow`, `hero.tagline`, `about.text` in `src/scripts/translations.js` |
| Reviews | `src/data/reviews.json` |
| Photos | put files in `images/` (clean file names), list them in `src/data/gallery.json` |
| Homepage notice (holiday closure etc.) | `src/data/announcement.json` |
| Colours, fonts | CSS variables in `src/styles/main.css` |
| Wording | `src/scripts/translations.js` |
| Default language | `getLang()` fallback in `common.js` |

Requests to add pages (e.g. "Services", "FAQ", "Impressum/Privacy"): add a new HTML page under `src/pages/`, a nav entry in `common.js`, and translation keys for every language. For sites in Germany, mention to the user that a legal notice (Impressum) and privacy policy are normally required; offer to add pages but do not invent legal text.

---

## Validation checklist (agent must run and report)

1. `node --check` every file in `src/scripts/`.
2. Every JSON file in `src/data/` parses (`python3 -m json.tool`).
3. Translation key parity across all languages (script comparing sorted keys).
4. Serve with a static server and confirm HTTP 200 for all pages, scripts, styles and data files (only if the user permits starting a server).
5. Grep to confirm none of these exist: `booking`, `appointment`, `admin`, `termin`, `server.py`, `<form` (matches for `bookingUrl` / `book.cta` / "Termin buchen" are expected when an external booking link is configured).
6. Confirm no external requests (no `http(s)://` in scripts, styles or HTML except user-supplied links).
7. Confirm all placeholders (phone, address, prices, reviews) are listed to the user for replacement.
8. State clearly what was not checked visually.

## README requirements

The generated `README.md` must include: what the site is, page list, folder structure, requirements, run locally (`python3 -m http.server 8000 --bind 127.0.0.1`), open on another device on the same network (`--bind 0.0.0.0`, find IP with `ip -4 addr`, open `http://<host-ip>:8000/`, firewall note), "no build step", deployment to any static host, a table of where to edit content, and the validation commands. Also create `.gitignore`, `.gitattributes` (`* text=auto eol=lf`, images binary) and `.editorconfig`.
