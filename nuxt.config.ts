import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/fonts', '@nuxt/icon'],
  css: ['~/assets/css/main.css', 'lenis/dist/lenis.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },
  // The theme names its families through custom properties, which the font scanner can't follow.
  fonts: {
    families: [
      {
        name: 'Schibsted Grotesk',
        provider: 'google',
        global: true,
        weights: [400, 500, 600, 700, 800],
      },
      {
        name: 'JetBrains Mono',
        provider: 'google',
        global: true,
        weights: [400, 500],
      },
    ],
  },
  icon: {
    clientBundle: { scan: true },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
