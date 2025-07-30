<template>
  <div class="w-full max-w-3xl mx-auto px-2 py-8">
    <!-- Başlık ve Açıklama -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Ayarlar</h1>
      <p class="mt-1 text-gray-500 dark:text-gray-400">
        Profil bilgilerinizi ve hesap ayarlarınızı buradan yönetebilirsiniz.
      </p>
    </div>

    <!-- Sekmeli Yapı -->
    <div class="mt-8">
      <div class="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          v-for="item in tabItems"
          :key="item.key"
          @click="selectedTab = item.key"
          class="flex items-center gap-1 px-4 py-2 -mb-px border-b-2 transition-all duration-200 text-sm font-semibold focus:outline-none"
          :class="selectedTab === item.key
            ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400'
            : 'border-transparent text-gray-500 hover:text-primary-600 dark:hover:text-primary-400'"
        >
          <UIcon :name="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </button>
      </div>

      <!-- PROFİL BİLGİLERİ -->
      <UCard v-if="selectedTab === 'profile'">
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Profil Bilgileri</h3>
        </template>
        <UForm :state="profileState" :schema="profileSchema" @submit="handleUpdateProfile" class="space-y-5 max-w-lg">
          <!-- İSTENEN DEĞİŞİKLİK: UInput sadeleştirildi ve Nuxt UI standartlarına uyarlandı -->
          <UFormGroup label="Ad Soyad" name="fullName" required>
            <UInput
              v-model="profileState.fullName"
              icon="i-heroicons-user"
              size="lg"
              placeholder="Ad Soyad"
              :ui="{ rounded: 'rounded-full' }"
            />
          </UFormGroup>
          <UFormGroup label="E-posta" name="email" required>
            <UInput
              v-model="profileState.email"
              icon="i-heroicons-envelope"
              type="email"
              size="lg"
              placeholder="E-posta"
              :ui="{ rounded: 'rounded-full' }"
            />
          </UFormGroup>
          <UButton
            type="submit"
            :loading="isProfileLoading"
            size="lg"
            block
            class="rounded-full"
          >
            Profili Güncelle
          </UButton>
        </UForm>
      </UCard>

      <!-- ŞİFRE DEĞİŞTİR -->
      <UCard v-if="selectedTab === 'password'">
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Şifre Değiştir</h3>
        </template>
        <UForm :state="passwordState" :schema="passwordSchema" @submit="handleUpdatePassword" class="space-y-5 max-w-lg">
          <!-- İSTENEN DEĞİŞİKLİK: Tüm UInput'lar sadeleştirildi -->
          <UFormGroup label="Mevcut Şifre" name="currentPassword" required>
            <UInput
              v-model="passwordState.currentPassword"
              icon="i-heroicons-lock-closed"
              type="password"
              size="lg"
              placeholder="Mevcut Şifre"
              :ui="{ rounded: 'rounded-full' }"
            />
          </UFormGroup>
          <UFormGroup label="Yeni Şifre" name="newPassword" required>
            <UInput
              v-model="passwordState.newPassword"
              icon="i-heroicons-key"
              type="password"
              size="lg"
              placeholder="Yeni Şifre"
              :ui="{ rounded: 'rounded-full' }"
            />
          </UFormGroup>
          <UFormGroup label="Yeni Şifre (Tekrar)" name="confirmPassword" required>
            <UInput
              v-model="passwordState.confirmPassword"
              icon="i-heroicons-key"
              type="password"
              size="lg"
              placeholder="Yeni Şifre (Tekrar)"
              :ui="{ rounded: 'rounded-full' }"
            />
          </UFormGroup>
          <UButton
            type="submit"
            :loading="isPasswordLoading"
            size="lg"
            block
            class="rounded-full"
          >
            Şifreyi Güncelle
          </UButton>
        </UForm>
      </UCard>

      <!-- BİLDİRİMLER -->
      <UCard v-if="selectedTab === 'notifications'">
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Bildirim Ayarları</h3>
        </template>
        <div class="space-y-5 max-w-lg">
          <div class="flex items-center justify-between p-4 border dark:border-gray-700 rounded-xl">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Yeni Talep Bildirimleri</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Bir talep oluşturulduğunda e-posta al.</p>
            </div>
            <UToggle v-model="notificationState.newTicket" size="lg" />
          </div>
          <div class="flex items-center justify-between p-4 border dark:border-gray-700 rounded-xl">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Durum Güncelleme Bildirimleri</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Talebinizin durumu değiştiğinde e-posta al.</p>
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
  fullName: authStore.user?.fullName || '',
  email: authStore.user?.email || ''
})
const isProfileLoading = ref(false)

async function handleUpdateProfile(event) {
  isProfileLoading.value = true
  try {
    await $fetch('/api/auth/updateprofile', {
      method: 'PUT',
      body: event.data
    })
    // authStore.user.fullName = event.data.fullName
    // authStore.user.email = event.data.email
    await authStore.fetchUser() // Fetch the user again to get updated info
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

const notificationState = reactive({
  newTicket: false,
  statusUpdate: false
});

</script>