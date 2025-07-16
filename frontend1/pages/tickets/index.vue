<template>
  <div class="space-y-6 px-4 sm:px-6 lg:px-8">
    <!-- SAYFA BAŞLIĞI VE YENİ TALEP BUTONU -->
    <div class="flex justify-between items-center flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-bold">Destek Talepleri</h1>
        <p class="mt-1 text-gray-400" v-if="authStore.userRole">
          {{
            authStore.userRole === "EndUser"
              ? "Oluşturduğunuz tüm destek taleplerini"
              : "Tüm destek taleplerini"
          }} buradan yönetebilirsiniz.
        </p>
      </div>
      <UButton
        to="/tickets/new"
        icon="i-heroicons-plus-circle-20-solid"
        size="lg"
        class="w-full sm:w-auto"
      >
        Yeni Destek Talebi Oluştur
      </UButton>
    </div>

    <!-- FİLTRELER -->
    <UCard>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Başlıkta veya ID'de ara..."
        />
        <USelectMenu
          v-model="selectedStatuses"
          :options="statusOptions"
          multiple
          placeholder="Duruma Göre Filtrele"
        />
        <USelectMenu
          v-model="selectedPriorities"
          :options="priorityOptions"
          multiple
          placeholder="Önceliğe Göre Filtrele"
        />
        <UButton @click="clearFilters" color="gray" variant="ghost">
          Filtreleri Temizle
        </UButton>
      </div>
    </UCard>

    <!-- TABLO -->
    <div v-if="pending" class="text-center py-10">Talepler yükleniyor...</div>
    <div v-else-if="error" class="text-center py-10 text-red-500">
      Talepler yüklenirken bir hata oluştu.
    </div>
    <div v-else class="overflow-auto">
      <UTable
        :rows="filteredTickets"
        :columns="columns"
        :empty-state="{
          icon: 'i-heroicons-circle-stack-20-solid',
          label: 'Gösterilecek talep bulunamadı.',
        }"
      >
        <!-- Durum Rozeti -->
        <template #status-data="{ row }">
          <UBadge
            :color="{
              New: 'blue',
              InProgress: 'orange',
              Resolved: 'green',
              Closed: 'gray',
              Cancelled: 'red',
            }[row.status] || 'gray'"
            variant="soft"
          >
            {{ row.status }}
          </UBadge>
        </template>

        <!-- Öncelik Rozeti -->
        <template #priority-data="{ row }">
          <UBadge
            :color="{
              Low: 'green',
              Medium: 'yellow',
              High: 'orange',
              Urgent: 'red',
            }[row.priority] || 'gray'"
            variant="soft"
          >
            {{ row.priority }}
          </UBadge>
        </template>

        <!-- Tarih Formatı -->
        <template #createdAt-data="{ row }">
          {{
            new Date(row.createdAt).toLocaleString("tr-TR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })
          }}
        </template>
      </UTable>
    </div>
  </div>
</template>

<!-- <script setup>
import { useAuthStore } from '~/stores/auth'
const filteredTickets = ref([]) // veya computed döndürüyor olabilirsin
const columns = ref([]) // VEYA sabit dizi olabilir

const authStore = useAuthStore()
authStore.initializeAuth()

definePageMeta({
  layout: 'default', // <-- Bu satır önemli
  middleware: 'auth' 
});
const tickets = ref([])

const { data, error } = await useFetch('/api/tickets', {
  headers: {
    Authorization: `Bearer ${authStore.token}`
  }
})

if (data.value?.success) {
  tickets.value = data.value.data
}

</script> -->
<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
await authStore.initializeAuth?.() // Eğer initialize async ise

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// Yüklenme durumu ve hata
const pending = ref(true)
const error = ref(false)

// Veriler
const tickets = ref([])

// Arama ve filtreleme
const searchQuery = ref('')
const selectedStatuses = ref([])
const selectedPriorities = ref([])

const statusOptions = ['New', 'InProgress', 'Resolved', 'Closed', 'Cancelled']
const priorityOptions = ['Low', 'Medium', 'High', 'Urgent']

// Kolonlar
const columns = [
  { key: 'ticketId', label: 'Talep ID' },
  { key: 'title', label: 'Başlık' },
  { key: 'status', label: 'Durum' },
  { key: 'priority', label: 'Öncelik' },
  { key: 'createdAt', label: 'Oluşturulma Tarihi' },
]

// API çağrısı
const { data, error: fetchError } = await useFetch('/api/tickets', {
  headers: {
    Authorization: `Bearer ${authStore.token}`,
  }
})

if (fetchError.value) {
  error.value = true
} else if (data.value?.success) {
  tickets.value = data.value.data
}

pending.value = false

// Filtreleme
const filteredTickets = computed(() => {
  let results = [...tickets.value]

  // Eğer kullanıcı EndUser ise sadece kendi taleplerini filtrele
  if (authStore.userRole === 'EndUser') {
    results = results.filter(ticket =>
      ticket.openedBy === authStore.userId || ticket.openedBy?._id === authStore.userId
    )
  }

  // Arama
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    results = results.filter(
      ticket =>
        ticket.title?.toLowerCase().includes(q) ||
        ticket.ticketId?.toLowerCase().includes(q)
    )
  }

  // Statü filtrele
  if (selectedStatuses.value.length > 0) {
    results = results.filter(ticket => selectedStatuses.value.includes(ticket.status))
  }

  // Öncelik filtrele
  if (selectedPriorities.value.length > 0) {
    results = results.filter(ticket => selectedPriorities.value.includes(ticket.priority))
  }

  return results
})

function clearFilters() {
  searchQuery.value = ''
  selectedStatuses.value = []
  selectedPriorities.value = []
}
</script>
