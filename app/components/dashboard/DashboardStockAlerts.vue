<script setup lang="ts">
const { reviewItems } = useMockData()

const typeConfig: Record<string, { icon: string; bg: string; text: string }> = {
  stock_bajo: { icon: 'lucide:package-x', bg: 'bg-danger-soft', text: 'text-danger' },
  costo_aumento: { icon: 'lucide:trending-up', bg: 'bg-warning-soft', text: 'text-warning' },
  merma_alta: { icon: 'lucide:alert-triangle', bg: 'bg-warning-soft', text: 'text-warning' },
  gasto_inusual: { icon: 'lucide:receipt', bg: 'bg-info-soft', text: 'text-info' },
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-sand-200/60 overflow-hidden">
    <div class="px-5 py-4 border-b border-sand-200/40">
      <div class="flex items-center gap-2">
        <Icon name="lucide:alert-circle" class="w-3.5 h-3.5 text-sand-400" />
        <h3 class="text-[14px] font-bold text-brand-950">Stock y alertas</h3>
      </div>
    </div>
    <div class="divide-y divide-sand-200/40">
      <div
        v-for="item in reviewItems"
        :key="item.id"
        class="px-5 py-3 hover:bg-sand-50/50 transition-colors"
      >
        <div class="flex items-start gap-3">
          <div
            :class="[typeConfig[item.type]?.bg]"
            class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          >
            <Icon
              :name="typeConfig[item.type]?.icon"
              :class="[typeConfig[item.type]?.text]"
              class="w-3.5 h-3.5"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[12px] font-semibold text-brand-950 leading-snug">{{ item.title }}</p>
            <p class="text-[10px] text-sand-400 mt-0.5 font-medium">{{ item.description }}</p>
            <NuxtLink
              v-if="item.action && item.actionTo"
              :to="item.actionTo"
              class="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-brand-600 hover:text-brand-950 transition-colors"
            >
              {{ item.action }}
              <Icon name="lucide:arrow-right" class="w-2.5 h-2.5" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
