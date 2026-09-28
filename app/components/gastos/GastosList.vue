<script setup lang="ts">
const emit = defineEmits<{
  create: []
}>()

const { isLoading, searchQuery, filterCategoria, filterFechaDesde, filterFechaHasta, filteredGastos } = useGastos()

const { searchQuery: localSearch } = useSearch()
watch(searchQuery, (v) => { localSearch.value = v })

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
    <!-- Compact filters row -->
    <div class="flex flex-wrap items-center gap-2 mb-6">
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
        class="text-[12px] text-neon-pink hover:text-neon-pink/80 font-medium transition-colors"
        @click="clearFilters"
      >
        Limpiar
      </button>
      <div class="flex-1" />
      <span class="text-[12px] text-sand-400 font-medium">{{ filteredGastos.length }}</span>
      <PrimaryButton @click="emit('create')">
        <Icon name="lucide:plus" class="w-4 h-4" />
        <span class="hidden sm:inline">Nuevo gasto</span>
      </PrimaryButton>
    </div>

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
        class="mt-4 text-[13px] text-neon-pink hover:text-neon-pink/80 font-medium transition-colors"
        @click="searchQuery = ''; clearFilters()"
      >
        Limpiar filtros
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      <GastosCard
        v-for="gasto in filteredGastos"
        :key="gasto.id"
        :gasto="gasto"
      />
    </div>
  </div>
</template>
