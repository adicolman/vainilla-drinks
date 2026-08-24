<script setup lang="ts">
const { upcomingPayments, todayEvents } = useMockData()

const today = new Date()
const currentMonth = today.getMonth()
const currentYear = today.getFullYear()
const todayDate = today.getDate()

const monthName = computed(() => {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return months[currentMonth]
})

const daysInMonth = computed(() => new Date(currentYear, currentMonth + 1, 0).getDate())
const firstDayOfWeek = computed(() => new Date(currentYear, currentMonth, 1).getDay())

const calendarDays = computed(() => {
  const days: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek.value; i++) days.push(null)
  for (let i = 1; i <= daysInMonth.value; i++) days.push(i)
  return days
})

const dayNames = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

const eventIcons: Record<string, string> = {
  delivery: 'lucide:truck',
  reception: 'lucide:package',
  close: 'lucide:lock',
}
</script>

<template>
  <div class="space-y-4">
    <!-- Calendar -->
    <div class="bg-white rounded-2xl border border-sand-200/60 p-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-[13px] font-bold text-brand-950">{{ monthName }} {{ currentYear }}</h4>
        <div class="flex gap-1">
          <button class="w-6 h-6 rounded-md hover:bg-sand-100 flex items-center justify-center transition-colors">
            <Icon name="lucide:chevron-left" class="w-3 h-3 text-sand-400" />
          </button>
          <button class="w-6 h-6 rounded-md hover:bg-sand-100 flex items-center justify-center transition-colors">
            <Icon name="lucide:chevron-right" class="w-3 h-3 text-sand-400" />
          </button>
        </div>
      </div>

      <!-- Day names -->
      <div class="grid grid-cols-7 gap-0 mb-1">
        <div
          v-for="day in dayNames"
          :key="day"
          class="text-center text-[9px] font-semibold text-sand-400 py-1"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar grid -->
      <div class="grid grid-cols-7 gap-0">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="text-center"
        >
          <div
            v-if="day"
            :class="[
              day === todayDate
                ? 'bg-brand-900 text-white font-bold'
                : 'text-brand-950 hover:bg-sand-100',
            ]"
            class="w-7 h-7 mx-auto rounded-lg flex items-center justify-center text-[10px] cursor-pointer transition-colors"
          >
            {{ day }}
          </div>
        </div>
      </div>
    </div>

    <!-- Hoy en Vainilla Drinks -->
    <div class="bg-white rounded-2xl border border-sand-200/60 p-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-[13px] font-bold text-brand-950">Hoy</h4>
        <span class="text-[10px] font-semibold text-sand-400">{{ todayDate }} {{ monthName }}</span>
      </div>

      <div class="space-y-2">
        <div
          v-for="event in todayEvents"
          :key="event.title"
          class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-sand-50 transition-colors"
        >
          <div class="w-6 h-6 rounded-md bg-brand-50 flex items-center justify-center shrink-0">
            <Icon :name="eventIcons[event.type]" class="w-3 h-3 text-brand-600" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[11px] font-semibold text-brand-950 truncate">{{ event.title }}</p>
            <p class="text-[9px] text-sand-400 font-medium">{{ event.time }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Próximos pagos compacto -->
    <div class="bg-white rounded-2xl border border-sand-200/60 p-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-[13px] font-bold text-brand-950">Próximos pagos</h4>
        <NuxtLink to="/gastos" class="text-[10px] font-semibold text-brand-600 hover:text-brand-950 transition-colors">
          Ver todos →
        </NuxtLink>
      </div>

      <div class="space-y-2">
        <div
          v-for="payment in upcomingPayments.slice(0, 3)"
          :key="payment.id"
          class="flex items-center justify-between py-1.5"
        >
          <div class="min-w-0">
            <p class="text-[11px] font-semibold text-brand-950 truncate">{{ payment.proveedor }}</p>
            <p class="text-[9px] text-sand-400 font-medium">{{ payment.fecha }}</p>
          </div>
          <span class="text-[11px] font-bold text-brand-950 tabular-nums shrink-0 ml-2">
            ${{ (payment.monto / 1000).toFixed(0) }}k
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
