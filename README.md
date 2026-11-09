# Effer Ventures, one-page site (version 2)

Nuxt (Vue) build of the Effer Ventures site, matching the design on canvas 2
("Effer Ventures one-page design – v2 (wireframe v2)"). The page is prerendered to
static HTML and hosted on Cloudflare Pages.

## Run it

```bash
npm install
cp .env.example .env   # then fill in NUXT_CONTACT_WEBHOOK_URL (never commit .env)
npm run dev        # http://localhost:3000
```

## Build

```bash
npm run build      # Cloudflare Pages output in dist/: the prerendered page plus the
                   # /api/contact function (a plain `generate` would drop the function)
npx wrangler pages dev dist      # preview the Cloudflare Pages build locally
```

On Cloudflare Pages, set the build command to `npm run build`, the output folder to `dist`,
and add these as encrypted environment variables:

- `NUXT_CONTACT_WEBHOOK_URL`: the n8n webhook's Production URL
- `NUXT_CONTACT_WEBHOOK_AUTH_HEADER` and `NUXT_CONTACT_WEBHOOK_AUTH_VALUE`: the header name
  (`X-Webhook-Secret`) and value of the n8n webhook's Header Auth. Without them n8n refuses the
  message.

## Where things are

- `app.vue`: the whole page (markup and behaviour). Sections in order: header (with the
  mobile menu), hero, What we do, Our group (Current and Exited), Our team, Join us,
  Contact (with the thank-you and failed popups), footer.
- `server/api/contact.post.ts`: the contact form route. Checks the fields, drops spam caught
  by the hidden honeypot field, and forwards the message to the n8n webhook.
- `assets/css/site.css`: layout, responsive breakpoints and animations.
- `public/images/`: illustrations; `public/images/logos/` the group company logos (colour for
  the cards, white for the footer); `public/images/team/` the black-and-white team cut-outs.
- `nuxt.config.ts`: page title, language, font and the Cloudflare Pages preset.

## Behaviour

- Header: slims down and turns the three links into thin Lucide icons when scrolling down, and
  brings the words back on scroll up. On phones the menu button opens a drop-down menu.
- Hero: the waves ripple and sway, the fish swim (inline SVG animation).
- What we do: the plane flies in along its trail the first time it scrolls into view.
- Our group: logo-first cards; the details panel slides up on hover or keyboard focus
  (shown open on touch screens). The balloon girl floats up as you scroll.
- Our team: arrows and dots, mouse drag with momentum, swipe on touch, and a 5-second
  auto-slide that starts when the carousel is on screen.
- Join us: the clouds and the grey sky drift in as the section scrolls into view.
- Contact: Submit posts to `/api/contact`, which sends the message to n8n. The button shows
  "Sending…", then the thank-you popup on success or a "Message not sent" popup with the
  reason (a missing field, or try again / email us if n8n could not be reached).
- Footer: the group logos slide in.
- In-page links glide to their section. All motion stops for visitors with reduced motion on.

## Still to do

- Contact form: add a Cloudflare rate-limiting rule on `/api/contact`; confirm with Codi where
  the n8n flow sends each message.
- Team: a sharper photo for Suvaal (the current one is very low resolution) and Alex's real
  LinkedIn link.
- Self-host Circular as WOFF2 (Figtree is a stand-in for now).
- Split `app.vue` into section components, move copy and team data into data files.
- SEO: Open Graph image, Organization schema, sitemap, robots.txt, and the WordPress 301 redirects.
