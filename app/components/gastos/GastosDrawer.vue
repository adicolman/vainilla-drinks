<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { createGasto, fetchProveedores, proveedores } = useGastos()

const concepto = ref('')
const categoria = ref('otros')
const monto = ref<number>(0)
const medioPago = ref('efectivo')
const proveedorId = ref('')
const descripcion = ref('')
const isSaving = ref(false)

const errors = reactive({
  concepto: '',
  monto: '',
})

const categoriaOptions = [
  { value: 'publicidad', label: 'Publicidad' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'equipamiento', label: 'Equipamiento' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'logistica', label: 'Logística' },
  { value: 'impuestos', label: 'Impuestos' },
  { value: 'otros', label: 'Otros' },
]

const medioPagoOptions = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'mp', label: 'Mercado Pago' },
]

const proveedorOptions = computed(() => [
  { value: '', label: 'Sin proveedor' },
  ...proveedores.value.map(p => ({ value: p.id, label: p.nombre })),
])

watch(() => props.open, async (val) => {
  if (val) {
    await fetchProveedores()
    concepto.value = ''
    categoria.value = 'otros'
    monto.value = 0
    medioPago.value = 'efectivo'
    proveedorId.value = ''
    descripcion.value = ''
    errors.concepto = ''
    errors.monto = ''
  }
})

function validate(): boolean {
  errors.concepto = ''
  errors.monto = ''
  let valid = true

  if (!concepto.value || concepto.value.trim().length < 2) {
    errors.concepto = 'El concepto es obligatorio'
    valid = false
  }

  if (!monto.value || monto.value <= 0) {
    errors.monto = 'El monto debe ser mayor a 0'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return

  isSaving.value = true
  try {
    await createGasto(
      concepto.value.trim(),
      categoria.value,
      monto.value,
      medioPago.value,
      descripcion.value,
      proveedorId.value || null
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
  <AppDrawer :open="open" title="Nuevo gasto" @close="emit('close')">
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <AppInput
        v-model="concepto"
        label="Concepto *"
        placeholder="Ej: Alquiler local, Servicio de luz..."
        :error="errors.concepto"
        :disabled="isSaving"
      />

      <div class="grid grid-cols-2 gap-4">
        <AppSelect
          v-model="categoria"
          label="Categoría"
          :options="categoriaOptions"
          :disabled="isSaving"
        />
        <AppSelect
          v-model="medioPago"
          label="Medio de pago"
          :options="medioPagoOptions"
          :disabled="isSaving"
        />
      </div>

      <AppInput
        v-model="monto"
        label="Monto *"
        type="number"
        placeholder="0"
        :error="errors.monto"
        :disabled="isSaving"
      />

      <AppSelect
        v-model="proveedorId"
        label="Proveedor (opcional)"
        :options="proveedorOptions"
        :disabled="isSaving"
      />

      <AppInput
        v-model="descripcion"
        label="Descripción (opcional)"
        placeholder="Detalles adicionales..."
        :disabled="isSaving"
      />

      <!-- Preview -->
      <div v-if="monto > 0" class="bg-danger-soft rounded-xl p-4">
        <div class="flex justify-between items-center">
          <span class="text-[13px] font-medium text-danger">Egreso</span>
          <span class="text-[18px] font-bold text-danger">
            −{{ monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }) }}
          </span>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <SecondaryButton :disabled="isSaving" @click="emit('close')">Cancelar</SecondaryButton>
        <PrimaryButton :loading="isSaving" @click="handleSubmit">
          Registrar gasto
        </PrimaryButton>
      </div>
    </template>
  </AppDrawer>
</template>
