<script setup lang="ts">
const emit = defineEmits<{
  create: []
}>()

const { isLoading, searchQuery, filteredProduccion, fetchProduccion } = useProduccion()

onMounted(() => {
  fetchProduccion()
})
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
          placeholder="Buscar producción..."
          class="w-full h-10 pl-9 pr-4 bg-white text-brand-950 text-[13px] rounded-xl border border-sand-200 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-400 transition-all duration-200"
        />
      </div>

      <PrimaryButton @click="emit('create')">
        <Icon name="lucide:plus" class="w-4 h-4" />
        <span class="hidden sm:inline">Registrar producción</span>
      </PrimaryButton>
    </div>

    <!-- Loading -->
    <LoadingState v-if="isLoading" type="card" />

    <!-- Empty state -->
    <EmptyState
      v-else-if="filteredProduccion.length === 0 && !searchQuery"
      icon="lucide:flask-conical"
      title="Todavía no hay producción registrada"
      description="Registrá tu primer lote de producción para descontar ingredientes del stock."
      action-label="Registrar primera producción"
      action-to=""
    />

    <!-- No results -->
    <div v-else-if="filteredProduccion.length === 0 && searchQuery" class="text-center py-16">
      <Icon name="lucide:search-x" class="w-10 h-10 text-sand-300 mx-auto mb-3" />
      <p class="text-[14px] font-medium text-brand-950">No se encontraron producciones</p>
      <p class="text-[13px] text-sand-400 mt-1">Probá con otros términos de búsqueda</p>
      <button class="mt-4 text-[13px] text-brand-600 hover:text-brand-950 font-medium transition-colors" @click="searchQuery = ''">
        Limpiar búsqueda
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <ProduccionCard
        v-for="item in filteredProduccion"
        :key="item.id"
        :produccion="item"
      />
    </div>
  </div>
</template>
