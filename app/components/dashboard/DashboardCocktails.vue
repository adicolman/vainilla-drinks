<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { formatCurrency } from '~/utils/formatting'

const { topCocktails } = useMockData()

const chartData = computed(() => ({
  labels: topCocktails.value.map(c => c.name),
  datasets: [
    {
      data: topCocktails.value.map(c => c.sold),
      backgroundColor: ['#052659', '#5483B3', '#7DA0CA', '#B0A694', '#C1E8FF'],
      borderRadius: 6,
      barThickness: 28,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#021024',
      titleColor: '#fff',
      bodyColor: '#C1E8FF',
      cornerRadius: 8,
      padding: 10,
      titleFont: { family: 'Inter', weight: '600' as const, size: 11 },
      bodyFont: { family: 'Inter', size: 11 },
      callbacks: {
        label: (ctx: any) => ` ${ctx.parsed.y} unidades`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        font: { family: 'Inter', size: 10, weight: '500' as const },
        color: '#B0A694',
      },
      border: { display: false },
    },
    y: {
      grid: { color: 'rgba(176, 166, 148, 0.15)', drawBorder: false },
      ticks: {
        font: { family: 'Inter', size: 10, weight: '400' as const },
        color: '#B0A694',
        padding: 8,
      },
      border: { display: false },
    },
  },
}
</script>

<template>
  <div class="rounded-2xl p-5 sm:p-6 card-bg-vanilla overflow-hidden">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-[14px] font-bold text-brand-950">Cócteles populares</h3>
      <NuxtLink to="/recetas" class="text-[11px] font-semibold text-brand-600 hover:text-brand-950 transition-colors">
        Ver todos →
      </NuxtLink>
    </div>

    <!-- KPI pills -->
    <div class="flex gap-2 mb-5">
      <div
        v-for="cocktail in topCocktails.slice(0, 3)"
        :key="cocktail.name"
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm"
      >
        <span class="text-[12px] font-bold text-brand-950">{{ cocktail.sold }}</span>
        <span class="text-[10px] text-sand-400 font-medium">{{ cocktail.name }}</span>
      </div>
    </div>

    <!-- Bar chart -->
    <div class="h-44">
      <ClientOnly>
        <Bar :data="chartData" :options="chartOptions" />
      </ClientOnly>
    </div>
  </div>
</template>
