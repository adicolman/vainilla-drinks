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
      { label: 'Ventas', icon: 'lucide:shopping-cart', to: '/ventas' },
      { label: 'Recetas', icon: 'lucide:chef-hat', to: '/recetas' },
      { label: 'Producción', icon: 'lucide:flask-conical', to: '/produccion' },
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
  {
    label: 'Herramientas',
    items: [
      { label: 'Proveedores', icon: 'lucide:users', to: '/proveedores' },
      { label: 'Configuración', icon: 'lucide:settings', to: '/configuracion' },
    ],
  },
]

const { logout } = useAuth()

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
          ? 'opacity-100'
          : 'opacity-0 pointer-events-none',
    ]"
    class="fixed top-3 left-3 bottom-3 z-50 w-[252px] flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ease-in-out
           bg-brand-950 text-white
           border border-white/[0.08]"
  >
    <!-- Brand -->
    <div class="px-5 pt-6 pb-1">
      <NuxtLink to="/dashboard" class="block" @click="closeMobileMenu">
        <div class="flex items-center justify-center">
          <span class="text-[17px] font-bold tracking-[0.16em] uppercase text-white">
            Vainilla
          </span>
          <span class="text-[17px] font-light tracking-[0.16em] uppercase text-brand-400 ml-1">
            Drinks
          </span>
        </div>
      </NuxtLink>
    </div>

    <!-- Main Navigation -->
    <nav class="flex-1 overflow-y-auto px-3 pt-4 pb-2">
      <div v-for="(group, gi) in mainNav" :key="group.label" :class="gi > 0 ? 'mt-6' : ''">
        <p class="px-4 mb-2 text-[10px] font-semibold tracking-[0.20em] uppercase text-brand-400/35">
          {{ group.label }}
        </p>
        <ul class="space-y-0.5">
          <li v-for="item in group.items" :key="item.to">
            <NuxtLink
              :to="item.to"
              :class="[
                isActive(item.to)
                  ? 'bg-white/[0.08] text-white'
                  : 'text-brand-400/60 hover:text-white/85 hover:bg-white/[0.03]',
              ]"
              class="group flex items-center gap-3 px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-150"
              @click="closeMobileMenu"
            >
              <Icon
                :name="item.icon"
                :class="isActive(item.to) ? 'text-white' : 'text-brand-400/50 group-hover:text-brand-400/80'"
                class="w-[17px] h-[17px] shrink-0 transition-colors duration-150"
              />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Bottom: Cerrar sesión -->
    <div class="px-3 pb-3 pt-2">
      <div class="h-px bg-white/[0.06] mx-2 mb-2" />
      <button
        class="group flex items-center gap-3 px-4 py-2 rounded-lg text-[13px] font-medium text-brand-400/50 hover:text-white/85 hover:bg-white/[0.03] transition-all duration-150 w-full text-left"
        @click="logout(); closeMobileMenu()"
      >
        <Icon
          name="lucide:log-out"
          class="w-[17px] h-[17px] shrink-0 text-brand-400/40 group-hover:text-brand-400/80 transition-colors duration-150"
        />
        <span>Cerrar sesión</span>
      </button>
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
