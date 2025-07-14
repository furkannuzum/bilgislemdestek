<!-- frontend1/layouts/default.vue (GÜNCELLENMİŞ HALİ) -->
<template>
  <div class="min-h-screen grid md:grid-cols-[280px_1fr]">
    
    <!-- SOL MENÜ (SIDEBAR) -->
    <aside class="hidden md:flex flex-col bg-gray-800 text-gray-300 p-6">
      <!-- Logo -->
      <div class="mb-10">
        <h1 class="text-2xl font-bold text-white tracking-wider">
          Belediye IT Destek
        </h1>
      </div>

      <!-- Navigasyon Linkleri -->
      <nav class="flex-grow">
        <ul class="space-y-2">
          <li>
            <NuxtLink to="/dashboard" class="nav-link" active-class="active-nav-link">
              <UIcon name="i-heroicons-home" class="w-5 h-5 mr-3" />
              <span>Dashboard</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/tickets" class="nav-link" active-class="active-nav-link">
              <UIcon name="i-heroicons-ticket" class="w-5 h-5 mr-3" />
              <span>Destek Talepleri</span>
            </NuxtLink>
          </li>
           <li>
            <NuxtLink to="/requests" class="nav-link" active-class="active-nav-link">
              <UIcon name="i-heroicons-computer-desktop" class="w-5 h-5 mr-3" />
              <span>Cihaz Talepleri</span>
            </NuxtLink>
          </li>
          <!-- TODO: Diğer linkler (Departmanlar, Raporlar vb.) buraya eklenebilir -->
        </ul>
      </nav>

      <!-- Kullanıcı Profili ve Ayarlar -->
      <div>
        <NuxtLink to="/settings" class="nav-link" active-class="active-nav-link">
            <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5 mr-3" />
            <span>Ayarlar</span>
        </NuxtLink>
        <!-- 
          ÇIKIŞ YAP BUTONU GÜNCELLEMESİ:
          - @click olayı ile authStore'daki logout fonksiyonunu çağırır.
        -->
        <button @click="authStore.logout()" class="nav-link w-full mt-2 text-red-400 hover:bg-red-500/10">
            <UIcon name="i-heroicons-arrow-left-on-rectangle" class="w-5 h-5 mr-3" />
            <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>

    <!-- SAĞ TARAF (ANA İÇERİK VE HEADER) -->
    <div class="flex flex-col bg-gray-50 dark:bg-gray-900">
      <!-- Üst Header -->
      <header class="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
        <!-- Arama Çubuğu -->
        <UInput icon="i-heroicons-magnifying-glass" placeholder="Ara..." />
        
        <!-- 
          KULLANICI BİLGİSİ GÜNCELLEMESİ:
          - v-if ile kullanıcının giriş yapıp yapmadığını kontrol eder.
          - authStore'dan gelen dinamik verileri gösterir.
        -->
        <p v-if="authStore.isAuthenticated" class="font-semibold text-gray-700 dark:text-gray-200">
          {{ authStore.userFullName }} ({{ authStore.userRole }})
        </p>
      </header>

      <!-- Sayfa İçeriği -->
      <main class="flex-grow p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
// SCRIPT BÖLÜMÜ GÜNCELLEMESİ:
// Pinia'daki auth store'unu bu bileşende kullanabilmek için import ediyoruz.
import { useAuthStore } from '~/stores/auth';
const authStore = useAuthStore();
</script>

<style scoped>
/* Aktif navigasyon linki için özel stil */
.nav-link {
  @apply flex items-center w-full px-4 py-2.5 rounded-lg transition-colors duration-200 hover:bg-gray-700 text-left;
}

.active-nav-link {
  @apply bg-blue-600 text-white hover:bg-blue-600;
}
</style>