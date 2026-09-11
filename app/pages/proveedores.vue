<script setup lang="ts">
import type { ProveedorRow } from '~/composables/useProveedores'

definePageMeta({ layout: 'default' })

const showDrawer = ref(false)
const editingProveedor = ref<ProveedorRow | null>(null)
const proveedorToDelete = ref<ProveedorRow | null>(null)
const showDeleteConfirm = ref(false)
const { fetchProveedores, toggleActivo, deleteProveedor } = useProveedores()

onMounted(() => {
  fetchProveedores()
})

function openCreate() {
  editingProveedor.value = null
  showDrawer.value = true
}

function openEdit(proveedor: ProveedorRow) {
  editingProveedor.value = proveedor
  showDrawer.value = true
}

function handleDrawerClose() {
  showDrawer.value = false
  editingProveedor.value = null
}

function handleSaved() {
  fetchProveedores()
}

async function handleToggle(proveedor: ProveedorRow) {
  try {
    await toggleActivo(proveedor.id, !proveedor.activo)
  } catch {
    // toast already shown
  }
}

function openDelete(proveedor: ProveedorRow) {
  proveedorToDelete.value = proveedor
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!proveedorToDelete.value) return
  try {
    await deleteProveedor(proveedorToDelete.value.id)
  } catch {
    // toast already shown
  }
  showDeleteConfirm.value = false
  proveedorToDelete.value = null
}
</script>

<template>
  <div>
    <ProveedorList
      @create="openCreate"
      @edit="openEdit"
      @toggle="handleToggle"
      @delete="openDelete"
    />

    <ProveedorDrawer
      :open="showDrawer"
      :proveedor="editingProveedor"
      @close="handleDrawerClose"
      @saved="handleSaved"
    />

    <!-- Delete confirmation -->
    <AppModal :open="showDeleteConfirm" @close="showDeleteConfirm = false">
      <div class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-danger-soft flex items-center justify-center">
            <Icon name="lucide:trash-2" class="w-5 h-5 text-danger" />
          </div>
          <div>
            <h3 class="text-[15px] font-semibold text-brand-950">Eliminar proveedor</h3>
            <p class="text-[13px] text-danger font-medium">Esta acción no se puede deshacer</p>
          </div>
        </div>
        <p class="text-[13px] text-sand-400 mb-6">
          ¿Segurás que querés eliminar <strong class="text-brand-950">{{ proveedorToDelete?.nombre }}</strong>?
          Si tiene compras asociadas, no se podrá eliminar.
        </p>
        <div class="flex items-center justify-end gap-3">
          <SecondaryButton @click="showDeleteConfirm = false">Cancelar</SecondaryButton>
          <PrimaryButton variant="danger" @click="confirmDelete">
            Eliminar
          </PrimaryButton>
        </div>
      </div>
    </AppModal>
  </div>
</template>
