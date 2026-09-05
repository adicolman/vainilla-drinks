<script setup lang="ts">
import type { VentaItemForm, RecetaConCosto } from '~/composables/useVentas'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { createVenta, fetchRecetas, recetas } = useVentas()

const items = ref<VentaItemForm[]>([])
const medioPago = ref('efectivo')
const isSaving = ref(false)

const errors = reactive({
  items: '',
})

const medioPagoOptions = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'mp', label: 'Mercado Pago' },
]

const recetaOptions = computed(() =>
  recetas.value.map(r => ({
    value: r.id,
    label: `${r.nombre} — ${formatCurrency(Number(r.precio_venta))}`,
  }))
)

function formatCurrency(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function calcularCosto(recetaId: string): number {
  const receta = recetas.value.find(r => r.id === recetaId)
  if (!receta?.receta_ingredientes?.length) return 0
  return receta.receta_ingredientes.reduce((sum, ing) => {
    const costo = Number(ing.insumo?.costo_promedio || 0)
    const cantidad = Number(ing.cantidad_para_1_litro || 0)
    return sum + (costo * cantidad)
  }, 0)
}

function handleRecetaSelect(idx: number) {
  const item = items.value[idx]
  if (!item || !item.receta_id) return
  const receta = recetas.value.find(r => r.id === item.receta_id)
  if (receta) {
    item.precio_unitario = Number(receta.precio_venta)
  }
}

const totalGeneral = computed(() =>
  items.value.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0)
)

const costoTotal = computed(() =>
  items.value.reduce((sum, item) => sum + (calcularCosto(item.receta_id) * item.cantidad), 0)
)

const margenTotal = computed(() => {
  if (totalGeneral.value <= 0) return 0
  return ((totalGeneral.value - costoTotal.value) / totalGeneral.value) * 100
})

watch(() => props.open, async (val) => {
  if (val) {
    await fetchRecetas()
    items.value = []
    medioPago.value = 'efectivo'
    errors.items = ''
  }
})

function addItem() {
  items.value.push({ receta_id: '', cantidad: 1, precio_unitario: 0 })
}

function removeItem(index: number) {
  items.value.splice(index, 1)
}

function validate(): boolean {
  errors.items = ''

  if (items.value.length === 0) {
    errors.items = 'Agregá al menos un item'
    return false
  }

  const hasEmpty = items.value.some(i => !i.receta_id || i.cantidad <= 0 || i.precio_unitario <= 0)
  if (hasEmpty) {
    errors.items = 'Todos los items deben tener receta, cantidad y precio válidos'
    return false
  }

  return true
}

async function handleSubmit() {
  if (!validate()) return

  isSaving.value = true
  try {
    await createVenta(items.value, medioPago.value)
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
  <AppDrawer :open="open" title="Nueva venta" @close="emit('close')">
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <AppSelect
        v-model="medioPago"
        label="Medio de pago"
        :options="medioPagoOptions"
        :disabled="isSaving"
      />

      <!-- Items -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-brand-950">Productos vendidos</label>
          <button
            type="button"
            class="text-[12px] text-brand-600 hover:text-brand-950 font-medium transition-colors"
            @click="addItem"
          >
            + Agregar producto
          </button>
        </div>

        <p v-if="errors.items" class="text-[12px] text-danger mb-2">{{ errors.items }}</p>

        <div v-if="items.length === 0" class="text-center py-6 bg-sand-50 rounded-xl">
          <p class="text-[13px] text-sand-400">Sin productos. Agregá al menos uno.</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(item, idx) in items"
            :key="idx"
            class="bg-sand-50 rounded-xl p-3 space-y-2"
          >
            <div class="flex items-end gap-2">
              <div class="flex-1">
                <AppSelect
                  v-model="item.receta_id"
                  :options="[{ value: '', label: 'Seleccionar receta...' }, ...recetaOptions]"
                  :disabled="isSaving"
                  @update:model-value="handleRecetaSelect(idx)"
                />
              </div>
              <button
                type="button"
                class="w-9 h-9 flex items-center justify-center rounded-lg text-sand-400 hover:text-danger hover:bg-danger-soft transition-colors shrink-0 mb-0.5"
                @click="removeItem(idx)"
              >
                <Icon name="lucide:x" class="w-4 h-4" />
              </button>
            </div>
            <div class="flex gap-2">
              <div class="flex-1">
                <AppInput
                  v-model="item.cantidad"
                  label="Cantidad"
                  type="number"
                  :disabled="isSaving"
                />
              </div>
              <div class="flex-1">
                <AppInput
                  v-model="item.precio_unitario"
                  label="Precio unitario"
                  type="number"
                  :disabled="isSaving"
                />
              </div>
              <div class="flex-1">
                <label class="block text-[11px] text-sand-300 uppercase tracking-wider font-medium mb-1">Subtotal</label>
                <p class="h-[38px] flex items-center text-[14px] font-semibold text-brand-950">
                  {{ formatCurrency(item.cantidad * item.precio_unitario) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Totals -->
      <div v-if="items.length > 0" class="space-y-3">
        <div class="bg-brand-950 text-white rounded-xl p-4">
          <div class="flex justify-between items-center">
            <span class="text-[13px] text-brand-400">Total venta</span>
            <span class="text-[18px] font-bold">{{ formatCurrency(totalGeneral) }}</span>
          </div>
        </div>
        <div class="bg-sand-50 rounded-xl p-4">
          <div class="flex justify-between items-center">
            <span class="text-[13px] text-sand-400">Costo estimado</span>
            <span class="text-[14px] font-semibold text-brand-950">{{ formatCurrency(costoTotal) }}</span>
          </div>
          <div class="flex justify-between items-center mt-2">
            <span class="text-[13px] text-sand-400">Margen estimado</span>
            <span
              class="text-[14px] font-semibold"
              :class="margenTotal >= 50 ? 'text-success' : margenTotal >= 20 ? 'text-warning' : 'text-danger'"
            >
              {{ margenTotal.toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <SecondaryButton :disabled="isSaving" @click="emit('close')">Cancelar</SecondaryButton>
        <PrimaryButton :loading="isSaving" @click="handleSubmit">
          Registrar venta
        </PrimaryButton>
      </div>
    </template>
  </AppDrawer>
</template>
