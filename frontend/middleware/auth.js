import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();

  // 1. Kullanıcı bilgisi yoksa, her ortamda çekmeye çalış
  if (!authStore.user) {
    await authStore.fetchUser();
  }

  // 2. Giriş yapılmadan erişilebilecek sayfalar
  const publicPages = ["/", "/login", "/forgot-password"];
  const authRequired = !publicPages.includes(to.path);

  // 3. Korumalı sayfaya giriş yapılmamışsa login'e at
  if (authRequired && !authStore.isAuthenticated) {
    return navigateTo("/login");
  }

  // 4. Giriş yapılmışsa ve login gibi açık sayfaya gidiliyorsa yönlendir
  if (!authRequired && authStore.isAuthenticated && to.path !== "/") {
    return navigateTo("/dashboard");
  }
});
