<script setup lang="ts">
import type { InsumoRow } from '~/composables/useInsumos'

const props = defineProps<{
  open: boolean
  insumo?: InsumoRow | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { createInsumo, updateInsumo } = useInsumos()
const { getCategoriasPorTipo, fetchCategorias } = useCategorias()

const isEditing = computed(() => !!props.insumo)

const categoriaOptions = getCategoriasPorTipo('insumo')

const form = reactive({
  nombre: '',
  categoria: 'general',
  unidad_medida: 'ml',
  costo_unitario: 0,
  stock_inicial: 0,
  stock_minimo: 0,
  volumen_botella: null as number | null,
  proveedor_principal_id: '',
  activo: true,
})

const errors = reactive({
  nombre: '',
  costo_unitario: '',
  stock_inicial: '',
  stock_minimo: '',
})

const isSaving = ref(false)

const unidadOptions = [
  { value: 'ml', label: 'ml' },
  { value: 'l', label: 'L' },
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'unidad', label: 'Unidad' },
]

watch(() => props.open, (val) => {
  if (val) fetchCategorias('insumo')
  if (val && props.insumo) {
    form.nombre = props.insumo.nombre
    form.categoria = props.insumo.categoria
    form.unidad_medida = props.insumo.unidad_medida
    form.costo_unitario = Number(props.insumo.costo_unitario)
    form.stock_inicial = 0
    form.stock_minimo = Number(props.insumo.stock_minimo)
    form.volumen_botella = props.insumo.volumen_botella != null ? Number(props.insumo.volumen_botella) : null
    form.proveedor_principal_id = props.insumo.proveedor_principal_id || ''
    form.activo = props.insumo.activo
  } else if (val) {
    form.nombre = ''
    form.categoria = 'general'
    form.unidad_medida = 'ml'
    form.costo_unitario = 0
    form.stock_inicial = 0
    form.stock_minimo = 0
    form.volumen_botella = null
    form.proveedor_principal_id = ''
    form.activo = true
  }
  clearErrors()
})

function clearErrors() {
  errors.nombre = ''
  errors.costo_unitario = ''
  errors.stock_inicial = ''
  errors.stock_minimo = ''
}

function validate(): boolean {
  clearErrors()
  let valid = true

  if (!form.nombre || form.nombre.trim().length < 2) {
    errors.nombre = 'El nombre es obligatorio (mínimo 2 caracteres)'
    valid = false
  }

  if (form.costo_unitario < 0) {
    errors.costo_unitario = 'El costo no puede ser negativo'
    valid = false
  }

  if (!isEditing.value && form.stock_inicial < 0) {
    errors.stock_inicial = 'El stock no puede ser negativo'
    valid = false
  }

  if (form.stock_minimo < 0) {
    errors.stock_minimo = 'El stock mínimo no puede ser negativo'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return

  isSaving.value = true
  try {
    if (isEditing.value && props.insumo) {
      await updateInsumo(props.insumo.id, {
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        unidad_medida: form.unidad_medida,
        costo_unitario: form.costo_unitario,
        stock_minimo: form.stock_minimo,
        volumen_botella: form.volumen_botella,
        proveedor_principal_id: form.proveedor_principal_id || null,
        activo: form.activo,
      })
    } else {
      await createInsumo({
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        unidad_medida: form.unidad_medida,
        costo_unitario: form.costo_unitario,
        stock_inicial: form.stock_inicial,
        stock_minimo: form.stock_minimo,
        volumen_botella: form.volumen_botella,
        proveedor_principal_id: form.proveedor_principal_id || null,
      })
    }
    emit('saved')
    emit('close')
  } catch {
    // toast already shown by composable
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <AppDrawer
    :open="open"
    :title="isEditing ? 'Editar insumo' : 'Nuevo insumo'"
    @close="emit('close')"
  >
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <AppInput
        v-model="form.nombre"
        label="Nombre *"
        placeholder="Ej: Azúcar flor"
        :error="errors.nombre"
        :disabled="isSaving"
      />

      <AppSelect
        v-model="form.categoria"
        label="Categoría"
        :options="categoriaOptions"
        :disabled="isSaving"
      />

      <AppSelect
        v-model="form.unidad_medida"
        label="Unidad de medida"
        :options="unidadOptions"
        :disabled="isSaving"
      />

      <AppInput
        v-model="form.costo_unitario"
        label="Costo unitario"
        type="number"
        :error="errors.costo_unitario"
        :disabled="isSaving"
      />

      <AppInput
        v-if="!isEditing"
        v-model="form.stock_inicial"
        label="Stock inicial"
        type="number"
        helper="Se registrará como movimiento de tipo ajuste"
        :error="errors.stock_inicial"
        :disabled="isSaving"
      />

      <AppInput
        v-model="form.stock_minimo"
        label="Stock mínimo"
        type="number"
        :error="errors.stock_minimo"
        :disabled="isSaving"
      />

      <div v-if="form.unidad_medida === 'ml' || form.unidad_medida === 'l'" class="space-y-1">
        <AppInput
          v-model="form.volumen_botella"
          label="Volumen de la botella (ml)"
          type="number"
          helper="Ej: 750 para una botella de 750ml. Se usa para calcular costo por ml."
          :disabled="isSaving"
        />
      </div>

      <div v-if="form.volumen_botella && form.costo_unitario && form.volumen_botella > 0" class="bg-sand-50 rounded-xl p-3">
        <p class="text-[12px] text-sand-400">Costo por ml</p>
        <p class="text-[16px] font-semibold text-brand-950">
          ${{ (form.costo_unitario / form.volumen_botella).toFixed(2) }}
        </p>
      </div>

      <div v-if="isEditing" class="flex items-center gap-3">
        <label class="text-sm font-medium text-brand-950">Activo</label>
        <button
          type="button"
          :class="form.activo ? 'bg-brand-600' : 'bg-sand-200'"
          class="relative w-10 h-6 rounded-full transition-colors"
          @click="form.activo = !form.activo"
        >
          <span
            :class="form.activo ? 'translate-x-4' : 'translate-x-0.5'"
            class="absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow transition-transform"
          />
        </button>
      </div>
    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <SecondaryButton :disabled="isSaving" @click="emit('close')">
          Cancelar
        </SecondaryButton>
        <PrimaryButton :loading="isSaving" @click="handleSubmit">
          {{ isEditing ? 'Guardar cambios' : 'Crear insumo' }}
        </PrimaryButton>
      </div>
    </template>
  </AppDrawer>
</template>
