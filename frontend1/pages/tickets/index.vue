<template>
  <div class="space-y-6">
    <!-- SAYFA BAŞLIĞI VE YENİ TALEP BUTONU -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold">Destek Talepleri</h1>
        <p class="mt-1 text-gray-500">
          {{
            authStore.userRole === "EndUser"
              ? "Oluşturduğunuz tüm destek taleplerini"
              : "Tüm destek taleplerini"
          }}
          buradan yönetebilirsiniz.
        </p>
      </div>
      <!-- YENİ EKLENEN BUTON -->
      <UButton
        to="/tickets/new"
        icon="i-heroicons-plus-circle-20-solid"
        size="lg"
      >
        Yeni Destek Talebi Oluştur
      </UButton>
    </div>

    <!-- Filtreleme ve Arama Alanı -->
    <UCard>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Başlıkta veya ID'de ara..."
        />
        <USelectMenu
          v-model="selectedStatuses"
          :options="statusOptions"
          multiple
          placeholder="Duruma Göre Filtrele"
        />
        <USelectMenu
          v-model="selectedPriorities"
          :options="priorityOptions"
          multiple
          placeholder="Önceliğe Göre Filtrele"
        />
        <UButton @click="clearFilters" color="gray" variant="ghost"
          >Filtreleri Temizle</UButton
        >
      </div>
    </UCard>

    <!-- Talepleri Listeleyen Tablo -->
    <div v-if="pending" class="text-center py-10">Talepler yükleniyor...</div>
    <div v-else-if="error" class="text-center py-10 text-red-500">
      Talepler yüklenirken bir hata oluştu.
    </div>
    <div v-else>
      <UTable
        :rows="filteredTickets"
        :columns="columns"
        :empty-state="{
          icon: 'i-heroicons-circle-stack-20-solid',
          label: 'Gösterilecek talep bulunamadı.',
        }"
      >
        <!-- ... Tablo slotları aynı kalacak ... -->
      </UTable>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default', // <-- Bu satır önemli
  middleware: 'auth' 
});
// ...
</script>