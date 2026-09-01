<script setup lang="ts">
const { eventosHoy } = useDashboard()

function formatCurrency(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

const today = new Date()
const dayName = today.toLocaleDateString('es-AR', { weekday: 'long' })
const dayNumber = today.getDate()
const monthName = today.toLocaleDateString('es-AR', { month: 'long' })

const colorByCategoria: Record<string, { dot: string; bg: string; text: string }> = {
  'Compra': { dot: 'bg-brand-600', bg: 'bg-brand-600/5', text: 'text-brand-700' },
  'Producción': { dot: 'bg-success', bg: 'bg-success-soft', text: 'text-success' },
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-sand-200/60 shadow-card overflow-hidden">
    <div class="px-4 py-3 border-b border-sand-200/40">
      <div class="flex items-center justify-between">
        <h3 class="text-[12px] font-bold text-brand-950 tracking-tight">Actividad de hoy</h3>
        <span class="text-[10px] font-semibold text-sand-400 capitalize">{{ dayName }}</span>
      </div>
      <p class="text-[10px] text-sand-400 mt-0.5 font-medium">{{ dayNumber }} de {{ monthName }}</p>
    </div>
    <div class="px-4 py-3">
      <div v-if="eventosHoy.length === 0" class="text-center py-6">
        <Icon name="lucide:calendar-check" class="w-7 h-7 text-sand-300 mx-auto mb-2" />
        <p class="text-[11px] text-sand-400">Sin movimientos registrados hoy</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(event, idx) in eventosHoy"
          :key="event.id"
          class="flex gap-3"
        >
          <!-- Connector line -->
          <div class="flex flex-col items-center pt-1.5">
            <div :class="colorByCategoria[event.categoria]?.dot || 'bg-sand-300'" class="w-2 h-2 rounded-full shrink-0" />
            <div v-if="idx < eventosHoy.length - 1" class="w-px flex-1 bg-sand-200/60 my-1" />
          </div>

          <!-- Event card -->
          <div :class="colorByCategoria[event.categoria]?.bg || 'bg-sand-50'" class="flex-1 rounded-xl px-3 py-2.5 mb-1">
            <p :class="colorByCategoria[event.categoria]?.text || 'text-brand-950'" class="text-[12px] font-bold leading-tight">
              {{ event.concepto }}
            </p>
            <p class="text-[10px] text-sand-400 mt-0.5 leading-snug">{{ formatCurrency(event.monto) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
