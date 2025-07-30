<!-- [id].vue SAYFASININ NİHAİ İÇERİĞİ -->
<template>
  <div class="space-y-6">
    <!-- Yükleme ve Hata Durumları -->
    <div v-if="pending" class="flex justify-center items-center h-64">
      <p class="text-gray-500 dark:text-gray-400">Talep bilgileri yükleniyor...</p>
    </div>
    <div v-else-if="error || !request" class="flex justify-center items-center h-64">
      <p class="text-red-500">Talep bulunamadı veya bir hata oluştu.</p>
    </div>

    <!-- Ana İçerik -->
    <div v-else class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ request.productCategory?.name || 'Cihaz Talebi' }}
      </h1>

      <!-- AÇIKLAMA (SPECS) KARTI - YENİ EKLENDİ -->
      <UCard>
        <template #header>
          <h2 class="font-semibold text-gray-700 dark:text-gray-200">Kullanıcı Açıklaması</h2>
        </template>
        <!-- `whitespace-pre-wrap` class'ı satır atlamalarını korur -->
        <p class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{{ request.specs }}</p>
      </UCard>

      <!-- BİLGİ KARTI -->
      <UCard>
        <template #header>
          <h2 class="font-semibold text-gray-700 dark:text-gray-200">Talep Detayları</h2>
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div><span class="font-medium text-gray-500">Talep ID:</span> {{ request.requestId }}</div>
          <div><span class="font-medium text-gray-500">Durum:</span> <UBadge :label="statusMap[request.status]?.label || request.status" :color="statusMap[request.status]?.color || 'gray'" variant="soft" /></div>
          <div><span class="font-medium text-gray-500">Öncelik:</span> {{ request.priority || 'Belirtilmemiş' }}</div>
          <div><span class="font-medium text-gray-500">Birim:</span> {{ request.department?.name || 'Yok' }}</div>
          <div><span class="font-medium text-gray-500">Talep Eden:</span> {{ request.requestedBy?.fullName || 'Yok' }}</div>
          <div><span class="font-medium text-gray-500">Oluşturma:</span> {{ formatDateTime(request.createdAt) }}</div>
          <div><span class="font-medium text-gray-500">Atanan:</span> {{ request.assignedTo?.fullName || 'Atanmamış' }}</div>
        </div>
      </UCard>

      <!-- GÜNCELLEME FORMU -->
      <UCard v-if="canEdit">
        <template #header>
          <h2 class="font-semibold text-gray-700 dark:text-gray-200">Talep Yönetimi</h2>
        </template>
        <UForm :state="formState" @submit="submitUpdate" class="space-y-4">
          <UFormGroup label="Durumu Güncelle" name="status">
            <!-- USelectMenu ile daha şık ve Türkçe etiketli seçim -->
            <USelectMenu
              v-model="formState.status"
              :options="statusOptions"
              value-attribute="value"
              option-attribute="label"
              size="lg"
            />
          </UFormGroup>

          <UFormGroup label="Yorum / Red Sebebi" name="rejectionReason">
            <UTextarea v-model="formState.rejectionReason" placeholder="Gerekliyse bir yorum veya red sebebi ekleyin..." size="lg" />
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
        <div v-if="!request.history || request.history.length === 0" class="text-sm text-center py-4 text-gray-500">
          Bu talep için bir geçmiş kaydı bulunmuyor.
        </div>
        <div v-else class="space-y-4">
          <div v-for="item in request.history" :key="item._id" class="flex items-start gap-4">
            <UAvatar :alt="item.user?.fullName.charAt(0) || 'S'" size="md" />
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ item.action }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                <span class="font-semibold">{{ item.user?.fullName || 'Sistem' }}</span> tarafından
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
const requestId = route.params.id;
const authStore = useAuthStore();
const { $api } = useNuxtApp();
const toast = useToast();

// State'ler
const request = ref(null);
const isSubmitting = ref(false);

const canEdit = computed(() => ['Admin', 'ITAgent'].includes(authStore.user?.role));

const formState = reactive({
  status: '',
  rejectionReason: ''
});

// --- DURUM SEÇENEKLERİ VE HARİTASI (TÜRKÇELEŞTİRME İÇİN) ---
const statusOptions = [
  { value: 'PendingApproval', label: 'Onay Bekliyor' },
  { value: 'Approved', label: 'Onaylandı' },
  { value: 'Rejected', label: 'Reddedildi' },
  { value: 'Ordered', label: 'Sipariş Edildi' },
  { value: 'Delivered', label: 'Teslim Edildi' }
];

const statusMap = {
  PendingApproval: { label: 'Onay Bekliyor', color: 'amber' },
  Approved: { label: 'Onaylandı', color: 'blue' },
  Rejected: { label: 'Reddedildi', color: 'red' },
  Ordered: { label: 'Sipariş Edildi', color: 'purple' },
  Delivered: { label: 'Teslim Edildi', color: 'green' }
};

// --- VERİ ÇEKME VE YÖNETİMİ ---
const { data, pending, error, refresh } = useAsyncData(
  `device-request-${requestId}`,
  () => $api(`/devicerequests/${requestId}`),
  { lazy: true, server: false }
);

watch(data, (newData) => {
  if (newData && newData.success) {
    request.value = newData.data;
    formState.status = newData.data.status;
    formState.rejectionReason = '';
  }
}, { immediate: true });

// --- FORM GÖNDERME FONKSİYONU ---
const submitUpdate = async () => {
  isSubmitting.value = true;
  try {
    const updates = {
      status: formState.status,
      ...(formState.status === 'Rejected' && formState.rejectionReason.trim() && { rejectionReason: formState.rejectionReason.trim() })
    };

    if (updates.status === request.value.status && !updates.rejectionReason) {
      toast.add({ title: 'Bilgi', description: 'Kaydedilecek bir değişiklik yok.', color: 'orange' });
      return;
    }

    await $api(`/devicerequests/${requestId}`, {
      method: 'PUT',
      body: updates
    });

    toast.add({ title: 'Başarılı!', description: 'Talep durumu güncellendi.', icon: 'i-heroicons-check-circle' });
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

<style scoped>
/* Bu alanın boş olması, Nuxt UI ve Tailwind'in gücünü gösterir. */
</style>