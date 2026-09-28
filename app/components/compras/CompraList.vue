<script setup lang="ts">
const emit = defineEmits<{
  create: []
}>()

const { isLoading, searchQuery, filterEstado, filteredCompras, fetchCompras } = useCompras()

const { searchQuery: localSearch } = useSearch()
watch(searchQuery, (v) => { localSearch.value = v })

const estadoOptions = [
  { value: '', label: 'Todos' },
  { value: 'recibido', label: 'Recibidos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'cancelado', label: 'Cancelados' },
]

const hasActiveFilters = computed(() => filterEstado.value)

function clearFilters() {
  filterEstado.value = ''
}
</script>

<template>
  <div>
    <!-- Compact filters row -->
    <div class="flex flex-wrap items-center gap-2 mb-6">
      <AppSelect v-model="filterEstado" :options="estadoOptions" class="w-40" />
      <button
        v-if="hasActiveFilters"
        class="text-[12px] text-neon-pink hover:text-neon-pink/80 font-medium transition-colors"
        @click="clearFilters"
      >
        Limpiar
      </button>
      <div class="flex-1" />
      <span class="text-[12px] text-sand-400 font-medium">{{ filteredCompras.length }}</span>
      <PrimaryButton @click="emit('create')">
        <Icon name="lucide:plus" class="w-4 h-4" />
        <span class="hidden sm:inline">Nueva compra</span>
      </PrimaryButton>
    </div>

    <!-- Loading -->
    <LoadingState v-if="isLoading" type="card" />

    <!-- Empty state -->
    <EmptyState
      v-else-if="filteredCompras.length === 0 && !searchQuery && !hasActiveFilters"
      icon="lucide:truck"
      title="Todavía no hay compras registradas"
      description="Registrá tu primera compra para agregar stock de insumos."
      action-label="Registrar primera compra"
      action-to=""
    />

    <!-- No results -->
    <div v-else-if="filteredCompras.length === 0 && (searchQuery || hasActiveFilters)" class="text-center py-16">
      <Icon name="lucide:search-x" class="w-10 h-10 text-sand-300 mx-auto mb-3" />
      <p class="text-[14px] font-medium text-brand-950">No se encontraron compras</p>
      <p class="text-[13px] text-sand-400 mt-1">Probá con otros filtros o términos de búsqueda</p>
      <button class="mt-4 text-[13px] text-neon-pink hover:text-neon-pink/80 font-medium transition-colors" @click="searchQuery = ''; clearFilters()">
        Limpiar filtros
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      <CompraCard
        v-for="compra in filteredCompras"
        :key="compra.id"
        :compra="compra"
      />
    </div>
  </div>
</template>
