<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title?: string
  side?: 'left' | 'right'
}>()

const emit = defineEmits<{
  close: []
}>()

function onBackdropClick() {
  emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-brand-950/40 backdrop-blur-sm" @click="onBackdropClick" />
        <div
          :class="side === 'left' ? 'left-0' : 'right-0'"
          class="absolute inset-y-0 w-full max-w-md bg-white shadow-elevated border-sand-200/60 flex flex-col border-l"
        >
          <div v-if="title" class="flex items-center justify-between px-6 py-4 border-b border-sand-200/40">
            <h2 class="text-lg font-semibold text-brand-950">{{ title }}</h2>
            <IconButton icon="lucide:x" size="sm" @click="emit('close')" />
          </div>
          <div class="flex-1 overflow-auto p-6">
            <slot />
          </div>
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-sand-200/40 bg-sand-50/60">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-enter-active .absolute:last-child,
.drawer-leave-active .absolute:last-child {
  transition: transform 0.3s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from .absolute:last-child {
  transform: translateX(100%);
}
.drawer-leave-to .absolute:last-child {
  transform: translateX(100%);
}
</style>
