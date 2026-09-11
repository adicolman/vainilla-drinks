<script setup lang="ts">
import type { ProveedorRow } from '~/composables/useProveedores'

const props = defineProps<{
  open: boolean
  proveedor?: ProveedorRow | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { createProveedor, updateProveedor } = useProveedores()

const nombre = ref('')
const contacto = ref('')
const telefono = ref('')
const email = ref('')
const direccion = ref('')
const notas = ref('')
const isSaving = ref(false)

const errors = reactive({
  nombre: '',
})

const isEditing = computed(() => !!props.proveedor)

watch(() => props.open, (val) => {
  if (val) {
    if (props.proveedor) {
      nombre.value = props.proveedor.nombre
      contacto.value = props.proveedor.contacto || ''
      telefono.value = props.proveedor.telefono || ''
      email.value = props.proveedor.email || ''
      direccion.value = props.proveedor.direccion || ''
      notas.value = props.proveedor.notas || ''
    } else {
      nombre.value = ''
      contacto.value = ''
      telefono.value = ''
      email.value = ''
      direccion.value = ''
      notas.value = ''
    }
    errors.nombre = ''
  }
})

function validate(): boolean {
  errors.nombre = ''
  let valid = true

  if (!nombre.value || nombre.value.trim().length < 2) {
    errors.nombre = 'El nombre es obligatorio'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return

  isSaving.value = true
  try {
    const data = {
      nombre: nombre.value.trim(),
      contacto: contacto.value.trim(),
      telefono: telefono.value.trim(),
      email: email.value.trim(),
      direccion: direccion.value.trim(),
      notas: notas.value.trim(),
    }

    if (isEditing.value && props.proveedor) {
      await updateProveedor(props.proveedor.id, data)
    } else {
      await createProveedor(data)
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
  <AppDrawer :open="open" :title="isEditing ? 'Editar proveedor' : 'Nuevo proveedor'" @close="emit('close')">
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <AppInput
        v-model="nombre"
        label="Nombre *"
        placeholder="Ej: Distribuidora X, Coto..."
        :error="errors.nombre"
        :disabled="isSaving"
      />

      <AppInput
        v-model="contacto"
        label="Contacto"
        placeholder="Nombre del contacto"
        :disabled="isSaving"
      />

      <div class="grid grid-cols-2 gap-4">
        <AppInput
          v-model="telefono"
          label="Teléfono"
          placeholder="Ej: 11-1234-5678"
          :disabled="isSaving"
        />
        <AppInput
          v-model="email"
          label="Email"
          placeholder="contacto@empresa.com"
          :disabled="isSaving"
        />
      </div>

      <AppInput
        v-model="direccion"
        label="Dirección"
        placeholder="Dirección del proveedor"
        :disabled="isSaving"
      />

      <AppInput
        v-model="notas"
        label="Notas"
        placeholder="Información adicional..."
        :disabled="isSaving"
      />
    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <SecondaryButton :disabled="isSaving" @click="emit('close')">Cancelar</SecondaryButton>
        <PrimaryButton :loading="isSaving" @click="handleSubmit">
          {{ isEditing ? 'Guardar cambios' : 'Crear proveedor' }}
        </PrimaryButton>
      </div>
    </template>
  </AppDrawer>
</template>
