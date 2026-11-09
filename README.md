# L&T Nails

Static website template for a nail studio. Public pages only: no booking, no admin area, no backend. Languages: German (default), English, Vietnamese.

## Pages

| Page | File |
| --- | --- |
| Home (hero, announcement, gallery, reviews, about, contact) | `index.html` |
| Price list | `src/pages/prices.html` |
| Contact and opening hours | `src/pages/contact.html` |

## Project structure

```
index.html
src/
  pages/      prices.html, contact.html
  scripts/    common.js (header, footer, language, contact), home.js, prices.js, translations.js
  styles/     main.css
  data/       shop.json, reviews.json, gallery.json, announcement.json, prices.json
public/
  images/     gallery pictures
```

## Requirements

- A modern browser.
- Any static file server for local use. Opening `index.html` directly with `file://` does not work, because the page loads JSON with `fetch`.
- Python 3 or Node.js are only needed if you use the commands below.

## Run locally

There is no build step and no dependencies to install. From the project folder:

```sh
# Python
python3 -m http.server 8000 --bind 127.0.0.1

# or Node.js
npx serve -l 8000 .
```

Then open <http://127.0.0.1:8000/>.

### Open on another device on the same network

1. On the host computer, stop the local server with `Ctrl+C`, then start it from the project folder so other devices can connect:

  ```sh
  python3 -m http.server 8000 --bind 0.0.0.0
  ```

2. Find the host computer's local IPv4 address with `ip -4 addr`. Look for an address such as `192.168.1.25` on the active Wi-Fi or Ethernet interface; do not use `127.0.0.1`.
3. On the other device, connected to the same Wi-Fi or network, open `http://<host-ip>:8000/`, replacing `<host-ip>` with that address. For example: `http://192.168.1.25:8000/`.

Keep the server running while using the site. If the other device cannot connect, check that the host's firewall allows incoming connections on port `8000`. Binding to `0.0.0.0` makes the server reachable by devices on the network, so stop it with `Ctrl+C` when finished; files in the project folder are served.

## Build

None. The site is plain HTML, CSS and JavaScript. The files are the deliverable.

## Deploy

Upload `index.html`, `src/` and `public/` to any static host (GitHub Pages, Netlify, Cloudflare Pages, or a plain web server). Do not upload `CHANNELS.md`. Serve the site over HTTPS and from the site root, since the pages use relative paths.

## Edit the content

Texts shown in three languages live in `src/scripts/translations.js`. Add every new key to `de`, `en` and `vi`.

| What | Where |
| --- | --- |
| Studio name, phone, address, opening hours, social links | `src/data/shop.json` (`openingHours` has 7 entries, Monday to Sunday; `null` shows "Closed"; `social` accepts `instagram`, `facebook`, `tiktok` as `https://` URLs; `bookingUrl` is an external booking page, shown as a "Book online" button on the home, price and contact pages, and hidden when empty) |
| Reviews | `src/data/reviews.json` (`name`, `text` as `{ "de", "en", "vi" }`). The slider appears only when the list is not empty. The English/German/Vietnamese versions of the shipped reviews are translations of the originals; have them checked. |
| Gallery | `src/data/gallery.json`: `cover` is the banner image, `images` the pictures in the overlay. Use paths such as `images/nails-01.png`. |
| Homepage notice | `src/data/announcement.json`: text per language. The section is hidden when all text is empty. |
| Price list | `src/data/prices.json`: categories with items (`name` per language, `price`). An empty list `[]` shows a "coming soon" message. |
| Colours and fonts | CSS variables at the top of `src/styles/main.css` |

The shipped phone number, address, hours and prices are placeholders. Replace them before publishing.

## Validate

```sh
for f in src/scripts/*.js; do node --check "$f"; done
for f in src/data/*.json; do python3 -m json.tool "$f" > /dev/null || echo "Invalid: $f"; done
```

## Create a new shop from this template with an AI agent

[docs/NAILSHOP_TEMPLATE_SPEC.md](docs/NAILSHOP_TEMPLATE_SPEC.md) is a self-contained brief an AI agent can follow to rebuild or adapt this site. Point the agent at it and add overrides (name, languages, phone, email, address, hours, prices, colours) in your prompt.

## Changes

See [CHANNELS.md](CHANNELS.md) for the change log of the reference project this template follows.
# LTNails
