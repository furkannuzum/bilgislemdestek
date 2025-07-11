 ```vue
 <!-- frontend1/pages/requests.vue -->
 <template>
   <div>
     <h1 class="text-3xl font-bold text-gray-900">Cihaz Talepleri</h1>
     <p class="mt-1 text-gray-500">
       Tüm cihaz taleplerini buradan yönetebilirsiniz.
     </p>
     <!-- Buraya daha sonra cihaz talebi listesi tablosu gelecek -->
   </div>
 </template>

 <script setup>
 // Bu sayfanın da "default" layout'u kullanmasını sağlıyoruz.
 definePageMeta({
   layout: 'default'
 })
 </script>
 ```