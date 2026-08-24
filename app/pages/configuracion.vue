<script setup lang="ts">
import type { CategoriaRow } from '~/composables/useCategorias'

definePageMeta({ layout: 'default' })

const { addToast } = useToast()
const { profile } = useAuth()
const { categorias, isLoading, fetchCategorias, createCategoria, updateCategoria, deleteCategoria } = useCategorias()

const activeTab = ref('insumo')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingCategoria = ref<CategoriaRow | null>(null)
const newNombre = ref('')
const editNombre = ref('')
const isSaving = ref(false)

const filteredCategorias = computed(() =>
  categorias.value.filter(c => c.tipo === activeTab.value).sort((a, b) => a.nombre.localeCompare(b.nombre))
)

const activeCount = computed(() => filteredCategorias.value.filter(c => c.activo).length)
const inactiveCount = computed(() => filteredCategorias.value.filter(c => !c.activo).length)

const tabs = [
  { value: 'insumo', label: 'Insumos' },
  { value: 'receta', label: 'Recetas' },
]

onMounted(() => {
  fetchCategorias()
})

function handleTabChange(tab: string) {
  activeTab.value = tab
}

function openCreate() {
  newNombre.value = ''
  showCreateModal.value = true
}

async function handleCreate() {
  if (!newNombre.value.trim()) return

  isSaving.value = true
  try {
    await createCategoria(activeTab.value, newNombre.value)
    showCreateModal.value = false
  } catch {
    // toast already shown
  } finally {
    isSaving.value = false
  }
}

function openEdit(cat: CategoriaRow) {
  editingCategoria.value = cat
  editNombre.value = cat.nombre
  showEditModal.value = true
}

async function handleEdit() {
  if (!editNombre.value.trim() || !editingCategoria.value) return

  isSaving.value = true
  try {
    await updateCategoria(editingCategoria.value.id, editNombre.value, activeTab.value)
    showEditModal.value = false
    editingCategoria.value = null
  } catch {
    // toast already shown
  } finally {
    isSaving.value = false
  }
}

function confirmDelete(cat: CategoriaRow) {
  editingCategoria.value = cat
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!editingCategoria.value) return

  isSaving.value = true
  try {
    await deleteCategoria(editingCategoria.value.id, activeTab.value)
    showDeleteModal.value = false
    editingCategoria.value = null
  } catch {
    // toast already shown
  } finally {
    isSaving.value = false
  }
}

const isAdmin = computed(() => profile.value?.rol === 'admin')
</script>

<template>
  <div>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-[22px] font-bold text-brand-950 tracking-tight">Configuración</h1>
          <p class="text-[13px] text-sand-400 mt-1">Administra las categorías del sistema</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-sand-200/60">
        <div class="flex gap-6">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="pb-3 text-[13px] font-medium transition-colors relative"
            :class="activeTab === tab.value ? 'text-brand-950' : 'text-sand-400 hover:text-sand-500'"
            @click="handleTabChange(tab.value)"
          >
            {{ tab.label }}
            <span
              v-if="activeTab === tab.value"
              class="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-950 rounded-full"
            />
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="flex items-center gap-4">
        <span class="text-[12px] text-sand-400">
          {{ activeCount }} activa{{ activeCount !== 1 ? 's' : '' }}
        </span>
        <span v-if="inactiveCount > 0" class="text-[12px] text-sand-300">
          · {{ inactiveCount }} inactiva{{ inactiveCount !== 1 ? 's' : '' }}
        </span>
        <div class="flex-1" />
        <PrimaryButton @click="openCreate">
          <Icon name="lucide:plus" class="w-4 h-4" />
          Nueva categoría
        </PrimaryButton>
      </div>

      <!-- Loading -->
      <LoadingState v-if="isLoading" type="list" />

      <!-- Empty state -->
      <EmptyState
        v-else-if="filteredCategorias.length === 0"
        icon="lucide:tags"
        title="Sin categorías"
        description="Creá la primera categoría para organizar tus datos."
        action-label="Crear categoría"
      />

      <!-- Categories list -->
      <div v-else class="space-y-2">
        <div
          v-for="cat in filteredCategorias"
          :key="cat.id"
          class="flex items-center justify-between bg-white rounded-xl border border-sand-200/60 px-4 py-3 hover:shadow-card transition-all duration-200"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-2 h-2 rounded-full shrink-0"
              :class="cat.activo ? 'bg-success' : 'bg-sand-300'"
            />
            <span
              class="text-[14px] font-medium"
              :class="cat.activo ? 'text-brand-950' : 'text-sand-400 line-through'"
            >
              {{ cat.nombre }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="w-8 h-8 flex items-center justify-center rounded-lg text-sand-400 hover:text-brand-950 hover:bg-sand-50 transition-colors"
              title="Editar"
              @click="openEdit(cat)"
            >
              <Icon name="lucide:pencil" class="w-4 h-4" />
            </button>
            <button
              v-if="isAdmin"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-sand-400 hover:text-danger hover:bg-danger-soft transition-colors"
              title="Eliminar"
              @click="confirmDelete(cat)"
            >
              <Icon name="lucide:trash-2" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <AppModal :open="showCreateModal" title="Nueva categoría" @close="showCreateModal = false">
      <form class="space-y-4" @submit.prevent="handleCreate">
        <p class="text-[13px] text-sand-400">
          Tipo: <span class="font-medium text-brand-950">{{ activeTab === 'insumo' ? 'Insumo' : 'Receta' }}</span>
        </p>
        <AppInput
          v-model="newNombre"
          label="Nombre"
          placeholder="Ej: Bebida base"
          autofocus
          :disabled="isSaving"
        />
      </form>
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <SecondaryButton :disabled="isSaving" @click="showCreateModal = false">Cancelar</SecondaryButton>
          <PrimaryButton :loading="isSaving" @click="handleCreate">Crear</PrimaryButton>
        </div>
      </template>
    </AppModal>

    <!-- Edit Modal -->
    <AppModal :open="showEditModal" title="Editar categoría" @close="showEditModal = false">
      <form class="space-y-4" @submit.prevent="handleEdit">
        <AppInput
          v-model="editNombre"
          label="Nombre"
          placeholder="Nombre de la categoría"
          autofocus
          :disabled="isSaving"
        />
      </form>
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <SecondaryButton :disabled="isSaving" @click="showEditModal = false">Cancelar</SecondaryButton>
          <PrimaryButton :loading="isSaving" @click="handleEdit">Guardar</PrimaryButton>
        </div>
      </template>
    </AppModal>

    <!-- Delete Confirm Modal -->
    <AppModal :open="showDeleteModal" title="Eliminar categoría" @close="showDeleteModal = false">
      <div class="space-y-4">
        <p class="text-[14px] text-brand-950">
          ¿Eliminar la categoría <strong>"{{ editingCategoria?.nombre }}"</strong>?
        </p>
        <p class="text-[13px] text-sand-400">
          Los insumos o recetas que usen esta categoría no se verán afectados.
        </p>
      </div>
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <SecondaryButton :disabled="isSaving" @click="showDeleteModal = false">Cancelar</SecondaryButton>
          <PrimaryButton :loading="isSaving" variant="danger" @click="handleDelete">Eliminar</PrimaryButton>
        </div>
      </template>
    </AppModal>
  </div>
</template>
