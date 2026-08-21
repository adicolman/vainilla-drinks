import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/supabase',
    '@nuxt/icon',
    '@nuxt/fonts',
  ],

  components: {
    pathPrefix: false,
  },

  supabase: {
    redirect: false,
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  icon: {
    serverBundle: {
      collections: ['lucide'],
    },
  },

  fonts: {
    families: [
      {
        name: 'Inter',
        provider: 'google',
        weights: ['300', '400', '500', '600', '700'],
        global: true,
      },
    ],
  },
})
