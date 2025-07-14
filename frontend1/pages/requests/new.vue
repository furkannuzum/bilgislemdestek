<template>
  <UCard>
    <template #header>
      <div class="flex items-center space-x-3">
        <UIcon name="i-heroicons-computer-desktop-20-solid" class="w-6 h-6 text-blue-600" />
        <h1 class="text-2xl font-bold">Yeni Cihaz Talebi Oluştur</h1>
      </div>
      <p class="text-gray-500 mt-1 pl-9">Lütfen talep ettiğiniz cihaza dair bilgileri girin.</p>
    </template>

    <UForm :state="state" :schema="schema" @submit="handleCreateRequest" class="space-y-4">
      <UFormGroup label="Ürün Kategorisi" name="productCategory" required>
        <USelectMenu
          v-model="state.productCategory"
          :options="productCategories"
          by="_id"
          option-attribute="name"
          placeholder="Kategori seçiniz..."
          searchable
          size="lg"
        />
      </UFormGroup>
      <UFormGroup label="Teknik Özellikler ve Açıklama" name="specs" required>
        <UTextarea v-model="state.specs" :rows="5" placeholder="Örn: 27 inç, 4K, IPS panel bir monitör..." />
      </UFormGroup>
      <div class="flex justify-end">
        <UButton type="submit" :loading="isLoading" size="lg" icon="i-heroicons-paper-airplane">
          Talep Oluştur
        </UButton>
      </div>
    </UForm>
  </UCard>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { z } from 'zod';
import { useAuthStore } from '~/stores/auth';

definePageMeta({ layout: 'default', middleware: 'auth' });

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const schema = z.object({
  productCategory: z.object({_id: z.string(), name: z.string()}, { required_error: "Ürün kategorisi seçimi zorunludur." }),
  specs: z.string({ required_error: "Açıklama alanı zorunludur." }).min(10, 'Lütfen en az 10 karakterlik bir açıklama girin.'),
});

const state = reactive({ productCategory: undefined, specs: undefined });

const productCategories = ref([]);
const { data, error } = await useFetch('/api/categories?type=Product', { headers: { Authorization: `Bearer ${authStore.token}` } });
if (data.value?.success) { productCategories.value = data.value.data; } 
else { toast.add({ title: 'Hata', description: 'Ürün kategorileri yüklenemedi.', color: 'red' }); }

const isLoading = ref(false);
async function handleCreateRequest(event) {
  isLoading.value = true;
  try {
    const response = await $fetch('/api/devicerequests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: {
        productCategory: event.data.productCategory._id,
        specs: event.data.specs,
      }
    });
    if(response.success) {
      toast.add({ title: 'Başarılı!', description: 'Cihaz talebiniz oluşturuldu.', color: 'green' });
      router.push('/requests');
    }
  } catch (err) {
    toast.add({ title: 'Hata!', description: err.data?.message || 'Talep oluşturulamadı.', color: 'red' });
  } finally {
    isLoading.value = false;
  }
}
</script>