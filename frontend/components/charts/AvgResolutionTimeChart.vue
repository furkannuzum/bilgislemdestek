<template>
  <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps({
  resolutionData: {
    type: Array,
    required: true,
  },
});

const chartData = computed(() => {
  if (!props.resolutionData || props.resolutionData.length === 0) return null;
  return {
    labels: props.resolutionData.map(d => d.categoryName),
    datasets: [
      {
        label: 'Ortalama Çözüm Süresi (Gün)',
        backgroundColor: '#3b82f6',
        data: props.resolutionData.map(d => d.avgDays.toFixed(1)),
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};
</script>