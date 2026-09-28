<script setup lang="ts">
import type { RecetaConIngredientes } from '~/composables/useRecetas'

const emit = defineEmits<{
  create: []
  edit: [receta: RecetaConIngredientes]
  deactivate: [receta: RecetaConIngredientes]
}>()

const {
  isLoading,
  searchQuery,
  filterCategoria,
  filterEstado,
  categorias,
  filteredRecetas,
} = useRecetas()

const { searchQuery: localSearch } = useSearch()
watch(searchQuery, (v) => { localSearch.value = v })

const estadoOptions = [
  { value: '', label: 'Todas' },
  { value: 'activo', label: 'Activas' },
  { value: 'inactivo', label: 'Inactivas' },
]

const categoriaOptions = computed(() => {
  return [{ value: '', label: 'Todas' }, ...categorias.value.map(c => ({ value: c, label: c }))]
})

const hasActiveFilters = computed(() => {
  return filterCategoria.value || filterEstado.value
})

function clearFilters() {
  filterCategoria.value = ''
  filterEstado.value = ''
}
</script>

<template>
  <div>
    <!-- Compact filters row -->
    <div class="flex flex-wrap items-center gap-2 mb-6">
      <AppSelect v-model="filterCategoria" :options="categoriaOptions" class="w-40" />
      <AppSelect v-model="filterEstado" :options="estadoOptions" class="w-36" />
      <button
        v-if="hasActiveFilters"
        class="text-[12px] text-neon-pink hover:text-neon-pink/80 font-medium transition-colors"
        @click="clearFilters"
      >
        Limpiar
      </button>
      <div class="flex-1" />
      <span class="text-[12px] text-sand-400 font-medium">{{ filteredRecetas.length }}</span>
      <PrimaryButton @click="emit('create')">
        <Icon name="lucide:plus" class="w-4 h-4" />
        <span class="hidden sm:inline">Nueva receta</span>
      </PrimaryButton>
    </div>

    <!-- Loading -->
    <LoadingState v-if="isLoading" type="card" />

    <!-- Empty state -->
    <EmptyState
      v-else-if="filteredRecetas.length === 0 && !searchQuery && !hasActiveFilters"
      icon="lucide:chef-hat"
      title="Todavía no hay recetas"
      description="Creá tu primera receta para definir los ingredientes y costos de tus productos."
      action-label="Crear primera receta"
      action-to=""
    />

    <!-- No results -->
    <div v-else-if="filteredRecetas.length === 0 && (searchQuery || hasActiveFilters)" class="text-center py-16">
      <Icon name="lucide:search-x" class="w-10 h-10 text-sand-300 mx-auto mb-3" />
      <p class="text-[14px] font-medium text-brand-950">No se encontraron recetas</p>
      <p class="text-[13px] text-sand-400 mt-1">Probá con otros filtros o términos de búsqueda</p>
      <button class="mt-4 text-[13px] text-neon-pink hover:text-neon-pink/80 font-medium transition-colors" @click="searchQuery = ''; clearFilters()">
        Limpiar filtros
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      <RecetaCard
        v-for="receta in filteredRecetas"
        :key="receta.id"
        :receta="receta"
        @edit="emit('edit', $event)"
        @deactivate="emit('deactivate', $event)"
      />
    </div>
  </div>
</template>
