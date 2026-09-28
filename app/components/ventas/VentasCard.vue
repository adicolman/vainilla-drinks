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

const itemCount = computed(() => props.venta.venta_items?.length || 0)

const emit = defineEmits<{
  edit: [venta: VentaConDetalle]
}>()
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-sand-200/60 overflow-hidden hover:shadow-elevated transition-all duration-200 flex flex-col cursor-pointer group"
    @click="emit('edit', venta)"
  >
    <div class="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
      <div class="flex gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl bg-success text-white flex items-center justify-center shrink-0">
          <Icon name="lucide:shopping-bag" class="w-[18px] h-[18px]" />
        </div>
        <div class="min-w-0">
          <h3 class="text-[14px] font-semibold text-brand-950 leading-tight truncate">
            {{ venta.venta_items?.[0]?.receta?.nombre || 'Venta' }}
            <span v-if="itemCount > 1" class="text-sand-400 font-normal">+{{ itemCount - 1 }}</span>
          </h3>
          <p class="text-[11px] text-sand-400 mt-0.5">{{ formatDate(venta.fecha) }} · {{ formatTime(venta.fecha) }}</p>
        </div>
      </div>
      <StatusBadge :label="estadoLabel[venta.estado] || venta.estado" :variant="(estadoVariant[venta.estado] || 'default') as any" />
    </div>

    <div class="px-5 pb-5 flex items-center gap-4">
      <span class="text-[15px] font-bold text-success">{{ formatCurrency(venta.total) }}</span>
      <div class="w-px h-4 bg-sand-200" />
      <span class="text-[12px] text-sand-400">{{ itemCount }} producto{{ itemCount !== 1 ? 's' : '' }}</span>
    </div>
  </div>
</template>
