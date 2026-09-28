<script setup lang="ts">
import type { ConsumoItem } from '~/composables/useConsumoDiario'

const emit = defineEmits<{
  saved: []
}>()

const { insumos, isLoading, isSaving, fecha, fetchInsumos, registrarConsumo } = useConsumoDiario()

const items = ref<ConsumoItem[]>([])

onMounted(async () => {
  await fetchInsumos()
  addRow()
})

const insumoOptions = computed(() =>
  insumos.value.map(i => ({
    value: i.id,
    label: `${i.nombre} (${i.unidad_medida}) — stock: ${Number(i.stock_actual).toFixed(1)}`,
  }))
)

function addRow() {
  items.value.push({
    insumo_id: '',
    peso_inicial: 0,
    peso_final: 0,
  })
}

function removeRow(index: number) {
  items.value.splice(index, 1)
}

function getConsumo(item: ConsumoItem): number {
  if (item.peso_inicial > 0 && item.peso_final >= 0) {
    return Math.max(0, item.peso_inicial - item.peso_final)
  }
  return 0
}

function getUnidad(insumoId: string): string {
  const insumo = insumos.value.find(i => i.id === insumoId)
  return insumo?.unidad_medida || 'kg'
}

const totalConsumido = computed(() =>
  items.value.reduce((sum, i) => sum + getConsumo(i), 0)
)

const hasValidItems = computed(() =>
  items.value.some(i => i.insumo_id && i.peso_inicial > 0 && i.peso_final >= 0 && i.peso_inicial > i.peso_final)
)

async function handleSubmit() {
  try {
    await registrarConsumo(items.value)
    items.value = []
    addRow()
    emit('saved')
  } catch {
    // toast already shown
  }
}
</script>

<template>
  <div>
    <!-- Loading -->
    <LoadingState v-if="isLoading" type="card" />

    <div v-else class="space-y-4">
      <!-- Fecha -->
      <div class="flex items-center gap-3">
        <AppInput v-model="fecha" label="Fecha" type="date" class="w-48" />
      </div>

      <!-- Instrucciones -->
      <div class="bg-brand-50 rounded-xl p-4 border border-brand-100">
        <div class="flex items-start gap-3">
          <Icon name="lucide:info" class="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
          <p class="text-[13px] text-brand-700">
            Pesá cada insumo al inicio y al final del día. El sistema calcula automáticamente cuánto se consumió y descuenta del stock.
          </p>
        </div>
      </div>

      <!-- Lista de items -->
      <div class="space-y-3">
        <div
          v-for="(item, idx) in items"
          :key="idx"
          class="bg-white rounded-xl border border-sand-200/60 p-4"
        >
          <div class="flex items-end gap-3">
            <div class="flex-1">
              <AppSelect
                v-model="item.insumo_id"
                label="Insumo"
                :options="[{ value: '', label: 'Seleccionar...' }, ...insumoOptions]"
                :disabled="isSaving"
              />
            </div>
            <div class="w-32">
              <AppInput
                v-model="item.peso_inicial"
                label="Peso inicial"
                type="number"
                placeholder="0"
                :disabled="isSaving"
              />
            </div>
            <div class="w-32">
              <AppInput
                v-model="item.peso_final"
                label="Peso final"
                type="number"
                placeholder="0"
                :disabled="isSaving"
              />
            </div>
            <div class="w-28">
              <label class="block text-[12px] font-medium text-sand-400 mb-1">Consumo</label>
              <div class="h-10 flex items-center text-[14px] font-semibold" :class="getConsumo(item) > 0 ? 'text-danger' : 'text-sand-300'">
                {{ getConsumo(item) > 0 ? `${getConsumo(item).toFixed(1)} ${getUnidad(item.insumo_id)}` : '—' }}
              </div>
            </div>
            <button
              type="button"
              class="w-9 h-9 flex items-center justify-center rounded-lg text-sand-400 hover:text-danger hover:bg-danger-soft transition-colors shrink-0 mb-0.5"
              @click="removeRow(idx)"
            >
              <Icon name="lucide:x" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Agregar fila -->
      <button
        type="button"
        class="w-full py-2.5 border border-dashed border-sand-300 rounded-xl text-[13px] text-sand-400 hover:text-brand-600 hover:border-brand-400 transition-colors"
        @click="addRow"
      >
        + Agregar insumo
      </button>

      <!-- Resumen -->
      <div v-if="totalConsumido > 0" class="bg-danger-soft rounded-xl p-4">
        <div class="flex justify-between items-center">
          <span class="text-[13px] font-medium text-danger">Total consumido hoy</span>
          <span class="text-[18px] font-bold text-danger">
            {{ totalConsumido.toFixed(1) }} unidades
          </span>
        </div>
      </div>

      <!-- Guardar -->
      <div class="flex justify-end">
        <PrimaryButton :loading="isSaving" :disabled="!hasValidItems" @click="handleSubmit">
          Registrar consumo del día
        </PrimaryButton>
      </div>
    </div>
  </div>
</template>
