<script setup lang="ts">
import { formatCurrency, formatPercent, formatVariation } from '~/utils/formatting'

const { metrics } = useMockData()

const ingresos = computed(() => metrics.value.find(m => m.label === 'Ingresos')!)
const ganancia = computed(() => metrics.value.find(m => m.label === 'Ganancia')!)
const margen = computed(() => metrics.value.find(m => m.label === 'Margen')!)
const gastos = computed(() => metrics.value.find(m => m.label === 'Gastos')!)
</script>

<template>
  <div class="bg-white rounded-2xl border border-sand-200/60 shadow-card overflow-hidden">
    <div class="px-6 sm:px-8 py-6 sm:py-7">
      <!-- Hero: main number -->
      <div class="mb-5">
        <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-sand-400">
          Ingresos del mes
        </span>
        <div class="flex items-baseline gap-3 mt-1.5">
          <span class="text-4xl sm:text-5xl font-bold text-brand-950 tracking-tight leading-none">
            {{ formatCurrency(ingresos.value) }}
          </span>
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold text-success bg-success-soft"
          >
            <Icon name="lucide:arrow-up" class="w-3 h-3" />
            {{ formatVariation(ingresos.variation) }}
          </span>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-gradient-to-r from-sand-200/60 via-sand-200/30 to-transparent mb-5" />

      <!-- Secondary metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
        <!-- Ganancia -->
        <div>
          <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-sand-400">
            Ganancia neta
          </span>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-xl sm:text-2xl font-bold text-brand-950 tracking-tight">
              {{ formatCurrency(ganancia.value) }}
            </span>
            <span class="text-[11px] font-bold text-success">
              {{ formatVariation(ganancia.variation) }}
            </span>
          </div>
        </div>

        <!-- Margen -->
        <div>
          <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-sand-400">
            Margen
          </span>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-xl sm:text-2xl font-bold text-brand-950 tracking-tight">
              {{ formatPercent(margen.value) }}
            </span>
            <span class="text-[11px] font-bold text-success">
              {{ formatVariation(margen.variation) }}
            </span>
          </div>
          <div class="mt-1.5 text-[11px] text-sand-400 font-medium">
            Objetivo: 55%
          </div>
        </div>

        <!-- Gastos -->
        <div>
          <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-sand-400">
            Gastos
          </span>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-xl sm:text-2xl font-bold text-brand-950 tracking-tight">
              {{ formatCurrency(gastos.value) }}
            </span>
            <span class="text-[11px] font-bold text-success">
              {{ formatVariation(gastos.variation) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
