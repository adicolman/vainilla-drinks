<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { useMockData } from '~/composables/useMockData'

const { expenseChartData } = useMockData()

const chartData = computed(() => ({
  labels: expenseChartData.value.labels,
  datasets: expenseChartData.value.datasets.map((ds, i) => ({
    ...ds,
    borderWidth: i === 0 ? 2.5 : 1.5,
    tension: 0.45,
    fill: true,
    pointRadius: 0,
    pointHoverRadius: 4,
    pointHoverBackgroundColor: ds.borderColor,
    pointHoverBorderColor: '#fff',
    pointHoverBorderWidth: 2,
    borderColor: i === 0 ? '#052659' : i === 1 ? '#7DA0CA' : '#B0A694',
    backgroundColor: i === 0
      ? 'rgba(5, 38, 89, 0.06)'
      : i === 1
        ? 'rgba(125, 160, 202, 0.04)'
        : 'rgba(176, 166, 148, 0.03)',
  })),
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      align: 'end' as const,
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        boxWidth: 5,
        padding: 20,
        font: {
          family: 'Inter',
          size: 11,
          weight: '500' as const,
        },
        color: '#B0A694',
      },
    },
    tooltip: {
      backgroundColor: '#021024',
      titleColor: '#fff',
      bodyColor: '#C1E8FF',
      borderColor: 'rgba(84, 131, 179, 0.3)',
      borderWidth: 1,
      cornerRadius: 10,
      padding: { top: 10, bottom: 10, left: 14, right: 14 },
      titleFont: { family: 'Inter', weight: '600' as const, size: 12 },
      bodyFont: { family: 'Inter', size: 12 },
      bodySpacing: 6,
      usePointStyle: true,
      callbacks: {
        title: (items: any[]) => items[0]?.label || '',
        label: (ctx: any) => {
          const value = ctx.parsed.y
          return `  ${ctx.dataset.label}   $${new Intl.NumberFormat('es-AR').format(value)}`
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        font: { family: 'Inter', size: 11, weight: '400' as const },
        color: '#B0A694',
        padding: 8,
      },
      border: { display: false },
    },
    y: {
      grid: {
        color: 'rgba(176, 166, 148, 0.12)',
        drawBorder: false,
      },
      ticks: {
        font: { family: 'Inter', size: 11, weight: '400' as const },
        color: '#B0A694',
        padding: 12,
        callback: (value: any) => `$${(value / 1000).toFixed(0)}k`,
      },
      border: { display: false },
    },
  },
}
</script>

<template>
  <div class="h-64">
    <ClientOnly>
      <Line :data="chartData" :options="chartOptions" />
      <template #fallback>
        <LoadingState :lines="3" type="card" />
      </template>
    </ClientOnly>
  </div>
</template>
