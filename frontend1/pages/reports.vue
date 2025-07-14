<template>
  <div class="space-y-8">
    <!-- Sayfa Başlığı -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Raporlar ve Analiz</h1>
      <p class="mt-1 text-gray-500 dark:text-gray-400">
        Sistem verilerine dayalı detaylı raporları ve analizleri buradan görüntüleyebilirsiniz.
      </p>
    </div>

    <!-- 
      Bu bölüm, projenin ilerleyen aşamalarında grafik kütüphaneleri 
      (örn: Chart.js, ECharts) ile doldurulacaktır. 
      Şimdilik yer tutucu (placeholder) kartlar ekliyoruz.
    -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      <!-- Kart 1: Birimlere Göre Talep Dağılımı -->
      <UCard>
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-chart-pie" class="w-5 h-5" />
            <h3 class="font-semibold">Birimlere Göre Talep Dağılımı</h3>
          </div>
        </template>
        <div class="h-64 flex items-center justify-center text-gray-400">
          <!-- Buraya Pasta Grafiği (Pie Chart) gelecek -->
          <p>Pasta Grafiği Alanı</p>
        </div>
      </UCard>
      
      <!-- Kart 2: Aylık Talep Trendi -->
      <UCard>
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-chart-bar" class="w-5 h-5" />
            <h3 class="font-semibold">Aylık Talep Trendi</h3>
          </div>
        </template>
        <div class="h-64 flex items-center justify-center text-gray-400">
          <!-- Buraya Çizgi Grafiği (Line Chart) gelecek -->
          <p>Çizgi Grafiği Alanı</p>
        </div>
      </UCard>

      <!-- Kart 3: Ortalama Çözüm Süreleri -->
       <UCard>
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-clock" class="w-5 h-5" />
            <h3 class="font-semibold">Kategori Bazında Ortalama Çözüm Süresi</h3>
          </div>
        </template>
        <div class="h-64 flex items-center justify-center text-gray-400">
           <!-- Buraya Sütun Grafiği (Bar Chart) gelecek -->
          <p>Sütun Grafiği Alanı</p>
        </div>
      </UCard>

    </div>
  </div>
</template>

<script setup>
// Bu sayfanın, soldaki menüyü gösteren "default" layout'u kullanmasını sağlıyoruz.
definePageMeta({
  layout: 'default'
})

// TODO: Raporlar için gerekli verileri çekecek API istekleri burada yapılacak.
// Örnek: const { data: reportData } = await useFetch('/api/analytics/reports/department-distribution')
</script>