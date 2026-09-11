<script setup lang="ts">
const emit = defineEmits<{
  create: []
}>()

const { isLoading, searchQuery, filterCategoria, filterFechaDesde, filterFechaHasta, filteredGastos } = useGastos()

const categoriaOptions = [
  { value: '', label: 'Todas' },
  { value: 'publicidad', label: 'Publicidad' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'equipamiento', label: 'Equipamiento' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'logistica', label: 'Logística' },
  { value: 'impuestos', label: 'Impuestos' },
  { value: 'otros', label: 'Otros' },
]

const hasActiveFilters = computed(() => filterCategoria.value || filterFechaDesde.value || filterFechaHasta.value)

function clearFilters() {
  filterCategoria.value = ''
  filterFechaDesde.value = ''
  filterFechaHasta.value = ''
}
</script>

<template>
  <div>
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
      <div class="relative flex-1 w-full max-w-md">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-300" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por concepto..."
          class="w-full h-10 pl-9 pr-4 bg-white text-brand-950 text-[13px] rounded-xl border border-sand-200 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-400 transition-all duration-200"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <!-- Filter toggle (mobile) -->
        <button
          class="lg:hidden flex items-center gap-2 h-10 px-4 bg-white border border-sand-200 rounded-xl text-[13px] font-medium text-brand-950 hover:bg-sand-50 transition-colors"
          @click="clearFilters"
        >
          <Icon name="lucide:filter" class="w-4 h-4" />
          Filtros
          <span v-if="hasActiveFilters" class="w-1.5 h-1.5 rounded-full bg-brand-600" />
        </button>

        <!-- Desktop filters -->
        <div class="hidden lg:flex items-center gap-2">
          <AppSelect v-model="filterCategoria" :options="categoriaOptions" class="w-40" />
          <AppInput
            v-model="filterFechaDesde"
            type="date"
            placeholder="Desde"
            class="w-40"
          />
          <AppInput
            v-model="filterFechaHasta"
            type="date"
            placeholder="Hasta"
            class="w-40"
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
          <span class="hidden sm:inline">Nuevo gasto</span>
        </PrimaryButton>
      </div>
    </div>

    <!-- Mobile filters -->
    <Transition name="filters">
      <div v-if="hasActiveFilters" class="lg:hidden mb-4 p-4 bg-white rounded-xl border border-sand-200/60 space-y-3">
        <AppSelect v-model="filterCategoria" label="Categoría" :options="categoriaOptions" />
        <div class="grid grid-cols-2 gap-3">
          <AppInput v-model="filterFechaDesde" label="Desde" type="date" />
          <AppInput v-model="filterFechaHasta" label="Hasta" type="date" />
        </div>
        <button
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
      v-else-if="filteredGastos.length === 0 && !searchQuery && !hasActiveFilters"
      icon="lucide:receipt"
      title="Todavía no hay gastos registrados"
      description="Registrá tu primer gasto para comenzar a controlar los egresos operativos."
      action-label="Registrar primer gasto"
      action-to=""
    />

    <!-- No results -->
    <div
      v-else-if="filteredGastos.length === 0 && (searchQuery || hasActiveFilters)"
      class="text-center py-16"
    >
      <Icon name="lucide:search-x" class="w-10 h-10 text-sand-300 mx-auto mb-3" />
      <p class="text-[14px] font-medium text-brand-950">No se encontraron gastos</p>
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
      <GastosCard
        v-for="gasto in filteredGastos"
        :key="gasto.id"
        :gasto="gasto"
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
