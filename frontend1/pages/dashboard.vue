<template>
  <div class="space-y-8">
    <!-- Sayfa Başlığı -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <p class="mt-1 text-gray-500 dark:text-gray-400">
        Hoş geldin! Sistemdeki son duruma buradan göz atabilirsin.
      </p>
    </div>

    <!-- İstatistik Kartları (Stat Cards) -->
    <!-- `grid` ve `gap` ile responsive bir kart düzeni oluşturuyoruz. -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <!-- Örnek Kart 1: Toplam Ticket -->
      <UCard>
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Destek Talebi</p>
          <UIcon name="i-heroicons-ticket" class="w-6 h-6 text-gray-400" />
        </div>
        <p class="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">247</p>
        <p class="mt-1 text-sm text-green-600 flex items-center">+12% geçen aydan</p>
      </UCard>
      
      <!-- Örnek Kart 2: Açık Ticket'lar -->
      <UCard>
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Açık Talepler</p>
          <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-orange-500" />
        </div>
        <p class="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">23</p>
        <p class="mt-1 text-sm text-gray-500">8 Yüksek, 15 Orta öncelikli</p>
      </UCard>

      <!-- Örnek Kart 3: Onay Bekleyen Cihazlar -->
      <UCard>
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Onay Bekleyen Cihaz Talebi</p>
          <UIcon name="i-heroicons-computer-desktop" class="w-6 h-6 text-blue-500" />
        </div>
        <p class="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">12</p>
        <p class="mt-1 text-sm text-gray-500">onay bekliyor</p>
      </UCard>
    </div>

    <!-- Son Ticket'lar ve Hızlı Aksiyonlar -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Son Ticket'lar Listesi (Sol Taraf) -->
      <div class="lg:col-span-2">
        <h2 class="text-lg font-semibold mb-4">Son Destek Talepleri</h2>
        <div class="space-y-4">
          <!-- Örnek bir ticket listesi elemanı -->
          <UCard>
            <div class="flex justify-between items-start">
              <div>
                <p class="font-semibold text-gray-800 dark:text-white">Network bağlantı sorunu</p>
                <p class="text-sm text-gray-500">Rapor eden: Ali Veli - 2 saat önce</p>
              </div>
              <div class="flex items-center space-x-2">
                <UBadge color="red" variant="soft">High</UBadge>
                <UBadge color="orange" variant="soft">In Progress</UBadge>
              </div>
            </div>
          </UCard>
          <!-- Diğer ticket'lar buraya eklenecek -->
        </div>
      </div>

      <!-- Hızlı Aksiyonlar (Sağ Taraf) -->
      <div>
        <h2 class="text-lg font-semibold mb-4">Hızlı Aksiyonlar</h2>
        <div class="space-y-3">
          <UButton to="/tickets/new" label="Yeni Destek Talebi Oluştur" icon="i-heroicons-plus-circle" size="lg" block />
          <UButton to="/requests/new" label="Yeni Cihaz Talebi Oluştur" icon="i-heroicons-plus-circle" color="gray" size="lg" block />
          <UButton to="/reports" label="Raporları Görüntüle" icon="i-heroicons-chart-pie" color="white" size="lg" block />
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
// Bu sayfanın "default" layout'u kullanmasını sağlıyoruz.
definePageMeta({
  layout: 'default'
})

// TODO: Backend'den /api/analytics/stats ve /api/tickets?limit=5
// endpoint'lerine istek atıp kartları ve listeyi dinamik hale getireceğiz.
</script>