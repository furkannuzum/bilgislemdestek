<!-- app.vue DOSYASININ YENİ İÇERİĞİ -->
<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UNotifications /> <!-- Toast mesajları için genel bir kapsayıcı -->
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const token = useCookie('token'); // 'token' sizin cookie adınız olmalı

// Sadece bir token cookie'si varsa kullanıcıyı getirmeyi dene
if (token.value) {
  // await kullanmıyoruz, çünkü uygulamanın açılışını bloklamasını istemiyoruz.
  // İşlem arka planda devam ederken sayfa yüklenir.
  authStore.fetchUser();
}
</script>