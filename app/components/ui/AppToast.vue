<script setup lang="ts">
const { toasts, removeToast } = useToast()

const iconMap: Record<string, string> = {
  success: 'lucide:check-circle',
  error: 'lucide:x-circle',
  warning: 'lucide:alert-triangle',
  info: 'lucide:info',
}

const colorMap: Record<string, string> = {
  success: 'border-success/30 bg-success-soft',
  error: 'border-danger/30 bg-danger-soft',
  warning: 'border-warning/30 bg-warning-soft',
  info: 'border-info/30 bg-info-soft',
}

const iconColorMap: Record<string, string> = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
}


</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="colorMap[toast.type]"
          class="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-elevated max-w-sm"
        >
          <Icon :name="iconMap[toast.type]" :class="iconColorMap[toast.type]" class="w-5 h-5 mt-0.5 shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-brand-950">{{ toast.title }}</p>
            <p v-if="toast.message" class="text-xs text-sand-400 mt-0.5">{{ toast.message }}</p>
          </div>
          <button class="text-sand-400 hover:text-brand-950 transition-colors shrink-0" @click="removeToast(toast.id)">
            <Icon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
