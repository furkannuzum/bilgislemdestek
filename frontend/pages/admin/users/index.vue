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
              <UInput
                v-model="searchQuery"
                icon="i-heroicons-magnifying-glass-20-solid"
                placeholder="Kullanıcı ara..."
              />
            </div>
          </template>

          <div class="overflow-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Ad Soyad</th>
                  <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">E-posta</th>
                  <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Birim</th>
                  <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Rol</th>
                  <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Aksiyon</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="user in filteredUsers" :key="user._id">
                  <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ user.fullName }}</td>
                  <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ user.email }}</td>
                  <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                    {{ user.departmentId?.name || 'Atanmamış' }}
                  </td>
                  <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                      <span
                        :class="{
                          'text-red-600 font-semibold': user.role === 'Admin',
                          'text-blue-600 font-semibold': user.role === 'ITAgent',
                          'text-gray-700 dark:text-gray-300': user.role === 'EndUser'
                        }"
                      >
                        {{ user.role }}
                      </span>
                    </td>
                  <td class="px-4 py-2 flex gap-2">
                  <UButton
                    icon="i-heroicons-pencil-square-20-solid"
                    size="xs"
                    class="bg-blue-600 hover:bg-blue-700 text-white"
                    @click="router.push(`/admin/users/${user._id}`)"
                  >
                    Düzenle
                  </UButton>
                  <UButton
                    icon="i-heroicons-trash-20-solid"
                    size="xs"
                    class="bg-red-600 hover:bg-red-700 text-white"
                    @click="deleteUser(user._id, user.fullName)"
                  >
                    Sil
                  </UButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Stil bölümü olduğu gibi bırakıldı */
</style>

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

// Geri kalan tüm state ve schema tanımlamaları olduğu gibi bırakıldı...

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  return users.value.filter(user =>
    Object.values(user).some(value =>
      String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  );
});

// --- İSTENEN DEĞİŞİKLİK BURADA ---
async function fetchUsers() {
  isLoadingUsers.value = true;
  try {
    // API çağrısına Authorization başlığını ekliyoruz.
    const response: any = await $api('/users', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    if (response.success) {
      users.value = response.data;
    }
  } catch (err) {
    toast.add({ title: 'Hata', description: 'Kullanıcı listesi yüklenemedi.', color: 'red' });
  } finally {
    isLoadingUsers.value = false;
  }
}

// --- İYİ BİR PRATİK OLARAK BURAYA DA EKLEYELİM ---
async function fetchDepartments() {
  try {
    // API çağrısına Authorization başlığını ekliyoruz.
    const response: any = await $api('/departments', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
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
    // Diğer API çağrıları için de headers eklemek gerekir, ancak $api plugin'iniz
    // bunu otomatik yapmıyorsa hepsine eklemeniz gerekebilir. Şimdilik sadece
    // sorunun olduğu yeri düzeltiyoruz.
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

async function deleteUser(userId: string, userName: string) {
  if (!confirm(`'${userName}' adlı kullanıcıyı silmek istediğinizden emin misiniz?`)) return;
  
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

// Geri kalan kod (updateUser vb.) olduğu gibi bırakılmıştır.
</script>