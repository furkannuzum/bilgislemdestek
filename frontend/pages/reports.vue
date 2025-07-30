<template>
  <div class="space-y-8">
    <!-- Sayfa Başlığı -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Raporlar ve Analiz</h1>
      <p class="mt-1 text-gray-500 dark:text-gray-400">
        Sistem verilerine dayalı detaylı raporları ve analizleri buradan görüntüleyebilirsiniz.
      </p>
    </div>

    <!-- Yükleme ve Hata Durumları -->
    <div v-if="pending" class="text-center py-20 text-gray-500 dark:text-gray-400">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin mx-auto mb-4" />
      Rapor verileri yükleniyor...
    </div>
    <div v-else-if="error || !reportData" class="text-center py-20 text-red-500">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 mx-auto mb-4" />
      Raporlar yüklenirken bir hata oluştu.
    </div>

    <!-- Sekmeli İçerik -->
    <UTabs v-if="reportData" :items="tabItems">
      <!-- Sekme 1: Genel Raporlar -->
      <template #genel>
        <div class="space-y-8 mt-6">
          <!-- İstatistik Kartları -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <UCard><div class="flex items-center gap-4"><UIcon name="i-heroicons-ticket" class="text-4xl text-blue-500" /><div><p class="text-sm text-gray-500 dark:text-gray-400">Toplam Destek Talebi</p><p class="text-3xl font-bold">{{ reportData.generalStats.totalTickets }}</p></div></div></UCard>
            <UCard><div class="flex items-center gap-4"><UIcon name="i-heroicons-envelope-open" class="text-4xl text-orange-500" /><div><p class="text-sm text-gray-500 dark:text-gray-400">Açık Destek Talebi</p><p class="text-3xl font-bold">{{ reportData.generalStats.openTickets }}</p></div></div></UCard>
            <UCard><div class="flex items-center gap-4"><UIcon name="i-heroicons-computer-desktop" class="text-4xl text-green-500" /><div><p class="text-sm text-gray-500 dark:text-gray-400">Toplam Cihaz Talebi</p><p class="text-3xl font-bold">{{ reportData.generalStats.totalDeviceRequests }}</p></div></div></UCard>
            <UCard><div class="flex items-center gap-4"><UIcon name="i-heroicons-clock" class="text-4xl text-red-500" /><div><p class="text-sm text-gray-500 dark:text-gray-400">Bekleyen Cihaz Talebi</p><p class="text-3xl font-bold">{{ reportData.generalStats.pendingDeviceRequests }}</p></div></div></UCard>
          </div>

          <!-- Akordiyon: Birimlere Göre Dağılım -->
          <UCard>
            <template #header><h2 class="font-semibold text-lg text-gray-900 dark:text-white">Birimlere Göre Talep Dağılımı</h2></template>
            <UAccordion :items="accordionItems">
              <template #default="{ item, open }">
                <UButton color="gray" variant="ghost" class="border-b border-gray-200 dark:border-gray-800" :ui="{ rounded: 'rounded-none', padding: { sm: 'p-3' } }">
                  <span class="truncate font-medium">{{ item.label }}</span>
                  <template #trailing>
                    <UBadge color="white" variant="soft" class="mr-4">{{ item.content.length }} talep</UBadge>
                    <UIcon name="i-heroicons-chevron-right-20-solid" class="w-5 h-5 ms-auto transform transition-transform duration-200" :class="[open && 'rotate-90']" />
                  </template>
                </UButton>
              </template>
              <template #item="{ item }"><UTable :rows="item.content" :columns="ticketColumns" /></template>
            </UAccordion>
          </UCard>

          <!-- Grafikler -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Grafik 1: Pie -->
            <UCard>
              <template #header><h3 class="font-semibold">Birimlere Göre Talep Dağılımı (Grafik)</h3></template>
              <div class="h-80">
                <LazyChartsDepartmentPieChart v-if="reportData.departmentDistribution?.length" :distribution-data="reportData.departmentDistribution" />
                <p v-else class="flex items-center justify-center h-full text-gray-500">Grafik için veri bulunamadı.</p>
              </div>
            </UCard>

            <!-- Grafik 2: Trend -->
            <UCard>
              <template #header>
                <div class="flex justify-between items-center">
                  <h3 class="font-semibold">Talep Trendi</h3>
                  <UButtonGroup size="xs" orientation="horizontal">
                    <UButton v-for="period in trendPeriods" :key="period.value" :label="period.label" @click="selectedPeriod = period.value" :variant="selectedPeriod === period.value ? 'solid' : 'outline'" />
                  </UButtonGroup>
                </div>
              </template>
              <div class="h-80">
                <LazyChartsMonthlyTrendChart v-if="reportData.monthlyTrend?.length" :trend-data="reportData.monthlyTrend" :period="selectedPeriod" />
                <p v-else class="flex items-center justify-center h-full text-gray-500">Grafik için veri bulunamadı.</p>
              </div>
            </UCard>
          </div>
        </div>
      </template>

      <!-- Sekme 2: Personel Performansı -->
      <template #performans>
        <div class="space-y-8 mt-6">
          <UCard>
            <template #header><h2 class="font-semibold text-lg">IT Personeli Çözüm Sayıları</h2></template>
            <UTable v-if="reportData.agentPerformance?.length" :rows="reportData.agentPerformance" :columns="performanceColumns">
              <template #rank-data="{ index }"><span class="font-bold text-xl" :class="getRankColor(index)">#{{ index + 1 }}</span></template>
            </UTable>
            <p v-else class="text-center text-gray-500">Performans verisi bulunamadı.</p>
          </UCard>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

definePageMeta({ layout: 'default' });

const selectedPeriod = ref('monthly');
const trendPeriods = [
  { label: 'Günlük', value: 'daily' },
  { label: 'Haftalık', value: 'weekly' },
  { label: 'Aylık', value: 'monthly' },
];

const tabItems = [
  { slot: 'genel', label: 'Genel Raporlar', icon: 'i-heroicons-chart-bar-square' },
  { slot: 'performans', label: 'Personel Performansı', icon: 'i-heroicons-user-group' }
];

const queryParams = computed(() => ({ period: selectedPeriod.value }));

const { data: reportData, pending, error } = useFetch('/api/analytics/stats', {
  lazy: true,
  query: queryParams,
  transform: (res) => res.data,
  watch: [selectedPeriod],
});

const accordionItems = computed(() => {
  if (!reportData.value?.ticketsByDepartment) return [];
  const grouped = reportData.value.ticketsByDepartment.reduce((acc, ticket) => {
    const dept = ticket.department?.name;
    if (!dept) return acc;
    acc[dept] = acc[dept] || [];
    acc[dept].push({
      id: ticket._id,
      title: ticket.title,
      status: ticket.status,
      openedBy: ticket.openedBy?.fullName || 'Bilinmiyor',
      createdAt: new Date(ticket.createdAt).toLocaleDateString('tr-TR')
    });
    return acc;
  }, {});
  return Object.entries(grouped).map(([label, content]) => ({ label, content })).sort((a, b) => b.content.length - a.content.length);
});

const ticketColumns = [
  { key: 'title', label: 'Başlık' },
  { key: 'status', label: 'Durum' },
  { key: 'openedBy', label: 'Açan Kişi' },
  { key: 'createdAt', label: 'Tarih' }
];

const performanceColumns = [
  { key: 'rank', label: 'Sıra' },
  { key: 'agentName', label: 'Personel Adı', sortable: true },
  { key: 'resolvedTickets', label: 'Çözülen Talep Sayısı', sortable: true, class: 'text-right font-bold' }
];

const getRankColor = (index) => {
  if (index === 0) return 'text-amber-500';
  if (index === 1) return 'text-gray-400';
  if (index === 2) return 'text-amber-700';
  return 'text-gray-500';
};
</script>
