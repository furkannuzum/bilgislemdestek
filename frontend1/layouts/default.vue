<template>
  <!-- 
    Ana layout yapısı:
    - md:grid-cols-[280px_1fr]: Masaüstünde 280px'lik bir sol sütun (sidebar)
      ve geri kalan tüm alanı kaplayan bir sağ sütun (ana içerik) oluşturur.
  -->
  <div class="min-h-screen grid md:grid-cols-[280px_1fr]">
    
    <!-- SOL MENÜ (SIDEBAR) -->
    <!-- 
      - bg-gray-800: Koyu arka plan.
      - hidden md:flex: Mobilde gizli, masaüstünde görünür.
    -->
    <aside class="hidden md:flex flex-col bg-gray-800 text-gray-300 p-6">
      <!-- Logo -->
      <div class="mb-10">
        <h1 class="text-2xl font-bold text-white tracking-wider">
          Belediye IT Destek
        </h1>
      </div>

<!-- ... -->
      <!-- Navigasyon Linkleri -->
      <nav class="flex-grow">
        <ul class="space-y-2">
          <li>
            <!-- Bu link /dashboard sayfasına gider -->
            <NuxtLink to="/dashboard" class="nav-link" active-class="active-nav-link">
              <UIcon name="i-heroicons-home" class="w-5 h-5 mr-3" />
              <span>Dashboard</span>
            </NuxtLink>
          </li>
          <li>
            <!-- BU LİNKİ KONTROL ET: /tickets sayfasına gitmeli -->
            <NuxtLink to="/tickets" class="nav-link" active-class="active-nav-link">
              <UIcon name="i-heroicons-ticket" class="w-5 h-5 mr-3" />
              <span>Destek Talepleri</span>
            </NuxtLink>
          </li>
           <li>
            <!-- BU LİNKİ KONTROL ET: /requests sayfasına gitmeli -->
            <NuxtLink to="/requests" class="nav-link" active-class="active-nav-link">
              <UIcon name="i-heroicons-computer-desktop" class="w-5 h-5 mr-3" />
              <span>Cihaz Talepleri</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
<!-- ... -->

      <!-- Kullanıcı Profili ve Ayarlar -->
      <div>
        <NuxtLink to="/settings" class="nav-link" active-class="active-nav-link">
            <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5 mr-3" />
            <span>Ayarlar</span>
        </NuxtLink>
        <button class="nav-link w-full mt-2 text-red-400 hover:bg-red-500/10">
            <UIcon name="i-heroicons-arrow-left-on-rectangle" class="w-5 h-5 mr-3" />
            <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>

    <!-- SAĞ TARAF (ANA İÇERİK VE HEADER) -->
    <div class="flex flex-col">
      <!-- Üst Header -->
      <header class="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
        <!-- Arama Çubuğu -->
        <UInput icon="i-heroicons-magnifying-glass" placeholder="Ara..." />
        
        <!-- Sağ Üst Kullanıcı Menüsü -->
        <p class="font-semibold">Furkan Test (Admin)</p>
      </header>

      <!-- Sayfa İçeriği -->
      <main class="flex-grow p-6 bg-gray-50 dark:bg-gray-900">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Aktif navigasyon linki için özel stil */
.nav-link {
  @apply flex items-center w-full px-4 py-2.5 rounded-lg transition-colors duration-200 hover:bg-gray-700;
}

.active-nav-link {
  @apply bg-blue-600 text-white hover:bg-blue-600;
}
</style>