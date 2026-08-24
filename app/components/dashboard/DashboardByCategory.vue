<script setup lang="ts">
import { formatCurrency } from '~/utils/formatting'

const { categoryBreakdown } = useMockData()

const icons: Record<string, string> = {
  'Gin-based': 'lucide:wine',
  'Vodka-based': 'lucide:beer',
  'Ron-based': 'lucide:glass-water',
}
</script>

<template>
  <div class="rounded-2xl p-5 sm:p-6 card-bg-sky overflow-hidden">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-[14px] font-bold text-brand-950">Por categoría</h3>
      <NuxtLink to="/recetas" class="text-[11px] font-semibold text-brand-600 hover:text-brand-950 transition-colors">
        Ver todas →
      </NuxtLink>
    </div>

    <div class="space-y-3">
      <div
        v-for="cat in categoryBreakdown"
        :key="cat.label"
        class="flex items-center gap-3"
      >
        <div class="w-8 h-8 rounded-lg bg-white/60 backdrop-blur-sm flex items-center justify-center shrink-0">
          <Icon :name="icons[cat.label] || 'lucide:glass-water'" class="w-4 h-4 text-brand-600" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[12px] font-semibold text-brand-950">{{ cat.label }}</span>
            <span class="text-[12px] font-bold text-brand-950">{{ cat.value }}%</span>
          </div>
          <div class="h-1.5 bg-white/60 rounded-full overflow-hidden">
            <div
              :class="cat.color"
              class="h-full rounded-full transition-all duration-500"
              :style="{ width: `${cat.value}%` }"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 pt-3 border-t border-brand-200/30">
      <div class="flex items-center justify-between">
        <span class="text-[11px] text-sand-400 font-medium">Total categorías</span>
        <span class="text-[12px] font-bold text-brand-950">{{ categoryBreakdown.length }}</span>
      </div>
    </div>
  </div>
</template>
