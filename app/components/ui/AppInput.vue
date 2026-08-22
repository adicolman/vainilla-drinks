<script setup lang="ts">
const props = defineProps<{
  modelValue: string | number
  label?: string
  placeholder?: string
  type?: string
  error?: string
  helper?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const inputType = computed(() => props.type || 'text')
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" class="block text-sm font-medium text-brand-950">
      {{ label }}
    </label>
    <input
      :type="inputType"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full px-4 py-2.5 bg-white text-brand-950 text-sm rounded-xl border border-sand-200 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="text-xs text-danger">{{ error }}</p>
    <p v-else-if="helper" class="text-xs text-sand-400">{{ helper }}</p>
  </div>
</template>
