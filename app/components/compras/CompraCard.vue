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

const itemCount = computed(() => props.compra.compra_items?.length || 0)

const emit = defineEmits<{
  edit: [compra: CompraConDetalle]
}>()
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-sand-200/60 overflow-hidden hover:shadow-elevated transition-all duration-200 flex flex-col cursor-pointer group"
    @click="emit('edit', compra)"
  >
    <div class="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
      <div class="flex gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl bg-brand-950 text-white flex items-center justify-center shrink-0">
          <Icon name="lucide:truck" class="w-[18px] h-[18px]" />
        </div>
        <div class="min-w-0">
          <h3 class="text-[14px] font-semibold text-brand-950 leading-tight truncate">{{ compra.proveedor_nombre || 'Sin proveedor' }}</h3>
          <p class="text-[11px] text-sand-400 mt-0.5">{{ formatDate(compra.fecha) }} · {{ itemCount }} item{{ itemCount !== 1 ? 's' : '' }}</p>
        </div>
      </div>
      <StatusBadge :label="estadoLabel[compra.estado] || compra.estado" :variant="(estadoVariant[compra.estado] || 'default') as any" />
    </div>

    <div class="px-5 pb-5 flex items-center gap-4">
      <span class="text-[15px] font-bold text-brand-950">{{ formatCurrency(compra.total) }}</span>
    </div>
  </div>
</template>
