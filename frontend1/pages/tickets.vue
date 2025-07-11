 ```vue
 <!-- frontend1/pages/tickets.vue -->
 <template>
   <div>
     <h1 class="text-3xl font-bold text-gray-900">Destek Talepleri</h1>
     <p class="mt-1 text-gray-500">
       Tüm destek taleplerini buradan yönetebilirsiniz.
     </p>
     <!-- Buraya daha sonra ticket listesi tablosu gelecek -->
   </div>
 </template>

 <script setup>
 // Bu sayfanın "default" (yani solda menü olan) layout'u kullanmasını sağlıyoruz.
 definePageMeta({
   layout: 'default'
 })
 </script>
 ```