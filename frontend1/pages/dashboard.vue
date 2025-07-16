<template>
  <div class="w-full max-w-7xl mx-auto px-2 py-6">
    <!-- Başlık ve Açıklama -->
    <div>
      <h1 class="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p class="mt-5 mb-5 text-gray-500">
        Hoş geldin, {{ authStore.userFullName }}! Sistemdeki son duruma buradan göz atabilirsin.
      </p>
    </div>

    <!-- Yükleniyor & Hata -->
    <div v-if="pending" class="text-center py-10 text-gray-500">Veriler yükleniyor...</div>
    <UAlert
      v-if="error"
      color="red"
      title="Hata!"
      description="Dashboard verileri yüklenirken bir sorun oluştu."
      class="my-6"
    />

    <div v-if="stats" class="space-y-8">
      <!-- İstatistik Kartları -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Kart 1: Toplam Destek Talebi -->
        <UCard class="rounded-2xl bg-white shadow border border-gray-100">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-gray-500">
              {{ authStore.userRole === "EndUser" ? "Toplam Destek Talebim" : "Toplam Destek Talebi" }}
            </p>
            <UIcon v-if="authStore.userRole !== 'EndUser'" name="i-heroicons-ticket" class="w-6 h-6 text-gray-400" />
          </div>
          <p class="mt-2 text-3xl font-semibold text-gray-800">{{ stats.totalTickets }}</p>
          <p v-if="authStore.userRole !== 'EndUser'" class="mt-2 text-sm text-green-600">
            +12% geçen aydan
          </p>
        </UCard>

        <!-- Kart 2: Açık Talepler -->
        <UCard class="rounded-2xl bg-white shadow border border-gray-100">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-gray-500">
              {{ authStore.userRole === "EndUser" ? "Açık Taleplerim" : "Açık Talepler" }}
            </p>
            <UIcon v-if="authStore.userRole !== 'EndUser'" name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-orange-500" />
          </div>
          <p class="mt-2 text-3xl font-semibold text-gray-800">{{ stats.openTickets }}</p>
          <p v-if="authStore.userRole !== 'EndUser'" class="mt-2 text-sm text-gray-500">
            8 Yüksek, 15 Orta öncelikli
          </p>
        </UCard>

        <!-- Kart 3: Onay Bekleyen Cihaz Talebi -->
        <UCard class="rounded-2xl bg-white shadow border border-gray-100">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-gray-500">
              {{ authStore.userRole === "EndUser" ? "Onay Bekleyen Cihaz Talebim" : "Onay Bekleyen Cihaz Talebi" }}
            </p>
            <UIcon v-if="authStore.userRole !== 'EndUser'" name="i-heroicons-computer-desktop" class="w-6 h-6 text-blue-500" />
          </div>
          <p class="mt-2 text-3xl font-semibold text-gray-800">{{ stats.pendingDeviceRequests }}</p>
          <p class="mt-2 text-sm text-gray-500">onay bekliyor</p>
        </UCard>
      </div>

      <!-- Son Destek Talepleri ve Hızlı Aksiyonlar -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Son Destek Talepleri -->
        <div class="lg:col-span-2">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">
              {{ authStore.userRole === "EndUser" ? "Son Destek Taleplerim" : "Son Destek Talepleri" }}
            </h2>
            <UButton to="/tickets" label="Tümünü Gör" variant="link" size="sm" />
          </div>
          <div v-if="ticketsPending" class="text-gray-500">Yükleniyor...</div>
          <div v-else-if="tickets?.length" class="space-y-4">
            <UCard v-for="ticket in tickets" :key="ticket._id" class="rounded-xl bg-gray-50 border border-gray-100">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <p class="font-semibold text-gray-800">{{ ticket.title }}</p>
                  <p class="text-sm text-gray-500">
                    <span v-if="authStore.userRole !== 'EndUser'">Rapor eden: {{ ticket.openedBy.fullName }} - </span>
                    <span>
                      {{ new Date(ticket.createdAt).toLocaleString("tr-TR", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      }) }}
                    </span>
                  </p>
                </div>
                <div class="flex items-center gap-2 mt-2 sm:mt-0">
                  <UBadge :color="priorityColors[ticket.priority] || 'gray'" variant="soft">
                    {{ ticket.priority }}
                  </UBadge>
                  <UBadge :color="statusColors[ticket.status] || 'gray'" variant="soft">
                    {{ ticket.status }}
                  </UBadge>
                </div>
              </div>
            </UCard>
          </div>
          <div v-else class="text-gray-500">Gösterilecek destek talebi bulunamadı.</div>
        </div>

        <!-- Hızlı Aksiyonlar -->
        <div>
          <h2 class="text-lg font-semibold mb-4">Hızlı Aksiyonlar</h2>
          <div class="space-y-4">
            <!-- Yeni Destek Talebi -->
            <NuxtLink to="/tickets/new"
              class="flex items-center justify-center w-full text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-full px-5 py-3 text-center transition-colors shadow">
              <UIcon name="i-heroicons-plus-circle-20-solid" class="w-5 h-5 mr-2" />
              <span>Yeni Destek Talebi Oluştur</span>
            </NuxtLink>
            <!-- Yeni Cihaz Talebi -->
            <NuxtLink to="/requests/new"
              class="flex items-center justify-center w-full text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-full px-5 py-3 text-center transition-colors shadow">
              <UIcon name="i-heroicons-plus-circle-20-solid" class="w-5 h-5 mr-2" />
              <span>Yeni Cihaz Talebi Oluştur</span>
            </NuxtLink>
            <!-- Raporlar (Sadece admin/IT) -->
            <NuxtLink v-if="authStore.userRole !== 'EndUser'" to="/reports"
              class="flex items-center justify-center w-full text-blue-700 bg-white border border-blue-600 hover:bg-blue-50 font-bold rounded-full px-5 py-3 text-center transition-colors shadow">
              <UIcon name="i-heroicons-chart-pie-20-solid" class="w-5 h-5 mr-2" />
              <span>Raporları Görüntüle</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from "~/stores/auth";
definePageMeta({ layout: "default", middleware: "auth" });

const authStore = useAuthStore();

const {
  data: statsData,
  pending,
  error,
} = await useFetch("/api/analytics/stats", {
  lazy: true,
  headers: { Authorization: `Bearer ${authStore.token}` },
});
const stats = computed(() => statsData.value?.data);

const { data: ticketsData, pending: ticketsPending } = await useFetch(
  "/api/tickets?limit=5",
  {
    lazy: true,
    headers: { Authorization: `Bearer ${authStore.token}` },
  }
);
const tickets = computed(() => ticketsData.value?.data);

const statusColors = {
  New: "blue",
  InProgress: "orange",
  Resolved: "green",
  Closed: "gray",
  Cancelled: "red",
};
const priorityColors = {
  Low: "green",
  Medium: "yellow",
  High: "orange",
  Urgent: "red",
};
</script>

<style scoped>
/* Ekstra: Kutular ve butonlar daha oval ve modern olsun */
</style>
