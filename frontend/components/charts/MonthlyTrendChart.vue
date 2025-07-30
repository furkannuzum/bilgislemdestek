<!-- components/charts/MonthlyTrendChart.vue -->
<template>
  <Line v-if="chartData" :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const props = defineProps({
  trendData: { type: Array, required: true },
  period: { type: String, default: 'monthly' } // Yeni prop
});

const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

// Etiketleri periyoda göre formatlayan fonksiyon
const formatLabel = (dateObj) => {
  switch (props.period) {
    case 'daily':
      return `${dateObj.day} ${monthNames[dateObj.month - 1]}`;
    case 'weekly':
      return `${dateObj.year} - ${dateObj.week}. Hafta`;
    default: // monthly
      return `${monthNames[dateObj.month - 1]} ${dateObj.year}`;
  }
}

const chartData = computed(() => {
  if (!props.trendData || props.trendData.length === 0) return null;
  return {
    labels: props.trendData.map(d => formatLabel(d.date)),
    datasets: [
      {
        label: 'Talep Sayısı',
        backgroundColor: '#f87979',
        borderColor: '#f87979',
        data: props.trendData.map(d => d.count),
        tension: 0.1,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};
</script>