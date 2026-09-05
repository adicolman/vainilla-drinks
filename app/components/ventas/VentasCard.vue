<script setup lang="ts">
import type { VentaConDetalle } from '~/composables/useVentas'

const props = defineProps<{
  venta: VentaConDetalle
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
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  preparando: 'Preparando',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const estadoVariant: Record<string, string> = {
  pendiente: 'warning',
  pagado: 'success',
  preparando: 'info',
  entregado: 'success',
  cancelado: 'danger',
}

const medioPagoLabel: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  mp: 'Mercado Pago',
}

const itemCount = computed(() => props.venta.venta_items?.length || 0)
</script>

<template>
  <div class="bg-white rounded-2xl border border-sand-200/60 p-5 hover:shadow-card transition-all duration-200">
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 min-w-0">
        <h3 class="text-[15px] font-semibold text-brand-950 truncate">
          {{ venta.venta_items?.[0]?.receta?.nombre || 'Venta' }}
          <span v-if="itemCount > 1" class="text-sand-400 font-normal">+{{ itemCount - 1 }}</span>
        </h3>
        <p class="text-[12px] text-sand-400 mt-0.5">
          {{ formatDate(venta.fecha) }} · {{ formatTime(venta.fecha) }}
        </p>
      </div>
      <StatusBadge
        :label="estadoLabel[venta.estado] || venta.estado"
        :variant="(estadoVariant[venta.estado] || 'default') as any"
      />
    </div>

    <div class="grid grid-cols-2 gap-3 mb-3">
      <div>
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Total</p>
        <p class="text-[14px] font-semibold text-success mt-0.5">
          {{ formatCurrency(venta.total) }}
        </p>
      </div>
      <div>
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Pago</p>
        <p class="text-[14px] font-semibold text-brand-950 mt-0.5">
          {{ medioPagoLabel[venta.medio_pago] || venta.medio_pago }}
        </p>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <span class="text-[12px] text-sand-400">
        {{ itemCount }} producto{{ itemCount !== 1 ? 's' : '' }}
      </span>
      <span v-if="Number(venta.costo_total_historico) > 0" class="text-[12px] text-sand-400">
        Margen: {{ formatCurrency(venta.total - Number(venta.costo_total_historico)) }}
      </span>
    </div>
  </div>
</template>
