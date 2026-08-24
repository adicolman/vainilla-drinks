<script setup lang="ts">
import type { RecetaConIngredientes } from '~/composables/useRecetas'

const props = defineProps<{
  receta: RecetaConIngredientes
}>()

const emit = defineEmits<{
  edit: [receta: RecetaConIngredientes]
  deactivate: [receta: RecetaConIngredientes]
  produce: [receta: RecetaConIngredientes]
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
  <div class="group bg-white rounded-2xl border border-sand-200/60 p-5 hover:shadow-card transition-all duration-200">
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 min-w-0">
        <h3 class="text-[15px] font-semibold text-brand-950 truncate">{{ receta.nombre }}</h3>
        <p class="text-[12px] text-sand-400 mt-0.5">{{ receta.categoria }}</p>
      </div>
      <div class="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg text-sand-400 hover:text-brand-600 hover:bg-brand-600/10 transition-colors"
          title="Producir"
          @click="emit('produce', receta)"
        >
          <Icon name="lucide:flask-conical" class="w-4 h-4" />
        </button>
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg text-sand-400 hover:text-brand-950 hover:bg-sand-100 transition-colors"
          title="Editar"
          @click="emit('edit', receta)"
        >
          <Icon name="lucide:pencil" class="w-4 h-4" />
        </button>
        <button
          v-if="receta.activo"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-sand-400 hover:text-danger hover:bg-danger-soft transition-colors"
          title="Desactivar"
          @click="emit('deactivate', receta)"
        >
          <Icon name="lucide:ban" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 mb-3">
      <div>
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Costo / L</p>
        <p class="text-[14px] font-semibold text-brand-950 mt-0.5">
          {{ formatCurrency(receta.costo_por_litro || 0) }}
        </p>
      </div>
      <div>
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Precio</p>
        <p class="text-[14px] font-semibold text-brand-950 mt-0.5">
          {{ formatCurrency(receta.precio_venta) }}
        </p>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-[12px] text-sand-400">
          {{ ingredientCount }} ingrediente{{ ingredientCount !== 1 ? 's' : '' }}
        </span>
        <span
          v-if="receta.precio_venta > 0"
          class="text-[12px] font-medium"
          :class="margenReal >= 0 ? 'text-success' : 'text-danger'"
        >
          {{ formatNumber(margenReal) }}% margen
        </span>
      </div>
      <StatusBadge
        :label="receta.activo ? 'Activa' : 'Inactiva'"
        :variant="receta.activo ? 'success' : 'danger'"
      />
    </div>
  </div>
</template>
