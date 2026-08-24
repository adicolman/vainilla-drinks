<script setup lang="ts">
import { formatCurrency, formatPercent, formatVariation } from '~/utils/formatting'

const { metrics } = useMockData()

const displayMetrics = computed(() =>
  metrics.value.filter(m => ['Ingresos', 'Ganancia'].includes(m.label))
)

const iconMap: Record<string, string> = {
  Ingresos: 'lucide:trending-up',
  Ganancia: 'lucide:wallet',
}

const colorMap: Record<string, { bg: string, icon: string }> = {
  Ingresos: { bg: 'bg-brand-600/8', icon: 'text-brand-600' },
  Ganancia: { bg: 'bg-success/8', icon: 'text-success' },
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
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div
      v-for="metric in displayMetrics"
      :key="metric.label"
      class="bg-white rounded-2xl border border-sand-200/60 p-4 shadow-card hover:shadow-elevated transition-all duration-300 group"
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
          :class="[
            metric.trend === 'up'
              ? (metric.label === 'Gastos' ? 'text-danger bg-danger-soft' : 'text-success bg-success-soft')
              : metric.trend === 'down'
                ? (metric.label === 'Gastos' ? 'text-success bg-success-soft' : 'text-danger bg-danger-soft')
                : 'text-sand-400 bg-sand-100'
          ]"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold"
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
</template>
