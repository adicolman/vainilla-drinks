<script setup lang="ts">
definePageMeta({ layout: 'default' })

useHead({
  title: 'Dashboard — Vainilla Drinks',
})
</script>

<template>
  <div class="space-y-5 lg:space-y-6">
    <!-- Hero: Metrics -->
    <section>
      <DashboardMetrics />
    </section>

    <!-- Operational strip -->
    <section>
      <DashboardOperationalMetrics />
    </section>

    <!-- Main content: Chart + Observaciones -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- Chart — protagonista -->
      <div class="lg:col-span-7 bg-white rounded-2xl border border-sand-200/60 shadow-card overflow-hidden">
        <div class="px-6 py-5">
          <div class="flex items-center justify-between mb-1">
            <div>
              <h3 class="text-[15px] font-bold text-brand-950">Gastos del período</h3>
              <p class="text-[12px] text-sand-400 mt-0.5 font-medium">Evolución de egresos por categoría</p>
            </div>
            <select class="px-3 py-1.5 bg-sand-50 text-brand-950 text-[11px] font-semibold rounded-lg border border-sand-200/80 focus:outline-none cursor-pointer appearance-none pr-7 bg-no-repeat bg-[right_0.4rem_center] bg-[length:0.9rem] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2020%2020%27%20fill%3D%27%23B0A694%27%3E%3Cpath%20fill-rule%3D%27evenodd%27%20d%3D%27M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%27%20clip-rule%3D%27evenodd%27%2F%3E%3C%2Fsvg%3E')]">
              <option>30 días</option>
              <option>7 días</option>
              <option>Mes actual</option>
            </select>
          </div>
        </div>
        <div class="px-6 pb-6">
          <DashboardExpenseChart />
        </div>
      </div>

      <!-- Para revisar — secundario -->
      <div class="lg:col-span-5 bg-white rounded-2xl border border-sand-200/60 shadow-card overflow-hidden">
        <div class="px-6 py-5 border-b border-sand-200/40">
          <div class="flex items-center gap-2">
            <div class="w-1 h-4 bg-vanilla-deep rounded-full" />
            <h3 class="text-[15px] font-bold text-brand-950">Para revisar</h3>
          </div>
          <p class="text-[12px] text-sand-400 mt-1 font-medium">Observaciones que requieren atención</p>
        </div>
        <div class="py-1">
          <DashboardParaRevisar />
        </div>
      </div>
    </section>

    <!-- Secondary content: Movements + Payments -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- Movements -->
      <div class="lg:col-span-7 bg-white rounded-2xl border border-sand-200/60 shadow-card overflow-hidden">
        <div class="px-6 py-5 border-b border-sand-200/40">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-[15px] font-bold text-brand-950">Movimientos recientes</h3>
              <p class="text-[12px] text-sand-400 mt-0.5 font-medium">Últimos registros del negocio</p>
            </div>
            <NuxtLink
              to="/caja"
              class="text-[12px] font-semibold text-brand-600 hover:text-brand-950 transition-colors"
            >
              Ver todos →
            </NuxtLink>
          </div>
        </div>
        <div>
          <DashboardRecentMovements />
        </div>
      </div>

      <!-- Payments -->
      <div class="lg:col-span-5 bg-white rounded-2xl border border-sand-200/60 shadow-card overflow-hidden">
        <div class="px-6 py-5 border-b border-sand-200/40">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-[15px] font-bold text-brand-950">Próximos pagos</h3>
              <p class="text-[12px] text-sand-400 mt-0.5 font-medium">Compromisos pendientes</p>
            </div>
            <NuxtLink
              to="/gastos"
              class="text-[12px] font-semibold text-brand-600 hover:text-brand-950 transition-colors"
            >
              Ver todos →
            </NuxtLink>
          </div>
        </div>
        <div class="p-4">
          <DashboardUpcomingPayments />
        </div>
      </div>
    </section>

    <!-- Review Panel — full width -->
    <section class="bg-white rounded-2xl border border-sand-200/60 shadow-card overflow-hidden">
      <div class="px-6 py-5 border-b border-sand-200/40">
        <div class="flex items-center gap-2">
          <Icon name="lucide:alert-circle" class="w-4 h-4 text-sand-400" />
          <h3 class="text-[15px] font-bold text-brand-950">Alertas del negocio</h3>
        </div>
        <p class="text-[12px] text-sand-400 mt-1 font-medium">Elementos que necesitan acción</p>
      </div>
      <div class="p-5">
        <DashboardReviewPanel />
      </div>
    </section>
  </div>
</template>
