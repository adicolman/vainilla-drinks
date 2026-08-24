<script setup lang="ts">
import { formatCurrency } from '~/utils/formatting'

const { recentMovements } = useMockData()

const categoryColors: Record<string, { bg: string, icon: string }> = {
  'Bebidas': { bg: 'bg-brand-600/10', icon: 'text-brand-600' },
  'Insumos': { bg: 'bg-success/10', icon: 'text-success' },
  'Ventas': { bg: 'bg-vanilla/20', icon: 'text-amber-600' },
  'Marketing': { bg: 'bg-danger/10', icon: 'text-danger' },
  'Packaging': { bg: 'bg-sand-200/60', icon: 'text-sand-500' },
  'Servicios': { bg: 'bg-brand-400/10', icon: 'text-brand-400' },
}

const categoryIcons: Record<string, string> = {
  'Bebidas': 'lucide:wine',
  'Insumos': 'lucide:apple',
  'Ventas': 'lucide:shopping-bag',
  'Marketing': 'lucide:megaphone',
  'Packaging': 'lucide:box',
  'Servicios': 'lucide:settings',
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="movement in recentMovements.slice(0, 5)"
      :key="movement.id"
      class="flex items-center gap-3 p-3 rounded-xl hover:bg-sand-50/80 transition-colors duration-150 group cursor-pointer"
    >
      <div
        :class="categoryColors[movement.categoria]?.bg || 'bg-sand-100'"
        class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      >
        <Icon
          :name="categoryIcons[movement.categoria] || (movement.tipo === 'ingreso' ? 'lucide:arrow-down-left' : 'lucide:arrow-up-right')"
          :class="categoryColors[movement.categoria]?.icon || 'text-sand-400'"
          class="w-4.5 h-4.5"
        />
      </div>

      <div class="flex-1 min-w-0">
        <p class="text-[13px] font-semibold text-brand-950 truncate leading-tight">{{ movement.concepto }}</p>
        <p class="text-[11px] text-sand-400 font-medium mt-0.5">{{ movement.categoria }}</p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <span
          :class="movement.tipo === 'ingreso' ? 'text-success' : 'text-brand-950'"
          class="text-[13px] font-bold tabular-nums"
        >
          {{ movement.tipo === 'ingreso' ? '+' : '-' }}{{ formatCurrency(movement.monto) }}
        </span>
        <Icon name="lucide:chevron-right" class="w-3.5 h-3.5 text-sand-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  </div>
</template>
