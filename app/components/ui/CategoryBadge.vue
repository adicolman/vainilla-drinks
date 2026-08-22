<script setup lang="ts">
const props = defineProps<{
  label: string
  color?: string
}>()

const colorClasses: Record<string, string> = {
  blue: 'bg-info-soft text-info',
  green: 'bg-success-soft text-success',
  red: 'bg-danger-soft text-danger',
  yellow: 'bg-warning-soft text-warning',
  purple: 'bg-sand-200 text-brand-900',
  gray: 'bg-sand-100 text-sand-400',
}

const computedClass = computed(() => colorClasses[props.color || 'blue'] || colorClasses.blue)
</script>

<template>
  <span
    :class="computedClass"
    class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium"
  >
    {{ label }}
  </span>
</template>
