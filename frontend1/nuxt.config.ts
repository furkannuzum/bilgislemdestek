export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/icon',
    '@nuxtjs/tailwindcss',
    '@nuxt/ui',
    '@pinia/nuxt'
  ],

  tailwindcss: {
    exposeConfig: true
  },
  

  // --- PROXY KURALI GÜNCELLEMESİ ---
  // Tek bir genel kural yerine, backend'e giden her bir yol için
  // ayrı ayrı ve daha spesifik proxy kuralları tanımlıyoruz.
  routeRules: {
    '/api/auth/**': { proxy: 'http://localhost:3001/api/auth/**' },
    '/api/departments/**': { proxy: 'http://localhost:3001/api/departments/**' },
    '/api/categories/**': { proxy: 'http://localhost:3001/api/categories/**' },
    '/api/tickets/**': { proxy: 'http://localhost:3001/api/tickets/**' },
    '/api/devicerequests/**': { proxy: 'http://localhost:3001/api/devicerequests/**' },
    '/api/analytics/**': { proxy: 'http://localhost:3001/api/analytics/**' },
  },
  // --- GÜNCELLEME SONU ---

  nitro: {
    compatibilityDate: '2025-07-11'
  }
})