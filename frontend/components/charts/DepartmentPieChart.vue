<template>
  <Pie v-if="chartData" :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { computed } from 'vue';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps({
  distributionData: {
    type: Array,
    required: true,
  },
});

const chartData = computed(() => {
  if (!props.distributionData || props.distributionData.length === 0) return null;
  return {
    labels: props.distributionData.map(d => d.departmentName),
    datasets: [
      {
        backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16', '#FFC107', '#3F51B5', '#9C27B0'],
        data: props.distributionData.map(d => d.count),
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};
</script>