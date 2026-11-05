// Effer Ventures one-page site (version 2). Static (prerendered) page hosted on Cloudflare Pages.
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/site.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'en-GB' },
      title: 'Effer Ventures',
      meta: [
        { name: 'description', content: "We build great businesses. We don't write cheques and walk away: we give every management team the infrastructure to scale." },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
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
