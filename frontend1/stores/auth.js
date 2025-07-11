import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role,
    userId: (state) => state.user?.id,
  },
  actions: {
    async login(email, password) {
      try {
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
    logout() {
      this.token = null
      this.user = null
      if (process.client) {
        localStorage.removeItem('authToken')
      }
      const router = useRouter()
      router.push('/login')
    },
    setToken(newToken) {
      this.token = newToken
      if (newToken) {
        this.user = jwtDecode(newToken)
        if (process.client) {
          localStorage.setItem('authToken', newToken)
        }
      } else {
        this.user = null
        if (process.client) {
          localStorage.removeItem('authToken')
        }
      }
    },
    initializeAuth() {
      if (process.client) {
        const token = localStorage.getItem('authToken')
        if (token) {
          this.setToken(token)
        }
      }
    }
  },
})