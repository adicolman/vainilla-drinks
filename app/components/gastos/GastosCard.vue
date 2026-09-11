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

const medioPagoLabel: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  mp: 'Mercado Pago',
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-sand-200/60 p-5 hover:shadow-card transition-all duration-200">
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 min-w-0">
        <h3 class="text-[15px] font-semibold text-brand-950 truncate">
          {{ gasto.concepto || 'Sin concepto' }}
        </h3>
        <p class="text-[12px] text-sand-400 mt-0.5">{{ formatDate(gasto.fecha) }}</p>
      </div>
      <span class="text-[18px] font-bold text-danger">
        −{{ formatCurrency(gasto.monto) }}
      </span>
    </div>

    <div class="flex items-center gap-2 mb-3">
      <StatusBadge
        :label="categoriaLabels[gasto.categoria] || gasto.categoria"
        :variant="(categoriaVariant[gasto.categoria] || 'default') as any"
      />
      <span class="text-[12px] text-sand-400">·</span>
      <span class="text-[12px] text-sand-400">{{ medioPagoLabel[gasto.medio_pago] || gasto.medio_pago }}</span>
    </div>

    <p v-if="gasto.descripcion" class="text-[12px] text-sand-400 truncate">
      {{ gasto.descripcion }}
    </p>
  </div>
</template>
