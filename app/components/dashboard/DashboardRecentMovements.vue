<script setup lang="ts">
import { formatCurrency, formatDate } from '~/utils/formatting'

const { recentMovements } = useMockData()
</script>

<template>
  <div class="divide-y divide-sand-200/40">
    <div
      v-for="movement in recentMovements"
      :key="movement.id"
      class="flex items-center gap-4 px-5 py-4 hover:bg-sand-50/50 transition-colors duration-200 group"
    >
      <!-- Icon -->
      <div
        :class="movement.tipo === 'ingreso' ? 'bg-success-soft' : 'bg-sand-100'"
        class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
      >
        <Icon
          :name="movement.tipo === 'ingreso' ? 'lucide:arrow-down-left' : 'lucide:arrow-up-right'"
          :class="movement.tipo === 'ingreso' ? 'text-success' : 'text-sand-400'"
          class="w-4 h-4"
        />
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <p class="text-[13px] font-semibold text-brand-950 truncate leading-snug">
          {{ movement.concepto }}
        </p>
        <div class="flex items-center gap-1.5 mt-0.5">
          <span class="text-[11px] text-sand-400 font-medium">{{ movement.categoria }}</span>
          <span v-if="movement.proveedor" class="text-sand-300">·</span>
          <span v-if="movement.proveedor" class="text-[11px] text-sand-400 font-medium">{{ movement.proveedor }}</span>
        </div>
      </div>

      <!-- Amount + Date -->
      <div class="text-right shrink-0">
        <p
          :class="movement.tipo === 'ingreso' ? 'text-success' : 'text-brand-950'"
          class="text-[13px] font-bold tabular-nums"
        >
          {{ movement.tipo === 'ingreso' ? '+' : '-' }}{{ formatCurrency(movement.monto) }}
        </p>
        <p class="text-[11px] text-sand-400 mt-0.5 font-medium">{{ formatDate(movement.fecha) }}</p>
      </div>
    </div>
  </div>
</template>
