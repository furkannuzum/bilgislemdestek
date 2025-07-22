<template>
  <div class="w-full space-y-8">
    <!-- Başlık Bölümü (Aynı Kalıyor) -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Kullanıcı Yönetimi</h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">
        Sisteme yeni kullanıcılar ekleyin veya mevcut kullanıcıların bilgilerini güncelleyin.
      </p>
    </div>

    <!-- Ana İçerik: Form ve Liste -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Sol Taraf: Yeni Kullanıcı Ekleme Formu (YENİ TASARIM) -->
      <div class="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">Yeni Kullanıcı Oluştur</h2>
        
        <form @submit.prevent="createUser" class="space-y-6">
          <!-- Ad Soyad Input Alanı -->
          <div>
            <label for="fullName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Ad Soyad</label>
            <div class="mt-1">
              <input 
                v-model="newUser.fullName"
                id="fullName" 
                name="fullName" 
                type="text" 
                required 
                class="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <!-- E-posta Input Alanı -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">E-posta Adresi</label>
            <div class="mt-1">
              <input 
                v-model="newUser.email"
                id="email" 
                name="email" 
                type="email" 
                required 
                class="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <!-- Şifre Input Alanı -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Geçici Şifre</label>
            <div class="mt-1">
              <input 
                v-model="newUser.password"
                id="password" 
                name="password" 
                type="password" 
                required 
                class="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <!-- Departman Seçim Alanı -->
          <div>
            <label for="department" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Birim (Departman)</label>
            <div class="mt-1">
              <select 
                v-model="newUser.departmentId"
                id="department" 
                name="department" 
                required 
                class="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option :value="null" disabled>Birim Seçiniz...</option>
                <option v-for="dept in departments" :key="dept._id" :value="dept._id">
                  {{ dept.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Rol Seçim Alanı -->
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Kullanıcı Rolü</label>
            <div class="mt-1">
              <select 
                v-model="newUser.role"
                id="role" 
                name="role" 
                required 
                class="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <span v-if="isSubmitting">Kaydediliyor...</span>
              <span v-else>Kullanıcıyı Kaydet</span>
            </button>
          </div>
        </form>
      </div>

        <!-- Sağ Taraf: Mevcut Kullanıcılar Listesi (YENİ KISIM) -->
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Mevcut Kullanıcılar</h2>
              <!-- Arama Input'u -->
              <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Kullanıcı ara..." />
            </div>
          </template>
          
          <!-- KULLANICI TABLOSU -->
          <UTable 
            :columns="columns" 
            :rows="filteredUsers" 
            :loading="isLoadingUsers"
          >
            <!-- Rol Sütunu için özel gösterim -->
            <template #role-data="{ row }">
              <UBadge :color="roleColor(row.role)" variant="soft">{{ row.role }}</UBadge>
            </template>
            
            <!-- Departman Sütunu için özel gösterim -->
            <template #department-data="{ row }">
              <span>{{ row.departmentId?.name || 'Atanmamış' }}</span>
            </template>
            
            <!-- Aksiyonlar (Düzenle/Sil) Sütunu -->
            <template #actions-data="{ row }">
              <UDropdown :items="userActions(row)">
                <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
              </UDropdown>
            </template>
          </UTable>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'; // computed'ı import et
import { z } from 'zod';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: 'default',
  middleware: 'auth',
});

const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();
if (authStore.userRole !== 'Admin' && authStore.userRole !== 'ITAgent') {
  toast.add({ title: 'Yetkisiz Erişim', description: 'Bu sayfayı görüntüleme yetkiniz yok.', color: 'red' });
  router.replace('/'); // <-- Burada sadece kullanılıyor, tanımlanmıyor. Bu doğru.
}
// --- YENİ REAKTİF STATE'LER ---
const users = ref<any[]>([]); // Tüm kullanıcıları tutacak dizi
const isLoadingUsers = ref(false);
const searchQuery = ref(''); // Arama kutusunun değerini tutacak


// --- REAKTİF STATE TANIMLAMALARI ---
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

const isEditModalOpen = ref(false); // Modal'ın açık/kapalı durumunu tutar
const selectedUser = ref<any>(null); // Düzenlenmek üzere seçilen kullanıcıyı tutar
// --- TABLO İÇİN AYARLAR ---
// Tablo sütunlarını tanımla
const columns = [
  { key: 'fullName', label: 'Ad Soyad' },
  { key: 'email', label: 'E-posta' },
  { key: 'department-data', label: 'Birim' }, // Özel template kullanacağımız için '-data' ekledik
  { key: 'role', label: 'Rol' },
  { key: 'actions', label: 'Aksiyonlar' } // Düzenle/Sil butonları için
];

// Rol etiketleri için renk belirleme
const roleColor = (role: string) => {
  if (role === 'Admin') return 'red';
  if (role === 'ITAgent') return 'orange';
  return 'primary';
};

// Her satır için aksiyon menüsü elemanlarını oluşturma
const userActions = (row: any) => [[
  {
    label: 'Düzenle',
    icon: 'i-heroicons-pencil-square-20-solid',
    click: () => {
      // Düzenlenecek kullanıcıyı seç ve modal'ı aç
      selectedUser.value = { ...row }; // Değişikliklerin tabloyu anında etkilememesi için bir kopyasını alıyoruz
      isEditModalOpen.value = true;
    }
  }, {
    label: 'Sil',
    icon: 'i-heroicons-trash-20-solid',
    click: () => deleteUser(row._id) // Silme fonksiyonunu çağır
  }
]];

// Arama kutusuna yazılan metne göre kullanıcıları filtrele
const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return users.value;
  }
  return users.value.filter(user => {
    return Object.values(user).some(value => {
      return String(value).toLowerCase().includes(searchQuery.value.toLowerCase());
    });
  });
});

// --- YENİ API FONKSİYONU ---
// Mevcut kullanıcıları API'den çekme
async function fetchUsers() {
  isLoadingUsers.value = true;
  const token = getToken(); // Zaten var olan yardımcı fonksiyon
  if (!token) return; // Token yoksa işlemi durdur

  try {
    const response: any = await $fetch('http://localhost:3001/api/users', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
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
// --- YARDIMCI FONKSİYON ---
const getToken = (): string | null => {
  if (process.client) {
    // BURAYI KONTROL ET: Senin localStorage key'in 'token' mı yoksa 'auth-token' mi?
    // Önceki çalışan koduna göre 'token' olmalı.
     return localStorage.getItem('authToken'); 
  }
  return null;
}

// --- API FONKSİYONLARI ---
async function fetchDepartments() {
  // ... Bu fonksiyon şimdilik doğru çalıştığı için dokunmuyoruz ...
  const token = getToken();
  try {
    const response: any = await $fetch('http://localhost:3001/api/departments', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.success) {
      departments.value = response.data;
    }
  } catch (err) {
    // hata mesajını gösterme, konsolda göreceğiz
  }
}

async function createUser() {
  console.log('--- Kullanıcı Oluşturma Başladı ---');

  isSubmitting.value = true;
  
  // ****** KONTROL ADIMI 2: TOKEN BURADA ALINIYOR ******
  const token = getToken();
  console.log('2. createUser fonksiyonu içindeki token:', token);

  if (!token) {
    toast.add({ title: 'HATA!', description: 'Token alınamadı (null)! Lütfen localStorage key adını kontrol et.', color: 'red' });
    isSubmitting.value = false;
    return;
  }

  try {
    console.log('3. API isteği gönderiliyor. Başlık:', `Bearer ${token}`);
    
    const response: any = await $fetch('http://localhost:3001/api/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: newUser,
    });
    
    console.log('4. API cevabı alındı:', response);

    if (response.success) {
      toast.add({ title: 'Başarılı!', description: 'Kullanıcı oluşturuldu.', color: 'green' });
     Object.assign(newUser, { /* ... */ });
      
      // YENİ: Kullanıcı eklendikten sonra listeyi yenile!
      await fetchUsers(); 
    }
  } catch (err: any) {
    console.error('API HATASI:', err);
    toast.add({ title: "HATA!", description: err.data?.message || "Kullanıcı oluşturulamadı.", color: "red" });
  } finally {
    isSubmitting.value = false;
  }
}
    // --- YENİ API FONKSİYONLARI ---
async function updateUser() {
  if (!selectedUser.value) return;
  isSubmitting.value = true;
  const token = getToken();
  if (!token) { /* ... token yoksa hata ver ... */ return; }

  try {
    // Önemli: departmentId bir obje olabilir, sadece ID'sini göndermeliyiz.
    const payload = {
      ...selectedUser.value,
      departmentId: selectedUser.value.departmentId?._id || selectedUser.value.departmentId,
    };

    const response: any = await $fetch(`/api/users/${selectedUser.value._id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: payload,
    });
    
    if (response.success) {
      toast.add({ title: 'Başarılı!', description: 'Kullanıcı güncellendi.', color: 'green' });
      isEditModalOpen.value = false;
      await fetchUsers(); // Listeyi yenile
    }
  } catch (err: any) {
    toast.add({ title: "Hata!", description: err.data?.message || "Güncellenemedi.", color: "red" });
  } finally {
    isSubmitting.value = false;
  }
}

async function deleteUser(userId: string) {
  // Basit bir onay penceresi
  if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
    return;
  }
  
  const token = getToken();
  if (!token) { /* ... hata ver ... */ return; }

  try {
    await $fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    toast.add({ title: 'Başarılı!', description: 'Kullanıcı silindi.', color: 'green' });
    await fetchUsers(); // Listeyi yenile
  } catch (err: any) {
    toast.add({ title: "Hata!", description: err.data?.message || "Kullanıcı silinemedi.", color: "red" });
  }
}
// --- YAŞAM DÖNGÜSÜ HOOK'U ---
onMounted(() => {
  console.log('--- Sayfa Yüklendi (onMounted) ---');
  // ****** KONTROL ADIMI 1: SAYFA YÜKLENİRKEN TOKEN DURUMU ******
  if (process.client) {
    const tokenInStorage = localStorage.getItem('token');
    console.log('1. localStorage\'dan okunan token:', tokenInStorage);
  }
  
  fetchDepartments();
  fetchUsers();
});
</script>