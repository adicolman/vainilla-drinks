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
  <div class="bg-white rounded-2xl border border-sand-200/60 shadow-card overflow-hidden">
    <div class="px-4 py-3 border-b border-sand-200/40">
      <h3 class="text-[12px] font-bold text-brand-950 tracking-tight">Operación</h3>
      <p class="text-[10px] text-sand-400 mt-0.5 font-medium">Métricas del día</p>
    </div>
    <div class="divide-y divide-sand-200/40">
      <div
        v-for="metric in operationalMetrics"
        :key="metric.label"
        class="px-4 py-3 hover:bg-sand-50/50 transition-colors duration-150"
      >
        <div class="flex items-center gap-2 mb-1">
          <Icon :name="metric.icon" class="w-3 h-3 text-sand-400" />
          <span class="text-[10px] font-semibold tracking-[0.08em] uppercase text-sand-400">
            {{ metric.label }}
          </span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-[18px] font-bold text-brand-950 tracking-tight leading-none">
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
  </div>
</template>
