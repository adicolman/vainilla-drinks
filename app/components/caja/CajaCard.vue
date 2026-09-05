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
  <div class="bg-white rounded-2xl border border-sand-200/60 p-5 hover:shadow-card transition-all duration-200">
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 min-w-0">
        <h3 class="text-[15px] font-semibold text-brand-950 truncate">
          {{ movimiento.concepto || 'Sin concepto' }}
        </h3>
        <p class="text-[12px] text-sand-400 mt-0.5">
          {{ formatDate(movimiento.fecha) }} · {{ formatTime(movimiento.fecha) }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span
          :class="movimiento.tipo === 'ingreso' ? 'text-success' : 'text-danger'"
          class="text-[18px] font-bold"
        >
          {{ movimiento.tipo === 'ingreso' ? '+' : '-' }}{{ formatCurrency(movimiento.monto) }}
        </span>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <StatusBadge
        :label="estadoLabel[movimiento.estado] || movimiento.estado"
        :variant="(estadoVariant[movimiento.estado] || 'default') as any"
      />
      <span v-if="movimiento.referencia_tipo" class="text-[12px] text-sand-400">
        {{ movimiento.referencia_tipo }}
      </span>
    </div>
  </div>
</template>
