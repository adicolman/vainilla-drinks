<script setup lang="ts">
import type { MovimientoCajaRow } from '~/composables/useCaja'

const props = defineProps<{
  movimiento: MovimientoCajaRow
}>()

function formatCurrency(n: number | string) {
  return Number(n).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

const estadoLabel: Record<string, string> = {
  confirmado: 'Confirmado',
  pendiente: 'Pendiente',
  cancelado: 'Cancelado',
}

const estadoVariant: Record<string, string> = {
  confirmado: 'success',
  pendiente: 'warning',
  cancelado: 'danger',
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-sand-200/60 overflow-hidden hover:shadow-elevated transition-all duration-200 flex flex-col">
    <div class="h-1" :class="movimiento.tipo === 'ingreso' ? 'bg-success' : 'bg-danger'" />
    <div class="px-5 pt-4 pb-4 flex items-start justify-between gap-3">
      <div class="flex gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :class="movimiento.tipo === 'ingreso' ? 'bg-success text-white' : 'bg-danger text-white'">
          <Icon :name="movimiento.tipo === 'ingreso' ? 'lucide:arrow-down-left' : 'lucide:arrow-up-right'" class="w-[18px] h-[18px]" />
        </div>
        <div class="min-w-0">
          <h3 class="text-[14px] font-semibold text-brand-950 leading-tight truncate">{{ movimiento.concepto || 'Sin concepto' }}</h3>
          <p class="text-[11px] text-sand-400 mt-0.5">{{ formatDate(movimiento.fecha) }} · {{ formatTime(movimiento.fecha) }}</p>
        </div>
      </div>
      <StatusBadge :label="estadoLabel[movimiento.estado] || movimiento.estado" :variant="(estadoVariant[movimiento.estado] || 'default') as any" />
    </div>

    <div class="px-5 pb-5 flex items-center justify-between">
      <span v-if="movimiento.referencia_tipo" class="text-[11px] px-2 py-1 rounded-full bg-sand-50 text-sand-400 capitalize">{{ movimiento.referencia_tipo }}</span>
      <span v-else class="text-[11px] text-sand-300">—</span>
      <span :class="movimiento.tipo === 'ingreso' ? 'text-success' : 'text-danger'" class="text-[17px] font-bold tracking-tight">{{ movimiento.tipo === 'ingreso' ? '+' : '-' }}{{ formatCurrency(movimiento.monto) }}</span>
    </div>
  </div>
</template>
