<script setup lang="ts">
import { Bar } from 'vue-chartjs'

const { comprasPorSemana } = useDashboard()

const chartData = computed(() => ({
  labels: comprasPorSemana.value.labels.length > 0 ? comprasPorSemana.value.labels : ['Sin datos'],
  datasets: [
    {
      label: 'Compras',
      data: comprasPorSemana.value.data.length > 0 ? comprasPorSemana.value.data : [0],
      borderWidth: 0,
      borderRadius: 6,
      barPercentage: 0.7,
      categoryPercentage: 0.8,
      borderColor: '#052659',
      backgroundColor: 'rgba(5, 38, 89, 0.85)',
    },
  ],
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
          weight: 500,
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
      titleFont: { family: 'Inter', weight: 600, size: 12 },
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
        font: { family: 'Inter', size: 11, weight: 400 },
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
        font: { family: 'Inter', size: 11, weight: 400 },
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
      <Bar :data="chartData" :options="chartOptions" />
      <template #fallback>
        <LoadingState :lines="3" type="card" />
      </template>
    </ClientOnly>
  </div>
</template>
