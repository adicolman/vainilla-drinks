<script setup lang="ts">
import type { ProduccionConDetalle } from '~/composables/useProduccion'

const props = defineProps<{
  produccion: ProduccionConDetalle
}>()

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatCurrency(n: number | string) {
  return Number(n).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function formatNumber(n: number | string) {
  return Number(n).toLocaleString('es-AR', { maximumFractionDigits: 2 })
}

const detailCount = computed(() => props.produccion.produccion_detalles?.length || 0)
</script>

<template>
  <div class="group bg-white rounded-2xl border border-sand-200/60 p-5 hover:shadow-card transition-all duration-200">
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 min-w-0">
        <h3 class="text-[15px] font-semibold text-brand-950 truncate">
          {{ produccion.receta?.nombre || 'Sin receta' }}
        </h3>
        <p class="text-[12px] text-sand-400 mt-0.5">{{ formatDate(produccion.fecha) }}</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 mb-3">
      <div>
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Producido</p>
        <p class="text-[14px] font-semibold text-brand-950 mt-0.5">
          {{ formatNumber(produccion.cantidad_producida) }} {{ produccion.unidad === 'l' ? 'L' : produccion.unidad }}
        </p>
      </div>
      <div>
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Costo total</p>
        <p class="text-[14px] font-semibold text-brand-950 mt-0.5">
          {{ formatCurrency(produccion.costo_total) }}
        </p>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <span class="text-[12px] text-sand-400">
        {{ detailCount }} insumo{{ detailCount !== 1 ? 's' : '' }} consumido{{ detailCount !== 1 ? 's' : '' }}
      </span>
      <span class="text-[12px] text-sand-400">
        {{ produccion.profiles?.nombre || '—' }}
      </span>
    </div>

    <p v-if="produccion.notas" class="text-[12px] text-sand-400 mt-2 truncate">
      {{ produccion.notas }}
    </p>
  </div>
</template>
