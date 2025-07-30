<!-- /tickets/[id].vue SAYFASININ NİHAİ İÇERİĞİ -->
<template>
  <div class="space-y-6">
    <!-- Yükleme ve Hata Durumları -->
    <div v-if="pending" class="flex justify-center items-center h-64">
      <p class="text-gray-500 dark:text-gray-400">Talep bilgileri yükleniyor...</p>
    </div>
    <div v-else-if="error || !ticket" class="flex justify-center items-center h-64">
      <p class="text-red-500">Talep bulunamadı veya bir hata oluştu.</p>
    </div>

    <!-- Ana İçerik -->
    <div v-else class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ ticket.title || "Talep Başlığı Yok" }}
      </h1>

      <!-- TALEP AÇIKLAMASI (DESCRIPTION) KARTI - YENİ EKLENDİ -->
      <UCard v-if="ticket.description">
        <template #header>
          <h2 class="font-semibold text-gray-700 dark:text-gray-200">Kullanıcı Açıklaması</h2>
        </template>
        <p class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{{ ticket.description }}</p>
      </UCard>

      <!-- BİLGİ KARTI -->
      <UCard>
        <template #header>
          <h2 class="font-semibold text-gray-700 dark:text-gray-200">Talep Detayları</h2>
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div><span class="font-medium text-gray-500">Talep ID:</span> {{ ticket.ticketId }}</div>
          <div><span class="font-medium text-gray-500">Durum:</span> <UBadge :label="statusMap[ticket.status]?.label || ticket.status" :color="statusMap[ticket.status]?.color || 'gray'" variant="soft" /></div>
          <div><span class="font-medium text-gray-500">Öncelik:</span> <UBadge :label="priorityMap[ticket.priority]?.label || ticket.priority" :color="priorityMap[ticket.priority]?.color || 'gray'" variant="soft" /></div>
          <div><span class="font-medium text-gray-500">Birim:</span> {{ ticket.department?.name || 'Yok' }}</div>
          <div><span class="font-medium text-gray-500">Talep Eden:</span> {{ ticket.openedBy?.fullName || 'Yok' }}</div>
          <div><span class="font-medium text-gray-500">Oluşturma:</span> {{ formatDateTime(ticket.createdAt) }}</div>
          <div><span class="font-medium text-gray-500">Atanan:</span> {{ ticket.assignedTo?.fullName || 'Atanmamış' }}</div>
        </div>
      </UCard>

      <!-- GÜNCELLEME FORMU (Sadece yetkili kullanıcılar için) -->
      <UCard v-if="canEdit">
        <template #header>
          <h2 class="font-semibold text-gray-700 dark:text-gray-200">Talep Yönetimi</h2>
        </template>
        <UForm :state="formState" @submit="submitUpdate" class="space-y-4">
          <UFormGroup label="Durumu Güncelle" name="status">
            <USelectMenu v-model="formState.status" :options="statusOptions" value-attribute="value" option-attribute="label" size="lg" />
          </UFormGroup>

          <UFormGroup label="IT Agent Ata" name="assignedTo">
            <USelectMenu v-model="formState.assignedTo" :options="itAgents" value-attribute="_id" option-attribute="fullName" placeholder="Bir ajan seçin..." searchable size="lg" />
          </UFormGroup>

          <UFormGroup label="Yorum Ekle" name="comment">
            <UTextarea v-model="formState.comment" placeholder="Kullanıcının görebileceği bir yorum ekleyin..." size="lg" />
          </UFormGroup>

          <div class="flex justify-end pt-4">
            <UButton 
              type="submit" 
              label="Güncellemeleri Kaydet" 
              :loading="isSubmitting"
              size="lg"
            />
          </div>
        </UForm>
      </UCard>

      <!-- GEÇMİŞ KARTI -->
      <UCard>
        <template #header>
          <h2 class="font-semibold text-gray-700 dark:text-gray-200">Talep Geçmişi</h2>
        </template>
        <div v-if="!ticket.history || ticket.history.length === 0" class="text-sm text-center py-4 text-gray-500">
          Bu talep için bir geçmiş kaydı bulunmuyor.
        </div>
        <div v-else class="space-y-4">
          <div v-for="item in ticket.history" :key="item._id" class="flex items-start gap-4">
            <UAvatar :alt="item.user?.fullName.charAt(0) || 'S'" size="md" />
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ item.action }}</p>
              <blockquote v-if="item.comment" class="mt-1 pl-3 border-l-2 border-gray-300 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                {{ item.comment }}
              </blockquote>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                <span class="font-semibold">{{ item.user?.fullName || 'Sistem' }}</span> ·
                <time :datetime="item.timestamp">{{ formatDateTime(item.timestamp) }}</time>
              </p>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useNuxtApp } from '#app';

definePageMeta({ layout: 'default', middleware: 'auth' });

// Gerekli araçlar
const route = useRoute();
const ticketId = route.params.id;
const authStore = useAuthStore();
const { $api } = useNuxtApp();
const toast = useToast();

// State'ler
const ticket = ref(null);
const itAgents = ref([]);
const isSubmitting = ref(false);

const canEdit = computed(() => ['Admin', 'ITAgent'].includes(authStore.user?.role));

// Güncelleme formu için reaktif state
const formState = reactive({
  status: '',
  assignedTo: '',
  comment: ''
});

// Durum ve Öncelik seçenekleri ve haritaları (Türkçeleştirme için)
const statusOptions = [
  { value: 'New', label: 'Yeni' },
  { value: 'InProgress', label: 'İşlemde' },
  { value: 'Resolved', label: 'Çözüldü' },
  { value: 'Closed', label: 'Kapandı' },
  { value: 'Cancelled', label: 'İptal Edildi' }
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

// Asenkron veri çekme
const { data, pending, error, refresh } = useAsyncData(
  `ticket-${ticketId}`,
  async () => {
    // İki API isteğini aynı anda yapalım
    const [ticketData, agentsData] = await Promise.all([
      $api(`/tickets/${ticketId}`),
      canEdit.value ? $api(`/users?role=Admin,ITAgent`) : Promise.resolve({ success: true, data: [] })
    ]);
    return { ticket: ticketData.data, itAgents: agentsData.data };
  },
  { lazy: true, server: false }
);

// Veri geldiğinde veya değiştiğinde state'leri güncelle
watch(data, (newData) => {
  if (newData) {
    if (newData.ticket) {
      ticket.value = newData.ticket;
      // Formu gelen veriyle doldur
      formState.status = ticket.value.status;
      formState.assignedTo = ticket.value.assignedTo?._id || null;
      formState.comment = ''; // Yorum alanını her zaman temizle
    }
    if (newData.itAgents) {
      itAgents.value = newData.itAgents;
    }
  }
}, { immediate: true });

// Formu gönderme fonksiyonu
const submitUpdate = async () => {
  isSubmitting.value = true;
  try {
    const updates = {};
    if (formState.status !== ticket.value.status) updates.status = formState.status;
    if (formState.assignedTo !== (ticket.value.assignedTo?._id || null)) updates.assignedTo = formState.assignedTo;
    if (formState.comment.trim()) updates.comment = formState.comment.trim();

    if (Object.keys(updates).length === 0) {
      toast.add({ title: 'Bilgi', description: 'Kaydedilecek bir değişiklik yok.', color: 'orange' });
      return;
    }

    await $api(`/tickets/${ticketId}`, { method: 'PUT', body: updates });
    toast.add({ title: 'Başarılı!', description: 'Talep güncellendi.', icon: 'i-heroicons-check-circle' });
    await refresh();
    
  } catch (err) {
    toast.add({ title: "Hata!", description: err.data?.message || "Güncelleme sırasında bir hata oluştu.", color: 'red', icon: 'i-heroicons-x-circle' });
  } finally {
    isSubmitting.value = false;
  }
};

const formatDateTime = (d) => d ? new Date(d).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }) : 'Bilinmiyor';

onMounted(() => {
  if (!authStore.user) {
    authStore.fetchUser();
  }
});
</script>

<!-- ÖZEL CSS'E ARTIK İHTİYAÇ YOK! -->
<style scoped></style>