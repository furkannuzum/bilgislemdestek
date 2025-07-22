<template>
  <div class="max-w-5xl mx-auto p-6">
    <div v-if="pending">Yükleniyor...</div>
    <div v-else-if="error" class="text-red-500">
      Talep yüklenemedi veya bulunamadı.
    </div>

    <div v-else>
      <h1 class="text-2xl font-bold mb-4">
        {{ ticket.title || "Talep Başlığı Yok" }}
      </h1>

      <!-- BİLGİ KARTI -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white rounded border p-4 shadow mb-6"
      >
        <div><strong>Talep ID:</strong> {{ ticket.ticketId }}</div>
        <div><strong>Durum:</strong> {{ ticket.status }}</div>
        <div><strong>Öncelik:</strong> {{ ticket.priority }}</div>
        <div>
          <strong>Birim:</strong> {{ ticket.department?.name || "Yok" }}
        </div>
        <div>
          <strong>Açan:</strong> {{ ticket.openedBy?.fullName || "Yok" }}
        </div>
        <div>
          <strong>Oluşturma:</strong> {{ formatDateTime(ticket.createdAt) }}
        </div>
        <div>
          <strong>Atanan:</strong>
          {{ ticket.assignedTo?.fullName || "Atanmamış" }}
        </div>
      </div>

      <!-- GÜNCELLEME FORMU (SADECE Admin ve ITAgent) -->
      <div
        v-if="canEdit"
        class="space-y-6 bg-white p-4 border rounded shadow mb-8"
      >
        <!-- DURUM -->
        <div>
          <label class="font-semibold block mb-1">Durumu Güncelle</label>
          <select v-model="selectedStatus" class="border rounded w-full p-2">
            <option value="New">Yeni</option>
            <option value="InProgress">İşlemde</option>
            <option value="Resolved">Çözüldü</option>
            <option value="Closed">Kapandı</option>
            <option value="Cancelled">İptal Edildi</option>
          </select>
        </div>

        <!-- IT Agent -->
        <div>
          <label class="font-semibold block mb-1">IT Agent Ata</label>
          <select
            v-model="selectedAssigneeId"
            class="border rounded w-full p-2"
          >
            <option
              v-for="agent in itAgents"
              :key="agent._id"
              :value="agent._id"
            >
              {{ agent.fullName }} ({{ agent.role }})
            </option>
          </select>
        </div>

        <!-- Yorum -->
        <div>
          <label class="font-semibold block mb-1">Yorum Ekle</label>
          <textarea
            v-model="newComment"
            class="border rounded w-full p-2"
            rows="3"
            placeholder="Yorum yaz..."
          ></textarea>
        </div>

        <!-- ✅ TEK BUTON -->
        <button
          @click="submitAll"
          class="mt-4 bg-indigo-600 text-white px-6 py-2 rounded"
          :disabled="isSubmitting"
        >
          Güncellemeleri Kaydet
        </button>
      </div>

      <!-- GEÇMİŞ -->
      <div class="bg-white border rounded shadow p-4">
        <h2 class="text-lg font-semibold mb-3">Talep Geçmişi</h2>
        <div v-if="ticket.history.length === 0" class="text-sm text-gray-500">
          Geçmiş yok.
        </div>
        <div
          v-for="item in ticket.history"
          :key="item._id"
          class="border-b py-3"
        >
          <div class="text-xs text-gray-500 mb-1">
            {{ formatDateTime(item.timestamp) }} -
            {{ item.user?.fullName || "Sistem" }}
          </div>
          <div class="text-sm font-medium">{{ item.action }}</div>
          <div v-if="item.comment" class="mt-1 text-sm text-gray-700">
            {{ item.comment }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const ticketId = route.params.id;

const ticket = ref(null);
const pending = ref(true);
const error = ref(false);
const isSubmitting = ref(false);
const newComment = ref("");
const selectedStatus = ref("");
const selectedAssigneeId = ref("");
const itAgents = ref([]);

const getToken = () =>
  process.client ? localStorage.getItem("authToken") : null;
const getUser = () => {
  if (!process.client) return {};
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};
const user = getUser();
const userRole = user.role || "";
const canEdit = computed(() => userRole === "Admin" || userRole === "ITAgent");

// === API FONKSİYONLARI ===
const fetchTicket = async () => {
  pending.value = true;
  try {
    const res = await fetch(`http://localhost:3001/api/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const result = await res.json();
    if (result.success) {
      ticket.value = result.data;
      selectedStatus.value = result.data.status;
      selectedAssigneeId.value = result.data.assignedTo?._id || "";
    } else {
      error.value = true;
    }
  } catch (e) {
    error.value = true;
  } finally {
    pending.value = false;
  }
};

const fetchITAgents = async () => {
  try {
    const res = await fetch(
      `http://localhost:3001/api/users?role=Admin,ITAgent`,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );
    const data = await res.json();
    if (data.success) itAgents.value = data.data;
  } catch (err) {
    console.error("IT agent listesi alınamadı:", err);
  }
};

const updateStatus = async () => {
  isSubmitting.value = true;
  try {
    await fetch(`http://localhost:3001/api/tickets/${ticketId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status: selectedStatus.value }),
    });
    await fetchTicket();
  } finally {
    isSubmitting.value = false;
  }
};

const assignAgent = async () => {
  if (!selectedAssigneeId.value) return;
  isSubmitting.value = true;
  try {
    await fetch(`http://localhost:3001/api/tickets/${ticketId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ assignedTo: selectedAssigneeId.value }),
    });
    await fetchTicket();
  } finally {
    isSubmitting.value = false;
  }
};

const addComment = async () => {
  if (!newComment.value.trim()) return;
  isSubmitting.value = true;
  try {
    await fetch(`http://localhost:3001/api/tickets/${ticketId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ comment: newComment.value }),
    });
    newComment.value = "";
    await fetchTicket();
  } finally {
    isSubmitting.value = false;
  }
};
const submitAll = async () => {
  isSubmitting.value = true;
  const updates = {};

  // Değişen durumu ekle
  if (selectedStatus.value && selectedStatus.value !== ticket.value.status) {
    updates.status = selectedStatus.value;
  }

  // Atama ekle
  if (
    selectedAssigneeId.value &&
    selectedAssigneeId.value !== (ticket.value.assignedTo?._id || "")
  ) {
    updates.assignedTo = selectedAssigneeId.value;
  }

  // Yorum ekle (isteğe bağlı)
  if (newComment.value.trim()) {
    updates.comment = newComment.value.trim();
  }

  try {
    if (Object.keys(updates).length === 0) {
      alert("Değişiklik yok.");
      return;
    }

    await fetch(`http://localhost:3001/api/tickets/${ticketId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(updates),
    });

    // Temizlik
    newComment.value = "";
    await fetchTicket();
  } catch (err) {
    console.error("Güncelleme hatası:", err);
  } finally {
    isSubmitting.value = false;
  }
};

const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString("tr-TR") : "Bilinmiyor";

onMounted(async () => {
  await fetchTicket();
  if (canEdit.value) await fetchITAgents();
});
</script>
