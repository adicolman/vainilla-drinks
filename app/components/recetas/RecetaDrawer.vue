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

const { createReceta, updateReceta, uploadImagen, insumos, fetchInsumos } = useRecetas()
const { addToast } = useToast()

const imagenUrl = ref<string | null>(null)
const imagenPreview = ref<string | null>(null)
const isUploading = ref(false)

const isEditing = computed(() => !!props.receta)

interface IngredienteForm {
  insumo_id: string
  cantidad_para_1_litro: number
  unidad: string
  es_nota: boolean
  unidad_receta: string | null
  factor_conversion: number
}

const form = reactive({
  nombre: '',
  descripcion: '',
  categoria: 'general',
  precio_venta: 0,
  margen_objetivo: 60,
  activo: true,
})

const ingredientes = ref<IngredienteForm[]>([])
const precioManual = ref(false)

const errors = reactive({
  nombre: '',
})

const isSaving = ref(false)

const { getCategoriasPorTipo, fetchCategorias } = useCategorias()
const categoriaOptions = getCategoriasPorTipo('receta')

const insumoOptions = computed(() =>
  insumos.value.map(i => ({ value: i.id, label: `${i.nombre} (${i.unidad_medida})` }))
)

const unidadRecetaOptions = [
  { value: 'ml', label: 'ml' },
  { value: 'g', label: 'g' },
  { value: 'oz', label: 'oz (25ml)' },
  { value: 'cucharada', label: 'cucharada (15g)' },
]

const stockLabels: Record<string, string> = {
  ml: 'ml',
  l: 'L',
  g: 'g',
  kg: 'kg',
  unidad: 'unidad',
}

function unidadOptionsFor(ing: IngredienteForm) {
  const base = getInsumo(ing.insumo_id)?.unidad_medida
  if (!base) return [{ value: null as string | null, label: 'Unidad stock' }]
  const stockOption = { value: null as string | null, label: `${stockLabels[base] || base} (stock)` }
  // artículos conteables no se convierten: solo existe la unidad de stock
  if (base === 'unidad') return [stockOption]
  return [stockOption, ...unidadRecetaOptions.filter(o => o.value !== base)]
}

function getInsumo(insumoId: string): InsumoRow | undefined {
  return insumos.value.find(i => i.id === insumoId)
}

function getConversion(ing: IngredienteForm): string {
  if (ing.es_nota || !ing.insumo_id || ing.cantidad_para_1_litro <= 0) return ''
  const insumo = getInsumo(ing.insumo_id)
  if (!insumo) return ''

  const unidadBase = insumo.unidad_medida
  const unidadReceta = ing.unidad_receta || unidadBase

  if (unidadReceta === unidadBase) return ''
  if (ing.factor_conversion <= 0) return ''

  const enBase = ing.cantidad_para_1_litro * ing.factor_conversion
  return `= ${enBase.toLocaleString('es-AR', { maximumFractionDigits: 3 })} ${unidadBase}`
}

const costoPorcion = computed(() => {
  return ingredientes.value.reduce((total, ing) => {
    if (ing.es_nota) return total
    const insumo = getInsumo(ing.insumo_id)
    if (!insumo) return total
    const factor = (ing.unidad_receta && ing.factor_conversion > 0) ? ing.factor_conversion : 1
    return total + (Number(insumo.costo_promedio) * ing.cantidad_para_1_litro * factor)
  }, 0)
})

const precioSugerido = computed(() => {
  if (costoPorcion.value <= 0 || form.margen_objetivo <= 0) return 0
  return costoPorcion.value / (1 - form.margen_objetivo / 100)
})

const margenReal = computed(() => {
  if (!form.precio_venta || form.precio_venta <= 0) return 0
  return ((form.precio_venta - costoPorcion.value) / form.precio_venta * 100)
})

watch(() => form.margen_objetivo, () => {
  if (!precioManual.value && costoPorcion.value > 0 && form.margen_objetivo > 0) {
    form.precio_venta = Math.round(precioSugerido.value)
  }
})

watch(() => form.precio_venta, () => {
  if (form.precio_venta > 0) {
    precioManual.value = true
  }
})

function setMargen(m: number) {
  precioManual.value = false
  form.margen_objetivo = m
  if (costoPorcion.value > 0) {
    form.precio_venta = Math.round(costoPorcion.value / (1 - m / 100))
  }
}

function setPrecioManual() {
  precioManual.value = true
}

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
      imagenUrl.value = (props.receta as any).imagen_url || null
      imagenPreview.value = imagenUrl.value
      precioManual.value = false
      ingredientes.value = (props.receta.receta_ingredientes || []).map(ri => {
        const base = getInsumo(ri.insumo_id)?.unidad_medida
        const ur = ri.unidad_receta || null
        const factor = ri.factor_conversion != null ? Number(ri.factor_conversion) : 1
        const cantidad = Number(ri.cantidad_para_1_litro)
        const esValida = !!ur && ur !== 'unidad' && ur !== base && unidadRecetaOptions.some(o => o.value === ur)

        // unidad ya no disponible (kg, l, unidad, o la misma del stock):
        // se aplana a la unidad de stock para conservar costo y descuento
        if (!esValida) {
          return {
            insumo_id: ri.insumo_id,
            cantidad_para_1_litro: ur && factor > 0 ? cantidad * factor : cantidad,
            unidad: ri.unidad,
            es_nota: ri.es_nota || false,
            unidad_receta: null,
            factor_conversion: 1,
          }
        }

        return {
          insumo_id: ri.insumo_id,
          cantidad_para_1_litro: cantidad,
          unidad: ri.unidad,
          es_nota: ri.es_nota || false,
          unidad_receta: ur,
          factor_conversion: factor,
        }
      })
    } else {
      form.nombre = ''
      form.descripcion = ''
      form.categoria = 'general'
      form.precio_venta = 0
      form.margen_objetivo = 60
      form.activo = true
      imagenUrl.value = null
      imagenPreview.value = null
      precioManual.value = false
      ingredientes.value = []
    }
    clearErrors()
  }
})

async function onImagenChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    addToast('error', 'Imagen muy grande', 'Máximo 5MB')
    return
  }
  isUploading.value = true
  const url = await uploadImagen(file)
  isUploading.value = false
  if (url) {
    imagenUrl.value = url
    imagenPreview.value = url
  }
}
function removeImagen() {
  imagenUrl.value = null
  imagenPreview.value = null
}

function clearErrors() {
  errors.nombre = ''
}

function addIngrediente() {
  ingredientes.value.push({
    insumo_id: '',
    cantidad_para_1_litro: 0,
    unidad: 'ml',
    es_nota: false,
    unidad_receta: null,
    factor_conversion: 1,
  })
}

function removeIngrediente(index: number) {
  ingredientes.value.splice(index, 1)
}

function onInsumoChange(ing: IngredienteForm) {
  const insumo = getInsumo(ing.insumo_id)
  if (!insumo) return
  ing.unidad = insumo.unidad_medida
  ing.unidad_receta = null
  ing.factor_conversion = 1
}

function onUnidadRecetaChange(ing: IngredienteForm) {
  if (!ing.unidad_receta) {
    ing.factor_conversion = 1
    return
  }

  const insumo = getInsumo(ing.insumo_id)
  if (!insumo) {
    ing.factor_conversion = 1
    return
  }

  // base unificada: 1g ≈ 1ml, 1kg ≈ 1l, oz ≈ 25ml, cucharada ≈ 15g
  // esto permite convertir desde ml/g aunque el insumo stockee en l o kg
  const equiv: Record<string, number> = {
    g: 1,
    kg: 1000,
    ml: 1,
    l: 1000,
    oz: 25,
    cucharada: 15,
  }

  const receta = ing.unidad_receta
  const stock = insumo.unidad_medida

  // artículos conteables (unidad) no se convierten a ml/g/kg
  if (stock === 'unidad') {
    ing.factor_conversion = 1
    return
  }

  const recetaEquiv = equiv[receta]
  const stockEquiv = equiv[stock]

  if (recetaEquiv != null && stockEquiv != null) {
    ing.factor_conversion = recetaEquiv / stockEquiv
    return
  }

  ing.factor_conversion = 1
}

const ingredientesPayload = computed(() =>
  ingredientes.value.map(ing => {
    const insumo = getInsumo(ing.insumo_id)
    return { ...ing, unidad: insumo ? insumo.unidad_medida : ing.unidad }
  })
)

function validate(): boolean {
  clearErrors()
  let valid = true

  if (!form.nombre || form.nombre.trim().length < 2) {
    errors.nombre = 'El nombre es obligatorio (mínimo 2 caracteres)'
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
      imagen_url: imagenUrl.value,
    }

    if (isEditing.value && props.receta) {
      await updateReceta(props.receta.id, { ...data, activo: form.activo }, ingredientesPayload.value)
    } else {
      await createReceta(data, ingredientesPayload.value)
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
      <!-- 1. Datos básicos -->
      <AppInput
        v-model="form.nombre"
        label="Nombre *"
        placeholder="Ej: Baileys Helado"
        :error="errors.nombre"
        :disabled="isSaving"
      />

      <div>
        <label class="block text-sm font-medium text-brand-950 mb-1.5">Foto del trago</label>
        <div v-if="imagenPreview" class="relative rounded-xl overflow-hidden border border-sand-200 h-40 bg-sand-50">
          <img :src="imagenPreview" alt="Preview" class="w-full h-full object-cover" />
          <button type="button" class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 text-danger flex items-center justify-center shadow" @click="removeImagen">
            <Icon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>
        <label v-else class="flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 border-dashed border-sand-200 bg-sand-50 hover:bg-white cursor-pointer transition-colors">
          <Icon name="lucide:image-plus" class="w-6 h-6 text-sand-400" />
          <span class="text-[12px] text-sand-500 font-medium">{{ isUploading ? 'Subiendo...' : 'Click para subir imagen' }}</span>
          <span class="text-[10px] text-sand-300">JPG/PNG hasta 5MB</span>
          <input type="file" accept="image/*" class="hidden" :disabled="isSaving || isUploading" @change="onImagenChange" />
        </label>
        <div v-if="imagenPreview" class="mt-2 flex gap-2">
          <label class="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-sand-200 bg-white text-[12px] font-medium text-sand-600 hover:bg-sand-50 cursor-pointer">
            <Icon name="lucide:refresh-cw" class="w-3.5 h-3.5" /> Cambiar
            <input type="file" accept="image/*" class="hidden" :disabled="isSaving || isUploading" @change="onImagenChange" />
          </label>
        </div>
      </div>

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

      <!-- 2. Ingredientes -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-brand-950">Ingredientes</label>
          <button
            type="button"
            class="text-[12px] text-neon-pink hover:text-neon-pink/80 font-medium transition-colors"
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
            class="bg-sand-50 rounded-xl p-3"
          >
            <!-- Fila principal: insumo, cantidad, unidad, delete -->
            <div class="flex items-end gap-2">
              <div class="flex-1">
                <AppCombobox
                  v-model="ing.insumo_id"
                  :options="[{ value: '', label: 'Seleccionar...' }, ...insumoOptions]"
                  placeholder="Buscar ingrediente..."
                  search-placeholder="Buscar ingrediente..."
                  :disabled="isSaving"
                  @update:model-value="onInsumoChange(ing)"
                />
              </div>
              <div class="w-20">
                <AppInput
                  v-model="ing.cantidad_para_1_litro"
                  label="Cantidad"
                  type="number"
                  :disabled="isSaving || ing.es_nota"
                />
              </div>
              <div class="w-24">
                <AppSelect
                  v-model="ing.unidad_receta"
                  :options="unidadOptionsFor(ing)"
                  :disabled="isSaving || ing.es_nota"
                  @update:model-value="onUnidadRecetaChange(ing)"
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

            <!-- Conversión -->
            <div v-if="getConversion(ing)" class="mt-1.5 text-[11px] text-sand-400">
              {{ getConversion(ing) }}
            </div>

            <!-- Nota toggle -->
            <div class="flex items-center gap-2 mt-2">
              <button
                type="button"
                :class="ing.es_nota ? 'bg-brand-600' : 'bg-sand-200'"
                class="relative w-8 h-5 rounded-full transition-colors"
                @click="ing.es_nota = !ing.es_nota"
              >
                <span
                  :class="ing.es_nota ? 'translate-x-3' : 'translate-x-0.5'"
                  class="absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform"
                />
              </button>
              <span class="text-[11px] text-sand-400">Nota (sin costo)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Costo calculado -->
      <div class="bg-sand-50 rounded-xl p-4">
        <p class="text-[12px] text-sand-400 mb-1">Costo por porción</p>
        <p class="text-[22px] font-bold text-brand-950">
          ${{ costoPorcion.toLocaleString('es-AR', { maximumFractionDigits: 0 }) }}
        </p>
        <p class="text-[11px] text-sand-300 mt-1">costo de ingredientes por vaso</p>
      </div>

      <!-- 4. Margen y precio -->
      <div v-if="costoPorcion > 0" class="space-y-4">
        <p class="text-[13px] font-medium text-brand-950">Calcular precio de venta</p>

        <!-- Margen rápido -->
        <div class="flex gap-2">
          <button
            v-for="m in [50, 60, 70, 80]"
            :key="m"
            type="button"
            :class="form.margen_objetivo === m && !precioManual ? 'bg-brand-600 text-white' : 'bg-sand-100 text-sand-500 hover:bg-sand-200'"
            class="flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors"
            @click="setMargen(m)"
          >
            {{ m }}%
          </button>
        </div>

        <!-- Margen personalizado + precio -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[12px] text-sand-400 mb-1">Margen %</label>
            <input
              v-model.number="form.margen_objetivo"
              type="number"
              min="0"
              max="99"
              class="w-full h-10 px-3 bg-white text-brand-950 text-[13px] rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-400"
              @input="precioManual = false"
            />
          </div>
          <div>
            <label class="block text-[12px] text-sand-400 mb-1">Precio de venta</label>
            <input
              v-model.number="form.precio_venta"
              type="number"
              min="0"
              class="w-full h-10 px-3 bg-white text-brand-950 text-[13px] rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-400"
              @input="setPrecioManual"
            />
          </div>
        </div>

        <!-- Resumen -->
        <div class="flex items-center justify-between bg-brand-50 rounded-xl p-3 border border-brand-100">
          <span class="text-[13px] text-brand-700">Margen real</span>
          <span class="text-[15px] font-bold" :class="margenReal >= 50 ? 'text-success' : margenReal >= 0 ? 'text-brand-950' : 'text-danger'">
            {{ margenReal.toLocaleString('es-AR', { maximumFractionDigits: 1 }) }}%
          </span>
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
