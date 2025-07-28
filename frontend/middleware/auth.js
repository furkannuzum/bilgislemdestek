import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async (to, from) => {
  // --- 1. Sadece client tarafında çalıştır ---
  if (process.server) return;

  // --- 2. Store'u çağır ---
  const authStore = useAuthStore();

  // --- 3. Kullanıcı bilgisi yoksa, backend'den çekmeye çalış ---
  if (!authStore.user && process.client) {
    await authStore.fetchUser(); // initializeAuth yerine artık fetchUser kullanıyoruz
  }

  // --- 4. Giriş yapılmadan erişilebilecek sayfalar ---
  const publicPages = ["/", "/login", "/forgot-password"];
  const authRequired = !publicPages.includes(to.path);

  // --- 5. Giriş yapılmamışsa ve korumalı sayfaya gidiliyorsa yönlendir ---
  if (authRequired && !authStore.isAuthenticated) {
    return navigateTo("/login");
  }

  // --- 6. Giriş yapılmışsa ve login gibi açık sayfaya gidiliyorsa yönlendir ---
  if (!authRequired && authStore.isAuthenticated && to.path !== "/") {
    return navigateTo("/dashboard");
  }

  // Her şey uygunsa devam etsin
});
