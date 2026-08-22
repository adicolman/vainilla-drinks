<script setup lang="ts">
interface FormattedInsight {
  title: string
  context: string
  action?: string
  actionTo?: string
  tone: 'up' | 'down' | 'neutral'
}

const formatted = computed<FormattedInsight[]>(() => [
  {
    title: 'El costo de frutas subió 13%',
    context: 'Impacto en costos de producción',
    tone: 'up',
  },
  {
    title: 'Negroni perdió 4 pts de margen',
    context: 'Rentabilidad vs mes anterior',
    tone: 'down',
  },
  {
    title: '3 insumos necesitan reposición',
    context: 'Stock por debajo del mínimo',
    action: 'Ver inventario',
    actionTo: '/inventario',
    tone: 'neutral',
  },
  {
    title: 'Volumen vendido +14%',
    context: 'Crecimiento sostenido',
    tone: 'up',
  },
])

const toneDots: Record<string, string> = {
  up: 'bg-success',
  down: 'bg-danger',
  neutral: 'bg-brand-600',
}
</script>

<template>
  <div class="space-y-0">
    <div
      v-for="(item, index) in formatted"
      :key="index"
      class="group px-5 py-4 border-b border-sand-200/40 last:border-b-0 hover:bg-sand-50/50 transition-colors duration-200"
    >
      <div class="flex items-start gap-3">
        <div :class="toneDots[item.tone]" class="w-1.5 h-1.5 rounded-full mt-2 shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-semibold text-brand-950 leading-snug">
            {{ item.title }}
          </p>
          <p class="text-[11px] text-sand-400 mt-0.5 font-medium">
            {{ item.context }}
          </p>
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
  </div>
</template>
