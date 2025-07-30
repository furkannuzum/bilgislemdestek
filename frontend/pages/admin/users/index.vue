<!-- /admin/users/index.vue SAYFASININ NİHAİ İÇERİĞİ -->
<template>
  <div class="space-y-8">
    <!-- Başlık Bölümü -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Kullanıcı Yönetimi</h1>
      <p class="mt-1 text-gray-500 dark:text-gray-400">
        Sisteme yeni kullanıcılar ekleyin veya mevcut kullanıcıların bilgilerini güncelleyin.
      </p>
    </div>

    <!-- İçerik: Sol form, sağ tablo -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Sol: Yeni Kullanıcı Ekleme Formu -->
      <UCard class="lg:col-span-1">
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Yeni Kullanıcı Oluştur</h2>
        </template>
        
        <UForm :state="newUser" :schema="schema" @submit="createUser" class="space-y-4">
          <UFormGroup label="Ad Soyad" name="fullName">
            <UInput v-model="newUser.fullName" />
          </UFormGroup>
          <UFormGroup label="E-posta Adresi" name="email">
            <UInput v-model="newUser.email" type="email" />
          </UFormGroup>
          <UFormGroup label="Geçici Şifre" name="password">
            <UInput v-model="newUser.password" type="password" />
          </UFormGroup>
          <UFormGroup label="Birim (Departman)" name="departmentId">
            <USelectMenu
              v-model="newUser.departmentId"
              :options="departments"
              value-attribute="_id"
              option-attribute="name"
              placeholder="Birim Seçiniz..."
              searchable
            />
          </UFormGroup>
          <UFormGroup label="Kullanıcı Rolü" name="role">
            <USelect
              v-model="newUser.role"
              :options="userRoles"
            />
          </UFormGroup>
          <UButton 
            type="submit"
            :loading="isSubmitting"
            block
            size="lg"
          >
            Kullanıcıyı Kaydet
          </UButton>
        </UForm>
      </UCard>
      
      <!-- Sağ: Kullanıcı Listesi -->
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Mevcut Kullanıcılar</h2>
            <UInput
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass-20-solid"
              placeholder="Kullanıcı ara..."
              class="w-full sm:w-64"
            />
          </div>
        </template>

        <div v-if="isLoadingUsers" class="text-center py-10 text-gray-500">Yükleniyor...</div>
        <!-- HATA ÇÖZÜMÜ: :columns="columns" prop'u geri eklendi. Bu zorunludur. -->
        <UTable 
          v-else 
          :rows="filteredUsers" 
          :columns="columns"
          :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'Kullanıcı bulunamadı.' }"
        >
            <template #departmentId-data="{ row }">
              <span>{{ row.departmentId?.name || 'Atanmamış' }}</span>
            </template>
            <template #role-data="{ row }">
              <UBadge :color="roleColorMap[row.role]" variant="soft">{{ row.role }}</UBadge>
            </template>
            <template #actions-data="{ row }">
              <div class="flex items-center gap-2 justify-end">
                <UButton
                  icon="i-heroicons-pencil-square"
                  size="sm"
                  color="gray"
                  variant="ghost"
                  @click="router.push(`/admin/users/${row._id}`)"
                />
                <UButton
                  icon="i-heroicons-trash"
                  size="sm"
                  color="red"
                  variant="ghost"
                  @click="deleteUser(row._id, row.fullName)"
                />
              </div>
            </template>
        </UTable>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { z } from 'zod';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import type { BadgeColor } from '#ui/types'

definePageMeta({ layout: 'default', middleware: 'auth' });

const { $api } = useNuxtApp();
const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();

if (!['Admin', 'ITAgent'].includes(authStore.userRole)) {
  toast.add({ title: 'Yetkisiz Erişim', description: 'Bu sayfayı görüntüleme yetkiniz yok.', color: 'red' });
  router.replace('/');
}

// State'ler
const users = ref<any[]>([]);
const departments = ref<{ _id: string, name: string }[]>([]);
const userRoles = ['EndUser', 'ITAgent', 'Admin'];
const isLoadingUsers = ref(false);
const isSubmitting = ref(false);
const searchQuery = ref('');

const newUser = reactive({
  fullName: '',
  email: '',
  password: '',
  role: 'EndUser',
  departmentId: undefined as string | undefined,
});

const schema = z.object({
  fullName: z.string().min(3, 'Ad Soyad en az 3 karakter olmalıdır.'),
  email: z.string().email('Lütfen geçerli bir e-posta adresi girin.'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
  departmentId: z.string({ required_error: "Birim seçimi zorunludur." }),
  role: z.string({ required_error: "Rol seçimi zorunludur." }),
});

// Tablo sütunları: UTable'ın çalışması için bu dizi zorunludur.
const columns = [
  { key: 'fullName', label: 'Ad Soyad', sortable: true },
  { key: 'email', label: 'E-posta', sortable: true },
  { key: 'departmentId', label: 'Birim', sortable: true },
  { key: 'role', label: 'Rol', sortable: true },
  { key: 'actions', label: 'İşlemler', class: 'text-right' } // Butonları sağa yaslamak için
];

const roleColorMap: { [key: string]: BadgeColor } = {
  Admin: 'red',
  ITAgent: 'orange',
  EndUser: 'primary',
};

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user =>
    user.fullName.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.role.toLowerCase().includes(query) ||
    (user.departmentId?.name && user.departmentId.name.toLowerCase().includes(query))
  );
});

// --- API FONKSİYONLARI ---
async function fetchAllData() {
  isLoadingUsers.value = true;
  try {
    const [usersResponse, deptsResponse]: [any, any] = await Promise.all([
      $api('/users'),
      $api('/departments'),
    ]);
    if (usersResponse.success) users.value = usersResponse.data;
    if (deptsResponse.success) departments.value = deptsResponse.data;
  } catch (err) {
    toast.add({ title: 'Hata', description: 'Veriler yüklenemedi.', color: 'red' });
  } finally {
    isLoadingUsers.value = false;
  }
}

async function createUser() {
  isSubmitting.value = true;
  try {
    await $api('/users', { method: 'POST', body: newUser });
    toast.add({ title: 'Başarılı!', description: 'Kullanıcı oluşturuldu.', icon: 'i-heroicons-check-circle' });
    Object.assign(newUser, { fullName: '', email: '', password: '', role: 'EndUser', departmentId: undefined });
    await fetchAllData();
  } catch (err: any) {
    toast.add({ title: "HATA!", description: err.data?.message || "Kullanıcı oluşturulamadı.", color: "red", icon: 'i-heroicons-x-circle' });
  } finally {
    isSubmitting.value = false;
  }
}

async function deleteUser(userId: string, userName: string) {
  if (!confirm(`'${userName}' adlı kullanıcıyı kalıcı olarak silmek istediğinizden emin misiniz?`)) return;
  try {
    await $api(`/users/${userId}`, { method: 'DELETE' });
    toast.add({ title: 'Başarılı!', description: 'Kullanıcı silindi.', icon: 'i-heroicons-check-circle' });
    await fetchAllData();
  } catch (err: any) {
    toast.add({ title: "Hata!", description: err.data?.message || "Kullanıcı silinemedi.", color: "red", icon: 'i-heroicons-x-circle' });
  }
}

onMounted(fetchAllData);
</script>

<style scoped></style>