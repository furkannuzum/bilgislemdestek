<!-- frontend1/pages/requests/index.vue (GÜNCEL VE HATASIZ HALİ) -->
<template>
  <div class="space-y-6">
    <!-- Sayfa Başlığı ve Yeni Talep Butonu -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold">Cihaz Talepleri</h1>
        <!-- 
          GÜNCELLEME:
          `authStore.user` objesi var olmadan `authStore.userRole`'ü okumaya çalışmamak için
          bir `v-if` kontrolü ekliyoruz.
        -->
        <p v-if="authStore.user" class="mt-1 text-gray-500">
           {{ authStore.userRole === 'EndUser' ? 'Oluşturduğunuz tüm cihaz taleplerini' : 'Tüm cihaz taleplerini' }} buradan yönetebilirsiniz.
        </p>
      </div>
      <UButton to="/requests/new" icon="i-heroicons-plus-circle-20-solid" size="lg">
        Yeni Cihaz Talebi Oluştur
      </UButton>
    </div>

    <!-- Filtreleme ve Arama Alanı -->
    <UCard>
      <div class="flex items-center space-x-4">
        <UInput v-model="searchQuery" class="flex-grow" icon="i-heroicons-magnifying-glass" placeholder="Talep ID'sine göre ara..." />
        <USelectMenu v-model="selectedStatuses" :options="statusOptions" multiple placeholder="Duruma Göre Filtrele" />
      </div>
    </UCard>

    <!-- Talepleri Listeleyen Tablo -->
    <div v-if="pending" class="text-center py-10">Talepler yükleniyor...</div>
    <div v-else-if="error" class="text-center py-10 text-red-500">Talepler yüklenirken bir hata oluştu.</div>
    <div v-else>
      <UTable :rows="filteredRequests" :columns="columns" :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'Gösterilecek cihaz talebi bulunamadı.' }">
        <!-- Durum (Status) Sütununu Özelleştirme -->
        <template #status-data="{ row }">
          <UBadge :color="statusColors[row.status] || 'gray'" variant="soft">{{ row.status }}</UBadge>
        </template>
        
        <!-- Kategori (productCategory) Sütununu Özelleştirme -->
        <template #productCategory-data="{ row }">
          <span v-if="row.productCategory">{{ row.productCategory.name }}</span>
        </template>

        <!-- Talep Eden (requestedBy) Sütununu Özelleştirme -->
        <template #requestedBy-data="{ row }">
          <span v-if="row.requestedBy">{{ row.requestedBy.fullName }}</span>
        </template>

        <!-- Oluşturulma Tarihi Sütununu Formatlama -->
         <template #createdAt-data="{ row }">
          <span>{{ new Date(row.createdAt).toLocaleDateString('tr-TR') }}</span>
        </template>
      </UTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';

definePageMeta({ layout: 'default', middleware: 'auth' });

const authStore = useAuthStore();

// --- Tablo Sütunlarını Tanımlama ---
const columns = [
  { key: 'requestId', label: 'Talep ID' },
  { key: 'productCategory', label: 'Ürün Kategorisi' },
  { key: 'status', label: 'Durum' },
  { key: 'requestedBy', label: 'Talep Eden' },
  { key: 'createdAt', label: 'Oluşturulma Tarihi' },
];

// --- Veri Çekme ---
const { data: requestsData, pending, error } = await useFetch('/api/devicerequests', {
  lazy: true,
  headers: { Authorization: `Bearer ${authStore.token}` }
});

// --- Filtreleme Mantığı ---
const searchQuery = ref('');
const statusOptions = ['PendingApproval', 'Approved', 'Rejected', 'Ordered', 'Delivered', 'Cancelled'];
const selectedStatuses = ref([]);

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

// --- Renk Eşleştirmeleri ---
const statusColors = {
  PendingApproval: 'orange',
  Approved: 'green',
  Rejected: 'red',
  Ordered: 'blue',
  Delivered: 'teal',
  Cancelled: 'gray'
};
</script>