<script setup lang="ts">
const route = useRoute()
const { isMobile } = useAppLayout()

interface MobileNavItem {
  label: string
  icon: string
  to: string
}

const navItems: MobileNavItem[] = [
  { label: 'Inicio', icon: 'lucide:layout-dashboard', to: '/dashboard' },
  { label: 'Ventas', icon: 'lucide:shopping-cart', to: '/ventas' },
  { label: 'Recetas', icon: 'lucide:chef-hat', to: '/recetas' },
  { label: 'Stock', icon: 'lucide:package', to: '/inventario' },
  { label: 'Más', icon: 'lucide:more-horizontal', to: '/gastos' },
]

function isActive(to: string) {
  if (to === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(to)
}
</script>

<template>
  <nav
    v-if="isMobile"
    class="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-sand-200/50 px-1 pb-[env(safe-area-inset-bottom)]"
  >
    <ul class="flex items-center justify-around">
      <li v-for="item in navItems" :key="item.to">
        <NuxtLink
          :to="item.to"
          :class="[
            isActive(item.to)
              ? 'text-brand-950'
              : 'text-sand-400',
          ]"
          class="relative flex flex-col items-center gap-0.5 px-4 py-2 text-[10px] font-semibold transition-colors"
        >
          <div
            v-if="isActive(item.to)"
            class="absolute -top-px left-1/2 -translate-x-1/2 w-5 h-0.5 bg-brand-950 rounded-full"
          />
          <Icon :name="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
