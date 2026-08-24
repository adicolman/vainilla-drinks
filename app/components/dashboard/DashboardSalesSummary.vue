<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { formatCurrency, formatPercent } from '~/utils/formatting'

const { metrics, expenseChartData } = useMockData()

const ingresos = computed(() => metrics.value.find(m => m.label === 'Ingresos')!)
const ganancia = computed(() => metrics.value.find(m => m.label === 'Ganancia')!)
const margen = computed(() => metrics.value.find(m => m.label === 'Margen')!)

const salesData = computed(() => ({
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  datasets: [
    {
      label: 'Ventas',
      data: [180_000, 245_000, 198_000, 310_000, 420_000, 504_000, 336_000],
      borderColor: '#052659',
      backgroundColor: 'rgba(5, 38, 89, 0.08)',
      borderWidth: 2.5,
      tension: 0.4,
      fill: true,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: '#052659',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2,
    },
  ],
}))

const salesOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' as const },
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
        label: (ctx: any) => ` ${formatCurrency(ctx.parsed.y)}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { family: 'Inter', size: 10, weight: '500' as const }, color: '#B0A694' },
      border: { display: false },
    },
    y: {
      grid: { color: 'rgba(176, 166, 148, 0.15)', drawBorder: false },
      ticks: {
        font: { family: 'Inter', size: 10, weight: '400' as const },
        color: '#B0A694',
        padding: 8,
        callback: (v: any) => `$${(v / 1000).toFixed(0)}k`,
      },
      border: { display: false },
    },
  },
}
</script>

<template>
  <div class="rounded-2xl p-5 sm:p-6 card-bg-blush overflow-hidden">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-[14px] font-bold text-brand-950">Resumen de ventas</h3>
      <NuxtLink to="/caja" class="text-[11px] font-semibold text-brand-600 hover:text-brand-950 transition-colors">
        Ver detalle →
      </NuxtLink>
    </div>

    <!-- KPI pills -->
    <div class="flex gap-2 mb-5">
      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm">
        <span class="text-[12px] font-bold text-brand-950">{{ formatCurrency(ingresos.value) }}</span>
        <span class="text-[10px] text-sand-400 font-medium">total</span>
      </div>
      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm">
        <span class="text-[12px] font-bold text-success">+12,5%</span>
        <span class="text-[10px] text-sand-400 font-medium">vs anterior</span>
      </div>
      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm">
        <span class="text-[12px] font-bold text-brand-950">{{ formatPercent(margen.value) }}</span>
        <span class="text-[10px] text-sand-400 font-medium">margen</span>
      </div>
    </div>

    <!-- Line chart -->
    <div class="h-44">
      <ClientOnly>
        <Line :data="salesData" :options="salesOptions" />
      </ClientOnly>
    </div>
  </div>
</template>
