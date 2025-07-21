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
          Destek Talepleri
        </h1>
        <p v-if="authStore.user" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Tüm destek taleplerini buradan yönetebilirsiniz.
        </p>
      </div>
      <UButton
        to="/tickets/new"
        icon="i-heroicons-plus-circle-20-solid"
        size="lg"
        class="flex-shrink-0"
        :ui="{ rounded: 'rounded-full', font: 'font-semibold' }"
      >
        Yeni Destek Talebi Oluştur
      </UButton>
    </div>

    <!-- Filtreler -->
    <UCard :ui="{ body: { padding: 'px-4 py-4 sm:p-6' } }" class="mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <UFormGroup label="Ara" :ui="{ label: { base: 'font-semibold' } }">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass-20-solid"
            placeholder="Başlık veya ID ile ara..."
          />
        </UFormGroup>

        <UFormGroup label="Durum" :ui="{ label: { base: 'font-semibold' } }">
          <!--
            İŞTE DÜZELTME BURADA:
            'relative' ve 'z-20' sınıflarını ekledik.
            'z-20', bu elemente yüksek bir katman seviyesi verir.
            'relative', z-index'in çalışması için gereklidir.
            Böylece popover, her zaman tablonun ÜSTÜNDE açılır.
          -->
          <UPopover :popper="{ placement: 'bottom-start' }" class="relative z-20">
            <UButton
              icon="i-heroicons-chevron-down-20-solid"
              trailing
              color="white"
              :label="statusButtonLabel"
              class="w-full justify-between"
            />
            <template #panel>
              <div class="p-4 space-y-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Duruma göre filtrele</p>
                <UCheckbox
                  v-for="option in statusOptions"
                  :key="option.value"
                  v-model="selectedStatuses"
                  :value="option.value"
                  :label="option.label"
                  class="mb-1"
                />
              </div>
            </template>
          </UPopover>
        </UFormGroup>

        <UFormGroup label="Öncelik" :ui="{ label: { base: 'font-semibold' } }">
           <!-- AYNI DÜZELTME BURAYA DA UYGULANDI -->
          <UPopover :popper="{ placement: 'bottom-start' }" class="relative z-20">
            <UButton
              icon="i-heroicons-chevron-down-20-solid"
              trailing
              color="white"
              :label="priorityButtonLabel"
              class="w-full justify-between"
            />
            <template #panel>
              <div class="p-4 space-y-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                 <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Önceliğe göre filtrele</p>
                <UCheckbox
                  v-for="option in priorityOptions"
                  :key="option.value"
                  v-model="selectedPriorities"
                  :value="option.value"
                  :label="option.label"
                   class="mb-1"
                />
              </div>
            </template>
          </UPopover>
        </UFormGroup>

        <UButton
          @click="clearFilters"
          color="gray"
          variant="outline"
          icon="i-heroicons-x-circle-20-solid"
        >
          Filtreleri Temizle
        </UButton>
      </div>
    </UCard>

    <!-- TABLO KISMI DÜZELTİLDİ: Verilerin doğru gösterimi için slotlar eklendi -->
    <div v-if="pending" class="text-center py-20 text-gray-500">
      Talepler yükleniyor...
    </div>
    <div v-else-if="error" class="text-center py-20 text-red-500">
      Talepler yüklenirken bir hata oluştu.
    </div>
    <div v-else-if="filteredTickets && filteredTickets.length > 0">
      <UCard :ui="{ body: { padding: '' }, divide: 'divide-y divide-gray-200 dark:divide-gray-800' }">
        <UTable :rows="filteredTickets" :columns="columns">
            <template #status-data="{ row }">
              <UBadge :color="statusColors[row.status]" variant="soft">{{ statusTranslations[row.status] || row.status }}</UBadge>
            </template>
            <template #priority-data="{ row }">
              <UBadge :color="priorityColors[row.priority]" variant="soft">{{ priorityTranslations[row.priority] || row.priority }}</UBadge>
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
              <UDropdown :items="[[{ label: 'Detayları Görüntüle', icon: 'i-heroicons-eye-20-solid', to: `/tickets/${row._id}` }]]">
                <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
              </UDropdown>
            </template>
        </UTable>
      </UCard>
    </div>
    <div v-else>
      <!-- Boş durum mesajı -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "~/stores/auth";

definePageMeta({ layout: "default", middleware: "auth" });

const authStore = useAuthStore();

const columns = [
  { key: "ticketId", label: "Talep ID", sortable: true },
  { key: "title", label: "Başlık", sortable: true },
  { key: "description", label: "Açıklama", class: "hidden lg:table-cell" },
  { key: "status", label: "Durum", sortable: true },
  { key: "priority", label: "Öncelik", sortable: true },
  { key: "openedBy", label: "Açan", class: "hidden xl:table-cell", sortable: true },
  { key: "assignedTo", label: "Atanan", class: "hidden xl:table-cell", sortable: true },
  { key: "createdAt", label: "Tarih", class: "hidden md:table-cell", sortable: true },
  { key: "actions", label: "İşlemler", class: 'text-right' },
];

const { data: ticketsData, pending, error } = await useFetch("/api/tickets", {
  lazy: true,
  headers: computed(() => ({ Authorization: `Bearer ${authStore.token}` })),
});

const searchQuery = ref("");
const selectedStatuses = ref([]);
const selectedPriorities = ref([]);

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
  { label: 'Yüksek', value: 'High' },
  { label: 'Acil', value: 'Urgent' }
];

const statusButtonLabel = computed(() => selectedStatuses.value.length ? `Durum (${selectedStatuses.value.length})` : 'Tüm Durumlar');
const priorityButtonLabel = computed(() => selectedPriorities.value.length ? `Öncelik (${selectedPriorities.value.length})` : 'Tüm Öncelikler');

const filteredTickets = computed(() => {
  let tickets = ticketsData.value?.data || [];
  if (!tickets) return [];
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase().trim();
    tickets = tickets.filter(t => t.title.toLowerCase().includes(q) || t.ticketId.toLowerCase().includes(q));
  }
  if (selectedStatuses.value.length > 0) {
    tickets = tickets.filter(t => selectedStatuses.value.includes(t.status));
  }
  if (selectedPriorities.value.length > 0) {
    tickets = tickets.filter(t => selectedPriorities.value.includes(t.priority));
  }
  return tickets;
});

function clearFilters() {
  searchQuery.value = "";
  selectedStatuses.value = [];
  selectedPriorities.value = [];
}

const statusTranslations = { New: 'Yeni', InProgress: 'İşlemde', Resolved: 'Çözüldü', Closed: 'Kapandı', Cancelled: 'İptal Edildi' };
const priorityTranslations = { Low: 'Düşük', Medium: 'Orta', High: 'Yüksek', Urgent: 'Acil' };
const statusColors = { New: "blue", InProgress: "orange", Resolved: "green", Closed: "gray", Cancelled: "red" };
const priorityColors = { Low: "green", Medium: "yellow", High: "orange", Urgent: "red" };
</script> 