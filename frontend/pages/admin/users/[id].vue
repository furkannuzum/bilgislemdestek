<!-- [id].vue SAYFASININ NİHAİ İÇERİĞİ -->
<template>
  <div>
    <!-- Yükleme ve Hata Durumları -->
    <div v-if="pending" class="flex justify-center items-center h-64">
      <p class="text-gray-500 dark:text-gray-400">Kullanıcı bilgileri yükleniyor...</p>
    </div>
    <div v-else-if="error || !user" class="flex justify-center items-center h-64">
      <p class="text-red-500">Kullanıcı bulunamadı veya bir hata oluştu.</p>
    </div>

    <!-- Ana Form -->
    <UCard v-else>
      <template #header>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          Kullanıcıyı Düzenle: <span class="text-primary-500">{{ user.fullName }}</span>
        </h1>
      </template>

      <!-- UForm bileşeni ile daha gelişmiş form yönetimi -->
      <UForm :state="formState" @submit="updateUser" class="space-y-4">
        <UFormGroup label="Ad Soyad" name="fullName">
          <UInput v-model="formState.fullName" size="lg" />
        </UFormGroup>

        <UFormGroup label="E-posta Adresi" name="email">
          <UInput v-model="formState.email" type="email" size="lg" />
        </UFormGroup>

        <UFormGroup label="Birim (Departman)" name="departmentId">
          <!-- USelectMenu ile şık ve aranabilir bir select kutusu -->
          <USelectMenu
            v-model="selectedDepartment"
            :options="departments"
            placeholder="Birim Seçiniz..."
            value-attribute="_id"
            option-attribute="name"
            searchable
            size="lg"
          />
        </UFormGroup>

        <UFormGroup label="Kullanıcı Rolü" name="role">
          <USelect
            v-model="formState.role"
            :options="['EndUser', 'ITAgent', 'Admin']"
            size="lg"
          />
        </UFormGroup>
        
        <div class="flex justify-end gap-3 pt-4">
          <UButton 
            label="İptal" 
            color="gray" 
            variant="ghost" 
            size="lg"
            @click="router.push('/admin/users')" 
          />
          <UButton 
            type="submit" 
            label="Değişiklikleri Kaydet" 
            :loading="isSubmitting" 
            size="lg"
          />
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNuxtApp } from '#app';

definePageMeta({ layout: 'default', middleware: 'auth' });

// Gerekli araçlar
const route = useRoute();
const router = useRouter();
const { $api } = useNuxtApp();
const toast = useToast();
const userId = route.params.id;

// State'ler
const user = ref(null);
const departments = ref([]);
const isSubmitting = ref(false);

// UForm'un state'i için reaktif bir obje
const formState = reactive({
  fullName: '',
  email: '',
  role: '',
  departmentId: ''
});

// USelectMenu için iki yönlü bağlama (v-model)
// USelectMenu sadece ID'yi döndürdüğü için, `formState.departmentId` ile senkronize tutuyoruz.
const selectedDepartment = computed({
  get: () => formState.departmentId,
  set: (value) => {
    formState.departmentId = value;
  }
});

// Sayfa yüklendiğinde hem kullanıcıyı hem de departmanları çek
const { data, pending, error } = await useAsyncData(
  `user-edit-${userId}`,
  async () => {
    try {
      const [userData, deptsData] = await Promise.all([
        $api(`/users/${userId}`),
        $api('/departments')
      ]);
      return { user: userData.data, departments: deptsData.data };
    } catch (e) {
      console.error("Veri çekme hatası:", e);
      return { user: null, departments: [] };
    }
  }, {
    // Bu veri her zaman sunucudan taze gelsin
    server: false,
    lazy: true,
  }
);

// Veri başarıyla çekildiyse, hem kullanıcıyı hem de form state'ini doldur
watch(data, (newData) => {
  if (newData && newData.user) {
    user.value = newData.user;
    departments.value = newData.departments || [];

    // Form state'ini gelen veriyle güncelle
    formState.fullName = user.value.fullName;
    formState.email = user.value.email;
    formState.role = user.value.role;
    formState.departmentId = user.value.departmentId?._id;
  }
}, { immediate: true });

// Kullanıcıyı güncelleme fonksiyonu
async function updateUser() {
  if (!user.value) return;

  isSubmitting.value = true;
  try {
    await $api(`/users/${userId}`, {
      method: 'PUT',
      // Sadece formState'i gönderiyoruz, bu daha temiz.
      body: formState,
    });
    toast.add({ title: 'Başarılı!', description: 'Kullanıcı bilgileri güncellendi.', icon: 'i-heroicons-check-circle' });
    router.push('/admin/users');
  } catch (err) {
    toast.add({ title: "Hata!", description: err.data?.message || "Güncellenemedi.", color: 'red', icon: 'i-heroicons-x-circle' });
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<!-- ÖZEL CSS'E ARTIK İHTİYAÇ YOK! -->
<style scoped>
/* Bu alanın boş olması, Nuxt UI'ın ne kadar güçlü olduğunu gösterir :) */
</style>