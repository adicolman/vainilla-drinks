<script setup lang="ts">
const route = useRoute()
const { sidebarOpen, mobileMenuOpen, isMobile, toggleSidebar, closeMobileMenu } = useAppLayout()

interface NavItem {
  label: string
  icon: string
  to: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const mainNav: NavGroup[] = [
  {
    label: 'General',
    items: [
      { label: 'Dashboard', icon: 'lucide:layout-dashboard', to: '/dashboard' },
    ],
  },
  {
    label: 'Operación',
    items: [
      { label: 'Ventas', icon: 'lucide:shopping-cart', to: '/ventas' },
      { label: 'Recetas', icon: 'lucide:chef-hat', to: '/recetas' },
      { label: 'Inventario', icon: 'lucide:package', to: '/inventario' },
      { label: 'Compras', icon: 'lucide:truck', to: '/compras' },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { label: 'Gastos', icon: 'lucide:receipt', to: '/gastos' },
      { label: 'Caja', icon: 'lucide:landmark', to: '/caja' },
      { label: 'Reportes', icon: 'lucide:bar-chart-3', to: '/reportes' },
    ],
  },
]

const bottomNav: NavItem[] = [
  { label: 'Proveedores', icon: 'lucide:users', to: '/proveedores' },
  { label: 'Configuración', icon: 'lucide:settings', to: '/configuracion' },
]

function isActive(to: string) {
  if (to === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(to)
}
</script>

<template>
  <!-- Mobile overlay -->
  <Transition name="overlay">
    <div
      v-if="isMobile && mobileMenuOpen"
      class="fixed inset-0 bg-brand-950/50 backdrop-blur-sm z-40 lg:hidden"
      @click="closeMobileMenu"
    />
  </Transition>

  <!-- Sidebar -->
  <aside
    :class="[
      isMobile
        ? mobileMenuOpen
          ? 'translate-x-0'
          : '-translate-x-full'
        : sidebarOpen
          ? 'w-[260px]'
          : 'w-0',
    ]"
    class="fixed inset-y-0 left-0 z-50 flex flex-col bg-brand-950 text-white transition-all duration-300 ease-in-out overflow-hidden"
    :style="{ minWidth: isMobile ? '280px' : undefined }"
  >
    <!-- Brand -->
    <div class="px-6 pt-7 pb-2">
      <NuxtLink to="/dashboard" class="block group" @click="closeMobileMenu">
        <div class="flex items-baseline gap-1.5">
          <span class="text-[16px] font-bold tracking-[0.18em] uppercase text-white">
            Vainilla
          </span>
          <span class="text-[16px] font-light tracking-[0.18em] uppercase text-brand-400 group-hover:text-white transition-colors duration-300">
            Drinks
          </span>
        </div>
        <div class="mt-2.5 h-px bg-gradient-to-r from-vanilla/30 via-brand-400/15 to-transparent" />
      </NuxtLink>
    </div>

    <!-- Main Navigation -->
    <nav class="flex-1 overflow-y-auto px-3 pt-4 pb-4">
      <div v-for="(group, gi) in mainNav" :key="group.label" :class="gi > 0 ? 'mt-7' : ''">
        <p class="px-4 mb-3 text-[10px] font-semibold tracking-[0.22em] uppercase text-brand-400/40">
          {{ group.label }}
        </p>
        <ul class="space-y-1">
          <li v-for="item in group.items" :key="item.to">
            <NuxtLink
              :to="item.to"
              :class="[
                isActive(item.to)
                  ? 'bg-white/[0.08] text-white'
                  : 'text-brand-400/70 hover:text-white/90 hover:bg-white/[0.03]',
              ]"
              class="group flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative"
              @click="closeMobileMenu"
            >
              <!-- Active indicator -->
              <div
                :class="isActive(item.to) ? 'opacity-100' : 'opacity-0'"
                class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-vanilla rounded-full transition-opacity duration-200"
              />
              <Icon
                :name="item.icon"
                :class="isActive(item.to) ? 'text-white' : 'text-brand-400/60 group-hover:text-brand-400/90'"
                class="w-[18px] h-[18px] shrink-0 transition-colors duration-200"
              />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Bottom Navigation -->
    <div class="px-3 pb-2">
      <div class="h-px bg-white/[0.06] mx-3 mb-3" />
      <ul class="space-y-1">
        <li v-for="item in bottomNav" :key="item.to">
          <NuxtLink
            :to="item.to"
            :class="[
              isActive(item.to)
                ? 'bg-white/[0.08] text-white'
                : 'text-brand-400/50 hover:text-white/80 hover:bg-white/[0.03]',
            ]"
            class="group flex items-center gap-3 px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-200"
            @click="closeMobileMenu"
          >
            <Icon
              :name="item.icon"
              class="w-[18px] h-[18px] shrink-0 text-brand-400/40 group-hover:text-brand-400/70 transition-colors duration-200"
            />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- User footer -->
    <div class="px-5 py-4 border-t border-white/[0.06]">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-vanilla/15 flex items-center justify-center ring-1 ring-vanilla/20">
          <span class="text-[10px] font-bold tracking-wider text-vanilla">VD</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-medium text-white/90 truncate">Admin</p>
          <p class="text-[11px] text-brand-400/40 truncate">Vainilla Drinks</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.2s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
