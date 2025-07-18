<template>
  <div class="w-full space-y-8">
    <!-- Başlık ve Karşılama Mesajı -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
      <p v-if="authStore.user" class="mt-1 text-gray-600 dark:text-gray-400">
        Hoş geldin, <span class="font-semibold text-gray-800 dark:text-gray-200">{{ authStore.user.fullName }}</span>! Sistemdeki son duruma buradan göz atabilirsin.
      </p>
    </div>

    <!-- İstatistik Kartları -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard>
        <div class="text-center">
          <p class="text-sm font-medium text-gray-500">Toplam Destek Talebim</p>
          <p class="text-3xl sm:text-4xl font-bold mt-1">1</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-sm font-medium text-gray-500">Açık Taleplerim</p>
          <p class="text-3xl sm:text-4xl font-bold mt-1">1</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-sm font-medium text-gray-500">Onay Bekleyen Cihaz Talebim</p>
          <p class="text-3xl sm:text-4xl font-bold mt-1">0</p>
          <p class="text-xs text-gray-400 mt-1">onay bekliyor</p>
        </div>
      </UCard>
    </div>

    <!-- Alt Kısım: Son Talepler ve Hızlı Aksiyonlar -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div class="lg:col-span-2 flex flex-col">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Son Destek Taleplerim</h2>
          <UButton to="/tickets" variant="link" color="primary" size="sm">Tümünü Gör</UButton>
        </div>
        <div class="flex-1">
          <UCard class="h-full">
            <div class="flex justify-between items-center gap-2">
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-800 truncate">office uygulaması lisans sorunu</p>
                <p class="text-sm text-gray-500">14.07.2025 16:07</p>
              </div>
              <div class="flex-shrink-0 flex items-center gap-2">
                <UBadge color="red" variant="soft">High</UBadge>
              </div>
            </div>
          </UCard>
        </div>
      </div>
      
      <!-- HIZLI AKSİYONLAR (YENİ TASARIM) -->
      <div class="lg:col-span-1 flex flex-col">
      
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Hızlı Aksiyonlar</h2>
        <div class="flex-1 flex flex-col space-y-3">
          <!-- Bu butonlar artık aynı stilde -->
          <UButton 
            to="/tickets/new" 
            icon="i-heroicons-plus-circle-20-solid" 
            size="lg" 
            block 
            class="w-full text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-full text-base px-5 py-3 text-center transition-colors disabled:opacity-50"
          >
            Yeni Destek Talebi
          </UButton>
          
          <UButton 
            to="/requests/new" 
            icon="i-heroicons-plus-circle-20-solid" 
            size="lg" 
            block 
            class="w-full text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-full text-base px-5 py-3 text-center transition-colors disabled:opacity-50"
          >
            Yeni Cihaz Talebi
          </UButton>

          <UButton 
            v-if="authStore.userRole !== 'EndUser'"
            to="/reports" 
            icon="i-heroicons-chart-pie-20-solid" 
            size="lg" 
            block 
            class="w-full text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-full text-base px-5 py-3 text-center transition-colors disabled:opacity-50"
          >
            Raporları Görüntüle
          </UButton>
        </div>
      </div>
      <!-- HIZLI AKSİYONLAR SONU -->

    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: 'default',
  middleware: 'auth'
});

const authStore = useAuthStore();
</script>