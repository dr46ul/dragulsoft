import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['@nuxt/fonts', '@nuxt/icon', '@nuxt/test-utils/module'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },
  // Nuxt types only test/nuxt by default; unit and e2e tests get the same checking as app code.
  typescript: {
    tsConfig: {
      include: ['../test/unit/**/*', '../test/e2e/**/*'],
    },
  },
  runtimeConfig: {
    public: {
      adamBaseUrl: 'https://adam.dragulsoft.dev',
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
