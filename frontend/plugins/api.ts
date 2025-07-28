export default defineNuxtPlugin(() => {
  const api = $fetch.create({
    baseURL: 'http://localhost:3001/api',
    // --- ÖNEMLİ DEĞİŞİKLİK ---
    // Tarayıcının, cookie gibi kimlik bilgilerini origin'ler arası isteklere
    // dahil etmesini sağlar.
    credentials: 'include',

    // Artık onRequest'e ihtiyacımız yok, çünkü cookie otomatik gönderiliyor.
    // onRequest({ options }) { ... },
    
    onResponseError({ response }) {
      if (response.status === 401) {
        console.error("Yetkisiz istek, oturum kapatılıyor.");
        // const authStore = useAuthStore();
        // authStore.logout();
        navigateTo('/login');
      }
    }
  });

  return {
    provide: {
      api
    }
  };
});