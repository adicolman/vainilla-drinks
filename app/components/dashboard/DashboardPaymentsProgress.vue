<script setup lang="ts">
import { formatCurrency, formatDate } from '~/utils/formatting'

const { upcomingPayments } = useMockData()

const statusConfig: Record<string, { label: string, color: string, bg: string }> = {
  pendiente: { label: 'Pendiente', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200/60' },
  pagado: { label: 'Pagado', color: 'text-success', bg: 'bg-emerald-50 border-emerald-200/60' },
  vencido: { label: 'Vencido', color: 'text-danger', bg: 'bg-red-50 border-red-200/60' },
}

const progressMap: Record<string, number> = {
  pendiente: 35,
  pagado: 100,
  vencido: 10,
}

const iconMap: Record<string, string> = {
  pendiente: 'lucide:clock',
  pagado: 'lucide:check-circle',
  vencido: 'lucide:alert-circle',
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-sand-200/60 shadow-card overflow-hidden">
    <div class="px-6 py-4 border-b border-sand-200/40">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-[14px] font-bold text-brand-950">Próximos pagos</h3>
          <p class="text-[11px] text-sand-400 mt-0.5 font-medium">Compromisos pendientes</p>
        </div>
        <NuxtLink
          to="/gastos"
          class="text-[11px] font-semibold text-brand-600 hover:text-brand-950 transition-colors"
        >
          Ver todos →
        </NuxtLink>
      </div>
    </div>

    <div class="divide-y divide-sand-200/40">
      <div
        v-for="payment in upcomingPayments"
        :key="payment.id"
        class="px-6 py-4 hover:bg-sand-50/50 transition-colors duration-150"
      >
        <div class="flex items-center gap-3 mb-2.5">
          <div
            :class="statusConfig[payment.estado]?.bg || 'bg-sand-100'"
            class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
          >
            <Icon
              :name="iconMap[payment.estado] || 'lucide:circle'"
              :class="statusConfig[payment.estado]?.color || 'text-sand-400'"
              class="w-4 h-4"
            />
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-semibold text-brand-950 truncate">{{ payment.proveedor }}</p>
            <p class="text-[11px] text-sand-400 font-medium mt-0.5">{{ payment.concepto }}</p>
          </div>

          <div class="text-right shrink-0">
            <p class="text-[14px] font-bold text-brand-950 tabular-nums">{{ formatCurrency(payment.monto) }}</p>
            <p class="text-[10px] text-sand-400 font-medium mt-0.5">{{ formatDate(payment.fecha) }}</p>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="flex items-center gap-2.5">
          <div class="flex-1 h-1.5 bg-sand-100 rounded-full overflow-hidden">
            <div
              :class="statusConfig[payment.estado]?.color === 'text-success' ? 'bg-success' : statusConfig[payment.estado]?.color === 'text-danger' ? 'bg-danger' : 'bg-amber-400'"
              class="h-full rounded-full transition-all duration-500"
              :style="{ width: `${progressMap[payment.estado] || 35}%` }"
            />
          </div>
          <span
            :class="statusConfig[payment.estado]?.color"
            class="text-[10px] font-bold tabular-nums"
          >
            {{ progressMap[payment.estado] || 35 }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
