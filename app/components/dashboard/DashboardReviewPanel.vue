<script setup lang="ts">
const { reviewItems } = useMockData()

const iconMap: Record<string, string> = {
  stock_bajo: 'lucide:package-x',
  costo_aumento: 'lucide:trending-up',
  merma_alta: 'lucide:droplets',
  gasto_inusual: 'lucide:alert-circle',
}

const colorMap: Record<string, string> = {
  stock_bajo: 'text-danger bg-danger-soft',
  costo_aumento: 'text-warning bg-warning-soft',
  merma_alta: 'text-warning bg-warning-soft',
  gasto_inusual: 'text-info bg-info-soft',
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div
      v-for="item in reviewItems"
      :key="item.id"
      class="flex items-start gap-3 p-4 rounded-xl bg-sand-50/50 hover:bg-sand-100/40 transition-colors duration-200"
    >
      <div
        :class="colorMap[item.type]"
        class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
      >
        <Icon :name="iconMap[item.type]" class="w-4 h-4" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[13px] font-semibold text-brand-950 leading-snug">{{ item.title }}</p>
        <p class="text-[11px] text-sand-400 mt-0.5 font-medium">{{ item.description }}</p>
        <NuxtLink
          v-if="item.action && item.actionTo"
          :to="item.actionTo"
          class="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-brand-600 hover:text-brand-950 transition-colors"
        >
          {{ item.action }}
          <Icon name="lucide:arrow-right" class="w-3 h-3" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
