<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { createMovimiento } = useCaja()

const tipo = ref<'ingreso' | 'egreso'>('ingreso')
const concepto = ref('')
const monto = ref<number>(0)
const referenciaTipo = ref('')
const isSaving = ref(false)

const errors = reactive({
  concepto: '',
  monto: '',
})

const tipoOptions = [
  { value: 'ingreso', label: 'Ingreso' },
  { value: 'egreso', label: 'Egreso' },
]

watch(() => props.open, (val) => {
  if (val) {
    tipo.value = 'ingreso'
    concepto.value = ''
    monto.value = 0
    referenciaTipo.value = ''
    clearErrors()
  }
})

function clearErrors() {
  errors.concepto = ''
  errors.monto = ''
}

function validate(): boolean {
  clearErrors()
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
    await createMovimiento(
      tipo.value,
      concepto.value.trim(),
      monto.value,
      referenciaTipo.value.trim() || undefined
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
  <AppDrawer :open="open" title="Nuevo movimiento" @close="emit('close')">
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <AppSelect
        v-model="tipo"
        label="Tipo de movimiento"
        :options="tipoOptions"
        :disabled="isSaving"
      />

      <AppInput
        v-model="concepto"
        label="Concepto *"
        placeholder="Ej: Venta del día, Pago a proveedor..."
        :error="errors.concepto"
        :disabled="isSaving"
      />

      <AppInput
        v-model="monto"
        label="Monto *"
        type="number"
        placeholder="0"
        :error="errors.monto"
        :disabled="isSaving"
      />

      <AppInput
        v-model="referenciaTipo"
        label="Referencia (opcional)"
        placeholder="Ej: Venta #123, Gasto mensual"
        :disabled="isSaving"
      />

      <!-- Preview -->
      <div v-if="monto > 0" class="rounded-xl p-4" :class="tipo === 'ingreso' ? 'bg-success-soft' : 'bg-danger-soft'">
        <div class="flex justify-between items-center">
          <span class="text-[13px] font-medium" :class="tipo === 'ingreso' ? 'text-success' : 'text-danger'">
            {{ tipo === 'ingreso' ? 'Ingreso' : 'Egreso' }}
          </span>
          <span class="text-[18px] font-bold" :class="tipo === 'ingreso' ? 'text-success' : 'text-danger'">
            {{ tipo === 'ingreso' ? '+' : '-' }}{{ monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }) }}
          </span>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <SecondaryButton :disabled="isSaving" @click="emit('close')">Cancelar</SecondaryButton>
        <PrimaryButton :loading="isSaving" @click="handleSubmit">
          Registrar movimiento
        </PrimaryButton>
      </div>
    </template>
  </AppDrawer>
</template>
