<!-- layouts/default.vue DOSYASININ NİHAİ İÇERİĞİ -->
<template>
  <div class="h-screen bg-gray-100 dark:bg-gray-900">
    <div class="flex h-full">
      <!-- MASAÜSTÜ İÇİN SOL MENÜ -->
      <aside class="hidden md:flex md:flex-col w-64 flex-shrink-0 bg-gray-800 dark:bg-gray-950">
        <div class="px-4 h-16 flex items-center">
          <h1 class="text-xl font-bold text-white">Belediye IT Destek</h1>
        </div>
        
        <div class="flex-1 flex flex-col overflow-y-auto">
          <!-- Ana Navigasyon: NuxtLink ile Sıfırdan Yazıldı -->
          <nav class="flex-1 px-2 py-4 space-y-1">
            <NuxtLink
              v-for="link in navigation"
              :key="link.to"
              :to="link.to"
              :class="[
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isRouteActive(link.to)
                  ? 'bg-gray-900 text-white' // Aktif link stili
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white' // Pasif link stili
              ]"
            >
              <UIcon :name="link.icon" class="mr-3 flex-shrink-0 h-5 w-5" />
              {{ link.label }}
            </NuxtLink>
          </nav>
          
          <!-- Alt Navigasyon (Ayarlar, Çıkış) -->
          <div class="px-2 py-4 border-t border-gray-700 dark:border-gray-800">
            <div class="space-y-1">
              <NuxtLink
                v-for="link in secondaryNavigation"
                :key="link.label"
                :to="link.to"
                @click="link.click"
                :class="[
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isRouteActive(link.to)
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                ]"
              >
                <UIcon :name="link.icon" class="mr-3 flex-shrink-0 h-5 w-5" />
                {{ link.label }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </aside>

      <!-- ANA İÇERİK ALANI (Değişiklik yok) -->
      <main class="flex-1 overflow-y-auto">
        <div class="p-4 sm:p-6 lg:p-8 md:pb-8 pb-24">
          <slot />
        </div>
      </main>
    </div>

    <!-- MOBİL İÇİN ALT NAVİGASYON MENÜSÜ (Değişiklik yok) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div class="flex justify-around h-16">
        <NuxtLink
          v-for="link in mobileNavigation"
          :key="link.to"
          :to="link.to"
          class="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 w-full transition-colors duration-200"
          :active-class="'!text-primary-600 dark:!text-primary-400'"
        >
          <UIcon :name="link.icon" class="w-6 h-6" />
          <span class="text-xs mt-1">{{ link.label }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const route = useRoute();

// --- AKTİF ROUTE'U KONTROL ETMEK İÇİN YARDIMCI FONKSİYON ---
// Bu fonksiyon, mevcut sayfa yolunun bir linkle eşleşip eşleşmediğini kontrol eder.
const isRouteActive = (to) => {
  return to && route.path === to;
};

// --- LİNK VERİLERİ OLDUĞU GİBİ KALIYOR ---

// Ana navigasyon linkleri
const navigation = computed(() => [
  { label: "Dashboard", icon: "i-heroicons-home", to: "/dashboard" },
  { label: "Destek Talepleri", icon: "i-heroicons-ticket", to: "/tickets" },
  { label: "Cihaz Talepleri", icon: "i-heroicons-computer-desktop", to: "/requests" },
  ...(authStore.userRole === 'Admin' || authStore.userRole === 'ITAgent' ? [{ label: 'Kullanıcı Yönetimi', icon: 'i-heroicons-users', to: '/admin/users' }] : [])
]);

// Çıkış yapma fonksiyonu
const handleLogout = async () => {
  await authStore.logout();
};

// Alt navigasyon linkleri
const secondaryNavigation = [
  { label: "Ayarlar", icon: "i-heroicons-cog-6-tooth", to: "/settings" },
  { label: "Çıkış Yap", icon: "i-heroicons-arrow-left-on-rectangle", to: '#', click: handleLogout }, // to='#' eklendi
];

// Mobil için navigasyon linkleri
const mobileNavigation = [
  { label: "Dashboard", icon: "i-heroicons-home-solid", to: "/dashboard" },
  { label: "Destek", icon: "i-heroicons-ticket-solid", to: "/tickets" },
  { label: "Cihaz", icon: "i-heroicons-computer-desktop-solid", to: "/requests" },
  { label: "Ayarlar", icon: "i-heroicons-cog-6-tooth-solid", to: "/settings" },
];
</script>