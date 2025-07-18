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
        <p v-if="authStore.user" class="mt-1 text-gray-500">
          {{
            authStore.userRole === "EndUser"
              ? "Oluşturduğunuz tüm destek taleplerini"
              : "Tüm destek taleplerini"
          }}
          buradan yönetebilirsiniz.
        </p>
      </div>
      <UButton
        to="/tickets/new"
        icon="i-heroicons-plus-circle-20-solid"
        size="lg"
        class="inline-flex items-center rounded-full px-6 py-3 font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow"
      >
        Yeni Destek Talebi Oluştur
      </UButton>
    </div>

    <!-- Filtreler -->
    <UCard class="mb-6 shadow-sm border-gray-200 dark:border-gray-800">
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
      >
        <UFormGroup label="Ara">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Başlıkta veya ID'de ara..."
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

        <UFormGroup label="Önceliğe Göre Filtrele">
          <USelectMenu
            v-model="selectedPriorities"
            :options="priorityOptions"
            multiple
            placeholder="Tüm Öncelikler"
            value-attribute="value"
            option-attribute="label"
            :ui="{ popper: { strategy: 'fixed' } }"
          />
        </UFormGroup>

        <UButton
          @click="clearFilters"
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-circle"
          class="w-full justify-center"
        >
          Filtreleri Temizle
        </UButton>
      </div>
    </UCard>

    <!-- TABLO veya BOŞ DURUM GÖSTERİMİ -->
    <div v-if="pending" class="text-center py-20 text-gray-500">
      Talepler yükleniyor...
    </div>
    <div v-else-if="error" class="text-center py-20 text-red-500">
      Talepler yüklenirken bir hata oluştu.
    </div>

    <div v-else-if="filteredTickets && filteredTickets.length > 0">
      <div
        class="overflow-x-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      >
        <UTable :rows="filteredTickets" :columns="columns">
          <template #title-data="{ row }">
            <span class="font-semibold" :title="row.title">{{
              row.title
            }}</span>
          </template>

          <template #description-data="{ row }">
            <span
              class="hidden lg:table-cell max-w-[140px] truncate"
              :title="row.description"
              >{{ row.description }}</span
            >
          </template>

          <template #attachment-data="{ row }">
            <div
              v-if="row.attachments && row.attachments[0]"
              class="hidden md:table-cell"
            >
              <img
                :src="row.attachments[0]"
                alt="Ek"
                class="h-10 w-10 object-cover rounded-lg border border-gray-200"
              />
            </div>
          </template>

          <template #status-data="{ row }">
            <UBadge :color="statusColors[row.status]" variant="soft">{{
              statusTranslations[row.status] || row.status
            }}</UBadge>
          </template>

          <template #priority-data="{ row }">
            <UBadge :color="priorityColors[row.priority]" variant="soft">{{
              priorityTranslations[row.priority] || row.priority
            }}</UBadge>
          </template>

          <template #openedBy-data="{ row }">
            <span class="hidden xl:table-cell">{{
              row.openedBy?.fullName
            }}</span>
          </template>

          <template #assignedTo-data="{ row }">
            <span v-if="row.assignedTo" class="hidden xl:table-cell">{{
              row.assignedTo.fullName
            }}</span>
            <span v-else class="text-gray-400 hidden xl:table-cell"
              >Atanmadı</span
            >
          </template>

          <template #createdAt-data="{ row }">
            <span class="hidden md:table-cell">{{
              new Date(row.createdAt).toLocaleDateString("tr-TR")
            }}</span>
          </template>

          <template #actions-data="{ row }">
            <UDropdown
              :items="[
                [
                  {
                    label: 'Detayları Görüntüle',
                    icon: 'i-heroicons-magnifying-glass',
                  },
                ],
              ]"
            >
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-ellipsis-horizontal-20-solid"
              />
            </UDropdown>
          </template>
        </UTable>
      </div>
    </div>

    <div
      v-else
      class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col items-center justify-center py-20 text-center"
    >
      <UIcon
        name="i-heroicons-circle-stack-20-solid"
        class="w-12 h-12 text-gray-400 mb-4"
      />
      <p class="text-lg font-medium text-gray-600 dark:text-gray-300">
        Gösterilecek Destek Talebi Bulunamadı
      </p>
      <p class="text-sm text-gray-400 mt-1">
        Filtrelerinizi kontrol edin veya yeni bir talep oluşturun.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "~/stores/auth";

definePageMeta({ layout: "default", middleware: "auth" });

const authStore = useAuthStore();

const columns = [
  { key: "ticketId", label: "Talep ID" },
  { key: "title", label: "Başlık" },
  { key: "description", label: "Açıklama", class: "hidden lg:table-cell" },
  { key: "attachment", label: "Foto", class: "hidden md:table-cell" },
  { key: "status", label: "Durum" },
  { key: "priority", label: "Öncelik" },
  { key: "openedBy", label: "Açan", class: "hidden xl:table-cell" },
  { key: "assignedTo", label: "Atanan", class: "hidden xl:table-cell" },
  { key: "createdAt", label: "Tarih", class: "hidden md:table-cell" },
  { key: "actions", label: "İşlemler" },
];

const {
  data: ticketsData,
  pending,
  error,
} = await useFetch("/api/tickets", {
  lazy: true,
  headers: { Authorization: `Bearer ${authStore.token}` },
});

const searchQuery = ref("");

const statusOptions = [
  { label: 'Yeni', value: 'New' },
  { label: 'İşlemde', value: 'InProgress' },
  { label: 'Çözüldü', value: 'Resolved' },
  { label: 'Kapandı', value: 'Closed' },
  { label: 'İptal Edildi', value: 'Cancelled' }
];
const selectedStatuses = ref([]);

const priorityOptions = [
  { label: 'Düşük', value: 'Low' },
  { label: 'Orta', value: 'Medium' },
  { label: 'Yüksek', value: 'High' },
  { label: 'Acil', value: 'Urgent' }
];
const selectedPriorities = ref([]);

const filteredTickets = computed(() => {
  let tickets = ticketsData.value?.data || [];
  if (!tickets) return [];
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    tickets = tickets.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(q) ||
        ticket.ticketId.toLowerCase().includes(q)
    );
  }
  if (selectedStatuses.value.length > 0) {
    tickets = tickets.filter((ticket) =>
      selectedStatuses.value.includes(ticket.status)
    );
  }
  if (selectedPriorities.value.length > 0) {
    tickets = tickets.filter((ticket) =>
      selectedPriorities.value.includes(ticket.priority)
    );
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