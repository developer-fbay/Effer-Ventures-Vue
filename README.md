# Effer Ventures, one-page site (version 2)

Nuxt (Vue) build of the Effer Ventures site, matching the design on canvas 2
("Effer Ventures one-page design – v2 (wireframe v2)"). The page is prerendered to
static HTML and hosted on Cloudflare Pages.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build

```bash
npm run generate   # static site in .output/public (also copied to dist/)
npx wrangler pages dev dist      # preview the Cloudflare Pages build locally
```

## Where things are

- `app.vue`: the whole page (markup and behaviour). Sections in order: header (with the
  mobile menu), hero, What we do, Our group (Current and Exited), Our team, Join us,
  Contact (with the thank-you popup), footer.
- `assets/css/site.css`: layout, responsive breakpoints and animations.
- `public/images/`: illustrations; `public/images/logos/` the group company logos (colour for
  the cards, white for the footer); `public/images/team/` the black-and-white team cut-outs.
- `nuxt.config.ts`: page title, language, font and the Cloudflare Pages preset.

## Behaviour

- Header: slims down and tucks the section links away when scrolling down, comes back on
  scroll up. On phones the menu button opens a drop-down menu.
- Hero: the waves ripple and sway, the fish swim (inline SVG animation).
- What we do: the plane flies in along its trail the first time it scrolls into view.
- Our group: logo-first cards; the details panel slides up on hover or keyboard focus
  (shown open on touch screens). The balloon girl floats up as you scroll.
- Our team: arrows and dots, mouse drag with momentum, swipe on touch, and a 5-second
  auto-slide that starts when the carousel is on screen.
- Join us: the clouds and the grey sky drift in as the section scrolls into view.
- Contact: Submit shows the thank-you popup (nothing is sent yet).
- Footer: the group logos slide in.
- In-page links glide to their section. All motion stops for visitors with reduced motion on.

## Still to do

- Contact form: `/api/contact` server route to the n8n webhook, with the secret in an encrypted
  Cloudflare Pages environment variable (never in the repo). Show the popup only on success.
- Team: photos for Juliet and Suvaal, and everyone's Past/Present lines (currently "[to come]");
  real LinkedIn links.
- Self-host Circular as WOFF2 (Figtree is a stand-in for now).
- Split `app.vue` into section components, move copy and team data into data files.
- SEO: Open Graph image, Organization schema, sitemap, robots.txt, and the WordPress 301 redirects.
