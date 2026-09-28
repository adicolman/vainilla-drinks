<script setup lang="ts">
import type { ProveedorRow } from '~/composables/useProveedores'

const emit = defineEmits<{
  create: []
  edit: [proveedor: ProveedorRow]
  toggle: [proveedor: ProveedorRow]
  delete: [proveedor: ProveedorRow]
}>()

const { isLoading, searchQuery, filterEstado, filteredProveedores } = useProveedores()

const { searchQuery: localSearch } = useSearch()
watch(searchQuery, (v) => { localSearch.value = v })

const estadoOptions = [
  { value: '', label: 'Todos' },
  { value: 'activo', label: 'Activos' },
  { value: 'inactivo', label: 'Inactivos' },
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
      <AppSelect v-model="filterEstado" :options="estadoOptions" class="w-36" />
      <button
        v-if="hasActiveFilters"
        class="text-[12px] text-neon-pink hover:text-neon-pink/80 font-medium transition-colors"
        @click="clearFilters"
      >
        Limpiar
      </button>
      <div class="flex-1" />
      <span class="text-[12px] text-sand-400 font-medium">{{ filteredProveedores.length }}</span>
      <PrimaryButton @click="emit('create')">
        <Icon name="lucide:plus" class="w-4 h-4" />
        <span class="hidden sm:inline">Nuevo proveedor</span>
      </PrimaryButton>
    </div>

    <!-- Loading -->
    <LoadingState v-if="isLoading" type="card" />

    <!-- Empty state -->
    <EmptyState
      v-else-if="filteredProveedores.length === 0 && !searchQuery && !hasActiveFilters"
      icon="lucide:users"
      title="Todavía no hay proveedores"
      description="Agregá tu primer proveedor para vincularlo a las compras."
      action-label="Agregar primer proveedor"
      action-to=""
    />

    <!-- No results -->
    <div v-else-if="filteredProveedores.length === 0 && (searchQuery || hasActiveFilters)" class="text-center py-16">
      <Icon name="lucide:search-x" class="w-10 h-10 text-sand-300 mx-auto mb-3" />
      <p class="text-[14px] font-medium text-brand-950">No se encontraron proveedores</p>
      <p class="text-[13px] text-sand-400 mt-1">Probá con otros términos de búsqueda</p>
      <button class="mt-4 text-[13px] text-neon-pink hover:text-neon-pink/80 font-medium transition-colors" @click="searchQuery = ''; clearFilters()">
        Limpiar filtros
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      <ProveedorCard
        v-for="proveedor in filteredProveedores"
        :key="proveedor.id"
        :proveedor="proveedor"
        @edit="emit('edit', $event)"
        @toggle="emit('toggle', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </div>
</template>
