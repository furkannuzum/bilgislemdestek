<template>
  <div class="w-full space-y-8">
    <!-- Başlık ve Karşılama Mesajı -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <p v-if="authStore.user" class="mt-1 text-gray-600 dark:text-gray-400">
        Hoş geldin, <span class="font-semibold text-primary-500 dark:text-primary-400">{{ authStore.user.fullName }}</span>! Sistemdeki son duruma buradan göz atabilirsin.
      </p>
    </div>

    <!-- İstatistik Kartları -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard v-for="stat in statsCards" :key="stat.label">
        <div class="flex items-center gap-4">
          <UIcon :name="stat.icon" class="text-4xl" :class="stat.color" />
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ stat.value }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Ana Panel (Talepler ve Aksiyonlar) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Sol Panel: Son Destek Talepleri -->
      <UCard class="lg:col-span-2" :ui="{ header: { padding: 'px-4 py-5 sm:px-6' }, body: { padding: 'p-0 sm:p-0' } }">
        <template #header>
          <h2 class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">Son Destek Talepleri</h2>
        </template>

        <div class="divide-y divide-gray-200 dark:divide-gray-800">
          <div v-if="recentTickets.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-400">
            Gösterilecek destek talebi bulunmuyor.
          </div>
          <div v-for="ticket in recentTickets" :key="ticket._id" class="flex items-center gap-4 px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" @click="$router.push(`/tickets/${ticket._id}`)">
            <UAvatar :alt="ticket.title.charAt(0).toUpperCase()" size="md" />
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-800 dark:text-gray-200 truncate">{{ ticket.title }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ new Date(ticket.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</p>
            </div>
            <UBadge :color="priorityMap[ticket.priority.toLowerCase()]?.color || 'gray'" variant="soft" size="md">{{ priorityMap[ticket.priority.toLowerCase()]?.label || ticket.priority }}</UBadge>
          </div>
        </div>

        <template #footer>
          <div class="p-4">
            <UButton icon="i-heroicons-arrow-right-circle" block size="lg" variant="ghost" @click="$router.push('/tickets')">
              Tüm Destek Taleplerini Gör
            </UButton>
          </div>
        </template>
      </UCard>

      <!-- Sağ Panel: Hızlı Aksiyonlar -->
      <UCard class="lg:col-span-1">
         <template #header>
           <h2 class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">Hızlı Aksiyonlar</h2>
         </template>
        <div class="space-y-3">
          <!-- İstenen değişiklik burada yapıldı: Butonların sırası değiştirildi. -->
          <UButton icon="i-heroicons-plus-circle" label="Yeni Destek Talebi" color="primary" variant="outline" size="lg" block @click="$router.push('/tickets/new')" />
          <UButton icon="i-heroicons-computer-desktop" label="Yeni Cihaz Talebi" color="primary" variant="outline" size="lg" block @click="$router.push('/requests/new')" />
          <UButton icon="i-heroicons-chart-bar" label="Raporları Görüntüle" color="primary" variant="soft" size="lg" block @click="$router.push('/reports')" />
          <UButton
            v-if="authStore.userRole === 'Admin' || authStore.userRole === 'ITAgent'"
            icon="i-heroicons-user-plus"
            label="Yeni Kullanıcı Oluştur"
            color="green"
            variant="soft"
            size="lg"
            block
            @click="$router.push('/admin/users')"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { onBeforeMount, ref, computed } from 'vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const authStore = useAuthStore()
const ticketsData = ref([])
const deviceData = ref([])

onBeforeMount(async () => {
  if (!authStore.user) {
    await authStore.fetchUser()
  }
  if (authStore.user) {
    try {
      const [ticketsRes, devicesRes] = await Promise.all([
        $fetch('/api/tickets', { credentials: 'include' }),
        $fetch('/api/devicerequests', { credentials: 'include' })
      ]);
      ticketsData.value = ticketsRes.data || []
      deviceData.value = devicesRes.data || []
    } catch (error) {
      console.error("Dashboard verileri çekilirken hata oluştu:", error)
    }
  }
})

const allTickets = computed(() => ticketsData.value || [])
const openTickets = computed(() => allTickets.value.filter(ticket => ['New', 'InProgress'].includes(ticket.status)))
const closedTickets = computed(() => allTickets.value.filter(ticket => ['Resolved', 'Closed', 'Cancelled'].includes(ticket.status)))
const recentTickets = computed(() => allTickets.value.slice(0, 5))

const deviceRequests = computed(() => deviceData.value || [])
const openDevices = computed(() => deviceRequests.value.filter(req => ['PendingApproval'].includes(req.status)))
const closedDevices = computed(() => deviceRequests.value.filter(req => ['Approved', 'Rejected', 'Ordered', 'Delivered', 'Cancelled'].includes(req.status)))

const statsCards = computed(() => [
  { label: 'Açık Destek Talebi', value: openTickets.value.length, icon: 'i-heroicons-envelope-open', color: 'text-blue-500' },
  { label: 'Kapanan Destek Talebi', value: closedTickets.value.length, icon: 'i-heroicons-check-circle', color: 'text-green-500' },
  { label: 'Açık Cihaz Talebi', value: openDevices.value.length, icon: 'i-heroicons-computer-desktop', color: 'text-orange-500' },
  { label: 'Kapanan Cihaz Talebi', value: closedDevices.value.length, icon: 'i-heroicons-archive-box', color: 'text-gray-500' }
])

const priorityMap = {
  high: { color: 'red', label: 'Yüksek' },
  medium: { color: 'amber', label: 'Orta' },
  low: { color: 'green', label: 'Düşük' }
}
</script>

<style scoped>
/* Bu alanın boş kalması, yapılandırmanın doğru çalıştığını gösterir! */
</style>