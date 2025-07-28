<template>
  <div>
    <UButton @click="showModal = true">Modalı Aç</UButton>
    <UModal v-model="showModal" :prevent-close="true" hide-close>
      <div style="padding:24px;">
        <h1>Modal İçeriği</h1>
        <UButton color="primary" block @click="showModal = false">Kapat</UButton>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const showModal = ref(false)
</script>
