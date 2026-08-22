<script setup lang="ts">
import { formatCurrency, formatPercent, formatNumber, formatVariation } from '~/utils/formatting'

const { operationalMetrics } = useMockData()

function formatValue(value: number, format: string): string {
  switch (format) {
    case 'currency': return formatCurrency(value)
    case 'percent': return formatPercent(value)
    case 'number': return formatNumber(value)
    default: return String(value)
  }
}
</script>

<template>
  <div class="flex flex-col sm:flex-row items-stretch gap-px bg-sand-200/40 rounded-2xl overflow-hidden border border-sand-200/60 shadow-card">
    <div
      v-for="metric in operationalMetrics"
      :key="metric.label"
      class="flex-1 bg-white px-5 py-4"
    >
      <div class="flex items-center gap-2 mb-1.5">
        <Icon :name="metric.icon" class="w-3.5 h-3.5 text-sand-400" />
        <span class="text-[10px] font-semibold tracking-[0.12em] uppercase text-sand-400">
          {{ metric.label }}
        </span>
      </div>
      <div class="flex items-baseline gap-2">
        <span class="text-lg font-bold text-brand-950 tracking-tight">
          {{ formatValue(metric.value, metric.format) }}
        </span>
        <span v-if="metric.extra" class="text-[11px] font-semibold text-brand-600">
          {{ metric.extra }}
        </span>
      </div>
      <div v-if="metric.variation !== 0" class="mt-1">
        <span
          :class="metric.trend === 'up' ? 'text-success' : metric.trend === 'down' ? 'text-danger' : 'text-sand-400'"
          class="text-[10px] font-bold"
        >
          {{ formatVariation(metric.variation) }}
        </span>
      </div>
    </div>
  </div>
</template>
