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
    class="bg-white rounded-xl border border-sand-200/60 overflow-hidden hover:shadow-elevated transition-all duration-200 flex items-center gap-4 px-4 py-3 cursor-pointer group"
    @click="emit('edit', insumo)"
  >
    <!-- Image or fallback -->
    <div class="w-12 h-12 rounded-lg bg-sand-100 overflow-hidden shrink-0 flex items-center justify-center">
      <img
        v-if="insumo.imagen_url"
        :src="insumo.imagen_url"
        :alt="insumo.nombre"
        class="w-full h-full object-cover"
      />
      <Icon v-else name="lucide:package" class="w-5 h-5 text-sand-300" />
    </div>

    <!-- Name + category -->
    <div class="flex-1 min-w-0">
      <h3 class="text-[13px] font-semibold text-brand-950 leading-tight truncate">{{ insumo.nombre }}</h3>
      <p class="text-[11px] text-sand-400 capitalize mt-0.5">{{ insumo.categoria }}</p>
    </div>

    <!-- Stock -->
    <div class="hidden sm:flex items-center gap-1.5 w-28">
      <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="stockStatus === 'low' ? 'bg-warning' : 'bg-success'" />
      <span class="text-[13px] font-semibold text-brand-950">{{ formatNumber(insumo.stock_actual) }}</span>
      <span class="text-[11px] text-sand-400">{{ unidadLabels[insumo.unidad_medida] }}</span>
    </div>

    <!-- Cost -->
    <div class="hidden md:block w-28 text-right">
      <span class="text-[13px] text-sand-400">${{ formatNumber(insumo.costo_promedio) }}/{{ unidadLabels[insumo.unidad_medida] }}</span>
    </div>

    <!-- Status -->
    <div class="hidden lg:block w-20">
      <StatusBadge :label="insumo.activo ? 'Activo' : 'Inactivo'" :variant="insumo.activo ? 'success' : 'neutral'" />
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button class="w-8 h-8 flex items-center justify-center rounded-lg text-sand-400 hover:text-brand-950 hover:bg-sand-50 transition-colors" title="Editar" @click.stop="emit('edit', insumo)">
        <Icon name="lucide:pencil" class="w-4 h-4" />
      </button>
      <button v-if="insumo.activo" class="w-8 h-8 flex items-center justify-center rounded-lg text-sand-400 hover:text-amber-600 hover:bg-sand-50 transition-colors" title="Desactivar" @click.stop="emit('deactivate', insumo)">
        <Icon name="lucide:pause" class="w-4 h-4" />
      </button>
      <button v-if="isAdmin" class="w-8 h-8 flex items-center justify-center rounded-lg text-sand-400 hover:text-danger hover:bg-sand-50 transition-colors" title="Eliminar" @click.stop="emit('delete', insumo)">
        <Icon name="lucide:trash-2" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
