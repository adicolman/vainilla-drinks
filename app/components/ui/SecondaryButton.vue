<script setup lang="ts">
defineProps<{
  disabled?: boolean
}>()
</script>

<template>
  <button
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-brand-950 text-sm font-semibold rounded-xl border border-sand-200 hover:bg-sand-100/50 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <slot />
  </button>
</template>
