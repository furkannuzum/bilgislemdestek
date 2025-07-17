<template>
  <div class="w-full max-w-7xl mx-auto px-2 py-6">
    <!-- Başlık ve Buton -->
    <div class="flex flex-wrap justify-between items-center gap-4 mb-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Destek Talepleri</h1>
        <p v-if="authStore.user" class="mt-5 mb-5 text-gray-500">
          {{ authStore.userRole === "EndUser" ? "Oluşturduğunuz tüm destek taleplerini" : "Tüm destek taleplerini" }} buradan yönetebilirsiniz.
        </p>
      </div>
      <UButton
        to="/tickets/new"
        icon="i-heroicons-plus-circle-20-solid"
        size="lg"
        class="rounded-full px-6 py-3 font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow"
      >
        Yeni Destek Talebi Oluştur
      </UButton>
    </div>

<!-- Filtreler (Düzeltilmiş Hali) -->
<UCard class="mb-6 shadow-none border border-gray-100 bg-white">
  <div class="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
    <!-- Arama Alanı -->
    <div class="flex-1 flex items-center">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        size="lg"
        placeholder="Başlıkta veya ID'de ara..."
        :ui="{
          base: 'w-full',
          rounded: 'rounded-full',
          color: { white: { outline: 'bg-gray-100 border-0' } },
          ring: 'focus:ring-2 focus:ring-inset focus:ring-blue-500',
          padding: { lg: 'py-3' }
        }"
      />
    </div>
    <!-- Durum Filtresi -->
    <div class="flex-1 flex items-center">
      <USelectMenu
        v-model="selectedStatuses"
        :options="statusOptions"
        multiple
        size="lg"
        placeholder="Duruma Göre Filtrele"
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
    <!-- Öncelik Filtresi -->
    <div class="flex-1 flex items-center">
      <USelectMenu
        v-model="selectedPriorities"
        :options="priorityOptions"
        multiple
        size="lg"
        placeholder="Önceliğe Göre Filtrele"
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
    <!-- Filtre Temizleme Butonu -->
    <div class="flex items-center">
      <UButton
        @click="clearFilters"
        color="gray"
        variant="ghost"
        icon="i-heroicons-x-circle"
        class="flex items-center whitespace-nowrap rounded-full px-4"
        size="lg"
      >
        Filtreleri Temizle
      </UButton>
    </div>
  </div>
</UCard>

    <!-- TABLO -->
    <div v-if="pending" class="text-center py-10 text-gray-500">Talepler yükleniyor...</div>
    <div v-else-if="error" class="text-center py-10 text-red-500">Talepler yüklenirken bir hata oluştu.</div>
    <div v-else>
      <div class="overflow-x-auto rounded-2xl shadow border border-gray-100 bg-white">
        <UTable
          v-model="selected"
          :rows="filteredTickets"
          :columns="columns"
          :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'Gösterilecek talep bulunamadı.' }"
          class="min-w-full"
        >
          <!-- Talep ID (Artık Link değil, sadece metin) -->
          <template #ticketId-data="{ row }">
            <span class="font-medium text-gray-800">{{ row.ticketId }}</span>
          </template>
          <!-- Başlık -->
          <template #title-data="{ row }">
            <span class="block max-w-[120px] truncate" :title="row.title">{{ row.title }}</span>
          </template>
          <!-- Açıklama -->
          <template #description-data="{ row }">
            <span class="block max-w-[140px] truncate" :title="row.description">{{ row.description }}</span>
          </template>
          <!-- Fotoğraf -->
          <template #attachment-data="{ row }">
            <img
              v-if="row.attachments && row.attachments[0]"
              :src="row.attachments[0]"
              alt="Ek"
              class="h-10 w-10 object-cover rounded-lg border border-gray-200 shadow-sm hidden sm:inline"
            />
          </template>
          <!-- Durum -->
          <template #status-data="{ row }">
            <UBadge
              :color="statusColors[row.status]"
              variant="soft"
              class="rounded-full px-2 py-1 text-xs"
            >
              {{ row.status }}
            </UBadge>
          </template>
          <!-- Öncelik -->
          <template #priority-data="{ row }">
            <UBadge
              :color="priorityColors[row.priority]"
              variant="soft"
              class="rounded-full px-2 py-1 text-xs"
            >
              {{ row.priority }}
            </UBadge>
          </template>
          <!-- Açan -->
          <template #openedBy-data="{ row }">
            <span class="hidden md:inline">{{ row.openedBy?.fullName }}</span>
          </template>
          <!-- Atanan -->
          <template #assignedTo-data="{ row }">
            <span v-if="row.assignedTo" class="hidden md:inline">{{ row.assignedTo.fullName }}</span>
            <span v-else class="text-gray-400 hidden md:inline">Atanmadı</span>
          </template>
          <!-- Tarih -->
          <template #createdAt-data="{ row }">
            {{ new Date(row.createdAt).toLocaleDateString("tr-TR") }}
          </template>

          <!-- Genişletilebilir Satır (detaylar) -->
          <template #expanded-row="{ row }">
            <div class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <!-- Açıklama -->
              <div class="mb-4">
                <h4 class="font-semibold mb-1">Açıklama:</h4>
                <p class="text-sm text-gray-700 dark:text-gray-300">{{ row.description }}</p>
              </div>
              <!-- Ekler / Resimler -->
              <div v-if="row.attachments && row.attachments.length > 0">
                <h5 class="font-semibold mb-2">Ekler:</h5>
                <div class="flex flex-wrap gap-4">
                  <a
                    v-for="(attachment, index) in row.attachments"
                    :key="index"
                    :href="attachment"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      :src="attachment"
                      alt="Ek"
                      class="h-24 w-24 object-cover rounded-md border hover:opacity-80 transition-opacity"
                    />
                  </a>
                </div>
              </div>
            </div>
          </template>
        </UTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default', middleware: 'auth' })

const authStore = useAuthStore()

const selected = ref([])
const columns = [
  { key: 'expand', label: '' },
  { key: 'ticketId', label: 'Talep ID' },
  { key: 'title', label: 'Başlık' },
  { key: 'description', label: 'Açıklama' },
  { key: 'attachment', label: 'Foto' },
  { key: 'status', label: 'Durum' },
  { key: 'priority', label: 'Öncelik' },
  { key: 'openedBy', label: 'Açan' },
  { key: 'assignedTo', label: 'Atanan' },
  { key: 'createdAt', label: 'Tarih' }
]

const { data: ticketsData, pending, error } = await useFetch('/api/tickets', {
  lazy: true,
  headers: { Authorization: `Bearer ${authStore.token}` }
})

const searchQuery = ref('')
const statusOptions = ['New', 'InProgress', 'Resolved', 'Closed', 'Cancelled']
const selectedStatuses = ref([])
const priorityOptions = ['Low', 'Medium', 'High', 'Urgent']
const selectedPriorities = ref([])

const filteredTickets = computed(() => {
  let tickets = ticketsData.value?.data || []
  if (!tickets) return []
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    tickets = tickets.filter(ticket =>
      ticket.title.toLowerCase().includes(q) ||
      ticket.ticketId.toLowerCase().includes(q)
    )
  }
  if (selectedStatuses.value.length > 0) {
    tickets = tickets.filter(ticket => selectedStatuses.value.includes(ticket.status))
  }
  if (selectedPriorities.value.length > 0) {
    tickets = tickets.filter(ticket => selectedPriorities.value.includes(ticket.priority))
  }
  return tickets
})

function clearFilters() {
  searchQuery.value = ''
  selectedStatuses.value = []
  selectedPriorities.value = []
}

const statusColors = { New: 'blue', InProgress: 'orange', Resolved: 'green', Closed: 'gray', Cancelled: 'red' }
const priorityColors = { Low: 'green', Medium: 'yellow', High: 'orange', Urgent: 'red' }
</script>

<style scoped>
.form-input {
  @apply block w-full rounded-full border-0 py-3 pl-11 pr-4 text-gray-900 bg-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6;
}
</style>
