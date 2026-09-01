<script setup lang="ts">
const { diasConEventosEsteMes } = useDashboard()

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const dayHeaders = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  let startDayOfWeek = firstDay.getDay()
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

  const daysInMonth = lastDay.getDate()

  const days: { day: number; isCurrentMonth: boolean; isToday: boolean; hasEvent: boolean }[] = []

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: false,
      hasEvent: false,
    })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
    const hasEvent = month === today.getMonth() && year === today.getFullYear() && diasConEventosEsteMes.value.includes(d)
    days.push({ day: d, isCurrentMonth: true, isToday, hasEvent })
  }

  // Next month leading days
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      isToday: false,
      hasEvent: false,
    })
  }

  return days
})

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-sand-200/60 shadow-card overflow-hidden">
    <div class="px-4 py-3 border-b border-sand-200/40">
      <div class="flex items-center justify-between">
        <h3 class="text-[12px] font-bold text-brand-950 tracking-tight">{{ monthNames[currentMonth] }}, {{ currentYear }}</h3>
        <div class="flex items-center gap-1">
          <button
            class="w-6 h-6 flex items-center justify-center rounded-md hover:bg-sand-100 text-sand-400 hover:text-brand-950 transition-colors"
            @click="prevMonth"
          >
            <Icon name="lucide:chevron-left" class="w-3.5 h-3.5" />
          </button>
          <button
            class="w-6 h-6 flex items-center justify-center rounded-md hover:bg-sand-100 text-sand-400 hover:text-brand-950 transition-colors"
            @click="nextMonth"
          >
            <Icon name="lucide:chevron-right" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <div class="p-3">
      <!-- Day headers -->
      <div class="grid grid-cols-7 mb-2">
        <div
          v-for="header in dayHeaders"
          :key="header"
          class="text-center text-[10px] font-semibold text-sand-400 py-1"
        >
          {{ header }}
        </div>
      </div>

      <!-- Calendar grid -->
      <div class="grid grid-cols-7 gap-0.5">
        <div
          v-for="(day, idx) in calendarDays"
          :key="idx"
          class="relative"
        >
          <div
            :class="[
              day.isToday
                ? 'bg-brand-600 text-white font-bold'
                : day.isCurrentMonth
                  ? 'text-brand-950 hover:bg-sand-50'
                  : 'text-sand-300',
              'w-full aspect-square flex flex-col items-center justify-center rounded-lg text-[11px] cursor-pointer transition-colors relative'
            ]"
          >
            {{ day.day }}
            <div
              v-if="day.hasEvent && day.isCurrentMonth && !day.isToday"
              class="absolute bottom-1 w-1 h-1 rounded-full bg-brand-600"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
