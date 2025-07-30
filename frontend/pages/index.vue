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

    <!-- FORM GÜNCELLEMESİ: Standart input'lar UInput ile değiştirildi -->
    <form @submit.prevent="handleLogin" class="space-y-6">
      
      <!-- E-posta Alanı Grubu -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          E-posta
        </label>
        <!-- UInput bileşeni kullanıldı -->
        <UInput 
          v-model="email" 
          id="email"
          type="email" 
          placeholder="ornek@posta.com" 
          required
          icon="i-heroicons-envelope"
          size="lg"
          :ui="{ rounded: 'rounded-full' }"
        />
      </div>

      <!-- Şifre Alanı Grubu -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
          Şifre
        </label>
        <!-- UInput bileşeni ve şifre gösterme/gizleme için #trailing slot'u kullanıldı -->
        <UInput 
          v-model="password"
          id="password" 
          :type="showPassword ? 'text' : 'password'"
          placeholder="••••••••"
          required
          size="lg"
          :ui="{ rounded: 'rounded-full', icon: { trailing: { pointer: '' } } }"
        >
          <template #trailing>
            <button type="button" @click="showPassword = !showPassword" class="flex items-center">
              <UIcon :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </template>
        </UInput>
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'auth' })

const email = ref('') // Örnek veri ile dolduruldu
const password = ref('')     // Örnek veri ile dolduruldu
const showPassword = ref(false)
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

<!-- Bu blok artık gereksiz olduğu için kaldırıldı -->
<!-- <style scoped>
.form-input { ... }
</style> -->