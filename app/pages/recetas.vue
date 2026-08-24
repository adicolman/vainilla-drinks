<script setup lang="ts">
import type { RecetaConIngredientes } from '~/composables/useRecetas'

definePageMeta({ layout: 'default' })

const { fetchRecetas, deactivateReceta } = useRecetas()
const { addToast } = useToast()

const showDrawer = ref(false)
const editingReceta = ref<RecetaConIngredientes | null>(null)
const recetaToDeactivate = ref<RecetaConIngredientes | null>(null)
const showDeactivateConfirm = ref(false)
const showProduceDrawer = ref(false)
const produceReceta = ref<RecetaConIngredientes | null>(null)

onMounted(() => {
  fetchRecetas()
})

function openCreate() {
  editingReceta.value = null
  showDrawer.value = true
}

function openEdit(receta: RecetaConIngredientes) {
  editingReceta.value = receta
  showDrawer.value = true
}

function openDeactivate(receta: RecetaConIngredientes) {
  recetaToDeactivate.value = receta
  showDeactivateConfirm.value = true
}

function openProduce(receta: RecetaConIngredientes) {
  produceReceta.value = receta
  showProduceDrawer.value = true
}

async function confirmDeactivate() {
  if (!recetaToDeactivate.value) return
  try {
    await deactivateReceta(recetaToDeactivate.value.id, recetaToDeactivate.value.nombre)
  } catch {
    // toast already shown
  }
  showDeactivateConfirm.value = false
  recetaToDeactivate.value = null
}

function handleDrawerClose() {
  showDrawer.value = false
  editingReceta.value = null
}

function handleSaved() {
  fetchRecetas()
}

function handleProduceClose() {
  showProduceDrawer.value = false
  produceReceta.value = null
}
</script>

<template>
  <div>
    <RecetaList
      @create="openCreate"
      @edit="openEdit"
      @deactivate="openDeactivate"
      @produce="openProduce"
    />

    <RecetaDrawer
      :open="showDrawer"
      :receta="editingReceta"
      @close="handleDrawerClose"
      @saved="handleSaved"
    />

    <ProduccionDrawer
      :open="showProduceDrawer"
      :receta="produceReceta"
      @close="handleProduceClose"
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
            <h3 class="text-[15px] font-semibold text-brand-950">Desactivar receta</h3>
            <p class="text-[13px] text-sand-400">Esta acción es reversible</p>
          </div>
        </div>
        <p class="text-[13px] text-sand-400 mb-6">
          ¿Segurás que querés desactivar <strong class="text-brand-950">{{ recetaToDeactivate?.nombre }}</strong>?
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
