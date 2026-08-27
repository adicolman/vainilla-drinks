<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { isLoading, fetchAll } = useReportes()

const activeTab = ref('costos')

const tabs = [
  { value: 'costos', label: 'Costos', icon: 'lucide:dollar-sign' },
  { value: 'rentabilidad', label: 'Rentabilidad', icon: 'lucide:trending-up' },
  { value: 'compras', label: 'Compras', icon: 'lucide:shopping-cart' },
  { value: 'stock', label: 'Stock', icon: 'lucide:package' },
]

onMounted(() => fetchAll())
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-[22px] font-bold text-brand-950 tracking-tight">Reportes</h1>
      <p class="text-[13px] text-sand-400 mt-1">Análisis de costos, rentabilidad, compras y stock</p>
    </div>

    <!-- Tabs -->
    <div class="border-b border-sand-200/60">
      <div class="flex gap-1 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-colors whitespace-nowrap relative"
          :class="activeTab === tab.value ? 'text-brand-950' : 'text-sand-400 hover:text-sand-500'"
          @click="activeTab = tab.value"
        >
          <Icon :name="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
          <span
            v-if="activeTab === tab.value"
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-950 rounded-full"
          />
        </button>
      </div>
    </div>

    <!-- Content -->
    <CostosReport v-if="activeTab === 'costos'" />
    <RentabilidadReport v-else-if="activeTab === 'rentabilidad'" />
    <ComprasReport v-else-if="activeTab === 'compras'" />
    <StockReport v-else-if="activeTab === 'stock'" />
  </div>
</template>
