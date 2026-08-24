<script setup lang="ts">
import type { CompraItemForm } from '~/composables/useCompras'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { createCompra, fetchInsumos, insumos } = useCompras()

const proveedorNombre = ref('')
const medioPago = ref('efectivo')
const notas = ref('')
const items = ref<CompraItemForm[]>([])
const isSaving = ref(false)

const errors = reactive({
  proveedor: '',
  items: '',
})

const medioPagoOptions = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'mp', label: 'Mercado Pago' },
]

const insumoOptions = computed(() =>
  insumos.value.map(i => ({
    value: i.id,
    label: `${i.nombre} (${i.unidad_medida}${i.volumen_botella ? ' — ' + i.volumen_botella + 'ml' : ''})`,
  }))
)

function handleInsumoSelect(idx: number) {
  const item = items.value[idx]
  if (!item.insumo_id) return
  const insumo = insumos.value.find(i => i.id === item.insumo_id)
  if (insumo) {
    item.costo_unitario = Number(insumo.costo_unitario)
  }
}

const totalGeneral = computed(() =>
  items.value.reduce((sum, item) => sum + (item.cantidad * item.costo_unitario), 0)
)

function formatCurrency(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function formatNumber(n: number) {
  return n.toLocaleString('es-AR', { maximumFractionDigits: 2 })
}

watch(() => props.open, async (val) => {
  if (val) {
    await fetchInsumos()
    proveedorNombre.value = ''
    medioPago.value = 'efectivo'
    notas.value = ''
    items.value = []
    clearErrors()
  }
})

function clearErrors() {
  errors.proveedor = ''
  errors.items = ''
}

function addItem() {
  items.value.push({ insumo_id: '', cantidad: 1, costo_unitario: 0 })
}

function removeItem(index: number) {
  items.value.splice(index, 1)
}

function validate(): boolean {
  clearErrors()
  let valid = true

  if (!proveedorNombre.value || proveedorNombre.value.trim().length < 2) {
    errors.proveedor = 'El nombre del proveedor es obligatorio'
    valid = false
  }

  if (items.value.length === 0) {
    errors.items = 'Agregá al menos un item'
    valid = false
  }

  const hasEmpty = items.value.some(i => !i.insumo_id || i.cantidad <= 0)
  if (hasEmpty) {
    errors.items = 'Todos los items deben tener insumo y cantidad válida'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return

  isSaving.value = true
  try {
    await createCompra(
      proveedorNombre.value.trim(),
      items.value,
      medioPago.value,
      notas.value
    )
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
  <AppDrawer :open="open" title="Nueva compra" @close="emit('close')">
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <AppInput
        v-model="proveedorNombre"
        label="Proveedor / Distribuidora *"
        placeholder="Ej: Coto, La Anónima, Distribuidora X"
        :error="errors.proveedor"
        :disabled="isSaving"
      />

      <div class="grid grid-cols-2 gap-4">
        <AppSelect
          v-model="medioPago"
          label="Medio de pago"
          :options="medioPagoOptions"
          :disabled="isSaving"
        />
        <AppInput
          v-model="notas"
          label="Notas"
          placeholder="Opcional"
          :disabled="isSaving"
        />
      </div>

      <!-- Items -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-brand-950">Items de la compra</label>
          <button
            type="button"
            class="text-[12px] text-brand-600 hover:text-brand-950 font-medium transition-colors"
            @click="addItem"
          >
            + Agregar item
          </button>
        </div>

        <p v-if="errors.items" class="text-[12px] text-danger mb-2">{{ errors.items }}</p>

        <div v-if="items.length === 0" class="text-center py-6 bg-sand-50 rounded-xl">
          <p class="text-[13px] text-sand-400">Sin items. Agregá al menos uno.</p>
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
                  v-model="item.insumo_id"
                  :options="[{ value: '', label: 'Seleccionar insumo...' }, ...insumoOptions]"
                  :disabled="isSaving"
                  @update:model-value="handleInsumoSelect(idx)"
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
                  v-model="item.costo_unitario"
                  label="Costo unitario"
                  type="number"
                  :disabled="isSaving"
                />
              </div>
              <div class="flex-1">
                <label class="block text-[11px] text-sand-300 uppercase tracking-wider font-medium mb-1">Subtotal</label>
                <p class="h-[38px] flex items-center text-[14px] font-semibold text-brand-950">
                  {{ formatCurrency(item.cantidad * item.costo_unitario) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Total -->
      <div v-if="items.length > 0" class="bg-brand-950 text-white rounded-xl p-4">
        <div class="flex justify-between items-center">
          <span class="text-[13px] text-brand-400">Total</span>
          <span class="text-[18px] font-bold">{{ formatCurrency(totalGeneral) }}</span>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <SecondaryButton :disabled="isSaving" @click="emit('close')">Cancelar</SecondaryButton>
        <PrimaryButton :loading="isSaving" @click="handleSubmit">
          Registrar compra
        </PrimaryButton>
      </div>
    </template>
  </AppDrawer>
</template>
