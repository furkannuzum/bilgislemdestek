<!-- frontend1/pages/dashboard.vue (DOĞRU MANTIKLA) -->
<template>
  <div class="space-y-8">
    <!-- Sayfa Başlığı -->
    <div>
      <h1 class="text-3xl font-bold">Dashboard</h1>
      <p class="mt-1 text-gray-500">
        Hoş geldin, {{ authStore.userFullName }}! Sistemdeki son duruma buradan
        göz atabilirsin.
      </p>
    </div>

    <!-- Veri yüklenirken veya hata olduğunda gösterilecek durumlar -->
    <div v-if="pending" class="text-center py-10">Veriler yükleniyor...</div>
    <UAlert
      v-if="error"
      color="red"
      title="Hata!"
      description="Dashboard verileri yüklenirken bir sorun oluştu."
    />

    <!-- Veri yüklendiğinde gösterilecek ana içerik -->
    <div v-if="stats" class="space-y-8">
      <!-- İSTATİSTİK KARTLARI -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Kart 1: Toplam Destek Talebi -->
        <UCard>
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-gray-500">
              {{
                authStore.userRole === "EndUser"
                  ? "Toplam Destek Talebim"
                  : "Toplam Destek Talebi"
              }}
            </p>
            <UIcon
              v-if="authStore.userRole !== 'EndUser'"
              name="i-heroicons-ticket"
              class="w-6 h-6 text-gray-400"
            />
          </div>
          <p class="mt-1 text-3xl font-semibold">{{ stats.totalTickets }}</p>
          <p
            v-if="authStore.userRole !== 'EndUser'"
            class="mt-1 text-sm text-green-600"
          >
            +12% geçen aydan
          </p>
        </UCard>

        <!-- Kart 2: Açık Talepler -->
        <UCard>
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-gray-500">
              {{
                authStore.userRole === "EndUser"
                  ? "Açık Taleplerim"
                  : "Açık Talepler"
              }}
            </p>
            <UIcon
              v-if="authStore.userRole !== 'EndUser'"
              name="i-heroicons-exclamation-triangle"
              class="w-6 h-6 text-orange-500"
            />
          </div>
          <p class="mt-1 text-3xl font-semibold">{{ stats.openTickets }}</p>
          <p
            v-if="authStore.userRole !== 'EndUser'"
            class="mt-1 text-sm text-gray-500"
          >
            8 Yüksek, 15 Orta öncelikli
          </p>
        </UCard>

        <!-- Kart 3: Onay Bekleyen Cihaz Talebi -->
        <UCard>
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-gray-500">
              {{
                authStore.userRole === "EndUser"
                  ? "Onay Bekleyen Cihaz Talebim"
                  : "Onay Bekleyen Cihaz Talebi"
              }}
            </p>
            <UIcon
              v-if="authStore.userRole !== 'EndUser'"
              name="i-heroicons-computer-desktop"
              class="w-6 h-6 text-blue-500"
            />
          </div>
          <p class="mt-1 text-3xl font-semibold">
            {{ stats.pendingDeviceRequests }}
          </p>
          <p class="mt-1 text-sm text-gray-500">onay bekliyor</p>
        </UCard>
      </div>

      <!-- Son Destek Talepleri ve Hızlı Aksiyonlar (Tüm roller için ortak) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Son Destek Talepleri Listesi -->
        <div class="lg:col-span-2">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">
              {{
                authStore.userRole === "EndUser"
                  ? "Son Destek Taleplerim"
                  : "Son Destek Talepleri"
              }}
            </h2>
            <UButton
              to="/tickets"
              label="Tümünü Gör"
              variant="link"
              size="sm"
            />
          </div>
          <!-- Ticket listesi mantığı aynı -->
          <div v-if="ticketsPending">Yükleniyor...</div>
          <div v-else-if="tickets?.length" class="space-y-4">
            <UCard v-for="ticket in tickets" :key="ticket._id">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-semibold">{{ ticket.title }}</p>
                  <p class="text-sm text-gray-500">
                    <span v-if="authStore.userRole !== 'EndUser'"
                      >Rapor eden: {{ ticket.openedBy.fullName }} -
                    </span>
                    <span>{{
                      new Date(ticket.createdAt).toLocaleString("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }}</span>
                  </p>
                </div>
                <div class="flex items-center space-x-2 flex-shrink-0">
                  <UBadge
                    :color="priorityColors[ticket.priority] || 'gray'"
                    variant="soft"
                    >{{ ticket.priority }}</UBadge
                  >
                  <UBadge
                    :color="statusColors[ticket.status] || 'gray'"
                    variant="soft"
                    >{{ ticket.status }}</UBadge
                  >
                </div>
              </div>
            </UCard>
          </div>
          <div v-else>Gösterilecek destek talebi bulunamadı.</div>
        </div>

        <!-- Hızlı Aksiyonlar -->
        <div>
          <h2 class="text-lg font-semibold mb-4">Hızlı Aksiyonlar</h2>
          <div class="space-y-3">
            <UButton
              to="/tickets/new"
              label="Yeni Destek Talebi Oluştur"
              icon="i-heroicons-plus-circle"
              size="lg"
              block
            />
            <UButton
              to="/requests/new"
              label="Yeni Cihaz Talebi Oluştur"
              icon="i-heroicons-plus-circle"
              color="gray"
              size="lg"
              block
            />
            <UButton
              v-if="authStore.userRole !== 'EndUser'"
              to="/reports"
              label="Raporları Görüntüle"
              icon="i-heroicons-chart-pie"
              color="white"
              size="lg"
              block
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Script bölümü tamamen aynı, bir değişiklik yok.
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
