<script setup lang="ts">
import type { GastoRow } from '~/composables/useGastos'

const props = defineProps<{
  gasto: GastoRow
}>()

function formatCurrency(n: number | string) {
  return Number(n).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const categoriaLabels: Record<string, string> = {
  publicidad: 'Publicidad',
  servicios: 'Servicios',
  delivery: 'Delivery',
  equipamiento: 'Equipamiento',
  mantenimiento: 'Mantenimiento',
  logistica: 'Logística',
  impuestos: 'Impuestos',
  otros: 'Otros',
}

const categoriaVariant: Record<string, string> = {
  publicidad: 'info',
  servicios: 'default',
  delivery: 'warning',
  equipamiento: 'default',
  mantenimiento: 'warning',
  logistica: 'info',
  impuestos: 'danger',
  otros: 'default',
}

const emit = defineEmits<{
  edit: [gasto: GastoRow]
}>()
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-sand-200/60 overflow-hidden hover:shadow-elevated transition-all duration-200 flex flex-col cursor-pointer group"
    @click="emit('edit', gasto)"
  >
    <div class="h-1 bg-danger" />
    <div class="px-5 pt-4 pb-4 flex items-start justify-between gap-3">
      <div class="flex gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl bg-danger text-white flex items-center justify-center shrink-0">
          <Icon name="lucide:receipt" class="w-[18px] h-[18px]" />
        </div>
        <div class="min-w-0">
          <h3 class="text-[14px] font-semibold text-brand-950 leading-tight truncate">{{ gasto.concepto || 'Sin concepto' }}</h3>
          <p class="text-[11px] text-sand-400 mt-0.5">{{ formatDate(gasto.fecha) }}</p>
        </div>
      </div>
      <span class="text-[15px] font-bold text-danger shrink-0">-{{ formatCurrency(gasto.monto) }}</span>
    </div>
    <div class="px-5 pb-4 flex items-center gap-2">
      <StatusBadge :label="categoriaLabels[gasto.categoria] || gasto.categoria" :variant="(categoriaVariant[gasto.categoria] || 'default') as any" />
    </div>
  </div>
</template>
