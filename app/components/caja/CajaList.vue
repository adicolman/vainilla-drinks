<script setup lang="ts">
const emit = defineEmits<{
  create: []
}>()

const { isLoading, searchQuery, filterTipo, filterFechaDesde, filterFechaHasta, filteredMovimientos } = useCaja()

const tipoOptions = [
  { value: '', label: 'Todos' },
  { value: 'ingreso', label: 'Ingresos' },
  { value: 'egreso', label: 'Egresos' },
]

const hasActiveFilters = computed(() => filterTipo.value || filterFechaDesde.value || filterFechaHasta.value)

function clearFilters() {
  filterTipo.value = ''
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
          <AppSelect v-model="filterTipo" :options="tipoOptions" class="w-36" />
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
          <span class="hidden sm:inline">Nuevo movimiento</span>
        </PrimaryButton>
      </div>
    </div>

    <!-- Mobile filters -->
    <Transition name="filters">
      <div v-if="hasActiveFilters" class="lg:hidden mb-4 p-4 bg-white rounded-xl border border-sand-200/60 space-y-3">
        <AppSelect v-model="filterTipo" label="Tipo" :options="tipoOptions" />
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
      v-else-if="filteredMovimientos.length === 0 && !searchQuery && !hasActiveFilters"
      icon="lucide:landmark"
      title="Todavía no hay movimientos de caja"
      description="Registrá tu primer movimiento para comenzar a controlar el flujo de dinero."
      action-label="Registrar primer movimiento"
      action-to=""
    />

    <!-- No results -->
    <div
      v-else-if="filteredMovimientos.length === 0 && (searchQuery || hasActiveFilters)"
      class="text-center py-16"
    >
      <Icon name="lucide:search-x" class="w-10 h-10 text-sand-300 mx-auto mb-3" />
      <p class="text-[14px] font-medium text-brand-950">No se encontraron movimientos</p>
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
      <CajaCard
        v-for="mov in filteredMovimientos"
        :key="mov.id"
        :movimiento="mov"
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
