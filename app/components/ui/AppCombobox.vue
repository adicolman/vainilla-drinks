<script setup lang="ts">
interface Option {
  value: string | number
  label: string
}

const props = defineProps<{
  modelValue: string | number
  options: Option[]
  label?: string
  placeholder?: string
  searchPlaceholder?: string
  error?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

const selectedLabel = computed(() => {
  const opt = props.options.find(o => o.value === props.modelValue)
  return opt?.label || ''
})

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  const q = searchQuery.value.toLowerCase()
  return props.options.filter(o => o.label.toLowerCase().includes(q))
})

function selectOption(value: string | number) {
  emit('update:modelValue', value)
  isOpen.value = false
  searchQuery.value = ''
}

function toggleOpen() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => searchInput.value?.focus())
  }
}

function onClickOutside(e: Event) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false
    searchQuery.value = ''
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" class="block text-sm font-medium text-brand-950">
      {{ label }}
    </label>
    <div ref="containerRef" class="relative">
      <!-- Trigger -->
      <button
        type="button"
        :disabled="disabled"
        class="w-full px-4 py-2.5 bg-white text-brand-950 text-sm rounded-lg border border-sand-200 text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer pr-8 bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2020%2020%27%20fill%3D%27%23B0A694%27%3E%3Cpath%20fill-rule%3D%27evenodd%27%20d%3D%27M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%27%20clip-rule%3D%27evenodd%27%2F%3E%3C%2Fsvg%3E')]"
        :class="isOpen ? 'ring-2 ring-neon-pink/20 border-neon-pink/40' : ''"
        @click="toggleOpen"
      >
        <span v-if="selectedLabel" class="truncate block">{{ selectedLabel }}</span>
        <span v-else class="text-sand-300">{{ placeholder || 'Seleccionar...' }}</span>
      </button>

      <!-- Dropdown -->
      <Transition name="dropdown">
        <div
          v-if="isOpen"
          class="absolute z-50 mt-1 w-full bg-white rounded-xl border border-sand-200/60 shadow-elevated overflow-hidden"
        >
          <!-- Search input -->
          <div class="p-2 border-b border-sand-100">
            <div class="relative">
              <Icon name="lucide:search" class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sand-300" />
              <input
                ref="searchInput"
                v-model="searchQuery"
                type="text"
                :placeholder="searchPlaceholder || 'Buscar...'"
                class="w-full h-8 pl-8 pr-3 bg-sand-50 text-brand-950 text-[13px] rounded-lg border-0 placeholder:text-sand-300 focus:outline-none focus:ring-1 focus:ring-neon-pink/20"
              />
            </div>
          </div>

          <!-- Options list -->
          <div class="max-h-48 overflow-y-auto">
            <button
              v-for="option in filteredOptions"
              :key="option.value"
              type="button"
              class="w-full text-left px-4 py-2 text-[13px] hover:bg-sand-50 transition-colors"
              :class="option.value === modelValue ? 'bg-neon-pink/5 text-neon-pink font-medium' : 'text-brand-950'"
              @click="selectOption(option.value)"
            >
              {{ option.label }}
            </button>
            <div v-if="filteredOptions.length === 0" class="px-4 py-3 text-center">
              <p class="text-[12px] text-sand-400">Sin resultados</p>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    <p v-if="error" class="text-xs text-danger">{{ error }}</p>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
