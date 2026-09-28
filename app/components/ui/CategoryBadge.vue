<script setup lang="ts">
const props = defineProps<{
  label: string
  color?: string
}>()

const colorClasses: Record<string, string> = {
  blue: 'bg-neon-cyan-soft text-neon-cyan',
  green: 'bg-success-soft text-success',
  red: 'bg-danger-soft text-danger',
  yellow: 'bg-warning-soft text-warning',
  purple: 'bg-neon-purple-soft text-neon-purple',
  gray: 'bg-sand-100 text-sand-400',
}

const computedClass = computed(() => colorClasses[props.color || 'blue'] || colorClasses.blue)
</script>

<template>
  <span
    :class="computedClass"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
  >
    {{ label }}
  </span>
</template>
