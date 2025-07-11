export default defineNuxtConfig({
  devtools: { enabled: true },

  // 1. Hem TailwindCSS hem de NuxtUI modüllerini ekliyoruz.
  // Sıralama önemlidir, genellikle Tailwind önce gelir.
  modules: ["@nuxtjs/tailwindcss", "@nuxt/ui",
            '@nuxt/ui',
            '@pinia/nuxt', // Bu satırı ekle
  ],

  // 2. Tailwind modülüne, konfigürasyonunu diğer modüllere "açması" (expose) için
  // özel bir ayar ekliyoruz. Hatanın çözümü bu satırdır.
  tailwindcss: {
    exposeConfig: true,
  },

  // 3. Ana CSS dosyamızı belirtiyoruz. NuxtUI kendi stillerini
  // otomatik olarak yönetir, bu yüzden sadece tailwind.css yeterlidir.
  // Bu satırı daha önce sildiğimiz için şimdi geri ekleyebiliriz.
  // css: [
  //   '~/assets/css/tailwind.css',
  // ],
  // NOT: NuxtUI ve TailwindCSS modülleri genellikle bu satıra bile gerek duymaz.
  // En temiz haliyle, bu satırı da yorumda bırakabiliriz. Eğer stiller yüklenmezse
  // yorumu kaldırıp tekrar deneriz. Şimdilik yorumda kalsın.
  // --- YENİ EKLENECEK BÖLÜM: PROXY TANIMI ---
  routeRules: {
    // '/api/**' ile başlayan tüm istekleri proxy'le
    "/api/**": {
      // Backend sunucumuzun çalıştığı adrese yönlendir
      proxy: "http://localhost:3001/api/**",
    },
  },
  nitro: {
    compatibilityDate: "2025-07-11",
  },
});
