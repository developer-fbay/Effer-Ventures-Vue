// Effer Ventures one-page site (version 2). Static (prerendered) page hosted on Cloudflare Pages.

// Link previews (Slack, LinkedIn, WhatsApp...) need absolute URLs. Switch to https://effer-ventures.com
// once the domain points at Cloudflare Pages.
const SITE_URL = 'https://effer-ventures.pages.dev'
const DESCRIPTION = "We build great businesses. We don't write cheques and walk away: we give every management team the infrastructure to scale."

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/site.css'],
  // Server-only settings for the contact form, filled from NUXT_CONTACT_WEBHOOK_* environment variables.
  runtimeConfig: {
    contactWebhookUrl: '',
    contactWebhookAuthHeader: '',
    contactWebhookAuthValue: '',
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en-GB' },
      title: 'Effer Ventures',
      meta: [
        { name: 'description', content: DESCRIPTION },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // share card: public/og.png, 1200 x 630
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Effer Ventures' },
        { property: 'og:title', content: 'Effer Ventures' },
        { property: 'og:description', content: DESCRIPTION },
        { property: 'og:url', content: SITE_URL + '/' },
        { property: 'og:image', content: SITE_URL + '/og.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Effer Ventures: We build great businesses.' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Effer Ventures' },
        { name: 'twitter:description', content: DESCRIPTION },
        { name: 'twitter:image', content: SITE_URL + '/og.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/images/triangle.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Figtree stands in for Circular until the licensed font files are self-hosted.
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;800;900&display=swap' },
      ],
    },
  },
  nitro: {
    preset: 'cloudflare_pages',
    prerender: { routes: ['/'] },
  },
})
