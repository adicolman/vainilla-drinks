<script setup lang="ts">
import type { InsumoRow } from '~/composables/useInsumos'

const emit = defineEmits<{
  create: []
  edit: [insumo: InsumoRow]
  deactivate: [insumo: InsumoRow]
  delete: [insumo: InsumoRow]
}>()

const {
  isLoading,
  searchQuery: localSearch,
  filterCategoria,
  filterUnidad,
  filterEstado,
  categorias,
  filteredInsumos,
} = useInsumos()

const { searchQuery } = useSearch()

watch(searchQuery, (v) => { localSearch.value = v })

const viewMode = ref<'cards' | 'rows'>('cards')

const unidadOptions = [
  { value: '', label: 'Todas' },
  { value: 'ml', label: 'ml' },
  { value: 'l', label: 'L' },
  { value: 'kg', label: 'kg' },
  { value: 'unidad', label: 'Unidad' },
]

const estadoOptions = [
  { value: '', label: 'Todos' },
  { value: 'activo', label: 'Activos' },
  { value: 'inactivo', label: 'Inactivos' },
]

const categoriaOptions = computed(() => {
  return [{ value: '', label: 'Todas' }, ...categorias.value.map(c => ({ value: c, label: c }))]
})

const hasActiveFilters = computed(() => {
  return filterCategoria.value || filterUnidad.value || filterEstado.value
})

function clearFilters() {
  filterCategoria.value = ''
  filterUnidad.value = ''
  filterEstado.value = ''
}
</script>

<template>
  <div>
    <!-- Filtros compactos — una sola fila -->
    <div class="flex flex-wrap items-center gap-2 mb-6">
      <AppSelect v-model="filterCategoria" :options="categoriaOptions" class="w-36" />
      <AppSelect v-model="filterUnidad" :options="unidadOptions" class="w-28" />
      <AppSelect v-model="filterEstado" :options="estadoOptions" class="w-32" />

      <button
        v-if="hasActiveFilters"
        class="text-[12px] text-neon-pink hover:text-neon-pink/80 font-medium transition-colors"
        @click="clearFilters"
      >
        Limpiar
      </button>

      <div class="flex-1" />

      <!-- View toggle -->
      <div class="flex items-center bg-white border border-sand-200 rounded-lg overflow-hidden">
        <button
          :class="viewMode === 'cards' ? 'bg-sand-100 text-brand-950' : 'text-sand-400 hover:text-brand-950'"
          class="w-8 h-8 flex items-center justify-center transition-colors"
          title="Vista cards"
          @click="viewMode = 'cards'"
        >
          <Icon name="lucide:layout-grid" class="w-4 h-4" />
        </button>
        <button
          :class="viewMode === 'rows' ? 'bg-sand-100 text-brand-950' : 'text-sand-400 hover:text-brand-950'"
          class="w-8 h-8 flex items-center justify-center transition-colors"
          title="Vista lista"
          @click="viewMode = 'rows'"
        >
          <Icon name="lucide:list" class="w-4 h-4" />
        </button>
      </div>

      <span class="text-[12px] text-sand-400 font-medium">{{ filteredInsumos.length }}</span>

      <PrimaryButton @click="emit('create')">
        <Icon name="lucide:plus" class="w-4 h-4" />
        <span class="hidden sm:inline">Nuevo</span>
      </PrimaryButton>
    </div>

    <!-- Loading -->
    <LoadingState v-if="isLoading" :type="viewMode === 'cards' ? 'card' : 'table'" />

    <!-- Empty state -->
    <EmptyState
      v-else-if="filteredInsumos.length === 0 && !searchQuery && !hasActiveFilters"
      icon="lucide:package"
      title="Todavía no hay insumos registrados"
      description="Creá tu primer insumo para comenzar a gestionar el inventario."
      action-label="Agregar primer insumo"
      action-to=""
    />

    <!-- No results -->
    <div
      v-else-if="filteredInsumos.length === 0 && (searchQuery || hasActiveFilters)"
      class="text-center py-16"
    >
      <Icon name="lucide:search-x" class="w-10 h-10 text-sand-300 mx-auto mb-3" />
      <p class="text-[14px] font-medium text-brand-950">No se encontraron insumos</p>
      <p class="text-[13px] text-sand-400 mt-1">Probá con otros filtros o términos de búsqueda</p>
      <button
        class="mt-4 text-[13px] text-neon-pink hover:text-neon-pink/80 font-medium transition-colors"
        @click="searchQuery = ''; clearFilters()"
      >
        Limpiar filtros
      </button>
    </div>

    <!-- Cards grid -->
    <div v-else-if="viewMode === 'cards'" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      <InsumoCard
        v-for="insumo in filteredInsumos"
        :key="insumo.id"
        :insumo="insumo"
        @edit="emit('edit', $event)"
        @deactivate="emit('deactivate', $event)"
        @delete="emit('delete', $event)"
      />
    </div>

    <!-- Rows list -->
    <div v-else class="space-y-2">
      <div class="hidden lg:flex items-center gap-4 px-4 py-2 text-[11px] font-semibold tracking-[0.1em] uppercase text-sand-400">
        <div class="w-12" />
        <div class="flex-1">Nombre</div>
        <div class="w-28">Stock</div>
        <div class="w-28 text-right">Costo</div>
        <div class="w-20">Estado</div>
        <div class="w-24" />
      </div>
      <InsumoRow
        v-for="insumo in filteredInsumos"
        :key="insumo.id"
        :insumo="insumo"
        @edit="emit('edit', $event)"
        @deactivate="emit('deactivate', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </div>
</template>
