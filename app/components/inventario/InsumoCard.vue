<script setup lang="ts">
import type { InsumoRow } from '~/composables/useInsumos'

const props = defineProps<{
  insumo: InsumoRow
}>()

const emit = defineEmits<{
  edit: [insumo: InsumoRow]
  deactivate: [insumo: InsumoRow]
  delete: [insumo: InsumoRow]
}>()

const { profile } = useAuth()
const isAdmin = computed(() => profile.value?.rol === 'admin')

const unidadLabels: Record<string, string> = {
  ml: 'ml',
  l: 'L',
  g: 'g',
  kg: 'kg',
  unidad: 'un',
}

const stockStatus = computed(() => {
  const stock = Number(props.insumo.stock_actual)
  const min = Number(props.insumo.stock_minimo)
  if (min > 0 && stock <= min) return 'low'
  return 'ok'
})

function formatNumber(n: number | string) {
  return Number(n).toLocaleString('es-AR', { maximumFractionDigits: 2 })
}
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-sand-200/60 overflow-hidden hover:shadow-elevated transition-all duration-200 flex flex-col cursor-pointer group"
    @click="emit('edit', insumo)"
  >
    <!-- Image or fallback -->
    <div class="relative w-full aspect-[4/3] bg-sand-100 overflow-hidden">
      <img
        v-if="insumo.imagen_url"
        :src="insumo.imagen_url"
        :alt="insumo.nombre"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <Icon name="lucide:package" class="w-10 h-10 text-sand-300" />
      </div>
      <div class="absolute top-3 right-3">
        <StatusBadge :label="insumo.activo ? 'Activo' : 'Inactivo'" :variant="insumo.activo ? 'success' : 'neutral'" />
      </div>
    </div>

    <div class="px-5 pt-4 pb-4">
      <h3 class="text-[14px] font-semibold text-brand-950 leading-tight truncate">{{ insumo.nombre }}</h3>
      <p class="text-[11px] text-sand-400 capitalize mt-1">{{ insumo.categoria }} · {{ unidadLabels[insumo.unidad_medida] || insumo.unidad_medida }}</p>
    </div>

    <div class="px-5 pb-5 flex items-center gap-4">
      <div class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full" :class="stockStatus === 'low' ? 'bg-warning' : 'bg-success'" />
        <span class="text-[13px] font-semibold text-brand-950">{{ formatNumber(insumo.stock_actual) }}</span>
        <span class="text-[11px] text-sand-400">{{ unidadLabels[insumo.unidad_medida] }}</span>
      </div>
      <div class="w-px h-4 bg-sand-200" />
      <span class="text-[13px] text-sand-400">${{ formatNumber(insumo.costo_promedio) }}/{{ unidadLabels[insumo.unidad_medida] }}</span>
    </div>

    <div class="mt-auto flex items-center gap-1 px-3 py-2.5 border-t border-sand-100 bg-sand-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button class="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-lg text-[12px] font-medium text-brand-950 hover:bg-white border border-transparent hover:border-sand-200 transition-colors" @click.stop="emit('edit', insumo)">
        <Icon name="lucide:pencil" class="w-3.5 h-3.5" /> Editar
      </button>
      <button v-if="insumo.activo" class="w-8 h-8 flex items-center justify-center rounded-lg text-sand-400 hover:text-amber-600 hover:bg-white border border-transparent hover:border-sand-200 transition-colors" title="Desactivar" @click.stop="emit('deactivate', insumo)">
        <Icon name="lucide:pause" class="w-4 h-4" />
      </button>
      <button v-if="isAdmin" class="w-8 h-8 flex items-center justify-center rounded-lg text-sand-400 hover:text-danger hover:bg-white border border-transparent hover:border-sand-200 transition-colors" title="Eliminar" @click.stop="emit('delete', insumo)">
        <Icon name="lucide:trash-2" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
