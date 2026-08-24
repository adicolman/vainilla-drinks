<script setup lang="ts">
withDefaults(defineProps<{
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'danger'
}>(), {
  variant: 'primary',
})
</script>

<template>
  <button
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="variant === 'danger'
      ? 'bg-danger hover:bg-danger-900 focus:ring-danger/30'
      : 'bg-brand-950 hover:bg-brand-900 focus:ring-brand-600/30'"
  >
    <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
    <slot />
  </button>
</template>
