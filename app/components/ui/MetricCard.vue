<script setup lang="ts">
import { formatCurrency, formatPercent, formatNumber, formatVariation } from '~/utils/formatting'

const props = defineProps<{
  label: string
  value: number
  variation: number
  trend: 'up' | 'down' | 'neutral'
  icon: string
  format: 'currency' | 'percent' | 'number'
  extra?: string
}>()

function formatValue(value: number, format: string): string {
  switch (format) {
    case 'currency': return formatCurrency(value)
    case 'percent': return formatPercent(value)
    case 'number': return formatNumber(value)
    default: return String(value)
  }
}

const trendColor = computed(() => {
  if (props.trend === 'up') return props.label === 'Gastos' ? 'text-danger' : 'text-success'
  if (props.trend === 'down') return props.label === 'Gastos' ? 'text-success' : 'text-danger'
  return 'text-sand-400'
})

const trendBg = computed(() => {
  if (props.trend === 'up') return props.label === 'Gastos' ? 'bg-danger-soft' : 'bg-success-soft'
  if (props.trend === 'down') return props.label === 'Gastos' ? 'bg-success-soft' : 'bg-danger-soft'
  return 'bg-sand-100'
})
</script>

<template>
  <div class="bg-white rounded-2xl border border-sand-200/60 p-6 shadow-card hover:shadow-elevated transition-shadow duration-300">
    <div class="flex items-start justify-between mb-4">
      <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-sand-400">{{ label }}</span>
      <div class="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center">
        <Icon :name="icon" class="w-5 h-5 text-brand-600" />
      </div>
    </div>

    <div class="mb-3">
      <span class="text-3xl font-bold text-brand-950 tracking-tight">
        {{ formatValue(value, format) }}
      </span>
      <span v-if="extra" class="ml-2 text-sm text-sand-400 font-medium">{{ extra }}</span>
    </div>

    <div class="flex items-center gap-2">
      <span
        :class="[trendBg, trendColor]"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold"
      >
        <Icon
          :name="trend === 'up' ? 'lucide:arrow-up' : trend === 'down' ? 'lucide:arrow-down' : 'lucide:minus'"
          class="w-3 h-3"
        />
        {{ formatVariation(variation) }}
      </span>
      <span class="text-xs text-sand-400">vs período anterior</span>
    </div>
  </div>
</template>
