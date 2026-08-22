<script setup lang="ts">
defineProps<{
  icon: string
  disabled?: boolean
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <button
    :disabled="disabled"
    :class="[
      size === 'sm' ? 'w-8 h-8' : 'w-10 h-10',
    ]"
    class="inline-flex items-center justify-center rounded-lg text-sand-400 hover:bg-sand-100 hover:text-brand-950 focus:outline-none focus:ring-2 focus:ring-brand-600/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <Icon :name="icon" :class="size === 'sm' ? 'w-4 h-4' : 'w-[18px] h-[18px]'" />
  </button>
</template>
