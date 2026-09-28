<script setup lang="ts">
import { formatCurrency, formatPercent, formatVariation } from '~/utils/formatting'

const { valorInventario, comprasEsteMes, variacionCompras, ventasEsteMes, variacionVentas, cajaSaldo, gastosEsteMes, insumosStockBajo } = useDashboard()

const cards = computed(() => [
  {
    label: 'Valor de inventario',
    value: valorInventario.value,
    format: 'currency' as const,
    icon: 'lucide:package',
    trend: 'neutral' as const,
    variation: null,
  },
  {
    label: 'Compras del mes',
    value: comprasEsteMes.value,
    format: 'currency' as const,
    icon: 'lucide:shopping-cart',
    trend: variacionCompras.value > 0 ? 'up' as const : variacionCompras.value < 0 ? 'down' as const : 'neutral' as const,
    variation: variacionCompras.value,
  },
  {
    label: 'Ventas del mes',
    value: ventasEsteMes.value,
    format: 'currency' as const,
    icon: 'lucide:trending-up',
    trend: variacionVentas.value > 0 ? 'up' as const : variacionVentas.value < 0 ? 'down' as const : 'neutral' as const,
    variation: variacionVentas.value,
  },
  {
    label: 'Saldo caja',
    value: cajaSaldo.value,
    format: 'currency' as const,
    icon: 'lucide:wallet',
    trend: cajaSaldo.value >= 0 ? 'neutral' as const : 'down' as const,
    variation: null,
  },
])

const iconMap: Record<string, string> = {
  'Valor de inventario': 'lucide:package',
  'Compras del mes': 'lucide:shopping-cart',
  'Ventas del mes': 'lucide:trending-up',
  'Saldo caja': 'lucide:wallet',
}

const colorMap: Record<string, { bg: string, icon: string }> = {
  'Valor de inventario': { bg: 'bg-brand-600/8', icon: 'text-brand-600' },
  'Compras del mes': { bg: 'bg-vanilla/20', icon: 'text-amber-600' },
  'Ventas del mes': { bg: 'bg-success/10', icon: 'text-success' },
  'Saldo caja': { bg: 'bg-brand-600/10', icon: 'text-brand-600' },
}

function formatValue(value: number, format: string): string {
  switch (format) {
    case 'currency': return formatCurrency(value)
    case 'percent': return formatPercent(value)
    default: return String(value)
  }
}
</script>

<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    <div
      v-for="metric in cards"
      :key="metric.label"
      class="bg-white rounded-2xl border border-sand-200/60 p-5 shadow-card hover:shadow-elevated transition-all duration-300 group"
    >
      <div class="flex items-start justify-between mb-2">
        <div :class="colorMap[metric.label]?.bg" class="w-9 h-9 rounded-xl flex items-center justify-center">
          <Icon
            :name="iconMap[metric.label] || metric.icon"
            :class="colorMap[metric.label]?.icon"
            class="w-5 h-5"
          />
        </div>
        <span
          v-if="metric.variation !== null"
          :class="[
            metric.trend === 'up' ? 'text-danger bg-danger-soft'
              : metric.trend === 'down' ? 'text-success bg-success-soft'
                : 'text-sand-400 bg-sand-100'
          ]"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
        >
          <Icon
            :name="metric.trend === 'up' ? 'lucide:arrow-up' : metric.trend === 'down' ? 'lucide:arrow-down' : 'lucide:minus'"
            class="w-2.5 h-2.5"
          />
          {{ formatVariation(metric.variation) }}
        </span>
      </div>

      <div>
        <span class="text-[10px] font-semibold tracking-[0.12em] uppercase text-sand-400 block mb-1">
          {{ metric.label }}
        </span>
        <span class="text-2xl font-bold text-brand-950 tracking-tight block">
          {{ formatValue(metric.value, metric.format) }}
        </span>
      </div>
    </div>
    </div>
    <div v-if="insumosStockBajo > 0" class="mt-4 flex items-center gap-2 text-[12px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
      <Icon name="lucide:alert-triangle" class="w-4 h-4 shrink-0" />
      <span>{{ insumosStockBajo }} insumo{{ insumosStockBajo > 1 ? 's' : '' }} con stock bajo — <NuxtLink to="/inventario" class="underline">revisar</NuxtLink></span>
    </div>
  </div>
</template>
