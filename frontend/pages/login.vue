<!-- frontend1/pages/login.vue (YENİ TASARIM) -->
<template>
  <div class="w-full max-w-sm mx-auto">
    
    <!-- Logo ve Başlık Alanları -->
    <div class="flex justify-center mb-6">
      <img src="/logo.png" alt="Mezitli Belediyesi Logosu" class="w-24 h-24 object-cover">
    </div>
    <div class="text-center mb-10">
      <h2 class="text-3xl font-bold text-gray-800">Hoş Geldiniz</h2>
      <p class="text-gray-500 mt-1">Lütfen giriş yapmak için bilgilerinizi girin.</p>
    </div>

    <!-- Hata Mesajı -->
    <UAlert
      v-if="errorMessage"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      variant="soft"
      title="Giriş Başarısız"
      :description="errorMessage"
      class="mb-6"
    />

    <!-- FORM GÜNCELLEMESİ -->
    <form @submit.prevent="handleLogin" class="space-y-6">
      
      <!-- E-posta Alanı Grubu -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          E-posta
        </label>
        <div class="relative">
          <input 
            v-model="email" 
            id="email"
            type="email" 
            placeholder="ornek@posta.com" 
            required
            class="form-input" 
          />
          <!-- İkonu inputun içine yerleştiriyoruz -->
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <UIcon name="i-heroicons-envelope" class="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      <!-- Şifre Alanı Grubu -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
          Şifre
        </label>
         <div class="relative">
          <input 
            v-model="password"
            id="password" 
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            required
            class="form-input" 
          />
          <!-- Şifreyi Göster/Gizle Butonu -->
          <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <UIcon :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>
      </div>
      
      <!-- Giriş Yap Butonu -->
      <button 
        type="submit"
        :disabled="isLoading"
        class="w-full text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-full text-base px-5 py-3 text-center transition-colors disabled:opacity-50"
      >
        <span v-if="!isLoading">Giriş Yap</span>
        <span v-else>Giriş Yapılıyor...</span>
      </button>

    </form>
    
    <!-- Linkler -->
    <div class="text-center mt-6">
      <NuxtLink to="/forgot-password" class="text-sm font-medium text-blue-600 hover:underline">
        Şifremi Unuttum
      </NuxtLink>
    </div>
    <!-- <p class="mt-8 text-center text-sm text-gray-500">
      Hesabınız yok mu?
      <NuxtLink to="/register" class="font-semibold text-blue-600 hover:underline">
        Kayıt Olun
      </NuxtLink>
    </p> -->

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'auth' })

const email = ref('')
const password = ref('')
const showPassword = ref(false) // Şifreyi göster/gizle durumu için
const isLoading = ref(false)
const errorMessage = ref(null)
const authStore = useAuthStore()
const router = useRouter()

async function handleLogin() {
  isLoading.value = true
  errorMessage.value = null
  try {
    const success = await authStore.login(email.value, password.value)
    if (success) {
      router.push('/dashboard')
    }
  } catch (error) {
    errorMessage.value = error.data?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* 
  Kendi özel form input stilimizi oluşturuyoruz.
  Bu stil, referans tasarımdaki gibi oval ve ikonlu olacak.
*/
.form-input {
  @apply block w-full rounded-full border-0 py-3 pl-11 pr-4 text-gray-900 bg-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6;
}
</style>