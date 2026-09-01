<script setup lang="ts">
import { formatCurrency } from '~/utils/formatting'

const { eventosRecientes } = useDashboard()

const categoryColors: Record<string, { bg: string, icon: string }> = {
  'Compra': { bg: 'bg-brand-600/10', icon: 'text-brand-600' },
  'Producción': { bg: 'bg-success/10', icon: 'text-success' },
}

const categoryIcons: Record<string, string> = {
  'Compra': 'lucide:shopping-cart',
  'Producción': 'lucide:flask-conical',
}

function formatDate(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-if="eventosRecientes.length === 0"
      class="text-center py-10"
    >
      <Icon name="lucide:inbox" class="w-8 h-8 text-sand-300 mx-auto mb-2" />
      <p class="text-[12px] text-sand-400">Todavía no hay movimientos registrados</p>
    </div>

    <div
      v-for="movement in eventosRecientes.slice(0, 5)"
      :key="movement.id"
      class="flex items-center gap-3 p-3 rounded-xl hover:bg-sand-50/80 transition-colors duration-150 group cursor-pointer"
    >
      <div
        :class="categoryColors[movement.categoria]?.bg || 'bg-sand-100'"
        class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      >
        <Icon
          :name="categoryIcons[movement.categoria] || 'lucide:arrow-up-right'"
          :class="categoryColors[movement.categoria]?.icon || 'text-sand-400'"
          class="w-4.5 h-4.5"
        />
      </div>

      <div class="flex-1 min-w-0">
        <p class="text-[13px] font-semibold text-brand-950 truncate leading-tight">{{ movement.concepto }}</p>
        <p class="text-[11px] text-sand-400 font-medium mt-0.5">{{ movement.categoria }} · {{ formatDate(movement.fecha) }}</p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <span class="text-[13px] font-bold tabular-nums text-brand-950">
          -{{ formatCurrency(movement.monto) }}
        </span>
        <Icon name="lucide:chevron-right" class="w-3.5 h-3.5 text-sand-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  </div>
</template>
