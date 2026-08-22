<script setup lang="ts">
import { formatCurrency, formatDate } from '~/utils/formatting'

const { upcomingPayments } = useMockData()

const statusConfig: Record<string, { label: string, classes: string }> = {
  pendiente: { label: 'Pendiente', classes: 'bg-warning-soft text-warning' },
  pagado: { label: 'Pagado', classes: 'bg-success-soft text-success' },
  vencido: { label: 'Vencido', classes: 'bg-danger-soft text-danger' },
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="payment in upcomingPayments"
      :key="payment.id"
      class="flex items-center gap-4 px-4 py-3 rounded-xl bg-sand-50/50 hover:bg-sand-100/50 transition-colors duration-200"
    >
      <div class="flex-1 min-w-0">
        <p class="text-[13px] font-semibold text-brand-950 truncate">{{ payment.proveedor }}</p>
        <p class="text-[11px] text-sand-400 mt-0.5 font-medium">{{ payment.concepto }}</p>
      </div>
      <div class="text-right shrink-0">
        <p class="text-[13px] font-bold text-brand-950 tabular-nums">{{ formatCurrency(payment.monto) }}</p>
        <p class="text-[11px] text-sand-400 mt-0.5 font-medium">{{ formatDate(payment.fecha) }}</p>
      </div>
      <span
        :class="statusConfig[payment.estado]?.classes"
        class="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
      >
        {{ statusConfig[payment.estado]?.label }}
      </span>
    </div>
  </div>
</template>
