<script setup lang="ts">
import { formatCurrency, formatPercent, formatNumber, formatVariation } from '~/utils/formatting'

const { metrics } = useMockData()

function formatValue(value: number, format: string): string {
  switch (format) {
    case 'currency': return formatCurrency(value)
    case 'percent': return formatPercent(value)
    case 'number': return formatNumber(value)
    default: return String(value)
  }
}

// Ingresos y Ganancia son protagonistas. Gastos y Margen son compactos.
const heroMetrics = computed(() => metrics.value.filter(m => m.label === 'Ingresos' || m.label === 'Ganancia'))
const sideMetrics = computed(() => metrics.value.filter(m => m.label === 'Gastos' || m.label === 'Margen'))
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
    <!-- Hero metrics — protagonistas -->
    <div class="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
      <div
        v-for="metric in heroMetrics"
        :key="metric.label"
        class="bg-white rounded-2xl border border-sand-200/60 p-6 sm:p-7 shadow-card group hover:shadow-elevated transition-all duration-300"
      >
        <div class="flex items-start justify-between mb-5">
          <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-sand-400">
            {{ metric.label }}
          </span>
        </div>

        <div class="mb-4">
          <span class="text-4xl sm:text-[42px] font-bold text-brand-950 tracking-tight leading-none">
            {{ formatValue(metric.value, metric.format) }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <span
            :class="[
              metric.trend === 'up'
                ? (metric.label === 'Gastos' ? 'text-danger bg-danger-soft' : 'text-success bg-success-soft')
                : metric.trend === 'down'
                  ? (metric.label === 'Gastos' ? 'text-success bg-success-soft' : 'text-danger bg-danger-soft')
                  : 'text-sand-400 bg-sand-100'
            ]"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold"
          >
            <Icon
              :name="metric.trend === 'up' ? 'lucide:arrow-up' : metric.trend === 'down' ? 'lucide:arrow-down' : 'lucide:minus'"
              class="w-3 h-3"
            />
            {{ formatVariation(metric.variation) }}
          </span>
          <span class="text-[11px] text-sand-400 font-medium">vs anterior</span>
        </div>

        <!-- Subtle brand accent line -->
        <div class="mt-5 h-px bg-gradient-to-r from-vanilla/50 via-sand-200/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </div>

    <!-- Side metrics — compactos -->
    <div class="lg:col-span-4 flex flex-col gap-4 lg:gap-5">
      <div
        v-for="metric in sideMetrics"
        :key="metric.label"
        class="bg-white rounded-2xl border border-sand-200/60 px-6 py-5 shadow-card flex-1 flex flex-col justify-center"
      >
        <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-sand-400 mb-2">
          {{ metric.label }}
        </span>
        <div class="flex items-baseline gap-3">
          <span class="text-2xl font-bold text-brand-950 tracking-tight">
            {{ formatValue(metric.value, metric.format) }}
          </span>
          <span
            :class="[
              metric.trend === 'up'
                ? (metric.label === 'Gastos' ? 'text-danger' : 'text-success')
                : metric.trend === 'down'
                  ? (metric.label === 'Gastos' ? 'text-success' : 'text-danger')
                  : 'text-sand-400'
            ]"
            class="text-[11px] font-bold"
          >
            {{ formatVariation(metric.variation) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
