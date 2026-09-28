<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  actionLabel?: string
  actionTo?: string
}>()
</script>

<template>
  <div class="bg-white rounded-2xl border border-sand-200/60 shadow-card overflow-hidden hover:shadow-neon-pink transition-shadow duration-300">
    <div class="px-7 py-5 border-b border-sand-200/30">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-[15px] font-bold text-brand-950">{{ title }}</h3>
          <p v-if="subtitle" class="text-[12px] text-sand-400 mt-0.5 font-medium">{{ subtitle }}</p>
        </div>
        <NuxtLink
          v-if="actionLabel && actionTo"
          :to="actionTo"
          class="text-[12px] font-semibold text-neon-pink hover:text-neon-pink/80 transition-colors"
        >
          {{ actionLabel }}
        </NuxtLink>
      </div>
    </div>
    <div class="p-7">
      <slot />
    </div>
  </div>
</template>
