import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware((to, from) => {
  // --- Adım 1: Sunucu Tarafında Çalışmasını Engelleme ---
  // Bu middleware'in sadece kullanıcının tarayıcısında çalışmasını sağlıyoruz.
  // Bu, SSR sırasında localStorage'a erişim gibi hataları önler.
  if (process.server) {
    return;
  }

  // --- Adım 2: Pinia Store'u Çağırma ---
  const authStore = useAuthStore();

  // --- Adım 3: Store'u Başlatma Kontrolü (En Önemli Kısım) ---
  // Eğer token bilgisi henüz store'a yüklenmemişse (örn: sayfa yenilendi),
  // localStorage'dan token'ı okuyup store'u güncelleyen fonksiyonu çalıştır.
  if (!authStore.user && process.client) {
    authStore.initializeAuth();
  }

  // --- Adım 4: Rota Kurallarını Tanımlama ---
  // Hangi sayfaların giriş yapmadan görülebileceğini tanımlıyoruz.
  const publicPages = ["/", "/login", "/forgot-password"];

  // Gidilmek istenen sayfa, publicPages listesinde DEĞİLSE, yetki gerektirir.
  const authRequired = !publicPages.includes(to.path);

  // --- Adım 5: Yönlendirme Mantığını Uygulama ---

  // Kural 1: Yetki gerektiren bir sayfaya, giriş yapmamış bir kullanıcı erişmeye çalışırsa...
  if (authRequired && !authStore.isAuthenticated) {
    // Onu login sayfasına yönlendir.
    return navigateTo("/login");
  }

  // Kural 2: Giriş yapmış bir kullanıcı, herkese açık bir sayfaya (login, register) gitmeye çalışırsa...
  // (Ana sayfaya '/' gitmesine izin veriyoruz)
  if (!authRequired && authStore.isAuthenticated && to.path !== "/") {
    // Onu doğrudan dashboard'a yönlendir, tekrar login olmasına gerek yok.
    return navigateTo("/dashboard");
  }

  // Eğer yukarıdaki kurallardan hiçbiri tetiklenmezse, kullanıcının gitmek istediği yere gitmesine izin ver.
});
