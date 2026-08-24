<script setup lang="ts">
const { timelineEvents } = useMockData()

const colorMap: Record<string, { dot: string; bg: string; text: string }> = {
  brand: { dot: 'bg-brand-600', bg: 'bg-brand-600/5', text: 'text-brand-700' },
  vanilla: { dot: 'bg-vanilla', bg: 'bg-vanilla/10', text: 'text-amber-700' },
  success: { dot: 'bg-success', bg: 'bg-success-soft', text: 'text-success' },
  danger: { dot: 'bg-danger', bg: 'bg-danger-soft', text: 'text-danger' },
  sand: { dot: 'bg-sand-400', bg: 'bg-sand-100', text: 'text-sand-500' },
}

const today = new Date()
const dayName = today.toLocaleDateString('es-CL', { weekday: 'long' })
const dayNumber = today.getDate()
const monthName = today.toLocaleDateString('es-CL', { month: 'long' })
</script>

<template>
  <div class="bg-white rounded-2xl border border-sand-200/60 shadow-card overflow-hidden">
    <div class="px-4 py-3 border-b border-sand-200/40">
      <div class="flex items-center justify-between">
        <h3 class="text-[12px] font-bold text-brand-950 tracking-tight">Agenda de hoy</h3>
        <span class="text-[10px] font-semibold text-sand-400 capitalize">{{ dayName }}</span>
      </div>
      <p class="text-[10px] text-sand-400 mt-0.5 font-medium">{{ dayNumber }} de {{ monthName }}</p>
    </div>
    <div class="px-4 py-3">
      <div class="space-y-3">
        <div
          v-for="(event, idx) in timelineEvents"
          :key="event.id"
          class="flex gap-3"
        >
          <!-- Time -->
          <div class="w-10 shrink-0 pt-0.5">
            <span class="text-[11px] font-bold text-sand-400 tabular-nums">{{ event.time }}</span>
          </div>

          <!-- Connector line -->
          <div class="flex flex-col items-center">
            <div :class="colorMap[event.color]?.dot || 'bg-sand-300'" class="w-2 h-2 rounded-full mt-1.5 shrink-0" />
            <div v-if="idx < timelineEvents.length - 1" class="w-px flex-1 bg-sand-200/60 my-1" />
          </div>

          <!-- Event card -->
          <div :class="colorMap[event.color]?.bg || 'bg-sand-50'" class="flex-1 rounded-xl px-3 py-2.5 mb-1">
            <p :class="colorMap[event.color]?.text || 'text-brand-950'" class="text-[12px] font-bold leading-tight">
              {{ event.title }}
            </p>
            <p class="text-[10px] text-sand-400 mt-0.5 leading-snug">{{ event.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
