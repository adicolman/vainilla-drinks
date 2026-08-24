<script setup lang="ts">
import type { RecetaConIngredientes } from '~/composables/useRecetas'

const props = defineProps<{
  open: boolean
  receta?: RecetaConIngredientes | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { registrarProduccion } = useProduccion()
const { recetas, fetchRecetas, fetchInsumos, insumos } = useRecetas()
const { addToast } = useToast()

const recetaId = ref('')
const cantidadProducida = ref(1)
const notas = ref('')
const isSaving = ref(false)

const selectedReceta = computed(() =>
  recetas.value.find(r => r.id === recetaId.value) || null
)

const costoEstimado = computed(() => {
  if (!selectedReceta.value) return 0
  return (selectedReceta.value.costo_por_litro || 0) * cantidadProducida.value
})

const ingredientesPreview = computed(() => {
  if (!selectedReceta.value) return []
  return (selectedReceta.value.receta_ingredientes || []).map(ri => ({
    nombre: ri.insumo?.nombre || '—',
    cantidad: Number(ri.cantidad_para_1_litro) * cantidadProducida.value,
    unidad: ri.unidad,
    costo: Number(ri.cantidad_para_1_litro) * cantidadProducida.value * Number(ri.insumo?.costo_promedio || 0),
  }))
})

watch(() => props.open, async (val) => {
  if (val) {
    await Promise.all([fetchRecetas(), fetchInsumos()])
    recetaId.value = props.receta?.id || ''
    cantidadProducida.value = 1
    notas.value = ''
  }
})

const recetaOptions = computed(() =>
  recetas.value
    .filter(r => r.activo)
    .map(r => ({ value: r.id, label: r.nombre }))
)

function formatCurrency(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function formatNumber(n: number) {
  return n.toLocaleString('es-AR', { maximumFractionDigits: 2 })
}

async function handleSubmit() {
  if (!recetaId.value) {
    addToast('error', 'Error', 'Seleccioná una receta')
    return
  }
  if (cantidadProducida.value <= 0) {
    addToast('error', 'Error', 'La cantidad debe ser mayor a 0')
    return
  }

  isSaving.value = true
  try {
    await registrarProduccion(recetaId.value, cantidadProducida.value, 'l', notas.value)
    emit('saved')
    emit('close')
  } catch {
    // toast already shown
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <AppDrawer :open="open" title="Registrar producción" @close="emit('close')">
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <AppSelect
        v-model="recetaId"
        label="Receta *"
        :options="[{ value: '', label: 'Seleccionar receta...' }, ...recetaOptions]"
        :disabled="isSaving"
      />

      <AppInput
        v-model="cantidadProducida"
        label="Cantidad a producir (litros) *"
        type="number"
        :disabled="isSaving"
      />

      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-brand-950">Notas</label>
        <textarea
          v-model="notas"
          rows="2"
          placeholder="Notas sobre esta producción..."
          class="w-full px-4 py-2.5 bg-white text-brand-950 text-sm rounded-xl border border-sand-200 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-400 transition-all duration-200 disabled:opacity-50 resize-none"
          :disabled="isSaving"
        />
      </div>

      <!-- Preview -->
      <div v-if="selectedReceta && ingredientesPreview.length > 0" class="bg-sand-50 rounded-xl p-4 space-y-3">
        <p class="text-[12px] font-medium text-sand-400 uppercase tracking-wider">Resumen de producción</p>

        <div class="space-y-2">
          <div
            v-for="(ing, idx) in ingredientesPreview"
            :key="idx"
            class="flex items-center justify-between text-[13px]"
          >
            <span class="text-brand-950">{{ ing.nombre }}</span>
            <span class="text-sand-400">
              {{ formatNumber(ing.cantidad) }} {{ ing.unidad === 'l' ? 'L' : ing.unidad }}
              · ${{ formatCurrency(ing.costo) }}
            </span>
          </div>
        </div>

        <div class="h-px bg-sand-200" />

        <div class="flex justify-between text-[13px]">
          <span class="font-medium text-brand-950">Costo estimado</span>
          <span class="font-semibold text-brand-950">{{ formatCurrency(costoEstimado) }}</span>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <SecondaryButton :disabled="isSaving" @click="emit('close')">Cancelar</SecondaryButton>
        <PrimaryButton :loading="isSaving" @click="handleSubmit">
          Registrar producción
        </PrimaryButton>
      </div>
    </template>
  </AppDrawer>
</template>
