import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
  // state ve getters bölümlerinde herhangi bir değişiklik yok.
  state: () => ({
    token: null,
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => (state.user ? state.user.role : null),
    userId: (state) => (state.user ? state.user.id : null),
    // Kullanıcının adını da kolayca almak için bir getter ekleyelim.
    userFullName: (state) => (state.user ? state.user.fullName : null),
  },

  // actions bölümü, özellikle logout fonksiyonu güncellendi.
  actions: {
    async login(email, password) {
      try {
        // Bu fonksiyon doğru, değişiklik yok.
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        })
        if (response.success && response.token) {
          this.setToken(response.token)
          return true
        }
        return false
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    },

    // --- LOGOUT FONKSİYONU GÜNCELLEMESİ ---
    logout() {
      this.token = null
      this.user = null
      
      // Tarayıcı hafızasını temizle
      if (process.client) {
        localStorage.removeItem('authToken')
      }

      // Yönlendirme için `navigateTo` kullanıyoruz.
      // Bu, store gibi .vue dosyası olmayan yerlerde yönlendirme
      // yapmanın en doğru ve güvenli yoludur.
      // 'external: true' parametresi tam bir sayfa yenilemesi yapar,
      // bu da tüm state'in temizlendiğinden emin olur.
      return navigateTo('/login', { external: true })
    },
    // --- GÜNCELLEME SONU ---

    setToken(newToken) {
      // Bu fonksiyon doğru, değişiklik yok.
      this.token = newToken
      if (newToken) {
        try {
          // jwt-decode, token geçersizse hata fırlatabilir.
          // Bunu bir try-catch bloğuna almak daha güvenlidir.
          this.user = jwtDecode(newToken)
          if (process.client) {
            localStorage.setItem('authToken', newToken)
          }
        } catch (error) {
          console.error("Invalid token:", error)
          this.logout() // Eğer token geçersizse, çıkış yaptır.
        }
      } else {
        this.user = null
        if (process.client) {
          localStorage.removeItem('authToken')
        }
      }
    },

    initializeAuth() {
      // Bu fonksiyon doğru, değişiklik yok.
      if (process.client) {
        const token = localStorage.getItem('authToken')
        if (token) {
          this.setToken(token)
        }
      }
    }
  },
})