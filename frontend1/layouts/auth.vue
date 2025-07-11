<!-- frontend1/layouts/auth.vue (GÜNCELLENMİŞ) -->
<template>
  <div class="min-h-screen bg-white flex flex-col p-4">
    <!-- Header'ı ortalamak için 'flex justify-center' eklendi -->
    <header class="w-full py-4 flex justify-center">
      <NuxtLink to="/" class="text-2xl font-bold text-gray-700">
        Mezitli Belediyesi
      </NuxtLink>
    </header>
    
    <main class="flex-grow flex items-center justify-center">
      <slot />
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
</style>