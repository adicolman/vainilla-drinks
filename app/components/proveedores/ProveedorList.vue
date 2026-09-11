<script setup lang="ts">
import type { ProveedorRow } from '~/composables/useProveedores'

const emit = defineEmits<{
  create: []
  edit: [proveedor: ProveedorRow]
  toggle: [proveedor: ProveedorRow]
  delete: [proveedor: ProveedorRow]
}>()

const { isLoading, searchQuery, filterEstado, filteredProveedores } = useProveedores()

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
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
      <div class="relative flex-1 w-full max-w-md">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-300" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar proveedor..."
          class="w-full h-10 pl-9 pr-4 bg-white text-brand-950 text-[13px] rounded-xl border border-sand-200 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-400 transition-all duration-200"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <div class="hidden lg:flex items-center gap-2">
          <AppSelect v-model="filterEstado" :options="estadoOptions" class="w-36" />
          <button
            v-if="hasActiveFilters"
            class="text-[12px] text-brand-600 hover:text-brand-950 font-medium transition-colors"
            @click="clearFilters"
          >
            Limpiar
          </button>
        </div>

        <PrimaryButton @click="emit('create')">
          <Icon name="lucide:plus" class="w-4 h-4" />
          <span class="hidden sm:inline">Nuevo proveedor</span>
        </PrimaryButton>
      </div>
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
      <button class="mt-4 text-[13px] text-brand-600 hover:text-brand-950 font-medium transition-colors" @click="searchQuery = ''; clearFilters()">
        Limpiar filtros
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
