<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  onRetry?: () => void
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div class="w-14 h-14 rounded-2xl bg-danger-soft flex items-center justify-center mb-5">
      <Icon name="lucide:alert-triangle" class="w-6 h-6 text-danger" />
    </div>
    <h3 class="text-[15px] font-bold text-brand-950 mb-1.5">{{ title || 'Algo salió mal' }}</h3>
    <p class="text-[13px] text-sand-400 max-w-xs font-medium">
      {{ description || 'Ocurrió un error inesperado. Intenta nuevamente.' }}
    </p>
    <button
      v-if="onRetry"
      class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-950 text-white text-[13px] font-semibold rounded-xl hover:bg-brand-900 transition-colors"
      @click="onRetry"
    >
      <Icon name="lucide:refresh-cw" class="w-4 h-4" />
      Reintentar
    </button>
  </div>
</template>
