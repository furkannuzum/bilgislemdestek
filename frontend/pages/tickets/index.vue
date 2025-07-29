<!-- /tickets/index.vue SAYFASININ NİHAİ İÇERİĞİ -->
<template>
  <div class="space-y-6">
    <!-- Başlık ve Buton -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Destek Talepleri
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Tüm destek taleplerini buradan yönetebilirsiniz.
        </p>
      </div>
      <UButton
        to="/tickets/new"
        icon="i-heroicons-plus-circle-20-solid"
        size="lg"
      >
        Yeni Destek Talebi Oluştur
      </UButton>
    </div>

    <!-- Filtreler (USelectMenu ile güncellendi) -->
    <UCard>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <UFormGroup label="Ara">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass-20-solid"
            placeholder="Başlık veya ID ile ara..."
          />
        </UFormGroup>
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
        <UFormGroup label="Öncelik">
          <USelectMenu
            v-model="selectedPriorityObjects"
            :options="priorityOptions"
            multiple
            placeholder="Tüm Öncelikler"
          >
             <template #label>
              <span v-if="selectedPriorityObjects.length" class="truncate">{{ selectedPriorityObjects.length }} öncelik seçildi</span>
              <span v-else>Tüm Öncelikler</span>
            </template>
          </USelectMenu>
        </UFormGroup>
        <UButton
          @click="clearFilters"
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-circle-20-solid"
          class="w-full justify-center"
          :disabled="!searchQuery && selectedStatusObjects.length === 0 && selectedPriorityObjects.length === 0"
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
    
    <!-- TABLO -->
    <UCard v-else-if="filteredTickets && filteredTickets.length > 0" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <UTable :rows="filteredTickets" :columns="columns">
          <!-- AÇIKLAMA SÜTUNU İÇİN ÖZEL TEMPLATE - İSTENEN DEĞİŞİKLİK BURADA -->
          <template #description-data="{ row }">
            <span class="block max-w-sm truncate" :title="row.description">
              {{ row.description }}
            </span>
          </template>

          <!-- Diğer Sütunlar için Özel Template'ler -->
          <template #title-data="{ row }">
            <ULink :to="`/tickets/${row._id}`" class="text-primary-500 dark:text-primary-400 hover:underline font-medium">{{ row.title }}</ULink>
          </template>
          <template #status-data="{ row }">
            <UBadge :color="statusMap[row.status]?.color || 'gray'" variant="soft">{{ statusMap[row.status]?.label || row.status }}</UBadge>
          </template>
          <template #priority-data="{ row }">
            <UBadge :color="priorityMap[row.priority]?.color || 'gray'" variant="soft">{{ priorityMap[row.priority]?.label || row.priority }}</UBadge>
          </template>
          <template #openedBy-data="{ row }">
            <span>{{ row.openedBy?.fullName || 'N/A' }}</span>
          </template>
          <template #assignedTo-data="{ row }">
            <span v-if="row.assignedTo">{{ row.assignedTo.fullName }}</span>
            <span v-else class="text-gray-400 italic">Atanmadı</span>
          </template>
          <template #createdAt-data="{ row }">
            <span>{{ new Date(row.createdAt).toLocaleDateString('tr-TR') }}</span>
          </template>
          <template #actions-data="{ row }">
            <UDropdown :items="[[{ label: 'Detayları Görüntüle', icon: 'i-heroicons-eye-20-solid', click: () => navigateTo(`/tickets/${row._id}`) }]]">
              <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
            </UDropdown>
          </template>
      </UTable>
    </UCard>
    
    <!-- Boş Filtre Sonucu -->
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

// SÜTUNLAR - Responsive sınıflar eklendi, Başlık tıkla-git olacak şekilde düzenlendi.
const columns = [
  { key: "ticketId", label: "Talep ID", class: "hidden lg:table-cell" },
  { key: "title", label: "Başlık", sortable: true },
  { key: "description", label: "Açıklama", class: "hidden lg:table-cell" },
  { key: "status", label: "Durum", sortable: true },
  { key: "priority", label: "Öncelik", sortable: true },
  { key: "openedBy", label: "Açan", class: "hidden xl:table-cell", sortable: true },
  { key: "assignedTo", label: "Atanan", class: "hidden xl:table-cell", sortable: true },
  { key: "createdAt", label: "Tarih", class: "hidden md:table-cell", sortable: true },
  { key: "actions", label: "" },
];

const { data: ticketsData, pending, error } = useFetch("/api/tickets", {
  lazy: true,
  // headers: computed(() => ({ Authorization: `Bearer ${authStore.token}` })),
});

// FİLTRELEME - USelectMenu'ya uyumlu hale getirildi.
const searchQuery = ref("");
const selectedStatusObjects = ref([]);
const selectedPriorityObjects = ref([]);

const statusOptions = [
  { label: 'Yeni', value: 'New' },
  { label: 'İşlemde', value: 'InProgress' },
  { label: 'Çözüldü', value: 'Resolved' },
  { label: 'Kapandı', value: 'Closed' },
  { label: 'İptal Edildi', value: 'Cancelled' }
];
const priorityOptions = [
  { label: 'Düşük', value: 'Low' },
  { label: 'Orta', value: 'Medium' },
  { label: 'Yüksek', value: 'High' }
];

const statusMap = {
  New: { label: 'Yeni', color: 'blue' },
  InProgress: { label: 'İşlemde', color: 'amber' },
  Resolved: { label: 'Çözüldü', color: 'green' },
  Closed: { label: 'Kapandı', color: 'gray' },
  Cancelled: { label: 'İptal Edildi', color: 'red' }
};
const priorityMap = {
  Low: { label: 'Düşük', color: 'green' },
  Medium: { label: 'Orta', color: 'amber' },
  High: { label: 'Yüksek', color: 'red' }
};

// FİLTRELENMİŞ VERİ HESAPLAMASI - USelectMenu'ya göre güncellendi.
const filteredTickets = computed(() => {
  if (!ticketsData.value?.data) return [];
  
  let tickets = ticketsData.value.data;

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase().trim();
    tickets = tickets.filter(t => t.title.toLowerCase().includes(q) || t.ticketId.toLowerCase().includes(q));
  }

  const statusValues = selectedStatusObjects.value.map(s => s.value);
  if (statusValues.length > 0) {
    tickets = tickets.filter(t => statusValues.includes(t.status));
  }
  
  const priorityValues = selectedPriorityObjects.value.map(p => p.value);
  if (priorityValues.length > 0) {
    tickets = tickets.filter(t => priorityValues.includes(t.priority));
  }
  
  return tickets;
});

function clearFilters() {
  searchQuery.value = "";
  selectedStatusObjects.value = [];
  selectedPriorityObjects.value = [];
}
</script>