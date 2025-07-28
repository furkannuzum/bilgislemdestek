import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // --- STATE ---
  const user = ref(null) // Token artık cookie'de, sadece user tutulur

  // --- GETTERS ---
  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role || null)
  const userFullName = computed(() => user.value?.fullName || null)
  const userId = computed(() => user.value?._id || null)

  // --- ACTIONS ---

  // Giriş işlemi
  async function login(email, password) {
    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password },
        credentials: 'include', // Cookie otomatik gönderilsin
      })

      if (response.success && response.user) {
        user.value = response.user
        return true
      }

      return false
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  // Çıkış işlemi
  async function logout() {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.warn('Logout isteği başarısız oldu.')
    } finally {
      user.value = null
      navigateTo('/login')
    }
  }

  // Uygulama açıldığında veya sayfa yenilendiğinde kullanıcıyı cookie'den doğrula
  async function fetchUser() {
    if (user.value) return // Zaten varsa tekrar çekme

    try {
      const response = await $fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include', // Cookie gönderilsin
      })

      if (response.success && response.user) {
        user.value = response.user
      } else {
        user.value = null
      }
    } catch (error) {
      console.error('fetchUser error:', error)
      user.value = null
    }
  }

  // Store'dan dışa aktarılacaklar
  return {
    user,
    isAuthenticated,
    userRole,
    userFullName,
    userId,
    login,
    logout,
    fetchUser,
  }
})
// --- ÖNEMLİ NOT ---
// Bu store, Nuxt'un otomatik olarak yüklediği bir Pinia store'dur  