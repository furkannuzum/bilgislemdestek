<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Ayarlar</h1>
      <p class="mt-1 text-gray-500 dark:text-gray-400">
        Profil bilgilerinizi ve hesap ayarlarınızı buradan yönetebilirsiniz.
      </p>
    </div>

    <UTabs :items="tabItems" class="w-full">
      <template #item="{ item }">
        
        <!-- Profil Bilgileri Sekmesi -->
        <UCard v-if="item.key === 'profile'">
          <template #header>
            <h3 class="text-lg font-semibold">Profil Bilgileri</h3>
          </template>

          <UForm :state="profileState" :schema="profileSchema" @submit="handleUpdateProfile" class="space-y-4">
            <UFormGroup label="Ad Soyad" name="fullName">
              <UInput v-model="profileState.fullName" />
            </UFormGroup>
            <UFormGroup label="E-posta" name="email">
              <UInput v-model="profileState.email" type="email" />
            </UFormGroup>
            <UButton type="submit" :loading="isProfileLoading">Profili Güncelle</UButton>
          </UForm>
        </UCard>

        <!-- Şifre Değiştir Sekmesi -->
        <UCard v-if="item.key === 'password'">
          <template #header>
            <h3 class="text-lg font-semibold">Şifre Değiştir</h3>
          </template>

          <UForm :state="passwordState" :schema="passwordSchema" @submit="handleUpdatePassword" class="space-y-4">
            <UFormGroup label="Mevcut Şifre" name="currentPassword">
              <UInput v-model="passwordState.currentPassword" type="password" />
            </UFormGroup>
            <UFormGroup label="Yeni Şifre" name="newPassword">
              <UInput v-model="passwordState.newPassword" type="password" />
            </UFormGroup>
             <UFormGroup label="Yeni Şifre (Tekrar)" name="confirmPassword">
              <UInput v-model="passwordState.confirmPassword" type="password" />
            </UFormGroup>
            <UButton type="submit" :loading="isPasswordLoading">Şifreyi Güncelle</UButton>
          </UForm>
        </UCard>

        <!-- Bildirimler Sekmesi -->
        <UCard v-if="item.key === 'notifications'">
           <template #header>
            <h3 class="text-lg font-semibold">Bildirim Ayarları</h3>
          </template>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <p>Yeni talep oluşturulduğunda e-posta gönder</p>
              <UToggle />
            </div>
             <div class="flex items-center justify-between">
              <p>Talebin durumu değiştiğinde e-posta gönder</p>
              <UToggle />
            </div>
          </div>
        </UCard>

      </template>
    </UTabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { z } from 'zod';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: 'default',
  middleware: 'auth' // Sadece giriş yapmışların girmesini sağlar
})

const authStore = useAuthStore();
const toast = useToast();

// --- Sekme Tanımları ---
const tabItems = [{ /* ... bir önceki adımdaki gibi aynı ... */ }];

// --- Profil Formu ---
const profileSchema = z.object({
  fullName: z.string().min(3, 'Ad Soyad en az 3 karakter olmalıdır.'),
  email: z.string().email('Geçersiz e-posta adresi.'),
});
const profileState = reactive({
  fullName: authStore.userFullName,
  email: authStore.user?.email,
});
const isProfileLoading = ref(false);

async function handleUpdateProfile(event) {
  isProfileLoading.value = true;
  try {
    const response = await $fetch('/api/auth/updateprofile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: event.data
    });
    toast.add({ title: 'Başarılı!', description: 'Profiliniz güncellendi.', color: 'green' });
    // TODO: Pinia store'daki kullanıcı bilgilerini de güncellemek gerekebilir.
  } catch (err) {
    toast.add({ title: 'Hata!', description: err.data?.message || 'Profil güncellenemedi.', color: 'red' });
  } finally {
    isProfileLoading.value = false;
  }
}

// --- Şifre Formu ---
const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Mevcut şifre gerekli.'),
    newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalı.'),
    confirmPassword: z.string().min(6, 'Onay şifresi en az 6 karakter olmalı.'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Yeni şifreler eşleşmiyor.",
    path: ["confirmPassword"], // Hatanın hangi alanda gösterileceği
  });
  
const passwordState = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' });
const isPasswordLoading = ref(false);

async function handleUpdatePassword(event) {
  isPasswordLoading.value = true;
  try {
    const response = await $fetch('/api/auth/updatepassword', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: {
        currentPassword: event.data.currentPassword,
        newPassword: event.data.newPassword,
      }
    });
    toast.add({ title: 'Başarılı!', description: response.message, color: 'green' });
    passwordState.currentPassword = '';
    passwordState.newPassword = '';
    passwordState.confirmPassword = '';
  } catch (err) {
    toast.add({ title: 'Hata!', description: err.data?.message || 'Şifre güncellenemedi.', color: 'red' });
  } finally {
    isPasswordLoading.value = false;
  }
}
</script>