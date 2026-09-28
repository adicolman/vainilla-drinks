<script setup lang="ts">
const { sidebarOpen, isMobile, toggleSidebar } = useAppLayout()
const { profile, logout } = useAuth()
const route = useRoute()
const { addToast } = useToast()
const router = useRouter()
const { searchQuery, placeholder } = useSearch()

const isDashboard = computed(() => route.path === '/dashboard' || route.path === '/dashboard/')
const showNotifications = ref(false)
const showProfile = ref(false)

const needsSearch = computed(() => {
  const mod = route.path.split('/')[1]
  return ['inventario', 'recetas', 'compras', 'gastos', 'ventas', 'caja', 'proveedores'].includes(mod)
})

function handleNotifications() {
  showNotifications.value = !showNotifications.value
  showProfile.value = false
  if (showNotifications.value) addToast('info', 'Notificaciones', 'No tenés notificaciones nuevas')
}
function handleProfileToggle() {
  showProfile.value = !showProfile.value
  showNotifications.value = false
}
function goConfig() {
  showProfile.value = false
  router.push('/configuracion')
}
async function handleLogout() {
  showProfile.value = false
  await logout()
}
function handleRegistrarGasto() {
  router.push('/gastos')
}

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
</script>

<template>
  <header class="sticky top-0 z-30 bg-sand-50/90 backdrop-blur-xl">
    <!-- Top bar -->
    <div class="flex items-center h-14 px-4 sm:px-6 lg:px-8 border-b border-sand-200/30">
      <!-- Left: hamburger + brand -->
      <div class="flex items-center gap-3 shrink-0">
        <button
          class="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-sand-400 hover:bg-sand-100 hover:text-brand-950 transition-colors"
          @click="toggleSidebar"
        >
          <Icon name="lucide:menu" class="w-[18px] h-[18px]" />
        </button>
        <button
          v-if="!isMobile && !sidebarOpen"
          class="hidden lg:flex w-9 h-9 items-center justify-center rounded-lg text-sand-400 hover:bg-sand-100 hover:text-brand-950 transition-colors"
          title="Abrir navegación"
          @click="toggleSidebar"
        >
          <Icon name="lucide:panel-left-open" class="w-[18px] h-[18px]" />
        </button>
        <NuxtLink to="/dashboard" class="sm:hidden flex items-baseline gap-1">
          <span class="text-[13px] font-bold tracking-[0.15em] uppercase text-brand-950">Vainilla</span>
          <span class="text-[13px] font-light tracking-[0.15em] uppercase text-sand-400">Drinks</span>
        </NuxtLink>
      </div>

      <!-- Center: search bar (solo en módulos que lo necesitan) -->
      <div v-if="needsSearch" class="flex-1 flex justify-center px-4">
        <div class="relative w-full max-w-md">
          <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-300" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="placeholder"
            class="w-full h-9 pl-9 pr-4 bg-white text-brand-950 text-[13px] rounded-lg border border-sand-200 placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-neon-pink/20 focus:border-neon-pink/40 transition-all duration-200"
          />
        </div>
      </div>
      <div v-else class="flex-1" />

      <!-- Right: actions -->
      <div class="flex items-center gap-2 shrink-0">
        <button class="hidden sm:inline-flex items-center gap-2 h-9 px-4 bg-neon-pink text-white text-[12px] font-semibold rounded-lg hover:bg-neon-pink/90 transition-all duration-200 shadow-neon-pink hover:shadow-neon-pink-strong" @click="handleRegistrarGasto">
          <Icon name="lucide:plus" class="w-4 h-4" />
          Registrar gasto
        </button>
        <button class="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-neon-pink text-white shadow-neon-pink" @click="handleRegistrarGasto">
          <Icon name="lucide:plus" class="w-[18px] h-[18px]" />
        </button>

        <div class="hidden sm:block w-px h-5 bg-sand-200/60" />

        <div class="relative">
          <button class="relative w-9 h-9 flex items-center justify-center rounded-full bg-sand-100 text-sand-500 hover:bg-sand-200 hover:text-brand-950 transition-colors" @click="handleNotifications">
            <Icon name="lucide:bell" class="w-[18px] h-[18px]" />
            <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger rounded-full" />
          </button>
          <div v-if="showNotifications" class="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-sand-200/60 shadow-elevated p-4 z-50">
            <p class="text-[13px] font-semibold text-brand-950">Notificaciones</p>
            <p class="text-[12px] text-sand-400 mt-1">No tenés notificaciones — los alertas de stock bajo aparecen en el dashboard.</p>
            <NuxtLink to="/inventario" class="inline-block mt-3 text-[12px] font-semibold text-neon-pink hover:text-neon-pink/80" @click="showNotifications=false">Ver inventario →</NuxtLink>
          </div>
        </div>

        <div class="relative">
          <button class="w-9 h-9 rounded-full bg-sand-100 flex items-center justify-center text-sand-500 hover:bg-sand-200 hover:text-brand-950 transition-colors" @click="handleProfileToggle">
            <Icon name="lucide:user" class="w-[18px] h-[18px]" />
          </button>
          <div v-if="showProfile" class="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-sand-200/60 shadow-elevated py-2 z-50">
            <div class="px-4 py-2 border-b border-sand-100">
              <p class="text-[13px] font-semibold text-brand-950 truncate">{{ profile?.nombre || 'Admin' }}</p>
              <p class="text-[11px] text-sand-400 truncate">{{ profile?.email || '' }}</p>
            </div>
            <button class="w-full text-left px-4 py-2 text-[12px] font-medium text-sand-600 hover:bg-sand-50 hover:text-brand-950 flex items-center gap-2" @click="goConfig">
              <Icon name="lucide:settings" class="w-4 h-4" /> Configuración
            </button>
            <button class="w-full text-left px-4 py-2 text-[12px] font-medium text-danger hover:bg-danger-soft flex items-center gap-2" @click="handleLogout">
              <Icon name="lucide:log-out" class="w-4 h-4" /> Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Greeting row — solo dashboard -->
    <div v-if="isDashboard" class="hidden sm:flex items-end justify-between px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <h1 class="text-[28px] font-bold text-brand-950 tracking-[-0.02em] leading-none">
          {{ greeting }}, <span class="text-neon-pink">{{ displayName }}</span>
        </h1>
        <p class="text-[13px] text-sand-400 mt-2.5 leading-relaxed max-w-lg">
          Resumen de tu negocio hoy. Revisa ventas, inventario y pedidos pendientes para mantener todo en orden.
        </p>
      </div>
    </div>
  </header>
</template>
