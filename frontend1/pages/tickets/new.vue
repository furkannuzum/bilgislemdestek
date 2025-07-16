<template>
  <UCard>
    <template #header>
      <div class="flex items-center space-x-3">
        <UIcon name="i-heroicons-ticket-20-solid" class="w-6 h-6 text-blue-600" />
        <h1 class="text-2xl mt-5 mb-5 font-bold">Yeni Destek Talebi Oluştur</h1>
      </div>
      <p class="text-gray-500 mt-4 mb-4 pl-9">
        Lütfen yaşadığınız sorun veya talebinizle ilgili bilgileri girin.
      </p>
    </template>

    <UForm :state="state" :schema="schema" @submit="handleCreateTicket" class="space-y-5">
      <UFormGroup label="Başlık" name="title" required>
        <UInput v-model="state.title" placeholder="Örn: Yazıcım çıktı vermiyor" size="lg" />
      </UFormGroup>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Kategori Seçimi -->
        <UFormGroup label="Kategori" name="category" required>
          <USelectMenu
            v-model="state.category"
            :options="ticketCategories"
            option-attribute="name"
            by="_id"
            placeholder="Sorun kategorisi seçiniz..."
            searchable
            size="lg"
            class="w-full"
            :clearable="true"
          />
        </UFormGroup>

        <!-- Öncelik -->
        <UFormGroup label="Öncelik" name="priority" required>
          <USelect v-model="state.priority" :options="priorityOptions" size="lg" class="w-full" />
        </UFormGroup>
      </div>

      <UFormGroup label="Açıklama" name="description" required>
        <UTextarea
          v-model="state.description"
          :rows="6"
          placeholder="Lütfen sorunu olabildiğince detaylı anlatın..."
        />
      </UFormGroup>

      <UFormGroup label="Ekran Görüntüsü (İsteğe Bağlı)" name="attachment">
        <input
          type="file"
          @change="handleFileChange"
          accept="image/png, image/jpeg, image/gif"
          class="file-input"
        />
      </UFormGroup>

      <div class="flex justify-end pt-4">
  <UButton
    type="submit"
    :loading="isLoading"
    size="lg"
    icon="i-heroicons-paper-airplane"
    class="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-5 py-3 text-center transition-colors disabled:opacity-50 shadow"
  >
    Destek Talebi Oluştur
  </UButton>
</div>
    </UForm>
  </UCard>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { z } from 'zod'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default', middleware: 'auth' })

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
const priorityOptions = ['Low', 'Medium', 'High', 'Urgent']

const schema = z.object({
  title: z.string({ required_error: 'Başlık zorunludur.' }).min(5),
  category: z.object({ _id: z.string(), name: z.string() }, { required_error: "Kategori seçimi zorunludur." }),
  priority: z.enum(priorityOptions, { required_error: "Öncelik seçimi zorunludur." }),
  description: z.string({ required_error: 'Açıklama zorunludur.' }).min(15),
  attachment: z.any().optional(),
})

const state = reactive({
  title: undefined,
  category: undefined,
  priority: 'Medium',
  description: undefined,
  attachment: null
})

// Kategoriler çekiliyor
const ticketCategories = ref([])
const { data, error } = await useFetch('/api/categories?type=Ticket', {
  headers: { Authorization: `Bearer ${authStore.token}` }
})
if (data.value?.success) {
  ticketCategories.value = data.value.data
} else {
  toast.add({ title: 'Hata', description: 'Kategori listesi yüklenemedi.', color: 'red' })
}

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file && file.size > 5 * 1024 * 1024) {
    toast.add({ title: 'Hata', description: 'Dosya boyutu 5MB\'tan büyük olamaz.', color: 'red' })
    event.target.value = ''
    return
  }
  state.attachment = file || null
}

const isLoading = ref(false)
async function handleCreateTicket(event) {
  isLoading.value = true
  try {
    const ticketResponse = await $fetch('/api/tickets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: {
        title: event.data.title,
        category: event.data.category._id,
        priority: event.data.priority,
        description: event.data.description,
      }
    })
    if (ticketResponse.success && state.attachment) {
      const formData = new FormData()
      formData.append('attachment', state.attachment)
      await $fetch(`/api/tickets/${ticketResponse.data._id}/upload`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${authStore.token}` },
        body: formData,
      })
    }
    toast.add({ title: 'Başarılı!', description: 'Destek talebiniz oluşturuldu.', color: 'green' })
    router.push('/tickets')
  } catch (err) {
    toast.add({ title: 'Hata!', description: err.data?.message || 'Talep oluşturulamadı.', color: 'red' })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.file-input {
  @apply block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer;
}
</style>
