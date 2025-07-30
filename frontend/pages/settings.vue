<template>
  <div class="w-full max-w-3xl mx-auto px-2 py-8">
    <!-- Başlık ve Açıklama -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Ayarlar</h1>
      <p class="mt-1 text-gray-500">
        Profil bilgilerinizi ve hesap ayarlarınızı buradan yönetebilirsiniz.
      </p>
    </div>

    <!-- Sekmeli Yapı -->
    <div class="mt-8">
      <div class="flex border-b border-gray-200 mb-6">
        <button
          v-for="item in tabItems"
          :key="item.key"
          @click="selectedTab = item.key"
          class="flex items-center gap-1 px-4 py-2 -mb-px border-b-2 transition-all duration-200
            text-sm font-semibold focus:outline-none"
          :class="selectedTab === item.key
            ? 'border-blue-600 text-blue-600 bg-white'
            : 'border-transparent text-gray-500 hover:text-blue-600 bg-transparent'"
        >
          <UIcon :name="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </button>
      </div>

      <!-- PROFİL BİLGİLERİ -->
      <UCard v-if="selectedTab === 'profile'" class="rounded-2xl border border-gray-100 bg-white shadow p-0">
        <template #header>
          <h3 class="text-lg font-semibold">Profil Bilgileri</h3>
        </template>
        <UForm :state="profileState" :schema="profileSchema" @submit="handleUpdateProfile" class="space-y-5 max-w-lg">
          <UFormGroup label="Ad Soyad" name="fullName" required>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <UIcon name="i-heroicons-user" class="w-5 h-5 text-gray-400" />
              </span>
              <UInput
                v-model="profileState.fullName"
                size="lg"
                class="pl-12 pr-4 py-3 rounded-full border-0 bg-gray-100 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 w-full"
                :class="{ 'border-red-500': $form?.errors.fullName }"
                placeholder="Ad Soyad"
              />
            </div>
          </UFormGroup>
          <UFormGroup label="E-posta" name="email" required>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <UIcon name="i-heroicons-envelope" class="w-5 h-5 text-gray-400" />
              </span>
              <UInput
                v-model="profileState.email"
                type="email"
                size="lg"
                class="pl-12 pr-4 py-3 rounded-full border-0 bg-gray-100 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 w-full"
                :class="{ 'border-red-500': $form?.errors.email }"
                placeholder="E-posta"
              />
            </div>
          </UFormGroup>
          <UButton
            type="submit"
            :loading="isProfileLoading"
            size="lg"
            class="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-5 py-3 text-center transition-colors disabled:opacity-50 shadow"
          >
            Profili Güncelle
          </UButton>
        </UForm>
      </UCard>

      <!-- ŞİFRE DEĞİŞTİR -->
      <UCard v-if="selectedTab === 'password'" class="rounded-2xl border border-gray-100 bg-white shadow p-0">
        <template #header>
          <h3 class="text-lg font-semibold">Şifre Değiştir</h3>
        </template>
        <UForm :state="passwordState" :schema="passwordSchema" @submit="handleUpdatePassword" class="space-y-5 max-w-lg">
          <UFormGroup label="Mevcut Şifre" name="currentPassword" required>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <UIcon name="i-heroicons-lock-closed" class="w-5 h-5 text-gray-400" />
              </span>
              <UInput
                v-model="passwordState.currentPassword"
                type="password"
                size="lg"
                class="pl-12 pr-4 py-3 rounded-full border-0 bg-gray-100 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 w-full"
                placeholder="Mevcut Şifre"
              />
            </div>
          </UFormGroup>
          <UFormGroup label="Yeni Şifre" name="newPassword" required>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <UIcon name="i-heroicons-key" class="w-5 h-5 text-gray-400" />
              </span>
              <UInput
                v-model="passwordState.newPassword"
                type="password"
                size="lg"
                class="pl-12 pr-4 py-3 rounded-full border-0 bg-gray-100 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 w-full"
                placeholder="Yeni Şifre"
              />
            </div>
          </UFormGroup>
          <UFormGroup label="Yeni Şifre (Tekrar)" name="confirmPassword" required>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <UIcon name="i-heroicons-key" class="w-5 h-5 text-gray-400" />
              </span>
              <UInput
                v-model="passwordState.confirmPassword"
                type="password"
                size="lg"
                class="pl-12 pr-4 py-3 rounded-full border-0 bg-gray-100 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 w-full"
                placeholder="Yeni Şifre (Tekrar)"
              />
            </div>
          </UFormGroup>
          <UButton
            type="submit"
            :loading="isPasswordLoading"
            size="lg"
            class="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-5 py-3 text-center transition-colors disabled:opacity-50 shadow"
          >
            Şifreyi Güncelle
          </UButton>
        </UForm>
      </UCard>

      <!-- BİLDİRİMLER -->
      <UCard v-if="selectedTab === 'notifications'" class="rounded-2xl border border-gray-100 bg-white shadow p-0">
        <template #header>
          <h3 class="text-lg font-semibold">Bildirim Ayarları</h3>
        </template>
        <div class="space-y-5 max-w-lg">
          <!-- İstenen Değişiklik 1: v-model eklendi -->
          <div class="flex items-center justify-between p-4 border rounded-xl">
            <div>
              <p class="font-medium">Yeni Talep Bildirimleri</p>
              <p class="text-sm text-gray-500">Bir talep oluşturulduğunda e-posta al.</p>
            </div>
            <UToggle v-model="notificationState.newTicket" size="lg" />
          </div>
          <!-- İstenen Değişiklik 2: v-model eklendi -->
          <div class="flex items-center justify-between p-4 border rounded-xl">
            <div>
              <p class="font-medium">Durum Güncelleme Bildirimleri</p>
              <p class="text-sm text-gray-500">Talebinizin durumu değiştiğinde e-posta al.</p>
            </div>
            <UToggle v-model="notificationState.statusUpdate" size="lg" />
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { z } from 'zod'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const authStore = useAuthStore()
const toast = useToast()

// Sekme
const tabItems = [
  { key: 'profile', label: 'Profil', icon: 'i-heroicons-user-circle' },
  { key: 'password', label: 'Şifre', icon: 'i-heroicons-key' },
  { key: 'notifications', label: 'Bildirimler', icon: 'i-heroicons-bell' }
]
const selectedTab = ref('profile')

// Profil Formu
const profileSchema = z.object({
  fullName: z.string().min(3, 'Ad Soyad en az 3 karakter olmalıdır.'),
  email: z.string().email('Geçersiz e-posta adresi.')
})
const profileState = reactive({
  fullName: authStore.userFullName || '',
  email: authStore.user?.email || ''
})
const isProfileLoading = ref(false)

async function handleUpdateProfile(event) {
  isProfileLoading.value = true
  try {
    await $fetch('/api/auth/updateprofile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: event.data
    })
    authStore.user.fullName = event.data.fullName
    authStore.user.email = event.data.email
    toast.add({ title: 'Başarılı!', description: 'Profiliniz güncellendi.', color: 'green' })
  } catch (err) {
    toast.add({ title: 'Hata!', description: err.data?.message || 'Profil güncellenemedi.', color: 'red' })
  } finally {
    isProfileLoading.value = false
  }
}

// Şifre Formu
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gerekli.'),
  newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalı.'),
  confirmPassword: z.string().min(6, 'Onay şifresi en az 6 karakter olmalı.')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Yeni şifreler eşleşmiyor.",
  path: ["confirmPassword"]
})
const passwordState = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const isPasswordLoading = ref(false)

async function handleUpdatePassword(event) {
  isPasswordLoading.value = true
  try {
    await $fetch('/api/auth/updatepassword', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: {
        currentPassword: event.data.currentPassword,
        newPassword: event.data.newPassword
      }
    })
    toast.add({ title: 'Başarılı!', description: 'Şifreniz güncellendi.', color: 'green' })
    Object.assign(passwordState, { currentPassword: '', newPassword: '', confirmPassword: '' })
  } catch (err) {
    toast.add({ title: 'Hata!', description: err.data?.message || 'Şifre güncellenemedi.', color: 'red' })
  } finally {
    isPasswordLoading.value = false
  }
}

// --- İSTENEN DEĞİŞİKLİK 3: Bildirimler için state eklendi ---
const notificationState = reactive({
  newTicket: false,
  statusUpdate: false
});

// Burada, normalde bu ayarları backend'den çeker ve değişiklik olduğunda kaydedersiniz.
// Örn: onMounted(() => { notificationState.newTicket = authStore.user.settings.newTicketNotification ... })
// Örn: watch(notificationState, (newValue) => { saveNotificationSettings(newValue) })
</script>