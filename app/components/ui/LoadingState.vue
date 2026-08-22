<script setup lang="ts">
defineProps<{
  lines?: number
  type?: 'text' | 'card' | 'table'
}>()
</script>

<template>
  <div v-if="type === 'card'" class="space-y-3">
    <div class="h-3.5 bg-sand-100 rounded-lg w-1/3 animate-pulse" />
    <div class="h-7 bg-sand-100 rounded-lg w-1/2 animate-pulse" />
    <div class="h-3 bg-sand-100 rounded-lg w-2/3 animate-pulse" />
  </div>
  <div v-else-if="type === 'table'" class="space-y-3">
    <div v-for="i in (lines || 5)" :key="i" class="flex items-center gap-4">
      <div class="h-3.5 bg-sand-100 rounded-lg flex-1 animate-pulse" />
      <div class="h-3.5 bg-sand-100 rounded-lg w-24 animate-pulse" />
      <div class="h-3.5 bg-sand-100 rounded-lg w-16 animate-pulse" />
    </div>
  </div>
  <div v-else class="space-y-2.5">
    <div v-for="i in (lines || 3)" :key="i" class="h-3.5 bg-sand-100 rounded-lg animate-pulse" :style="{ width: `${100 - (i * 15)}%` }" />
  </div>
</template>
