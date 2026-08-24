<script setup lang="ts">
import type { RecetaConIngredientes } from '~/composables/useRecetas'
import type { InsumoRow } from '~/composables/useInsumos'

const props = defineProps<{
  open: boolean
  receta?: RecetaConIngredientes | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { createReceta, updateReceta, insumos, fetchInsumos } = useRecetas()

const isEditing = computed(() => !!props.receta)

interface IngredienteForm {
  insumo_id: string
  cantidad_para_1_litro: number
  unidad: string
}

const form = reactive({
  nombre: '',
  descripcion: '',
  categoria: 'general',
  precio_venta: 0,
  margen_objetivo: 0,
  activo: true,
})

const ingredientes = ref<IngredienteForm[]>([])

const errors = reactive({
  nombre: '',
  precio_venta: '',
})

const isSaving = ref(false)

const { getCategoriasPorTipo, fetchCategorias } = useCategorias()
const categoriaOptions = getCategoriasPorTipo('receta')

const insumoOptions = computed(() =>
  insumos.value.map(i => ({ value: i.id, label: `${i.nombre} (${i.unidad_medida})` }))
)

const costoPorLitro = computed(() => {
  return ingredientes.value.reduce((total, ing) => {
    const insumo = insumos.value.find(i => i.id === ing.insumo_id)
    if (!insumo) return total
    return total + (Number(insumo.costo_promedio) * ing.cantidad_para_1_litro)
  }, 0)
})

const margenReal = computed(() => {
  if (!form.precio_venta) return 0
  return ((form.precio_venta - costoPorLitro.value) / form.precio_venta * 100)
})

watch(() => props.open, async (val) => {
  if (val) {
    await Promise.all([fetchInsumos(), fetchCategorias('receta')])

    if (props.receta) {
      form.nombre = props.receta.nombre
      form.descripcion = props.receta.descripcion
      form.categoria = props.receta.categoria
      form.precio_venta = Number(props.receta.precio_venta)
      form.margen_objetivo = Number(props.receta.margen_objetivo)
      form.activo = props.receta.activo
      ingredientes.value = (props.receta.receta_ingredientes || []).map(ri => ({
        insumo_id: ri.insumo_id,
        cantidad_para_1_litro: Number(ri.cantidad_para_1_litro),
        unidad: ri.unidad,
      }))
    } else {
      form.nombre = ''
      form.descripcion = ''
      form.categoria = 'general'
      form.precio_venta = 0
      form.margen_objetivo = 0
      form.activo = true
      ingredientes.value = []
    }
    clearErrors()
  }
})

function clearErrors() {
  errors.nombre = ''
  errors.precio_venta = ''
}

function addIngrediente() {
  ingredientes.value.push({ insumo_id: '', cantidad_para_1_litro: 0, unidad: 'ml' })
}

function removeIngrediente(index: number) {
  ingredientes.value.splice(index, 1)
}

function validate(): boolean {
  clearErrors()
  let valid = true

  if (!form.nombre || form.nombre.trim().length < 2) {
    errors.nombre = 'El nombre es obligatorio (mínimo 2 caracteres)'
    valid = false
  }

  if (form.precio_venta < 0) {
    errors.precio_venta = 'El precio no puede ser negativo'
    valid = false
  }

  const hasEmptyInsumo = ingredientes.value.some(i => !i.insumo_id)
  if (hasEmptyInsumo) {
    addToast('error', 'Error', 'Todos los ingredientes deben tener un insumo seleccionado')
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return

  isSaving.value = true
  try {
    const data = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      categoria: form.categoria,
      precio_venta: form.precio_venta,
      margen_objetivo: form.margen_objetivo,
    }

    if (isEditing.value && props.receta) {
      await updateReceta(props.receta.id, { ...data, activo: form.activo }, ingredientes.value)
    } else {
      await createReceta(data, ingredientes.value)
    }
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
  <AppDrawer :open="open" :title="isEditing ? 'Editar receta' : 'Nueva receta'" @close="emit('close')">
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <AppInput
        v-model="form.nombre"
        label="Nombre *"
        placeholder="Ej: Tonic & Gin"
        :error="errors.nombre"
        :disabled="isSaving"
      />

      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-brand-950">Descripción</label>
        <textarea
          v-model="form.descripcion"
          rows="2"
          placeholder="Descripción breve de la receta..."
          class="w-full px-4 py-2.5 bg-white text-brand-950 text-sm rounded-xl border border-sand-200 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-400 transition-all duration-200 disabled:opacity-50 resize-none"
          :disabled="isSaving"
        />
      </div>

      <AppSelect v-model="form.categoria" label="Categoría" :options="categoriaOptions" :disabled="isSaving" />

      <div class="grid grid-cols-2 gap-4">
        <AppInput v-model="form.precio_venta" label="Precio de venta" type="number" :error="errors.precio_venta" :disabled="isSaving" />
        <AppInput v-model="form.margen_objetivo" label="Margen objetivo (%)" type="number" :disabled="isSaving" />
      </div>

      <!-- Cost summary -->
      <div class="bg-sand-50 rounded-xl p-4 space-y-2">
        <div class="flex justify-between text-[13px]">
          <span class="text-sand-400">Costo por litro</span>
          <span class="font-medium text-brand-950">${{ costoPorLitro.toLocaleString('es-AR', { maximumFractionDigits: 2 }) }}</span>
        </div>
        <div class="flex justify-between text-[13px]">
          <span class="text-sand-400">Margen real</span>
          <span class="font-medium" :class="margenReal >= 0 ? 'text-success' : 'text-danger'">
            {{ margenReal.toLocaleString('es-AR', { maximumFractionDigits: 1 }) }}%
          </span>
        </div>
      </div>

      <!-- Ingredientes -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-brand-950">Ingredientes</label>
          <button
            type="button"
            class="text-[12px] text-brand-600 hover:text-brand-950 font-medium transition-colors"
            @click="addIngrediente"
          >
            + Agregar
          </button>
        </div>

        <div v-if="ingredientes.length === 0" class="text-center py-6 bg-sand-50 rounded-xl">
          <p class="text-[13px] text-sand-400">Sin ingredientes. Agregá al menos uno.</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(ing, idx) in ingredientes"
            :key="idx"
            class="flex items-end gap-2 bg-sand-50 rounded-xl p-3"
          >
            <div class="flex-1">
              <AppSelect
                v-model="ing.insumo_id"
                :options="[{ value: '', label: 'Seleccionar...' }, ...insumoOptions]"
                :disabled="isSaving"
              />
            </div>
            <div class="w-28">
              <AppInput
                v-model="ing.cantidad_para_1_litro"
                label="Cant./L"
                type="number"
                :disabled="isSaving"
              />
            </div>
            <button
              type="button"
              class="w-9 h-9 flex items-center justify-center rounded-lg text-sand-400 hover:text-danger hover:bg-danger-soft transition-colors shrink-0 mb-0.5"
              @click="removeIngrediente(idx)"
            >
              <Icon name="lucide:x" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="isEditing" class="flex items-center gap-3">
        <label class="text-sm font-medium text-brand-950">Activa</label>
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
        <SecondaryButton :disabled="isSaving" @click="emit('close')">Cancelar</SecondaryButton>
        <PrimaryButton :loading="isSaving" @click="handleSubmit">
          {{ isEditing ? 'Guardar cambios' : 'Crear receta' }}
        </PrimaryButton>
      </div>
    </template>
  </AppDrawer>
</template>
