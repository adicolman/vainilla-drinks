<script setup lang="ts">
import type { InsumoRow } from '~/composables/useInsumos'

definePageMeta({ layout: 'default' })

const { fetchInsumos, deactivateInsumo } = useInsumos()
const { addToast } = useToast()

const showDrawer = ref(false)
const editingInsumo = ref<InsumoRow | null>(null)
const insumoToDeactivate = ref<InsumoRow | null>(null)
const showDeactivateConfirm = ref(false)

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
</script>

<template>
  <div>
    <InsumoList
      @create="openCreate"
      @edit="openEdit"
      @deactivate="openDeactivate"
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
  </div>
</template>
