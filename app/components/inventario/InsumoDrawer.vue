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

const { createInsumo, updateInsumo, uploadImagen } = useInsumos()
const { getCategoriasPorTipo, fetchCategorias } = useCategorias()

const isEditing = computed(() => !!props.insumo)

const categoriaOptions = getCategoriasPorTipo('insumo')

const form = reactive({
  nombre: '',
  categoria: 'general',
  unidad_medida: 'l',
  precio_compra: 0,
  contenido_por_unidad: 0,
  stock_inicial: 0,
  stock_minimo: 0,
  proveedor_principal_id: '',
  activo: true,
  imagen_url: '' as string | null,
})

const errors = reactive({
  nombre: '',
  precio_compra: '',
  contenido_por_unidad: '',
  stock_minimo: '',
})

const isSaving = ref(false)
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const unidadOptions = [
  { value: 'ml', label: 'ml' },
  { value: 'l', label: 'L (Litros)' },
  { value: 'g', label: 'g (Gramos)' },
  { value: 'kg', label: 'kg (Kilogramos)' },
  { value: 'unidad', label: 'Unidad' },
]

const contenidoLabel = computed(() => {
  const labels: Record<string, string> = {
    ml: 'Contenido por envase (ml)',
    l: 'Litros por envase',
    g: 'Gramos por paquete',
    kg: 'Kilogramos por paquete',
    unidad: 'Unidades por paquete',
  }
  return labels[form.unidad_medida] || 'Contenido por envase'
})

const contenidoHelper = computed(() => {
  const helpers: Record<string, string> = {
    ml: 'Ej: 750 para una botella de 750ml',
    l: 'Ej: 10 para un balde de 10L',
    g: 'Ej: 500 para un paquete de 500g',
    kg: 'Ej: 2.5 para un paquete de 2.5kg',
    unidad: 'Ej: 100 para un paquete de 100 vasos',
  }
  return helpers[form.unidad_medida] || 'Cuántas unidades base trae 1 envase'
})

const costoPorUnidad = computed(() => {
  if (form.contenido_por_unidad > 0 && form.precio_compra > 0) {
    return form.precio_compra / form.contenido_por_unidad
  }
  return 0
})

const unidadLabel = computed(() => {
  const labels: Record<string, string> = {
    ml: 'ml',
    l: 'litro',
    g: 'g',
    kg: 'kg',
    unidad: 'unidad',
  }
  return labels[form.unidad_medida] || form.unidad_medida
})

watch(() => props.open, (val) => {
  if (val) fetchCategorias('insumo')
  if (val && props.insumo) {
    form.nombre = props.insumo.nombre
    form.categoria = props.insumo.categoria
    form.unidad_medida = props.insumo.unidad_medida
    form.precio_compra = Number(props.insumo.costo_unitario) * (props.insumo.cantidad_por_unidad || 1)
    form.contenido_por_unidad = props.insumo.cantidad_por_unidad != null ? Number(props.insumo.cantidad_por_unidad) : 0
    form.stock_inicial = 0
    form.stock_minimo = Number(props.insumo.stock_minimo)
    form.proveedor_principal_id = props.insumo.proveedor_principal_id || ''
    form.activo = props.insumo.activo
    form.imagen_url = props.insumo.imagen_url || null
  } else if (val) {
    form.nombre = ''
    form.categoria = 'general'
    form.unidad_medida = 'l'
    form.precio_compra = 0
    form.contenido_por_unidad = 0
    form.stock_inicial = 0
    form.stock_minimo = 0
    form.proveedor_principal_id = ''
    form.activo = true
    form.imagen_url = null
  }
  clearErrors()
})

function clearErrors() {
  errors.nombre = ''
  errors.precio_compra = ''
  errors.contenido_por_unidad = ''
  errors.stock_minimo = ''
}

function validate(): boolean {
  clearErrors()
  let valid = true

  if (!form.nombre || form.nombre.trim().length < 2) {
    errors.nombre = 'El nombre es obligatorio (mínimo 2 caracteres)'
    valid = false
  }

  if (form.precio_compra < 0) {
    errors.precio_compra = 'El precio no puede ser negativo'
    valid = false
  }

  if (form.contenido_por_unidad < 0) {
    errors.contenido_por_unidad = 'El contenido no puede ser negativo'
    valid = false
  }

  if (form.stock_minimo < 0) {
    errors.stock_minimo = 'El stock mínimo no puede ser negativo'
    valid = false
  }

  return valid
}

async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  isUploading.value = true
  const url = await uploadImagen(file)
  if (url) {
    form.imagen_url = url
  }
  isUploading.value = false
  input.value = ''
}

function removeImage() {
  form.imagen_url = null
  if (fileInput.value) fileInput.value.value = ''
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
        precio_compra: form.precio_compra,
        contenido_por_unidad: form.contenido_por_unidad,
        stock_minimo: form.stock_minimo,
        proveedor_principal_id: form.proveedor_principal_id || null,
        activo: form.activo,
        imagen_url: form.imagen_url,
      })
    } else {
      await createInsumo({
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        unidad_medida: form.unidad_medida,
        precio_compra: form.precio_compra,
        contenido_por_unidad: form.contenido_por_unidad,
        stock_inicial: form.stock_inicial,
        stock_minimo: form.stock_minimo,
        proveedor_principal_id: form.proveedor_principal_id || null,
        imagen_url: form.imagen_url,
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
      <!-- Image upload -->
      <div>
        <label class="text-[13px] font-medium text-brand-950 mb-2 block">Imagen del producto</label>
        <div
          class="relative w-full aspect-[16/9] rounded-xl border-2 border-dashed border-sand-200 overflow-hidden bg-sand-50 flex items-center justify-center cursor-pointer hover:border-neon-pink/40 transition-colors"
          @click="fileInput?.click()"
        >
          <img
            v-if="form.imagen_url"
            :src="form.imagen_url"
            alt="Preview"
            class="w-full h-full object-cover"
          />
          <div v-else class="text-center p-4">
            <Icon name="lucide:image-plus" class="w-8 h-8 text-sand-300 mx-auto mb-2" />
            <p class="text-[12px] text-sand-400">Click para subir imagen</p>
            <p class="text-[11px] text-sand-300 mt-1">JPG, PNG o WebP</p>
          </div>
          <div v-if="isUploading" class="absolute inset-0 bg-white/80 flex items-center justify-center">
            <Icon name="lucide:loader-2" class="w-6 h-6 text-neon-pink animate-spin" />
          </div>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleImageUpload"
        />
        <button
          v-if="form.imagen_url"
          type="button"
          class="mt-2 text-[12px] text-danger hover:text-danger/80 font-medium transition-colors"
          @click="removeImage"
        >
          Eliminar imagen
        </button>
      </div>

      <AppInput
        v-model="form.nombre"
        label="Nombre *"
        placeholder="Ej: Helado de limón, Azúcar flor..."
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
        v-model="form.contenido_por_unidad"
        :label="contenidoLabel + ' *'"
        type="number"
        :helper="contenidoHelper"
        :error="errors.contenido_por_unidad"
        :disabled="isSaving"
      />

      <AppInput
        v-model="form.precio_compra"
        label="Precio de compra *"
        type="number"
        placeholder="Precio total del envase/paquete"
        :error="errors.precio_compra"
        :disabled="isSaving"
      />

      <AppInput
        v-if="!isEditing"
        v-model="form.stock_inicial"
        label="Cantidad de envases comprados"
        type="number"
        placeholder="Ej: 1 balde, 3 paquetes..."
        helper="Se multiplicará por el contenido para calcular el stock en la unidad base"
        :disabled="isSaving"
      />

      <AppInput
        v-model="form.stock_minimo"
        label="Stock mínimo (en unidad base)"
        type="number"
        :placeholder="`Ej: 5 ${unidadLabel}`"
        :helper="`Mínimo que necesitás en ${unidadLabel} antes de reponer`"
        :error="errors.stock_minimo"
        :disabled="isSaving"
      />

      <div v-if="costoPorUnidad > 0" class="bg-sand-50 rounded-xl p-3">
        <p class="text-[12px] text-sand-400">Costo por {{ unidadLabel }}</p>
        <p class="text-[16px] font-semibold text-brand-950">
          ${{ costoPorUnidad.toLocaleString('es-AR', { maximumFractionDigits: 2 }) }}/{{ unidadLabel }}
        </p>
      </div>

      <div v-if="isEditing" class="flex items-center gap-3">
        <label class="text-sm font-medium text-brand-950">Activo</label>
        <button
          type="button"
          :class="form.activo ? 'bg-neon-pink' : 'bg-sand-200'"
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
