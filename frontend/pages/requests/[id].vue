<template>
  <div class="max-w-5xl mx-auto p-6">
    <div v-if="pending">Yükleniyor...</div>
    <div v-else-if="error" class="text-red-500">Talep yüklenemedi veya bulunamadı.</div>

    <!-- v-else-if="request" ekleyerek request'in null olmadığı durumu garantiliyoruz -->
    <div v-else-if="request">
      <!-- Başlık olarak productCategory'nin adını kullanalım -->
      <h1 class="text-2xl font-bold mb-4">{{ request.productCategory?.name || 'Cihaz Talebi' }}</h1>

      <!-- BİLGİ KARTI - DOĞRU ALANLARLA GÜNCELLENDİ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white rounded border p-4 shadow mb-6">
        <!-- 'requestId' yerine '_id' kullanıyoruz -->
        <div><strong>Talep ID:</strong> {{ request._id }}</div>
        <div><strong>Durum:</strong> {{ request.status }}</div>
        
        <!-- 'priority' alanı API'de yok, bu yüzden 'Belirtilmemiş' gösteriyoruz -->
        <div><strong>Öncelik:</strong> {{ request.priority || 'Belirtilmemiş' }}</div>

        <!-- 'department' alanı doğru, olduğu gibi bırakabiliriz -->
        <div><strong>Birim:</strong> {{ request.department?.name || 'Yok' }}</div>

        <!-- 'openedBy' yerine 'requestedBy' kullanıyoruz -->
        <div><strong>Açan:</strong> {{ request.requestedBy?.fullName || 'Yok' }}</div>
        
        <div><strong>Oluşturma:</strong> {{ formatDateTime(request.createdAt) }}</div>

        <!-- 'assignedTo' alanı API'de yok, bu yüzden bu satırı güncelliyoruz veya kaldırıyoruz -->
        <div><strong>Atanan:</strong> {{ request.assignedTo?.fullName || 'Atanmamış' }}</div>
      </div>

      <!-- GÜNCELLEME FORMU -->
      <!-- 'IT Agent Ata' kısmı, modelinizde 'assignedTo' alanı olmadığı için çalışmayacak. -->
      <!-- Şimdilik bu bölümü yorum satırı yapabilir veya backend'e bu özelliği ekleyebilirsiniz. -->
      <div v-if="canEdit" class="space-y-6 bg-white p-4 border rounded shadow mb-8">
        <div>
          <label class="font-semibold block mb-1">Durumu Güncelle</label>
          <select v-model="selectedStatus" class="border rounded w-full p-2">
            <!-- Durum seçenekleri projenizin akışına göre güncellenmeli (örn: Pending, Approved, Rejected) -->
            <option value="PendingApproval">Onay Bekliyor</option>
            <option value="Approved">Onaylandı</option>
            <option value="Rejected">Reddedildi</option>
            <option value="Ordered">Sipariş Edildi</option>
            <option value="Delivered">Teslim Edildi</option>
          </select>
        </div>

        <!-- BU BÖLÜM GEÇİCİ OLARAK YORUMA ALINDI, ÇÜNKÜ BACKEND'DE KARŞILIĞI YOK -->
        <!--
        <div>
          <label class="font-semibold block mb-1">IT Agent Ata</label>
          <select v-model="selectedAssigneeId" class="border rounded w-full p-2">
            <option v-for="agent in itAgents" :key="agent._id" :value="agent._id">
              {{ agent.fullName }} ({{ agent.role }})
            </option>
          </select>
        </div>
        -->

        <div>
          <label class="font-semibold block mb-1">Yorum Ekle / Red Sebebi</label>
          <textarea v-model="newComment" class="border rounded w-full p-2" rows="3" placeholder="Yorum veya red sebebi yaz..."></textarea>
        </div>

        <button @click="submitAll" class="mt-4 bg-indigo-600 text-white px-6 py-2 rounded" :disabled="isSubmitting">
          Güncellemeleri Kaydet
        </button>
      </div>

      <!-- GEÇMİŞ -->
      <div class="bg-white border rounded shadow p-4">
        <h2 class="text-lg font-semibold mb-3">Talep Geçmişi</h2>
        <div v-if="!request.history || request.history.length === 0" class="text-sm text-gray-500">Geçmiş yok.</div>
        <div v-else v-for="item in request.history" :key="item._id" class="border-b py-3">
          <div class="text-xs text-gray-500 mb-1">
            {{ formatDateTime(item.timestamp) }} - {{ item.user?.fullName || 'Sistem' }}
          </div>
          <div class="text-sm font-medium">{{ item.action }}</div>
          <!-- API history'de comment alanı göndermiyor, bu satır gizlenebilir -->
          <!-- <div v-if="item.comment" class="mt-1 text-sm text-gray-700">{{ item.comment }}</div> -->
        </div>
      </div>
    </div>
  </div>
</template> 
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

// $api yerine doğrudan $fetch kullanıyoruz, nuxt.config.ts'de proxy ayarınız olmalı.
const route = useRoute()
const requestId = route.params.id
console.log('Request ID:', requestId)

const authStore = useAuthStore()
const userRole = computed(() => authStore.user?.role || '')
const canEdit = computed(() => userRole.value === 'Admin' || userRole.value === 'ITAgent')

const request = ref(null)
const pending = ref(true)
const error = ref(false)
const isSubmitting = ref(false)
const newComment = ref('')
const selectedStatus = ref('')
// 'assignedTo' alanı olmadığı için bu satır şimdilik işlevsiz
const selectedAssigneeId = ref('') 
const itAgents = ref([])

const fetchRequest = async () => {
  pending.value = true
  try {
    const result = await $fetch(`/api/devicerequests/${requestId}`, {
        credentials: 'include'
    })
    if (result.success) {
      request.value = result.data
      selectedStatus.value = result.data.status
      // assignedTo alanı olmadığı için bu satır hata verebilir, yoruma alalım
      // selectedAssigneeId.value = result.data.assignedTo?._id || ''
    } else {
      error.value = true
    }
  } catch (e) {
    console.error('Talep getirme hatası:', e)
    error.value = true
  } finally {
    pending.value = false
  }
}

// Bu fonksiyon da 'assignedTo' olmadığı için şimdilik gereksiz, ama gelecekte kullanılabilir.
const fetchITAgents = async () => {
  try {
    const data = await $fetch(`/api/users?role=Admin,ITAgent`, {
        credentials: 'include'
    })
    if (data.success) {
      itAgents.value = data.data
    }
  } catch (err) {
    console.error('IT agent listesi alınamadı:', err)
  }
}

const submitAll = async () => {
  isSubmitting.value = true
  const updates = {}

  // Backend'deki PUT endpoint'i sadece 'status' ve 'rejectionReason' alıyor.
  // Bu yüzden gönderilecek veriyi ona göre düzenlemeliyiz.

  if (selectedStatus.value && selectedStatus.value !== request.value.status) {
    updates.status = selectedStatus.value
  }

  // Yorumu 'rejectionReason' olarak gönderelim (eğer status 'Rejected' ise)
  if (newComment.value.trim() && selectedStatus.value === 'Rejected') {
    updates.rejectionReason = newComment.value.trim()
  }

  // Backend'e 'assignedTo' ve 'comment' gönderme özelliği eklenene kadar bu kısımlar işe yaramaz.
  /*
  if (selectedAssigneeId.value && selectedAssigneeId.value !== (request.value.assignedTo?._id || '')) {
    updates.assignedTo = selectedAssigneeId.value
  }
  */

  try {
    if (Object.keys(updates).length === 0) {
      alert('Kaydedilecek bir değişiklik yok.')
      isSubmitting.value = false;
      return
    }

    await $fetch(`/api/devicerequests/${requestId}`, {
      method: 'PUT',
      body: updates,
      credentials: 'include'
    })

    newComment.value = ''
    await fetchRequest() // Veriyi tazelemek için
  } catch (err) {
    console.error('Güncelleme hatası:', err)
    alert('Güncelleme sırasında bir hata oluştu.')
  } finally {
    isSubmitting.value = false
  }
}

const formatDateTime = (d) => d ? new Date(d).toLocaleString('tr-TR') : 'Bilinmiyor'

onMounted(async () => {
  await authStore.fetchUser()
  await fetchRequest()
  if (canEdit.value) {
    // await fetchITAgents() // `assignedTo` özelliği eklenene kadar çağırmaya gerek yok.
  }
})
</script>