<template>
  <div class="h-screen flex flex-col">
    <div class="flex flex-1 overflow-hidden">
      <!-- MASAÜSTÜ İÇİN SOL MENÜ -->
      <aside
        class="hidden md:flex md:flex-col w-64 flex-shrink-0 bg-gray-800 border-r border-gray-700"
      >
        <div class="px-4 py-5">
          <h1 class="text-xl font-bold text-white">Belediye IT Destek</h1>
        </div>
        <div class="flex-1 flex flex-col overflow-y-auto">
          <nav class="flex-1 px-2">
            <UVerticalNavigation :links="navigation" :ui="uiConfig" />
          </nav>
          <div class="px-2 py-4">
            <UVerticalNavigation :links="secondaryNavigation" :ui="uiConfig" />
          </div>
        </div>
      </aside>

      <!-- ANA İÇERİK ALANI -->
      <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div class="p-4 sm:p-6 lg:p-8">
          <slot />
        </div>
      </main>
    </div>

    <!-- MOBİL İÇİN ALT NAVİGASYON MENÜSÜ -->
    <nav
      class="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
    >
      <div class="flex justify-around h-16">
        <NuxtLink
          v-for="link in mobileNavigation"
          :key="link.to"
          :to="link.to"
          class="flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 w-full pt-2 pb-1"
          active-class="text-blue-600"
        >
          <UIcon :name="link.icon" class="w-6 h-6" />
          <span class="text-xs mt-1">{{ link.label }}</span>
        </NuxtLink>
      </div>
    </nav>

    <div class="md:hidden h-16"></div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

// Navigasyon için özel UI yapılandırması
const uiConfig = {
  // YENİ VE KESİN ÇÖZÜM: 'before' ve 'after' kısımlarını boşaltarak erişilebilirlik metnini kaldırıyoruz.
  before: '',
  after: '',
  
  base: "group flex items-center gap-3 w-full rounded-md cursor-pointer",
  padding: "px-3 py-2.5",
  font: "font-medium",
  size: "text-sm",
  inactive: "text-gray-400 hover:text-white hover:bg-gray-700/50",
  active: "text-white bg-gray-900/50",
  icon: {
    base: "flex-shrink-0 w-5 h-5",
    active: "text-white",
    inactive: "text-gray-500 group-hover:text-white",
  },
};

const navigation = [
  { label: "Dashboard", icon: "i-heroicons-home", to: "/dashboard" },
  { label: "Destek Talepleri", icon: "i-heroicons-ticket", to: "/tickets" },
  {
    label: "Cihaz Talepleri",
    icon: "i-heroicons-computer-desktop",
    to: "/requests",
  },
];

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};

const secondaryNavigation = [
  { label: "Ayarlar", icon: "i-heroicons-cog-6-tooth", to: "/settings" },
  {
    label: "Çıkış Yap",
    icon: "i-heroicons-arrow-left-on-rectangle",
    click: handleLogout
  },
];

const mobileNavigation = [
  { label: "Dashboard", icon: "i-heroicons-home-solid", to: "/dashboard" },
  { label: "Destek", icon: "i-heroicons-ticket-solid", to: "/tickets" },
  {
    label: "Cihaz",
    icon: "i-heroicons-computer-desktop-solid",
    to: "/requests",
  },
  { label: "Ayarlar", icon: "i-heroicons-cog-6-tooth-solid", to: "/settings" },
];
</script>