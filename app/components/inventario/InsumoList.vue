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
  searchQuery,
  filterCategoria,
  filterUnidad,
  filterEstado,
  categorias,
  filteredInsumos,
} = useInsumos()

const showFilters = ref(false)

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
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
      <!-- Search -->
      <div class="relative flex-1 w-full max-w-md">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-300" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar insumo..."
          class="w-full h-10 pl-9 pr-4 bg-white text-brand-950 text-[13px] rounded-xl border border-sand-200 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-400 transition-all duration-200"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <!-- Filter toggle (mobile) -->
        <button
          class="lg:hidden flex items-center gap-2 h-10 px-4 bg-white border border-sand-200 rounded-xl text-[13px] font-medium text-brand-950 hover:bg-sand-50 transition-colors"
          @click="showFilters = !showFilters"
        >
          <Icon name="lucide:filter" class="w-4 h-4" />
          Filtros
          <span v-if="hasActiveFilters" class="w-1.5 h-1.5 rounded-full bg-brand-600" />
        </button>

        <!-- Desktop filters -->
        <div class="hidden lg:flex items-center gap-2">
          <AppSelect
            v-model="filterCategoria"
            :options="categoriaOptions"
            class="w-40"
          />
          <AppSelect
            v-model="filterUnidad"
            :options="unidadOptions"
            class="w-32"
          />
          <AppSelect
            v-model="filterEstado"
            :options="estadoOptions"
            class="w-36"
          />
          <button
            v-if="hasActiveFilters"
            class="text-[12px] text-brand-600 hover:text-brand-950 font-medium transition-colors"
            @click="clearFilters"
          >
            Limpiar
          </button>
        </div>

        <!-- Create button -->
        <PrimaryButton @click="emit('create')">
          <Icon name="lucide:plus" class="w-4 h-4" />
          <span class="hidden sm:inline">Nuevo insumo</span>
        </PrimaryButton>
      </div>
    </div>

    <!-- Mobile filters -->
    <Transition name="filters">
      <div v-if="showFilters" class="lg:hidden mb-4 p-4 bg-white rounded-xl border border-sand-200/60 space-y-3">
        <AppSelect
          v-model="filterCategoria"
          label="Categoría"
          :options="categoriaOptions"
        />
        <AppSelect
          v-model="filterUnidad"
          label="Unidad"
          :options="unidadOptions"
        />
        <AppSelect
          v-model="filterEstado"
          label="Estado"
          :options="estadoOptions"
        />
        <button
          v-if="hasActiveFilters"
          class="text-[12px] text-brand-600 hover:text-brand-950 font-medium"
          @click="clearFilters"
        >
          Limpiar filtros
        </button>
      </div>
    </Transition>

    <!-- Loading -->
    <LoadingState v-if="isLoading" type="card" />

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
        class="mt-4 text-[13px] text-brand-600 hover:text-brand-950 font-medium transition-colors"
        @click="searchQuery = ''; clearFilters()"
      >
        Limpiar filtros
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <InsumoCard
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

<style scoped>
.filters-enter-active,
.filters-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.filters-enter-from,
.filters-leave-to {
  opacity: 0;
  max-height: 0;
}
.filters-enter-to,
.filters-leave-from {
  opacity: 1;
  max-height: 300px;
}
</style>
