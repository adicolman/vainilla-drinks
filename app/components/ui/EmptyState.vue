<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div class="w-14 h-14 rounded-2xl bg-sand-100 flex items-center justify-center mb-5">
      <Icon :name="icon || 'lucide:inbox'" class="w-6 h-6 text-sand-400" />
    </div>
    <h3 class="text-[15px] font-bold text-brand-950 mb-1.5">{{ title }}</h3>
    <p v-if="description" class="text-[13px] text-sand-400 max-w-xs font-medium">{{ description }}</p>
    <NuxtLink
      v-if="actionLabel && actionTo"
      :to="actionTo"
      class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-950 text-white text-[13px] font-semibold rounded-xl hover:bg-brand-900 transition-colors"
    >
      {{ actionLabel }}
    </NuxtLink>
  </div>
</template>
