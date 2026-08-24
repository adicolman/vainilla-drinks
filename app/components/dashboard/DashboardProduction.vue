<script setup lang="ts">
const { productionMetrics } = useMockData()

const icons = ['lucide:glass-water', 'lucide:alert-triangle', 'lucide:calculator']
</script>

<template>
  <div class="rounded-2xl p-5 sm:p-6 card-bg-mint overflow-hidden">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-[14px] font-bold text-brand-950">Producción del mes</h3>
      <NuxtLink to="/recetas" class="text-[11px] font-semibold text-brand-600 hover:text-brand-950 transition-colors">
        Ver detalle →
      </NuxtLink>
    </div>

    <div class="space-y-3">
      <div
        v-for="(metric, index) in productionMetrics"
        :key="metric.label"
        class="flex items-center gap-3"
      >
        <div class="w-8 h-8 rounded-lg bg-white/60 backdrop-blur-sm flex items-center justify-center shrink-0">
          <Icon :name="icons[index]" class="w-4 h-4 text-success" />
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <span class="text-[12px] font-semibold text-brand-950">{{ metric.label }}</span>
            <span class="text-[14px] font-bold text-brand-950">{{ metric.value }}</span>
          </div>
          <span class="text-[10px] text-sand-400 font-medium">{{ metric.variation }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
