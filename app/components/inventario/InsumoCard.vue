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
    class="group bg-white rounded-2xl border border-sand-200/60 p-5 hover:shadow-card transition-all duration-200"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 min-w-0">
        <h3 class="text-[15px] font-semibold text-brand-950 truncate">{{ insumo.nombre }}</h3>
        <p class="text-[12px] text-sand-400 mt-0.5">{{ insumo.categoria }}</p>
      </div>
      <div class="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg text-sand-400 hover:text-brand-950 hover:bg-sand-100 transition-colors"
          title="Editar"
          @click="emit('edit', insumo)"
        >
          <Icon name="lucide:pencil" class="w-4 h-4" />
        </button>
        <button
          v-if="insumo.activo"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-sand-400 hover:text-danger hover:bg-danger-soft transition-colors"
          title="Desactivar"
          @click="emit('deactivate', insumo)"
        >
          <Icon name="lucide:ban" class="w-4 h-4" />
        </button>
        <button
          v-if="isAdmin"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-sand-400 hover:text-danger hover:bg-danger-soft transition-colors"
          title="Eliminar"
          @click="emit('delete', insumo)"
        >
          <Icon name="lucide:trash-2" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 mb-3">
      <div>
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Costo</p>
        <p class="text-[14px] font-semibold text-brand-950 mt-0.5">
          ${{ formatNumber(insumo.costo_promedio) }}
        </p>
      </div>
      <div>
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Unidad</p>
        <p class="text-[14px] font-semibold text-brand-950 mt-0.5">
          {{ unidadLabels[insumo.unidad_medida] || insumo.unidad_medida }}
        </p>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div
          :class="stockStatus === 'low' ? 'bg-warning-soft' : 'bg-success-soft'"
          class="w-2 h-2 rounded-full"
        />
        <span class="text-[13px] font-medium" :class="stockStatus === 'low' ? 'text-warning' : 'text-brand-950'">
          {{ formatNumber(insumo.stock_actual) }} {{ unidadLabels[insumo.unidad_medida] || insumo.unidad_medida }}
        </span>
      </div>
      <StatusBadge
        :label="insumo.activo ? 'Activo' : 'Inactivo'"
        :variant="insumo.activo ? 'success' : 'danger'"
      />
    </div>
  </div>
</template>
