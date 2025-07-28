<template>
  <div class="w-full space-y-8">
    <!-- Başlık Bölümü -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Kullanıcı Yönetimi</h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">
        Sisteme yeni kullanıcılar ekleyin veya mevcut kullanıcıların bilgilerini güncelleyin.
      </p>
    </div>

    <!-- İçerik: Sol form, sağ tablo -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Sol: Yeni Kullanıcı Ekleme Formu -->
      <div class="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">Yeni Kullanıcı Oluştur</h2>
        <form @submit.prevent="createUser" class="space-y-6">
          <!-- Ad Soyad -->
          <div>
            <label for="fullName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Ad Soyad</label>
            <div class="mt-1">
              <input 
                v-model="newUser.fullName"
                id="fullName"
                type="text"
                required
                class="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <!-- E-posta -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">E-posta Adresi</label>
            <div class="mt-1">
              <input 
                v-model="newUser.email"
                id="email"
                type="email"
                required
                class="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <!-- Şifre -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Geçici Şifre</label>
            <div class="mt-1">
              <input 
                v-model="newUser.password"
                id="password"
                type="password"
                required
                class="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <!-- Birim -->
          <div>
            <label for="department" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Birim (Departman)</label>
            <div class="mt-1">
              <select 
                v-model="newUser.departmentId"
                id="department"
                required
                class="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option :value="null" disabled>Birim Seçiniz...</option>
                <option v-for="dept in departments" :key="dept._id" :value="dept._id">
                  {{ dept.name }}
                </option>
              </select>
            </div>
          </div>
          <!-- Rol -->
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Kullanıcı Rolü</label>
            <div class="mt-1">
              <select 
                v-model="newUser.role"
                id="role"
                required
                class="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option v-for="role in userRoles" :key="role" :value="role">
                  {{ role }}
                </option>
              </select>
            </div>
          </div>
          <!-- Buton -->
          <div>
            <button 
              type="submit"
              :disabled="isSubmitting"
              class="w-full flex justify-center py-2 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <span v-if="isSubmitting">Kaydediliyor...</span>
              <span v-else>Kullanıcıyı Kaydet</span>
            </button>
          </div>
        </form>
      </div>
      <!-- Sağ: Kullanıcı Listesi -->
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Mevcut Kullanıcılar</h2>
              <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Kullanıcı ara..." />
            </div>
          </template>
          <UTable :columns="columns" :rows="filteredUsers" :loading="isLoadingUsers">
            <template #role-data="{ row }">
              <UBadge :color="roleColor(row.role)" variant="soft">{{ row.role }}</UBadge>
            </template>
            <template #department-data="{ row }">
              <span>{{ row.departmentId?.name || 'Atanmamış' }}</span>
            </template>
            <template #actions-data="{ row }">
              <UDropdown :items="userActions(row)">
                <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
              </UDropdown>
            </template>
          </UTable>
        </UCard>
      </div>
    </div>
    <!-- Düzenleme Modalı: Kapatılması engellenmiş -->
    <UModal v-model="isEditModalOpen" :prevent-close="true" hide-close>
      <template #default>
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Kullanıcıyı Düzenle</h3>
          <UFormGroup label="Ad Soyad">
            <UInput v-model="selectedUser.fullName" />
          </UFormGroup>
          <UFormGroup label="E-posta">
            <UInput v-model="selectedUser.email" />
          </UFormGroup>
          <UFormGroup label="Birim">
            <USelect
              v-model="selectedUser.departmentId"
              :options="departments"
              option-attribute="name"
              value-attribute="_id"
              placeholder="Departman Seçin"
            />
          </UFormGroup>
          <UFormGroup label="Rol">
            <USelect
              v-model="selectedUser.role"
              :options="userRoles"
              placeholder="Rol Seçin"
            />
          </UFormGroup>
          <div class="pt-4">
            <UButton
              :loading="isSubmitting"
              color="blue"
              block
              @click="updateUser"
            >
              Güncelle
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { z } from 'zod';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: 'default',
  middleware: 'auth',
});

const { $api } = useNuxtApp();
const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();

if (authStore.userRole !== 'Admin' && authStore.userRole !== 'ITAgent') {
  toast.add({ title: 'Yetkisiz Erişim', description: 'Bu sayfayı görüntüleme yetkiniz yok.', color: 'red' });
  router.replace('/');
}

const users = ref<any[]>([]);
const isLoadingUsers = ref(false);
const searchQuery = ref('');

const newUser = reactive({
  fullName: '',
  email: '',
  password: '',
  role: 'EndUser',
  departmentId: null as string | null,
});

const schema = z.object({
  fullName: z.string().min(3, 'Ad Soyad en az 3 karakter olmalıdır.'),
  email: z.string().email('Lütfen geçerli bir e-posta adresi girin.'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
  departmentId: z.string({ required_error: "Birim seçimi zorunludur." }),
  role: z.string({ required_error: "Rol seçimi zorunludur." }),
});

const departments = ref<{ _id: string, name: string }[]>([]);
const userRoles = ['EndUser', 'ITAgent', 'Admin'];
const isLoadingDepartments = ref(false);
const isSubmitting = ref(false);

const isEditModalOpen = ref(false);
const selectedUser = ref<any>({}); // Boş objeyle başlatmak güncellemeyi kolaylaştırır

const columns = [
  { key: 'fullName', label: 'Ad Soyad' },
  { key: 'email', label: 'E-posta' },
  { key: 'department-data', label: 'Birim' },
  { key: 'role', label: 'Rol' },
  { key: 'actions', label: 'Aksiyonlar' }
];

const roleColor = (role: string) => {
  if (role === 'Admin') return 'red';
  if (role === 'ITAgent') return 'orange';
  return 'primary';
};

const userActions = (row: any) => [[
  {
    label: 'Düzenle',
    icon: 'i-heroicons-pencil-square-20-solid',
    click: () => {
      // Departman objesiyle uyumluluk için aşağıdaki şekilde atama yapılıyor
      selectedUser.value = {
        ...row,
        departmentId: row.departmentId?._id || row.departmentId, // objeyse _id, değilse string zaten
      };
      isEditModalOpen.value = true;
    }
  }, {
    label: 'Sil',
    icon: 'i-heroicons-trash-20-solid',
    click: () => deleteUser(row._id)
  }
]];

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  return users.value.filter(user =>
    Object.values(user).some(value =>
      String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  );
});

async function fetchUsers() {
  isLoadingUsers.value = true;
  try {
    const response: any = await $api('/users');
    if (response.success) {
      users.value = response.data;
    }
  } catch (err) {
    toast.add({ title: 'Hata', description: 'Kullanıcı listesi yüklenemedi.', color: 'red' });
  } finally {
    isLoadingUsers.value = false;
  }
}

async function fetchDepartments() {
  try {
    const response: any = await $api('/departments');
    if (response.success) {
      departments.value = response.data;
    }
  } catch (err) {
    console.error("Birimler alınamadı:", err);
  }
}

async function createUser() {
  isSubmitting.value = true;
  try {
    const response: any = await $api('/users', {
      method: 'POST',
      body: newUser,
    });
    if (response.success) {
      toast.add({ title: 'Başarılı!', description: 'Kullanıcı oluşturuldu.', color: 'green' });
      Object.assign(newUser, {
        fullName: '',
        email: '',
        password: '',
        role: 'EndUser',
        departmentId: null,
      });
      await fetchUsers();
    }
  } catch (err: any) {
    toast.add({ title: "HATA!", description: err.data?.message || "Kullanıcı oluşturulamadı.", color: "red" });
  } finally {
    isSubmitting.value = false;
  }
}

async function updateUser() {
  if (!selectedUser.value) return;
  isSubmitting.value = true;
  try {
    const payload = {
      ...selectedUser.value,
      departmentId: typeof selectedUser.value.departmentId === 'object'
        ? selectedUser.value.departmentId._id
        : selectedUser.value.departmentId,
    };
    const response: any = await $api(`/users/${selectedUser.value._id}`, {
      method: 'PUT',
      body: payload,
    });
    if (response.success) {
      toast.add({ title: 'Başarılı!', description: 'Kullanıcı güncellendi.', color: 'green' });
      isEditModalOpen.value = false;
      selectedUser.value = {};
      await fetchUsers();
    }
  } catch (err: any) {
    toast.add({ title: "Hata!", description: err.data?.message || "Güncellenemedi.", color: "red" });
  } finally {
    isSubmitting.value = false;
  }
}

async function deleteUser(userId: string) {
  if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
  try {
    await $api(`/users/${userId}`, {
      method: 'DELETE',
    });
    toast.add({ title: 'Başarılı!', description: 'Kullanıcı silindi.', color: 'green' });
    await fetchUsers();
  } catch (err: any) {
    toast.add({ title: "Hata!", description: err.data?.message || "Kullanıcı silinemedi.", color: "red" });
  }
}

onMounted(() => {
  fetchDepartments();
  fetchUsers();
});
</script>
