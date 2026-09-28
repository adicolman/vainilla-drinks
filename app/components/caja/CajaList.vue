<script setup lang="ts">
const emit = defineEmits<{
  create: []
}>()

const { isLoading, searchQuery, filterTipo, filterFechaDesde, filterFechaHasta, filteredMovimientos } = useCaja()

const { searchQuery: localSearch } = useSearch()
watch(searchQuery, (v) => { localSearch.value = v })

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
    <!-- Compact filters row -->
    <div class="flex flex-wrap items-center gap-2 mb-6">
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
        class="text-[12px] text-neon-pink hover:text-neon-pink/80 font-medium transition-colors"
        @click="clearFilters"
      >
        Limpiar
      </button>
      <div class="flex-1" />
      <span class="text-[12px] text-sand-400 font-medium">{{ filteredMovimientos.length }}</span>
      <PrimaryButton @click="emit('create')">
        <Icon name="lucide:plus" class="w-4 h-4" />
        <span class="hidden sm:inline">Nuevo movimiento</span>
      </PrimaryButton>
    </div>

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
        class="mt-4 text-[13px] text-neon-pink hover:text-neon-pink/80 font-medium transition-colors"
        @click="searchQuery = ''; clearFilters()"
      >
        Limpiar filtros
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      <CajaCard
        v-for="mov in filteredMovimientos"
        :key="mov.id"
        :movimiento="mov"
      />
    </div>
  </div>
</template>
