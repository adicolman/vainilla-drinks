<script setup lang="ts">
const { sidebarOpen, isMobile, toggleSidebar } = useAppLayout()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
})

const searchQuery = ref('')
const showSearch = ref(false)
</script>

<template>
  <header class="sticky top-0 z-30 bg-sand-50/90 backdrop-blur-xl border-b border-sand-200/50">
    <div class="flex items-center h-16 px-4 sm:px-6 lg:px-8">
      <!-- Left: hamburger + greeting -->
      <div class="flex items-center gap-3 min-w-0 flex-shrink-0">
        <button
          class="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-sand-400 hover:bg-sand-100 hover:text-brand-950 transition-colors"
          @click="toggleSidebar"
        >
          <Icon name="lucide:menu" class="w-[18px] h-[18px]" />
        </button>

        <div class="hidden sm:block">
          <h1 class="text-[15px] font-bold text-brand-950 tracking-tight leading-none">
            {{ greeting }}
          </h1>
          <p class="text-[11px] text-sand-400 mt-1 font-medium leading-none">
            Vainilla Drinks — Panel de control
          </p>
        </div>

        <!-- Mobile brand -->
        <NuxtLink to="/dashboard" class="sm:hidden flex items-baseline gap-1 ml-1">
          <span class="text-[13px] font-bold tracking-[0.15em] uppercase text-brand-950">Vainilla</span>
          <span class="text-[13px] font-light tracking-[0.15em] uppercase text-sand-400">Drinks</span>
        </NuxtLink>
      </div>

      <!-- Center: search + period -->
      <div class="flex-1 flex items-center justify-center px-4 lg:px-8">
        <!-- Search bar -->
        <div class="hidden md:flex items-center w-full max-w-md">
          <div class="relative w-full">
            <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-300" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar..."
              class="w-full h-9 pl-9 pr-4 bg-sand-100/60 text-brand-950 text-[13px] rounded-lg border-0 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-600/15 focus:bg-white transition-all duration-200"
            />
          </div>
        </div>

        <!-- Mobile search toggle -->
        <button
          class="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-sand-400 hover:bg-sand-100 hover:text-brand-950 transition-colors"
          @click="showSearch = !showSearch"
        >
          <Icon name="lucide:search" class="w-[18px] h-[18px]" />
        </button>

        <!-- Period pills -->
        <div class="hidden lg:flex items-center gap-1 ml-4 bg-sand-100/50 rounded-lg p-0.5">
          <button class="px-3 py-1.5 text-[11px] font-semibold bg-white text-brand-950 rounded-md shadow-sm">
            Este mes
          </button>
          <button class="px-3 py-1.5 text-[11px] font-semibold text-sand-400 hover:text-brand-950 rounded-md transition-colors">
            30 días
          </button>
          <button class="px-3 py-1.5 text-[11px] font-semibold text-sand-400 hover:text-brand-950 rounded-md transition-colors">
            7 días
          </button>
        </div>
      </div>

      <!-- Right: actions -->
      <div class="flex items-center gap-1.5 flex-shrink-0">
        <!-- CTA -->
        <button class="hidden sm:inline-flex items-center gap-2 h-9 px-4 bg-brand-950 text-white text-[12px] font-semibold rounded-lg hover:bg-brand-900 transition-colors duration-200">
          <Icon name="lucide:plus" class="w-4 h-4" />
          Registrar gasto
        </button>

        <!-- Mobile CTA -->
        <button class="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-brand-950 text-white">
          <Icon name="lucide:plus" class="w-[18px] h-[18px]" />
        </button>

        <!-- Divider -->
        <div class="hidden sm:block w-px h-5 bg-sand-200/60 mx-1" />

        <!-- Notifications -->
        <button class="relative w-9 h-9 flex items-center justify-center rounded-lg text-sand-400 hover:bg-sand-100 hover:text-brand-950 transition-colors">
          <Icon name="lucide:bell" class="w-[18px] h-[18px]" />
          <span class="absolute top-2 right-2 w-1.5 h-1.5 bg-danger rounded-full" />
        </button>

        <!-- Avatar -->
        <button class="w-8 h-8 rounded-full bg-vanilla/20 flex items-center justify-center ring-1 ring-sand-200/60 hover:ring-brand-400/30 transition-all">
          <span class="text-[10px] font-bold text-brand-950">VD</span>
        </button>
      </div>
    </div>

    <!-- Mobile search (expandable) -->
    <Transition name="search">
      <div v-if="showSearch" class="md:hidden px-4 pb-3">
        <div class="relative">
          <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-300" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar..."
            class="w-full h-10 pl-9 pr-4 bg-sand-100/60 text-brand-950 text-[13px] rounded-xl border-0 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-600/15 focus:bg-white transition-all duration-200"
            autofocus
          />
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.search-enter-active,
.search-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.search-enter-from,
.search-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.search-enter-to,
.search-leave-from {
  opacity: 1;
  max-height: 60px;
}
</style>
