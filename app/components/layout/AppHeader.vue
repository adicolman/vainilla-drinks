<script setup lang="ts">
const { sidebarOpen, isMobile, toggleSidebar } = useAppLayout()
const { profile } = useAuth()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
})

const displayName = computed(() => {
  if (profile.value?.nombre) {
    return profile.value.nombre.split(' ')[0]
  }
  return 'Admin'
})

const searchQuery = ref('')
const showSearch = ref(false)
</script>

<template>
  <header class="sticky top-0 z-30 bg-sand-50/90 backdrop-blur-xl">
    <!-- Top bar: search + actions -->
    <div class="flex items-center h-14 px-4 sm:px-6 lg:px-8 border-b border-sand-200/50">
      <!-- Left: hamburger (mobile only) -->
      <button
        class="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-sand-400 hover:bg-sand-100 hover:text-brand-950 transition-colors mr-3"
        @click="toggleSidebar"
      >
        <Icon name="lucide:menu" class="w-[18px] h-[18px]" />
      </button>

      <!-- Mobile brand -->
      <NuxtLink to="/dashboard" class="sm:hidden flex items-baseline gap-1 mr-3">
        <span class="text-[13px] font-bold tracking-[0.15em] uppercase text-brand-950">Vainilla</span>
        <span class="text-[13px] font-light tracking-[0.15em] uppercase text-sand-400">Drinks</span>
      </NuxtLink>

      <!-- Search bar -->
      <div class="hidden md:flex items-center flex-1 max-w-md">
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

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Right: period pills (desktop) + icons -->
      <div class="flex items-center gap-2">
        <!-- Period pills -->
        <div class="hidden lg:flex items-center gap-1 bg-sand-100/50 rounded-lg p-0.5">
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

        <!-- CTA button (desktop) -->
        <button class="hidden sm:inline-flex items-center gap-2 h-9 px-4 bg-brand-950 text-white text-[12px] font-semibold rounded-lg hover:bg-brand-900 transition-colors duration-200">
          <Icon name="lucide:plus" class="w-4 h-4" />
          Registrar gasto
        </button>

        <!-- Mobile CTA -->
        <button class="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-brand-950 text-white">
          <Icon name="lucide:plus" class="w-[18px] h-[18px]" />
        </button>

        <!-- Divider -->
        <div class="hidden sm:block w-px h-5 bg-sand-200/60" />

        <!-- Notifications -->
        <button class="relative w-9 h-9 flex items-center justify-center rounded-full bg-sand-100 text-sand-500 hover:bg-sand-200 hover:text-brand-950 transition-colors">
          <Icon name="lucide:bell" class="w-[18px] h-[18px]" />
          <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger rounded-full" />
        </button>

        <!-- Profile avatar -->
        <button class="w-9 h-9 rounded-full bg-sand-100 flex items-center justify-center text-sand-500 hover:bg-sand-200 hover:text-brand-950 transition-colors">
          <Icon name="lucide:user" class="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>

    <!-- Greeting row -->
    <div class="hidden sm:flex items-end justify-between px-4 sm:px-6 lg:px-8 py-6">
      <div>
        <h1 class="text-[28px] font-bold text-brand-950 tracking-[-0.02em] leading-none">
          {{ greeting }}, <span class="text-brand-600">{{ displayName }}</span>
        </h1>
        <p class="text-[13px] text-sand-400 mt-2.5 leading-relaxed max-w-lg">
          Resumen de tu negocio hoy. Revisa ventas, inventario y pedidos pendientes para mantener todo en orden.
        </p>
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
