<script setup lang="ts">
defineProps<{
  disabled?: boolean
  loading?: boolean
}>()
</script>

<template>
  <button
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-950 text-white text-sm font-semibold rounded-xl hover:bg-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
    <slot />
  </button>
</template>
