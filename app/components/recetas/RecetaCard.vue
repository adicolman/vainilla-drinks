<script setup lang="ts">
import type { RecetaConIngredientes } from '~/composables/useRecetas'

const props = defineProps<{
  receta: RecetaConIngredientes
}>()

const emit = defineEmits<{
  edit: [receta: RecetaConIngredientes]
  deactivate: [receta: RecetaConIngredientes]
}>()

function formatCurrency(n: number | string) {
  return Number(n).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function formatNumber(n: number | string) {
  return Number(n).toLocaleString('es-AR', { maximumFractionDigits: 2 })
}

const margenReal = computed(() => {
  if (!props.receta.precio_venta || !props.receta.costo_por_litro) return 0
  return ((props.receta.precio_venta - props.receta.costo_por_litro) / props.receta.precio_venta * 100)
})

const ingredientCount = computed(() => props.receta.receta_ingredientes?.length || 0)
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-sand-200/60 overflow-hidden hover:shadow-elevated transition-all duration-200 flex flex-col cursor-pointer group"
    @click="emit('edit', receta)"
  >
    <div class="relative h-40 bg-sand-50 overflow-hidden">
      <img v-if="receta.imagen_url" :src="receta.imagen_url" :alt="receta.nombre" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sand-50 to-sand-100">
        <Icon name="lucide:image" class="w-8 h-8 text-sand-300 mb-1" />
        <span class="text-[10px] text-sand-400">Sin imagen</span>
      </div>
      <span class="absolute top-3 right-3">
        <StatusBadge :label="receta.activo ? 'Activa' : 'Inactiva'" :variant="receta.activo ? 'success' : 'neutral'" />
      </span>
    </div>

    <div class="px-5 pt-4 pb-3 flex items-start gap-3">
      <div class="flex-1 min-w-0">
        <h3 class="text-[14px] font-semibold text-brand-950 leading-tight truncate">{{ receta.nombre }}</h3>
        <p class="text-[11px] text-sand-400 capitalize mt-0.5">{{ receta.categoria }} · {{ ingredientCount }} ingrediente{{ ingredientCount !== 1 ? 's' : '' }}</p>
      </div>
      <div class="w-8 h-8 rounded-lg bg-brand-600/10 text-brand-600 flex items-center justify-center shrink-0">
        <Icon name="lucide:chef-hat" class="w-4 h-4" />
      </div>
    </div>

    <div class="px-5 pb-4 flex items-center gap-4">
      <span class="text-[13px] text-sand-400">Costo <strong class="text-brand-950 font-semibold">{{ formatCurrency(receta.costo_por_litro || 0) }}</strong></span>
      <div class="w-px h-4 bg-sand-200" />
      <span class="text-[13px] text-sand-400">Venta <strong class="text-brand-950 font-semibold">{{ formatCurrency(receta.precio_venta) }}</strong></span>
      <div class="ml-auto">
        <span
          class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
          :class="margenReal >= 50 ? 'bg-success-soft text-success' : margenReal >= 0 ? 'bg-brand-100 text-brand-950' : 'bg-danger-soft text-danger'"
        >
          {{ formatNumber(margenReal) }}%
        </span>
      </div>
    </div>

    <div class="mt-auto flex items-center gap-1 px-3 py-2.5 border-t border-sand-100 bg-sand-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button class="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-lg text-[12px] font-medium text-brand-950 hover:bg-white border border-transparent hover:border-sand-200 transition-colors" @click.stop="emit('edit', receta)">
        <Icon name="lucide:pencil" class="w-3.5 h-3.5" /> Editar
      </button>
      <button v-if="receta.activo" class="w-8 h-8 flex items-center justify-center rounded-lg text-sand-400 hover:text-amber-600 hover:bg-white border border-transparent hover:border-sand-200 transition-colors" title="Desactivar" @click.stop="emit('deactivate', receta)">
        <Icon name="lucide:pause" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
