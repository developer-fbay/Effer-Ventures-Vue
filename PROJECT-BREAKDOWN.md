# Effer Ventures site (v2): project breakdown

How the one-page site is put together: what each section does, how the animations work, and how
the contact form reaches n8n. For running and deploying, see `README.md`.

---

## 1. Stack at a glance

| Piece | What it is |
|---|---|
| Framework | Nuxt 3 (Vue 3, Options API) |
| Page | One page: `app.vue` holds all markup and behaviour |
| Styles | `assets/css/site.css` (plus inline styles in `app.vue`) |
| Images | `public/images/`, with `logos/` and `team/` subfolders |
| Server | `server/api/contact.post.ts`, the only server code |
| Hosting | Cloudflare Pages (`cloudflare_pages` Nitro preset). The home page is prerendered to static HTML; `/api/contact` runs as a Pages Function |
| Font | Figtree from Google Fonts, standing in for Circular until it is self-hosted |
| Icons | `@lucide/vue`, for the slim header's three icons (stroke width 1.25) |

### Where the page came from

The page was built from the **v2 design canvas** ("Effer Ventures one-page design – v2"), then
converted to Vue with a script. The conversion kept the canvas markup and inline styles as they
were, which is why `app.vue` is long and style-heavy. The converter script is not part of this
repo. From here on, treat `app.vue` as the source of truth and edit it directly. Splitting it into
section components is on the to-do list (section 9).

### Folder map

```
app.vue                     the whole page: <template> markup + <script> behaviour
assets/css/site.css         layout, breakpoints, keyframes, hover and transition rules
server/api/contact.post.ts  contact form route -> n8n webhook
public/images/              illustrations (hero art is inline SVG, not a file)
public/images/logos/        group logos: colour (cards) and -white (footer)
public/images/team/         black-and-white team cut-outs (transparent PNG)
nuxt.config.ts              head tags, font, runtime config, Cloudflare preset
.env.example                the contact form's environment variables (copy to .env)
```

---

## 2. How the page code is organised

`app.vue` is a single Options API component:

- **`data()`**: `tmLoop` (team carousel copies added), `tmIdx` (current team dot) and
  `contactSending` (form button state).
- **`computed`**:
  - `team`: the team list (name, past, present, photo, crop position, link).
  - `teamDots`: one dot per carousel position.
- **`mounted()`**: sets everything up in one place.
  - Grabs the refs: `plStage` (the plane), `girlBox`, `whySec` (the Join us section) and `teamTrack`.
  - Adds the scroll, resize, click and keyboard listeners.
  - Starts the IntersectionObservers and the carousel auto-slide.
- **`beforeUnmount()`**: removes every listener and observer that `mounted()` added.
- **`methods`**: one or more per feature, listed in each section below.

Most behaviour works by adding or removing a class (`nav-min`, `menu-open`, `open`, `in`) or by
writing a `transform`/`opacity` straight onto an element. The CSS does the actual visual
change. This keeps Vue re-renders out of scroll handlers, so scrolling stays smooth.

### Page-wide layout rules

- `.wrap`: the content container. Max 1600px wide with 24px side gutters; between 1280 and 1920 wide the maximum scales with the screen (`--wrap`), so side space grows steadily instead of only appearing above 1648. `--gutter` is the same side space for sections that bleed to one edge.
- `.sec-full`: makes a section at least one screen tall below the header:
  `min-height: calc(100svh - 88px)`. Switched off on phones so sections fit their content.
- Breakpoints:
  - `1279px`: group and team go from 4 to 3 across.
  - `1024px`: tablet, 2 across.
  - `767px`: phone, 1 across. The menu button replaces the links.
  - `max-height: 760px` (768px wide and up): short laptops get tighter group cards (mouse and
    trackpad only; touch screens keep the open cards at full height), square team photos (4:3 up
    to 1024px wide) and a more compact contact form, so the whole form down to Submit fits on one
    screen.
- Colours:
  - Navy `#00123D`, pink `#FF66CC`, purple `#7121FF`, grey text `#58595B`.
  - Cool grey sections `#E5EBF1`.
  - The pink-to-purple gradient is the `.gtxt` text gradient and the team photo background.

### In-page links (smooth scroll)

`onAnchor` is a capture-phase click listener on `window` that handles every `a[href^="#"]`. It:

1. Finds the target section.
2. Works out which element is scrolling (normally the window).
3. Glides there with `scrollTo({ behavior: 'smooth' })`.

It lands on the section's content rather than its outer edge: it skips the section's top padding
except 24px, so the first heading or picture sits 24px below the bar. It allows for the bar's final
height: 66px when heading down (the bar will be slim) and 88px when heading up (`#top` always goes
to the very top). About a second later it checks the aim once more and corrects it if the page was
still loading or the bar was mid-resize, unless the visitor has scrolled, swiped or pressed a key
in the meantime. Visitors with reduced motion get an instant jump.

`setupSectionSnap()` is a custom "snap to section" helper. It's written but switched off in
`mounted()` (commented out) after testing showed it felt glitchy. Leave it off unless that's
revisited.

---

## 3. Section by section

### Header (`<header>`, mobile menu `#m-menu`)

- **Sticky bar**: navy with a 4px pink bottom border. Holds the logo and the three links from the
  approved wireframe: **Home** (`#top`), **About** (`#what`) and **Contact** (`#contact`). The
  phone menu has the same three.
- **Shrink on scroll**: `setupNavShrink()`.
  - Scrolling down past 120px adds `header.nav-min`; scrolling up removes it. Movements under
    6px are ignored to avoid flicker.
  - In `nav-min` the words (`.nav-txt`) collapse and the links become thin Lucide icons
    (`.nav-ico`): `House`, `Info` and `Mail`. They stay clickable, each with a 44px target, and
    the hidden words stay in the page as the links' names for screen readers. Phones keep the
    menu button instead.
  - The bar's `height` goes from 88px to 66px while its `margin-bottom` grows by the same 22px.
    The total space it takes never changes, so the page below does not jump.
  - The logo scales to 84%.
- **Phones** (≤767px) skip the shrink: the bar stays 66px, so scrolling never changes the layout.
- **Mobile menu** (≤767px):
  - The menu button calls `toggleMenu()` → `setMenu(open)`. That toggles `header.menu-open` and
    updates `aria-expanded` and `aria-label`.
  - `#m-menu` is a navy panel under the bar. It fades and slides in, and the links stagger in.
  - It closes when a link is picked, on Escape, or when the window gets wider than 767px.

### Hero (`#top`)

- The headline uses the pink-to-purple gradient text.
- The artwork is an **inline SVG** (`svg.hero-art`, viewBox 1828×1200). It has four paper-cut
  wave layers and fifteen fish.
- The two fish shapes (`#ev-fish-p` pink, `#ev-fish-v` violet) are drawn once in `<defs>` and
  reused with `<use>`, each with its own position, rotation and size.
- The paper depth effect comes from the SVG filters in `<defs>`:
  - `#ev-paper` and `#ev-paper1`: inner shadows and highlights.
  - `#ev-fsh`: the fish drop shadow.
  - `#ev-soft-line`: a blur on the lines along the fish backs.
- How the waves and fish move: section 4.
- **Phones** (767px and under) don't run this SVG, because Safari redraws animated SVG blurs very
  slowly. They show `.hero-lite`: seven images in `public/images/hero/` (four waves, two fish
  groups and the lead fish), rendered once from the SVG's first frame, each moved only with CSS
  `transform`. They are CSS backgrounds in the phone media query, so desktops never download them.
- `heroRest()` pauses the waves when the hero is off screen or the phone menu is open.

### What we do (`#what`)

- Two columns: the plane illustration on the left, the heading and paragraph on the right.
- The illustration is `.pl-stage`: the scene image, a soft white panel that hides it until the
  plane has passed (`.pl-wipe`) and the plane image (`plane-shadow.webp`, which is `plane.png` with
  its shadow built in). It sits against the left edge and on the bottom of the section (no bottom
  padding), touching Our group below.
- On phones the text comes first and the picture second, at 80% width.
- The plane fly-in: section 4.

### Our group (`#portfolio`)

- **Current** and **Exited** labels, each followed by a `.cards` row.
- **Layout**: `.cards` is a flex row. Each card is
  `flex-basis: calc((100% - 3 × gap) / 4)` (4 across). At ≤1279px that becomes 3 across, at
  ≤1024px 2, and on phones 1. Rows fill from the left.
- **Card design**:
  - At rest a card shows only the logo (`.d-logo`) and the sector (`.d-tag`).
  - On `:hover` or `:focus-visible`:
    - The logo moves up by half the height of its own panel, so it centres in the space above it, and shrinks to 80%. Cards are always at least 88px taller than the tallest panel (`--info` and `--info-max`, measured in `setupGroupCards`).
    - The sector fades out.
    - The navy `.d-info` panel (headline, description, visit link) slides up from
      `translateY(101%)` to `0`.
  - On touch screens (`@media (hover:none)`) and on phones, the details are shown open under the
    logo instead. The navy panel sits at the bottom of the card, so cards in a row line up.
  - The visit links end in `&nbsp;→`, so the arrow never wraps onto a line of its own.
- **Balloon girl** (`.ev-girl`): floats with scroll. See section 4.
- **To add a company**:
  1. Copy a `<a class="card" …>` block.
  2. Change the link, logo, sector, headline and description.
  3. Put the logo in `public/images/logos/`. Add a white version to the footer if it's a current
     company.

### Our team (`#team`)

- **Data**: the `team` computed list. Each entry has:
  - `name`, `past`, `present`
  - `photo`: a path, or `null` to show the placeholder icon
  - `pos`: a CSS `object-position` that sets the crop. The tall 4:5 frame mostly ignores the
    second (vertical) value; it matters in the square and 4:3 frames on short screens, so pick
    one that keeps the whole head in view there
  - `noPhoto`
  - `link`

  To add or update someone, edit this list only.
- **Photos**:
  - Black-and-white cut-outs: transparent PNG, about 800px wide, in `public/images/team/`.
  - They sit on the pink-to-purple gradient in a 4:5 frame (`object-fit: cover`). On screens
    under 760px tall the frame is square (4:3 from 768 to 1024px wide), so no one's head is cut
    off.
  - The background was removed with `rembg`, a local Python background-removal tool:
    - `isnet-general-use` model for most photos.
    - `u2net_human_seg` model where arms were being cut off.
  - The photos were then turned black and white with a light contrast boost.
  - Use the same process for new photos so they match. Chulu's (plain wall, 800 x 1000) and
    Juliet's (grey studio backdrop, navy border cropped off, 800 x 800) photos were cut out with a
    Pillow script instead (flood fill of the backdrop colour from the edges), with the same
    black-and-white finish.
- **Track**: `.tm-track` is a horizontal scroller with CSS scroll-snap (`x mandatory`).
  - Cards are 4 across on wide screens, 3 below 1280px, 2 on tablet and 80% wide on phones.
  - The cards run the full container width. The arrows sit with the dots underneath
    (`.tm-controls`).
- **Movement**: `teamGlide(left, duration)` animates `scrollLeft` with an ease-in-out curve.
  Snap is switched off during the glide and restored after it.
  - `teamMove(±1)` (arrows) steps one card in 0.9s.
  - Taps stack up: a tap during a glide counts on from where the glide is heading (`tmTo`) and
    finishes in 0.5s with an ease-out, so triple-tapping moves three cards.
  - `teamGo(i)` (dots) goes to person `i`, the short way round the loop.
- **Endless loop**: `teamCards` renders the team three times. The middle run is the real one; the
  outer two are copies (`aria-hidden`, links out of the tab order) added after load, so the page
  HTML only carries 13 cards.
  - The view always stays in the middle run. `teamWrap(x)` maps any position to the same view
    there, and the runs are identical, so the jump can't be seen.
  - Arrows, dots, mouse drag and momentum wrap on every frame. Native touch swipes and keyboard
    scrolling can't be moved mid-scroll without killing their momentum, so `teamRecentre()` wraps
    them 140ms after they stop, or the moment a new finger lands, and never during a touch or
    mouse drag.
- **Dots**: one per person. `measureTeam()` measures the card step, the first card's offset and the
  width of one run, and sets `tmIdx`. It runs on scroll (throttled with `requestAnimationFrame`)
  and on resize.
- **Drag**: `setupTeamDrag()`. With a mouse you can drag the track. On release it keeps gliding
  with momentum (velocity × 0.94 each frame), then settles on the nearest card. A drag never
  triggers a click on a LinkedIn link. Touch screens use native swipe.
- **Auto-slide**: `startTeamAuto()` moves one card every 5s.
  - It starts the first time the carousel is 40% on screen, so visitors always begin on card one.
  - It pauses while the carousel is off screen, while hovered or focused, and while the tab is
    hidden.
  - It is off for visitors with reduced motion.

### Join us (`#join`)

- The text is on the left. On the right is a scene from the old site's "Why we exist" artwork,
  stacked bottom-right:
  - `join-bank`: cloud bank
  - `join-land`: mountains
  - `join-pink-full`: pink cloud
- **Soft edges**:
  - The cloud bank and mountains use a CSS `mask-image` (two gradients intersected) so their cut
    edges fade out.
  - The pink cloud is 72% opaque with a bottom fade.
  - `.join-fade` is a short white gradient at the very bottom that blends into the Contact
    section.
- **Grey sky**: the section itself is white. `.join-sky` is a full-size `#E5EBF1` layer behind
  everything (`z-index: -1` inside an `isolation: isolate` section). Its opacity follows the
  clouds, so the clouds appear to bring the grey in. See section 4.
- **Divider**: `.join-rule` is a 1px line across the top, inset 50–250px from each side depending
  on screen width.
- On phones the small clouds are hidden and the mountains sit under the text.
- The "full cloud" test (pink clouds with a mirrored underside) is still in the CSS but switched
  off with `.join-pink-full img + img { display: none !important }`. Delete that rule to bring it
  back.

### Contact (`#contact`)

- Three columns: the head illustration, the London HQ and Cape Town addresses, and the form.
- The phone number is a pink badge (`.chip.chip-tel`) and a `tel:` link.
- The form, its popups and the server route: section 5.
- On tablet the head is hidden. On phones it shows smaller (220px tall) above the addresses.

### Footer

- Pink-to-purple gradient, the white EV logo, white group logos (`.foot-logos`), contact details,
  company registration line and privacy policy link.
- The logos slide in when the footer comes into view. See section 4.

### Popups (thank-you and failed)

- Two dialogs that share the `.ev-thanks` styles:
  - `.ev-thanks`: success.
  - `.ev-thanks.ev-fail`: failure (`role="alertdialog"`).
- `openThanks()` and `openFail(message)`:
  1. Remember which element had focus.
  2. Add `.open`.
  3. Set `aria-hidden="false"`.
  4. Move focus to the popup's button.

  `openThanks()` also clears the form. `openFail()` puts the server's reason into
  `.ev-fail-msg`, or shows the default "try again / email us" text.
- They close via the button, a click on the dimmed background, or Escape, and focus returns to
  where it was.

---

## 4. How the animations work

There are four techniques. Every one of them is switched off for visitors with
`prefers-reduced-motion: reduce`: through ten `@media (prefers-reduced-motion:reduce)` blocks in
the CSS, and checks in `mounted()`.

### a) CSS keyframes (always running, decorative)

| Keyframes | Used on | What it does |
|---|---|---|
| `ev-sway` | hero wave groups (`.wv`) | slow drift, tilt and skew of each wave layer, 7–14s, alternating |
| `ev-swim` | most fish (`.fs`) | small side-to-side swim, 5–9s, alternating |
| `ev-leap` | the lead fish (`.fs-lead`) | bigger diagonal leap |
| `ev-bob` | balloon girl (`.ev-girl-bob`) | gentle up-and-down bob with a slight rotation |
| `ev-drift` / `ev-float` | Join us clouds | idle float while the section is on screen, 20–26s loops |
| `ev-burst` | thank-you popup triangles | ten small triangles fly out from the tick and fade, each angle and distance set with CSS variables (`--a`, `--d`) |

Each element gets its own `animation-delay` and `animation-duration` so nothing moves in lockstep.

### b) SVG animation (SMIL) for shapes that change

- **Wave ripple**: each wave `<path>` has an `<animate attributeName="d">` with 12 pre-computed
  outlines. Together they form one full cycle of a travelling swell that rolls towards the loose
  tip of the wave.
  - A small Python script generated the outlines by offsetting every point of the original path
    along a sine wave. Points outside the artwork stay pinned, so no edge ever shows.
  - Cycles are 12–16s, with `calcMode="linear"` and `repeatCount="indefinite"`.
  - This runs on top of `ev-sway`.
- **Plane fly-in** (`fly()`):
  1. CSS keyframes (`ev-pl-fly`) move the plane along a curved path from bottom-left to its final
     spot, banking into the curve, over 3.4s. They are that path and easing sampled every 2.5%.
  2. A soft-edged white panel (`ev-pl-wipe`) moves with it at 82% opacity, so the scene ahead of
     the plane looks faded and the scene behind it shows in full. That leaves the "trail". It
     relies on the section background being white.
  3. After landing, a small CSS animation (`ev-pl-bob`) keeps the plane bobbing.

  Only `transform` and `opacity` change, so phones can run it on the GPU; the old version redrew a
  live-blurred SVG mask every frame. `fly()` adds `.go` to the stage when an IntersectionObserver
  sees it (once, with a 20% bottom margin so it starts slightly late), or `.done` for reduced
  motion.

### c) Scroll-driven effects (JS, `requestAnimationFrame`)

All scroll listeners are passive and throttled to one update per animation frame. They only write
`transform` or `opacity`, which the browser can animate cheaply.

- **Balloon girl** (`floatGirl()`):
  - Works out the section's scroll progress `p` (0 → 1 as it passes through the screen).
  - Target position: from low in the section up to just above its top, plus a small
    `sin`-based tilt.
  - Each frame she moves 9% of the way to the target (a lerp). She trails the scroll and eases to
    a stop, which reads as floating.
- **Join us clouds and sky** (`cloudsOut()`):
  - Entry progress `inP` goes from 0 to 1 over one screen of scrolling as the section comes in,
    eased with a smoothstep curve.
  - Each cloud wrapper with `data-ev-out="f"` slides in from the right by `(1 − inP) × distance × f`.
    Different `f` values give a parallax spread, and the clouds sit on separate rows so they never
    cross.
  - Each cloud fades in with `opacity = inP × 1.5`.
  - The grey `.join-sky` layer gets `opacity = inP`, slightly behind the clouds.
  - Scrolling back up plays it in reverse.
- **Header shrink**: `setupNavShrink()` (section 3). A class toggle; the CSS transitions do the
  animation.

### d) IntersectionObserver triggers and CSS transitions

- **Footer logos**: when the logo row is 40% visible, `.foot-logos` gets the class `in`.
  - Each logo transitions from `translateX(-56px) scale(.86)`, `opacity 0`, to its place.
  - The curve is `cubic-bezier(.34, 1.7, .6, 1)`: it overshoots, then snaps back.
  - Each logo starts 0.09s after the previous one.
  - The class is removed when the footer is below the screen again, so it replays on the next
    pass down.
- **Plane**: plays once (section b).
- **Team auto-slide start**: section 3.
- **Hover and focus polish**:
  - Buttons fade colour over 0.45s.
  - Group cards lift.
  - Form fields fade in a pink outline and glow when focused.
  - The card arrow buttons nudge right.

---

## 5. Contact form: end to end

```
Visitor fills the form
  -> browser checks required fields (first name, last name, email, message)
  -> submitContact(): button shows "Sending…", POST /api/contact (JSON)
       -> server/api/contact.post.ts
            honeypot filled?          -> reply ok, send nothing
            fields invalid?           -> 400 { ok: false, message: "Please add …" }
            NUXT_CONTACT_WEBHOOK_URL? -> POST to the n8n webhook (10s timeout)
               n8n answers 2xx        -> 200 { ok: true }
               error / timeout        -> 502 { ok: false, message: "We could not send … email us" }
  -> ok:   form clears, thank-you popup
  -> fail: "Message not sent" popup with the message; the form keeps what they typed
```

### Front end (in `app.vue`)

- The `<form>` has `@submit.prevent="submitContact"`, and Submit is a real `type="submit"`
  button. The browser runs its own required-field and email checks first.
- **Required fields**: first name, last name, email and message, marked with a pink asterisk.
  Phone is optional.
- **Honeypot**: a hidden `ev_hp` field (`.hp`, moved off screen, `tabindex="-1"`,
  `aria-hidden`). People never fill it; bots usually do.
  - Don't give it a name or label that browser autofill recognises ("company", "website",
    "address", …). Chrome ignores `autocomplete="off"` for address data and fills off-screen
    fields too, so a real visitor's message would be dropped and they'd still see "Thank you!".
- **`submitContact(e)`**:
  1. Collects the fields with `FormData`.
  2. Sets `contactSending = true`, which disables the button and changes it to "Sending…".
  3. POSTs JSON to `/api/contact`.
  4. Calls `openThanks()` or `openFail(message)` depending on the reply.
  5. A network error also opens the failed popup.

### Server route (`server/api/contact.post.ts`)

- **Input**: JSON with `first_name`, `last_name`, `email`, `phone`, `message`, `ev_hp` (the
  honeypot).
- **Cleaning**: values are trimmed and cut to a maximum length:

  | Field | Max length |
  |---|---|
  | Names | 100 |
  | Email | 200 |
  | Phone | 50 |
  | Message | 5000 |
  | Honeypot | 200 |

- **Validation**: first and last name present, email matches `name@domain.tld`, message present.
  The reply lists what's missing in plain English.
- **Payload sent to n8n**:

  ```json
  {
    "firstName": "…", "lastName": "…", "email": "…", "phone": "…", "message": "…",
    "source": "effer-ventures.com",
    "submittedAt": "2026-11-06T10:15:00.000Z"
  }
  ```

- **Auth**: if `NUXT_CONTACT_WEBHOOK_AUTH_HEADER` and `NUXT_CONTACT_WEBHOOK_AUTH_VALUE` are set,
  that header is added to the request. This pairs with the "Header Auth" credential on the n8n
  Webhook node, which is switched on, so both must be set or n8n refuses the message.
- **Reply**: always `{ ok, message? }`, so the page can show the right popup.
- **Logging**: failures go to the server log (`console.error`) with the status code. The visitor's
  details are not logged.

### Configuration (never in the repo)

| Variable | Purpose |
|---|---|
| `NUXT_CONTACT_WEBHOOK_URL` | the n8n Webhook node's **Production** URL |
| `NUXT_CONTACT_WEBHOOK_AUTH_HEADER` | header name for n8n Header Auth: `X-Webhook-Secret` |
| `NUXT_CONTACT_WEBHOOK_AUTH_VALUE` | header value (the secret) |

- **Locally**: copy `.env.example` to `.env` and fill it in. `.env` is git-ignored.
- **Cloudflare Pages**: add these as **encrypted** environment variables in the project's
  settings.
- `nuxt.config.ts` declares them under `runtimeConfig` (`contactWebhookUrl`, …). Nuxt fills them
  from the matching `NUXT_…` variables at runtime.

### n8n side

- The workflow starts with a **Webhook** node (POST).
- The node uses **Header Auth** (credential "EV-Webhook-Secret", header `X-Webhook-Secret`). A
  request without the right header gets a 403, which shows the visitor the failed popup.
- Use the node's **Production URL**. The Test URL only works while the editor is listening.
- The workflow must be **active**.
- The webhook should answer with a 2xx status. Any non-2xx or a timeout shows the visitor the
  failed popup.
- What happens to each message (email, CRM, Slack, …) lives entirely in n8n.

### Build and deploy

- The site must be built with **`npm run build`**, not `npm run generate`. `generate` outputs
  static files only and would drop the `/api/contact` function.
- Cloudflare Pages settings: build command `npm run build`, output folder `dist`, plus the
  environment variables above.
- The Pages project is **effer-ventures** on the Marketing@fundingbay.co.uk Cloudflare account,
  connected to `developer-fbay/Effer-Ventures-Vue`. Every push to `main` deploys to
  https://effer-ventures.pages.dev; other branches get their own preview URL.
- Still to set up in Cloudflare: a **rate-limiting rule on `/api/contact`** (from the Notion task).

### Testing

- **Validation**:

  ```bash
  curl -X POST http://localhost:3000/api/contact \
    -H 'Content-Type: application/json' -d '{"email":"nope"}'
  ```

  This should return 400 with a "Please add …" message.
- **Honeypot**: send any payload with `"ev_hp":"x"`. It should return `{ ok: true }`, send
  nothing and log `contact: honeypot filled, message dropped`.
- **Real send**: submit the form on a dev or preview build and check the n8n executions list.

---

## 6. Accessibility notes

- Real `<button>`, `<a href>`, `<input>` and `<label>` elements throughout.
- Icon-only buttons have an `aria-label`.
- The mobile menu sets `aria-expanded` and `aria-controls`.
- The popups are `role="dialog"` / `role="alertdialog"` with `aria-modal`. Focus moves into them
  and back out again.
- Visible focus outlines (pink) everywhere. The group cards open their details on keyboard focus,
  not only on hover.
- Decorative SVGs and images use `aria-hidden` or empty `alt`. Logos and team photos have real
  `alt` text.
- Reduced motion turns off all of the animation (section 4).

---

## 7. Common changes

| Change | Where |
|---|---|
| Team member: name, title, photo, crop, LinkedIn | the `team` list in `app.vue` (computed), photo in `public/images/team/` |
| Group company card | the `.cards` blocks in `#portfolio`, logo in `public/images/logos/` |
| Footer logos | `.foot-logos` in the footer, white logos in `public/images/logos/*-white.*` |
| Copy | directly in the `app.vue` markup |
| Colours, spacing, breakpoints | `assets/css/site.css` and inline styles |
| Page title, description, font | `nuxt.config.ts` |
| Where form messages go | the n8n workflow (not this repo) |

---

## 8. Known quirks

- **Long template**: `app.vue` keeps the canvas's inline styles, so a style change may need
  editing both inline and in `site.css`. When a stylesheet rule must beat an inline style it uses
  `!important`, so check for that if a change seems to have no effect.
- **Unused code**: section snapping (`setupSectionSnap`) is written but off. The "full cloud"
  variant in Join us is hidden by one CSS rule.
- **Restart the dev server after rebuilding**: running `npm run build`/`generate` while
  `npm run dev` is running can break the dev server (an `#app-manifest` error). Restart
  `npm run dev` afterwards.

---

## 9. Still to do

- Split `app.vue` into section components, and move the team and company data into data files.
- Self-host the Circular font (WOFF2) in place of Figtree.
- Team: a sharper photo for Suvaal (the current one is very low resolution) and Alex's real
  LinkedIn link.
- Contact: the Cloudflare rate-limiting rule, and Cloudflare Turnstile if spam gets through.
- SEO: Open Graph image, Organization schema, sitemap, robots.txt, the WordPress 301 redirects.
- Launch: add the custom domain to the effer-ventures Pages project and switch DNS, only when
  Codi says go.
