import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: process.client ? localStorage.getItem('authToken') : null,
    user: process.client && localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user'))
      : null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || null,
    userId: (state) => state.user?.id || null,
    userFullName: (state) => state.user?.fullName || null,
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
        localStorage.removeItem('user')
      }

      return navigateTo('/login', { external: true })
    },

    setToken(newToken) {
      this.token = newToken

      if (newToken) {
        try {
          const decodedUser = jwtDecode(newToken)
          this.user = decodedUser

          if (process.client) {
            localStorage.setItem('authToken', newToken)
            localStorage.setItem('user', JSON.stringify(decodedUser))
          }
        } catch (error) {
          console.error("Invalid token:", error)
          this.logout()
        }
      } else {
        this.user = null
        if (process.client) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
        }
      }
    },

    initializeAuth() {
      if (process.client) {
        const token = localStorage.getItem('authToken')
        const user = localStorage.getItem('user')

        if (token) {
          this.token = token
        }

        if (user) {
          this.user = JSON.parse(user)
        } else if (token) {
          // Eğer user localStorage'da yoksa token'ı decode et
          try {
            const decodedUser = jwtDecode(token)
            this.user = decodedUser
            localStorage.setItem('user', JSON.stringify(decodedUser))
          } catch (error) {
            console.error('Token decode error:', error)
            this.logout()
          }
        }
      }
    }
  }
})
