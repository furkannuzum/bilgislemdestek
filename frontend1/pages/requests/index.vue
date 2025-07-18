<template>
  <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Başlık ve Buton -->
    <div
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6"
    >
      <div>
        <h1
          class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100"
        >
          Cihaz Talepleri
        </h1>
        <p v-if="authStore.user" class="mt-1 text-gray-500">
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
        class="inline-flex items-center rounded-full px-6 py-3 font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow"
      >
        Yeni Cihaz Talebi Oluştur
      </UButton>
    </div>

    <!-- Filtreleme ve Arama Alanı -->
    <UCard class="mb-6 shadow-sm border-gray-200 dark:border-gray-800">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormGroup label="Talep ID'sine Göre Ara">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Talep ID'si girin..."
          />
        </UFormGroup>

        <UFormGroup label="Duruma Göre Filtrele">
          <USelectMenu
            v-model="selectedStatuses"
            :options="statusOptions"
            multiple
            placeholder="Tüm Durumlar"
            value-attribute="value"
            option-attribute="label"
            :ui="{ popper: { strategy: 'fixed' } }"
          />
        </UFormGroup>
      </div>
    </UCard>

    <!-- TABLO veya BOŞ DURUM GÖSTERİMİ -->
    <div v-if="pending" class="text-center py-20 text-gray-500">
      Talepler yükleniyor...
    </div>
    <div v-else-if="error" class="text-center py-20 text-red-500">
      Talepler yüklenirken bir hata oluştu.
    </div>
    
    <div v-else-if="filteredRequests && filteredRequests.length > 0" class="flex justify-center">
      <div
        class="overflow-x-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      >
        <UTable
          :rows="filteredRequests"
          :columns="columns"
        >
          <template #requestId-data="{ row }">
            <span class="text-blue-600 font-medium">{{ row.requestId }}</span>
          </template>

          <template #productCategory-data="{ row }">
            <span class="font-semibold" :title="row.productCategory?.name">{{
              row.productCategory?.name
            }}</span>
          </template>

          <template #status-data="{ row }">
            <UBadge :color="statusColors[row.status] || 'gray'" variant="soft">
              {{ statusTranslations[row.status] || row.status }}
            </UBadge>
          </template>

          <template #requestedBy-data="{ row }">
            <span class="hidden md:table-cell">{{
              row.requestedBy?.fullName
            }}</span>
          </template>

          <template #createdAt-data="{ row }">
            <span class="hidden md:table-cell">{{
              new Date(row.createdAt).toLocaleDateString("tr-TR")
            }}</span>
          </template>
        </UTable>
      </div>
    </div>
    
    <div v-else class="flex justify-center">
        <div class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col items-center justify-center py-20 text-center w-full">
            <UIcon name="i-heroicons-circle-stack-20-solid" class="w-12 h-12 text-gray-400 mb-4" />
            <p class="text-lg font-medium text-gray-600 dark:text-gray-300">Gösterilecek Cihaz Talebi Bulunamadı</p>
            <p class="text-sm text-gray-400 mt-1">Filtrelerinizi kontrol edin veya yeni bir talep oluşturun.</p>
        </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "~/stores/auth";

definePageMeta({ layout: "default", middleware: "auth" });

const authStore = useAuthStore();

const columns = [
  { key: "requestId", label: "Talep ID" },
  { key: "productCategory", label: "Kategori" },
  { key: "status", label: "Durum" },
  { key: "requestedBy", label: "Talep Eden", class: "hidden md:table-cell" },
  { key: "createdAt", label: "Tarih", class: "hidden md:table-cell" },
];

const {
  data: requestsData,
  pending,
  error,
} = await useFetch("/api/devicerequests", {
  lazy: true,
  headers: { Authorization: `Bearer ${authStore.token}` },
});

const searchQuery = ref("");

const statusOptions = [
  { label: "Onay Bekliyor", value: "PendingApproval" },
  { label: "Onaylandı", value: "Approved" },
  { label: "Reddedildi", value: "Rejected" },
  { label: "Sipariş Edildi", value: "Ordered" },
  { label: "Teslim Edildi", value: "Delivered" },
  { label: "İptal Edildi", value: "Cancelled" },
];
const selectedStatuses = ref([]);

const statusTranslations = {
  PendingApproval: "Onay Bekliyor",
  Approved: "Onaylandı",
  Rejected: "Reddedildi",
  Ordered: "Sipariş Edildi",
  Delivered: "Teslim Edildi",
  Cancelled: "İptal Edildi",
};

const statusColors = {
  PendingApproval: "orange",
  Approved: "green",
  Rejected: "red",
  Ordered: "blue",
  Delivered: "teal",
  Cancelled: "gray",
};

const filteredRequests = computed(() => {
  let requests = requestsData.value?.data || [];

  if (searchQuery.value) {
    requests = requests.filter((request) =>
      request.requestId.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  if (selectedStatuses.value.length > 0) {
    requests = requests.filter((request) =>
      selectedStatuses.value.includes(request.status)
    );
  }

  return requests;
});
</script>