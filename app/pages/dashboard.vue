<script setup lang="ts">
definePageMeta({ layout: 'default' })

useHead({
  title: 'Dashboard — Vainilla Drinks',
})

const { fetchAll } = useDashboard()

onMounted(() => {
  fetchAll()
})
</script>

<template>
  <div class="space-y-5 lg:space-y-6">
    <!-- Row 1: Metric Cards -->
    <section>
      <DashboardMetricCards />
    </section>

    <!-- Row 2: Chart + Movements + Calendar -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- Expense chart -->
      <div class="lg:col-span-4 bg-white rounded-2xl border border-sand-200/60 shadow-card overflow-hidden">
        <div class="px-5 py-4 border-b border-sand-200/40">
          <div class="flex items-center justify-between mb-1">
            <div>
              <h3 class="text-[14px] font-bold text-brand-950">Compras del mes</h3>
              <p class="text-[11px] text-sand-400 mt-0.5 font-medium">Por semana</p>
            </div>
          </div>
        </div>
        <div class="px-5 pb-5">
          <DashboardExpenseChart />
        </div>
      </div>

      <!-- Movements list (Daily Schedule style) -->
      <div class="lg:col-span-4 bg-white rounded-2xl border border-sand-200/60 shadow-card overflow-hidden">
        <div class="px-5 py-4 border-b border-sand-200/40">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-[14px] font-bold text-brand-950">Movimientos</h3>
              <p class="text-[11px] text-sand-400 mt-0.5 font-medium">Actividad reciente</p>
            </div>
            <NuxtLink
              to="/reportes"
              class="text-[11px] font-semibold text-brand-600 hover:text-brand-950 transition-colors"
            >
              Ver todos →
            </NuxtLink>
          </div>
        </div>
        <div class="py-1">
          <DashboardMovementsList />
        </div>
      </div>

      <!-- Calendar + Agenda -->
      <div class="lg:col-span-4 space-y-5">
        <DashboardCalendar />
        <DashboardTimeline />
      </div>
    </section>
  </div>
</template>
