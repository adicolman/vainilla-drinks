<script setup lang="ts">
const props = defineProps<{
  label: string
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'neutral'
}>()

const variantClasses: Record<string, string> = {
  default: 'bg-sand-100 text-brand-950',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
  warning: 'bg-warning-soft text-warning',
  info: 'bg-neon-cyan-soft text-neon-cyan',
  neutral: 'bg-sand-100 text-sand-500',
}
</script>

<template>
  <span
    :class="variantClasses[variant || 'default']"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide"
  >
    {{ label }}
  </span>
</template>
