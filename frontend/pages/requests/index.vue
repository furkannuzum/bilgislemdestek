<!-- /requests/index.vue SAYFASININ NİHAİ İÇERİĞİ -->
<template>
  <div class="space-y-6">
    <!-- Başlık ve Buton -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Cihaz Talepleri
        </h1>
        <p v-if="authStore.user" class="mt-1 text-gray-500 dark:text-gray-400">
          {{
            authStore.userRole === "EndUser"
              ? "Oluşturduğunuz tüm cihaz taleplerini"
              : "Tüm cihaz taleplerini"
          }}
          buradan yönetebilirsiniz.
        </p>
      </div>
      <UButton
        to="/requests/new"
        icon="i-heroicons-plus-circle-20-solid"
        size="lg"
      >
        Yeni Cihaz Talebi Oluştur
      </UButton>
    </div>

    <!-- YENİ FİLTRELEME ALANI (İstenen tasarıma göre güncellendi) -->
    <UCard>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <!-- Arama Çubuğu (Daha geniş) -->
        <UFormGroup label="Ara" class="lg:col-span-2">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Başlık, Açıklama veya ID ile ara..."
          />
        </UFormGroup>

        <!-- Durum Filtresi -->
        <UFormGroup label="Durum">
          <USelectMenu
            v-model="selectedStatusObjects"
            :options="statusOptions"
            multiple
            placeholder="Tüm Durumlar"
          >
            <template #label>
              <span v-if="selectedStatusObjects.length" class="truncate">{{ selectedStatusObjects.length }} durum seçildi</span>
              <span v-else>Tüm Durumlar</span>
            </template>
          </USelectMenu>
        </UFormGroup>
        
        <!-- Filtreleri Temizle Butonu -->
        <UButton
            @click="clearFilters"
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-circle-solid"
            class="w-full justify-center"
            :disabled="!searchQuery && selectedStatusObjects.length === 0"
        >
            Filtreleri Temizle
        </UButton>
      </div>
    </UCard>

    <!-- Yükleme, Hata ve Boş Durumları -->
    <div v-if="pending" class="text-center py-20 text-gray-500 dark:text-gray-400">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin mx-auto mb-4" />
      Talepler yükleniyor...
    </div>
    <div v-else-if="error" class="text-center py-20 text-red-500">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 mx-auto mb-4" />
      Talepler yüklenirken bir hata oluştu.
    </div>
    
    <!-- TABLO (Değişiklik yok) -->
    <UCard v-else-if="filteredRequests && filteredRequests.length > 0" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <UTable
        :rows="filteredRequests"
        :columns="columns"
      >
        <template #requestId-data="{ row }">
          <ULink :to="`/requests/${row._id}`" class="text-primary-500 dark:text-primary-400 hover:underline font-medium">{{ row.requestId }}</ULink>
        </template>
        <template #specs-data="{ row }">
          <span class="block max-w-xs truncate" :title="row.specs">
            {{ row.specs }}
          </span>
        </template>
        <template #productCategory-data="{ row }">
          <span class="font-semibold">{{ row.productCategory?.name }}</span>
        </template>
        <template #status-data="{ row }">
          <UBadge :color="statusMap[row.status]?.color || 'gray'" variant="soft">
            {{ statusMap[row.status]?.label || row.status }}
          </UBadge>
        </template>
        <template #requestedBy-data="{ row }">
          <span>{{ row.requestedBy?.fullName }}</span>
        </template>
        <template #createdAt-data="{ row }">
          <span>{{ new Date(row.createdAt).toLocaleDateString("tr-TR") }}</span>
        </template>
        <template #actions-data="{ row }">
            <UDropdown :items="[[{ label: 'Detayları Görüntüle', icon: 'i-heroicons-eye-20-solid', click: () => navigateTo(`/requests/${row._id}`) }]]">
              <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
            </UDropdown>
        </template>
      </UTable>
    </UCard>
    
    <!-- Boş Filtre Sonucu Durumu -->
    <UCard v-else>
        <div class="flex flex-col items-center justify-center py-12 text-center">
            <UIcon name="i-heroicons-circle-stack" class="w-12 h-12 text-gray-400 mb-4" />
            <p class="text-lg font-medium text-gray-600 dark:text-gray-300">Aramanla Eşleşen Talep Bulunamadı</p>
            <p class="text-sm text-gray-400 mt-1">Filtrelerinizi temizleyerek tekrar deneyin.</p>
        </div>
    </UCard>
    
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "~/stores/auth";

definePageMeta({ layout: "default", middleware: "auth" });

const authStore = useAuthStore();
const navigateTo = useNuxtApp().$router.push;

const columns = [
  { key: "requestId", label: "Talep ID", sortable: true },
  { key: "productCategory", label: "Kategori", sortable: true },
  { key: "specs", label: "Açıklama" },
  { key: "status", label: "Durum", sortable: true },
  { key: "requestedBy", label: "Talep Eden", sortable: true },
  { key: "createdAt", label: "Tarih", sortable: true },
  { key: "actions", label: "" },
];

const { data: requestsData, pending, error } = useFetch("/api/devicerequests", {
  lazy: true,
});

const searchQuery = ref("");
const selectedStatusObjects = ref([]);

const statusOptions = [
  { label: "Onay Bekliyor", value: "PendingApproval" },
  { label: "Onaylandı", value: "Approved" },
  { label: "Reddedildi", value: "Rejected" },
  { label: "Sipariş Edildi", value: "Ordered" },
  { label: "Teslim Edildi", value: "Delivered" },
  { label: "İptal Edildi", value: "Cancelled" },
];

const statusMap = {
  PendingApproval: { label: 'Onay Bekliyor', color: 'amber' },
  Approved: { label: 'Onaylandı', color: 'blue' },
  Rejected: { label: 'Reddedildi', color: 'red' },
  Ordered: { label: 'Sipariş Edildi', color: 'purple' },
  Delivered: { label: 'Teslim Edildi', color: 'green' },
  Cancelled: { label: 'İptal Edildi', color: 'gray' },
};

// Filtrelenmiş talepleri hesaplayan computed property
const filteredRequests = computed(() => {
  if (!requestsData.value?.data) return [];
  
  let requests = requestsData.value.data;
  
  // ARAMA MANTIĞI GÜNCELLENDİ (Açıklama ve Kategoriye göre de arama)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    requests = requests.filter((request) =>
      request.requestId.toLowerCase().includes(query) ||
      (request.specs && request.specs.toLowerCase().includes(query)) ||
      (request.productCategory?.name && request.productCategory.name.toLowerCase().includes(query))
    );
  }
  
  const statusValues = selectedStatusObjects.value.map(status => status.value);
  if (statusValues.length > 0) {
    requests = requests.filter((request) =>
      statusValues.includes(request.status)
    );
  }

  return requests;
});

function clearFilters() {
    searchQuery.value = "";
    selectedStatusObjects.value = [];
}
</script>