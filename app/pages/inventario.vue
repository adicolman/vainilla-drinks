<script setup lang="ts">
import type { InsumoRow } from '~/composables/useInsumos'

definePageMeta({ layout: 'default' })

const { fetchInsumos, deactivateInsumo, deleteInsumo } = useInsumos()
const { addToast } = useToast()

const showDrawer = ref(false)
const editingInsumo = ref<InsumoRow | null>(null)
const insumoToDeactivate = ref<InsumoRow | null>(null)
const showDeactivateConfirm = ref(false)
const insumoToDelete = ref<InsumoRow | null>(null)
const showDeleteConfirm = ref(false)

onMounted(() => {
  fetchInsumos()
})

function openCreate() {
  editingInsumo.value = null
  showDrawer.value = true
}

function openEdit(insumo: InsumoRow) {
  editingInsumo.value = insumo
  showDrawer.value = true
}

function openDeactivate(insumo: InsumoRow) {
  insumoToDeactivate.value = insumo
  showDeactivateConfirm.value = true
}

async function confirmDeactivate() {
  if (!insumoToDeactivate.value) return
  try {
    await deactivateInsumo(insumoToDeactivate.value.id, insumoToDeactivate.value.nombre)
  } catch {
    // toast already shown
  }
  showDeactivateConfirm.value = false
  insumoToDeactivate.value = null
}

function handleDrawerClose() {
  showDrawer.value = false
  editingInsumo.value = null
}

function handleSaved() {
  fetchInsumos()
}

function openDelete(insumo: InsumoRow) {
  insumoToDelete.value = insumo
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!insumoToDelete.value) return
  try {
    await deleteInsumo(insumoToDelete.value.id, insumoToDelete.value.nombre)
  } catch {
    // toast already shown
  }
  showDeleteConfirm.value = false
  insumoToDelete.value = null
}
</script>

<template>
  <div>
    <InsumoList
      @create="openCreate"
      @edit="openEdit"
      @deactivate="openDeactivate"
      @delete="openDelete"
    />

    <InsumoDrawer
      :open="showDrawer"
      :insumo="editingInsumo"
      @close="handleDrawerClose"
      @saved="handleSaved"
    />

    <!-- Deactivate confirmation -->
    <AppModal :open="showDeactivateConfirm" @close="showDeactivateConfirm = false">
      <div class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-danger-soft flex items-center justify-center">
            <Icon name="lucide:alert-triangle" class="w-5 h-5 text-danger" />
          </div>
          <div>
            <h3 class="text-[15px] font-semibold text-brand-950">Desactivar insumo</h3>
            <p class="text-[13px] text-sand-400">Esta acción es reversible</p>
          </div>
        </div>
        <p class="text-[13px] text-sand-400 mb-6">
          ¿Segurás que querés desactivar <strong class="text-brand-950">{{ insumoToDeactivate?.nombre }}</strong>?
          No aparecerá en nuevos formularios, pero seguirá disponible en históricos.
        </p>
        <div class="flex items-center justify-end gap-3">
          <SecondaryButton @click="showDeactivateConfirm = false">Cancelar</SecondaryButton>
          <button
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-danger text-white text-sm font-semibold rounded-xl hover:bg-danger/90 transition-colors"
            @click="confirmDeactivate"
          >
            Desactivar
          </button>
        </div>
      </div>
    </AppModal>

    <!-- Delete confirmation -->
    <AppModal :open="showDeleteConfirm" @close="showDeleteConfirm = false">
      <div class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-danger-soft flex items-center justify-center">
            <Icon name="lucide:trash-2" class="w-5 h-5 text-danger" />
          </div>
          <div>
            <h3 class="text-[15px] font-semibold text-brand-950">Eliminar insumo</h3>
            <p class="text-[13px] text-danger font-medium">Esta acción no se puede deshacer</p>
          </div>
        </div>
        <p class="text-[13px] text-sand-400 mb-2">
          ¿Segurás que querés eliminar <strong class="text-brand-950">{{ insumoToDelete?.nombre }}</strong>?
        </p>
        <p class="text-[12px] text-sand-400 mb-6">
          Se eliminarán todos los registros asociados: movimientos de stock, items de compra, ingredientes de recetas y detalles de producción.
        </p>
        <div class="flex items-center justify-end gap-3">
          <SecondaryButton @click="showDeleteConfirm = false">Cancelar</SecondaryButton>
          <PrimaryButton variant="danger" @click="confirmDelete">
            Eliminar todo
          </PrimaryButton>
        </div>
      </div>
    </AppModal>
  </div>
</template>
