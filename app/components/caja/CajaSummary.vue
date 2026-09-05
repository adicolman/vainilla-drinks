<script setup lang="ts">
const { resumen } = useCaja()

function formatCurrency(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
    <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
      <div class="flex items-center justify-between mb-3">
        <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-sand-400">Ingresos hoy</span>
        <div class="w-8 h-8 rounded-lg bg-success-soft flex items-center justify-center">
          <Icon name="lucide:trending-up" class="w-4 h-4 text-success" />
        </div>
      </div>
      <p class="text-2xl font-bold text-success">{{ formatCurrency(resumen.ingresosHoy) }}</p>
    </div>

    <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
      <div class="flex items-center justify-between mb-3">
        <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-sand-400">Egresos hoy</span>
        <div class="w-8 h-8 rounded-lg bg-danger-soft flex items-center justify-center">
          <Icon name="lucide:trending-down" class="w-4 h-4 text-danger" />
        </div>
      </div>
      <p class="text-2xl font-bold text-danger">{{ formatCurrency(resumen.egresosHoy) }}</p>
    </div>

    <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
      <div class="flex items-center justify-between mb-3">
        <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-sand-400">Saldo hoy</span>
        <div class="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
          <Icon name="lucide:landmark" class="w-4 h-4 text-brand-600" />
        </div>
      </div>
      <p :class="resumen.saldoHoy >= 0 ? 'text-success' : 'text-danger'" class="text-2xl font-bold">
        {{ formatCurrency(resumen.saldoHoy) }}
      </p>
    </div>

    <div class="bg-brand-950 rounded-2xl p-5 text-white">
      <div class="flex items-center justify-between mb-3">
        <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-brand-400">Saldo acumulado</span>
        <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <Icon name="lucide:wallet" class="w-4 h-4 text-white" />
        </div>
      </div>
      <p class="text-2xl font-bold">{{ formatCurrency(resumen.saldo) }}</p>
    </div>
  </div>
</template>
