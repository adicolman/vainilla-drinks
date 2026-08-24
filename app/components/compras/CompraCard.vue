<script setup lang="ts">
import type { CompraConDetalle } from '~/composables/useCompras'

const props = defineProps<{
  compra: CompraConDetalle
}>()

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatCurrency(n: number | string) {
  return Number(n).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

const estadoLabel: Record<string, string> = {
  pendiente: 'Pendiente',
  recibido: 'Recibido',
  cancelado: 'Cancelado',
}

const estadoVariant: Record<string, string> = {
  pendiente: 'warning',
  recibido: 'success',
  cancelado: 'danger',
}

const medioPagoLabel: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  mp: 'Mercado Pago',
}

const itemCount = computed(() => props.compra.compra_items?.length || 0)
</script>

<template>
  <div class="group bg-white rounded-2xl border border-sand-200/60 p-5 hover:shadow-card transition-all duration-200">
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 min-w-0">
        <h3 class="text-[15px] font-semibold text-brand-950 truncate">
          {{ compra.proveedor_nombre || 'Sin proveedor' }}
        </h3>
        <p class="text-[12px] text-sand-400 mt-0.5">{{ formatDate(compra.fecha) }}</p>
      </div>
      <StatusBadge
        :label="estadoLabel[compra.estado] || compra.estado"
        :variant="(estadoVariant[compra.estado] || 'default') as any"
      />
    </div>

    <div class="grid grid-cols-2 gap-3 mb-3">
      <div>
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Total</p>
        <p class="text-[14px] font-semibold text-brand-950 mt-0.5">
          {{ formatCurrency(compra.total) }}
        </p>
      </div>
      <div>
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Pago</p>
        <p class="text-[14px] font-semibold text-brand-950 mt-0.5">
          {{ medioPagoLabel[compra.medio_pago] || compra.medio_pago }}
        </p>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <span class="text-[12px] text-sand-400">
        {{ itemCount }} item{{ itemCount !== 1 ? 's' : '' }}
      </span>
      <span v-if="compra.notas" class="text-[12px] text-sand-400 truncate max-w-[150px]">
        {{ compra.notas }}
      </span>
    </div>
  </div>
</template>
