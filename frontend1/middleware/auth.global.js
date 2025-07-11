import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  // Pinia store'u çağır
  const authStore = useAuthStore()

  // Gidilmek istenen sayfanın herkese açık olup olmadığını kontrol et
  const publicPages = ['/', '/login', '/register', '/forgot-password']
  const authRequired = !publicPages.includes(to.path)

  // Eğer gidilmek istenen sayfa korumalıysa VE kullanıcı giriş yapmamışsa
  if (authRequired && !authStore.isAuthenticated) {
    // Kullanıcıyı login sayfasına yönlendir
    return navigateTo('/login')
  }

  // Eğer kullanıcı giriş yapmışsa VE login/register gibi sayfalara gitmeye çalışıyorsa
  if (!authRequired && authStore.isAuthenticated) {
    // Onu dashboard'a yönlendir
    return navigateTo('/dashboard')
  }
})