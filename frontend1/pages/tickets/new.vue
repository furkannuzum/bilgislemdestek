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

    <!-- Filtreleme ve Arama Alanı (YENİ YAPI) -->
    <UCard class="mb-6 shadow-none border border-gray-100 bg-white">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Arama Alanı -->
        <UFormGroup label="Talep ID">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            size="lg"
            placeholder="Talep ID'sine göre ara..."
          />
        </UFormGroup>
        
        <!-- Durum Filtresi (İSTEDİĞİNİZ YAPI) -->
        <UFormGroup label="Durum">
          <USelect
            v-model="selectedStatus"
            :options="statusFilterOptions"
            option-attribute="label"
            value-attribute="value"
            placeholder="Tüm Durumlar"
            size="lg"
            clearable
          />
        </UFormGroup>

        <!-- Bu kısım boş bırakılabilir veya başka bir filtre eklenebilir -->
        <div></div>
      </div>
    </UCard>

    <!-- TABLO -->
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
          <!-- Talep Eden -->
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

// --- FİLTRELEME DEĞİŞİKLİKLERİ ---

const searchQuery = ref('');

// v-model artık tek bir değer tutacak (önceki gibi bir dizi değil)
const selectedStatus = ref(''); // veya ref()

// Filtre seçenekleri. `clearable` düzgün çalışsın diye başına "Tüm Durumlar" ekledim.
const statusFilterOptions = [
  { label: 'Tüm Durumlar', value: '' }, // Filtreyi temizlemek için
  { label: 'Onay Bekliyor', value: 'PendingApproval' },
  { label: 'Onaylandı', value: 'Approved' },
  { label: 'Reddedildi', value: 'Rejected' },
  { label: 'Sipariş Edildi', value: 'Ordered' },
  { label: 'Teslim Edildi', value: 'Delivered' },
  { label: 'İptal Edildi', value: 'Cancelled' }
];

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

// Filtreleme mantığı tekli seçime göre güncellendi
const filteredRequests = computed(() => {
  let requests = requestsData.value?.data || [];
  
  // Arama filtresi (değişiklik yok)
  if (searchQuery.value) {
    requests = requests.filter(request =>
      request.requestId.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  // Durum filtresi (artık tek bir değere göre kontrol ediyor)
  if (selectedStatus.value) {
    requests = requests.filter(request => request.status === selectedStatus.value);
  }
  
  return requests;
});
</script>