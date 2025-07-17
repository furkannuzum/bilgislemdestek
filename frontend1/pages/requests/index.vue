<template>
  <div class="w-full max-w-7xl mx-auto px-2 py-6">

    <!-- Başlık ve Buton -->
    <div class="flex flex-wrap justify-between items-center gap-4 mb-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Cihaz Talepleri</h1>
        <p v-if="authStore.user" class="mt-5 mb-5 text-gray-500">
           {{ authStore.userRole === 'EndUser' ? 'Oluşturduğunuz tüm cihaz taleplerini' : 'Tüm cihaz taleplerini' }} buradan yönetebilirsiniz.
        </p>
      </div>
      <UButton
        to="/requests/new"
        icon="i-heroicons-plus-circle-20-solid"
        size="lg"
        class="rounded-full px-6 py-3 font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow"
      >
        Yeni Cihaz Talebi Oluştur
      </UButton>
    </div>

    <!-- Filtreleme ve Arama Alanı -->
    <UCard class="mb-6 shadow-none border border-gray-100 bg-white">
      <div class="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div class="flex-1 flex items-center">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            size="lg"
            placeholder="Talep ID'sine göre ara..."
            :ui="{
              base: 'w-full',
              rounded: 'rounded-full',
              color: { white: { outline: 'bg-gray-100 border-0' } },
              ring: 'focus:ring-2 focus:ring-inset focus:ring-blue-500',
              padding: { lg: 'py-3' }
            }"
          />
        </div>
        <div class="flex-1 flex items-center">
          <USelectMenu
            v-model="selectedStatuses"
            :options="statusOptions"
            multiple
            size="lg"
            placeholder="Duruma Göre Filtrele"
            value-attribute="value"
            option-attribute="label"
            :popper="{ placement: 'bottom-end' }"
            :ui="{
              base: 'w-full',
              rounded: 'rounded-full',
              color: { white: { outline: 'bg-gray-100 border-0' } },
              ring: 'focus:ring-2 focus:ring-inset focus:ring-blue-500',
              padding: { lg: 'py-3' }
            }"
          />
        </div>
      </div>
    </UCard>

    <!-- TABLO (responsive ve kaydırmasız) -->
    <div v-if="pending" class="text-center py-10 text-gray-500">Talepler yükleniyor...</div>
    <div v-else-if="error" class="text-center py-10 text-red-500">Talepler yüklenirken bir hata oluştu.</div>
    <div v-else>
      <div class="overflow-x-auto rounded-2xl shadow border border-gray-100 bg-white">
        <UTable
          :rows="filteredRequests"
          :columns="columns"
          :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'Gösterilecek cihaz talebi bulunamadı.' }"
          class="min-w-full"
        >
          <!-- Talep ID -->
          <template #requestId-data="{ row }">
            <span class="text-blue-600 font-medium">{{ row.requestId }}</span>
          </template>
          <!-- Ürün Kategorisi -->
          <template #productCategory-data="{ row }">
            <span class="block max-w-[120px] truncate" :title="row.productCategory?.name">{{ row.productCategory?.name }}</span>
          </template>
          <!-- Durum -->
          <template #status-data="{ row }">
            <UBadge
              :color="statusColors[row.status] || 'gray'"
              variant="soft"
              class="rounded-full px-2 py-1 text-xs"
            >
              {{ statusTranslations[row.status] || row.status }}
            </UBadge>
          </template>
          <!-- Talep Eden (md ve üstünde göster) -->
          <template #requestedBy-data="{ row }">
            <span class="hidden md:inline">{{ row.requestedBy?.fullName }}</span>
          </template>
          <!-- Oluşturulma Tarihi -->
          <template #createdAt-data="{ row }">
            {{ new Date(row.createdAt).toLocaleDateString('tr-TR') }}
          </template>
        </UTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';

definePageMeta({ layout: 'default', middleware: 'auth' });

const authStore = useAuthStore();

// Tablo sütunları
const columns = [
  { key: 'requestId', label: 'Talep ID' },
  { key: 'productCategory', label: 'Kategori' },
  { key: 'status', label: 'Durum' },
  { key: 'requestedBy', label: 'Talep Eden' },
  { key: 'createdAt', label: 'Tarih' }
];

const { data: requestsData, pending, error } = await useFetch('/api/devicerequests', {
  lazy: true,
  headers: { Authorization: `Bearer ${authStore.token}` }
});

const searchQuery = ref('');

// Filtreleme için durum seçenekleri (Türkçeleştirildi)
const statusOptions = [
  { label: 'Onay Bekliyor', value: 'PendingApproval' },
  { label: 'Onaylandı', value: 'Approved' },
  { label: 'Reddedildi', value: 'Rejected' },
  { label: 'Sipariş Edildi', value: 'Ordered' },
  { label: 'Teslim Edildi', value: 'Delivered' },
  { label: 'İptal Edildi', value: 'Cancelled' }
];
const selectedStatuses = ref([]);

// Tablodaki durumları Türkçeleştirmek için harita
const statusTranslations = {
  PendingApproval: 'Onay Bekliyor',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  Ordered: 'Sipariş Edildi',
  Delivered: 'Teslim Edildi',
  Cancelled: 'İptal Edildi'
};

const statusColors = {
  PendingApproval: 'orange',
  Approved: 'green',
  Rejected: 'red',
  Ordered: 'blue',
  Delivered: 'teal',
  Cancelled: 'gray'
};

const filteredRequests = computed(() => {
  let requests = requestsData.value?.data || [];
  
  // Arama filtresi
  if (searchQuery.value) {
    requests = requests.filter(request =>
      request.requestId.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  // Durum filtresi
  if (selectedStatuses.value.length > 0) {
    requests = requests.filter(request => selectedStatuses.value.includes(request.status));
  }
  
  return requests;
});
</script>

<!-- STYLE BLOĞU TAMAMEN KALDIRILDI -->