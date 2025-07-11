<!-- frontend1/pages/register.vue (YENİ TASARIM) -->
<template>
  <div class="w-full max-w-sm mx-auto">
    
    <!-- Logo Alanı -->
    <div class="flex justify-center mb-6">
      <!-- Login sayfasındakiyle aynı logoyu kullanıyoruz -->
      <img src="/logo.png" alt="Mezitli Belediyesi Logosu" class="w-24 h-24 object-cover">
    </div>

    <!-- Başlık Alanı -->
    <div class="text-center mb-10">
      <h2 class="text-3xl font-bold text-gray-800">
        Yeni Hesap Oluştur
      </h2>
      <p class="text-gray-500 mt-1">
        Bilgilerinizi girerek platforma dahil olun.
      </p>
    </div>

    <!-- Hata Mesajı -->
    <UAlert
      v-if="errorMessage"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      variant="soft"
      title="Kayıt Başarısız"
      :description="errorMessage"
      class="mb-6"
    />

    <!-- Form Alanı -->
    <UForm :state="state" :schema="schema" @submit="handleRegister" class="space-y-6">

      <!-- Ad Soyad Alanı -->
      <div>
        <label for="fullName" class="form-label">Ad Soyad</label>
        <div class="relative">
          <input v-model="state.fullName" id="fullName" type="text" placeholder="Adınız Soyadınız" required class="form-input" />
          <div class="input-icon-wrapper">
            <UIcon name="i-heroicons-user" class="input-icon" />
          </div>
        </div>
      </div>
      
      <!-- E-posta Alanı -->
      <div>
        <label for="email" class="form-label">E-posta</label>
        <div class="relative">
          <input v-model="state.email" id="email" type="email" placeholder="ornek@posta.com" required class="form-input" />
          <div class="input-icon-wrapper">
            <UIcon name="i-heroicons-envelope" class="input-icon" />
          </div>
        </div>
      </div>

      <!-- Şifre Alanı -->
      <div>
        <label for="password" class="form-label">Şifre</label>
        <div class="relative">
          <input v-model="state.password" id="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" required class="form-input" />
           <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <UIcon :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>
      </div>

      <!-- Birim Seçimi Alanı -->
      <div>
        <label for="department" class="form-label">Birim</label>
        <!-- USelectMenu'nun görünümünü de inputlara benzetiyoruz -->
        <USelectMenu
          v-model="state.departmentId"
          :options="departments"
          id="department"
          by="_id"
          option-attribute="name"
          placeholder="Birim seçiniz..."
          searchable="Aramak için yazın..."
          size="xl"
          class="form-select"
        >
          <!-- Slotlar aynı kalıyor -->
          <template #label>
            <span v-if="state.departmentId" class="truncate">{{ state.departmentId.name }}</span>
            <span v-else>Birim seçiniz...</span>
          </template>
        </USelectMenu>
      </div>

      <!-- Kayıt Ol Butonu -->
      <button 
        type="submit"
        :disabled="isLoading"
        class="w-full text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-full text-base px-5 py-3 text-center transition-colors disabled:opacity-50"
      >
        <span v-if="!isLoading">Kayıt Ol</span>
        <span v-else>Kayıt Olunuyor...</span>
      </button>

    </UForm>

    <p class="mt-8 text-center text-sm text-gray-500">
      Zaten bir hesabın var mı?
      <NuxtLink to="/login" class="font-semibold text-blue-600 hover:underline">
        Giriş Yap
      </NuxtLink>
    </p>
  </div>
</template>

<script setup>
// Script bölümü neredeyse aynı, sadece showPassword ref'i eklendi.
import { ref, reactive } from 'vue'
import { z } from 'zod'

definePageMeta({ layout: 'auth' })

const showPassword = ref(false) // Şifre göster/gizle için
const schema = z.object({
  fullName: z.string({ required_error: 'Ad Soyad zorunludur.' }).min(3, 'Ad Soyad en az 3 karakter olmalıdır.'),
  email: z.string({ required_error: 'E-posta zorunludur.' }).email('Lütfen geçerli bir e-posta adresi girin.'),
  password: z.string({ required_error: 'Şifre zorunludur.' }).min(6, 'Şifre en az 6 karakter olmalıdır.'),
  departmentId: z.object({_id: z.string(),name: z.string()}, { required_error: "Birim seçimi zorunludur.", invalid_type_error: "Birim seçimi zorunludur." })
})
const state = reactive({ fullName: undefined, email: undefined, password: undefined, departmentId: undefined })
const departments = ref([])
const { data, error } = await useFetch('/api/departments')

if (data.value && data.value.success) {
  departments.value = data.value.data
} else {
  console.error('Departmanlar yüklenirken hata oluştu:', error.value)
}

const isLoading = ref(false)
const errorMessage = ref(null)
const router = useRouter()

async function handleRegister(event) {
  const validatedData = event.data
  isLoading.value = true
  errorMessage.value = null
  const body = {
    fullName: validatedData.fullName,
    email: validatedData.email,
    password: validatedData.password,
    departmentId: validatedData.departmentId._id,
    role: 'EndUser'
  }
  try {
    const response = await $fetch('/api/auth/register', { method: 'POST', body: body })
    if (response.success) {
      alert('Kayıt başarıyla tamamlandı! Lütfen giriş yapın.')
      router.push('/login')
    }
  } catch (err) {
    errorMessage.value = err.data?.message || 'Kayıt sırasında bir hata oluştu.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/*
  Login sayfasındaki .form-input stilini buraya da taşıdık ve
  diğer ortak stilleri de ekledik. Bu stilleri main.css'e de taşıyabiliriz.
*/
.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
.form-input {
  @apply block w-full rounded-full border-0 py-3 pl-11 pr-4 text-gray-900 bg-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6;
}
.input-icon-wrapper {
  @apply absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none;
}
.input-icon {
  @apply w-5 h-5 text-gray-400;
}
.form-select button {
  @apply bg-gray-100 border-0 rounded-full !important;
}
</style>