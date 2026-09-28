const searchQuery = ref('')
const activeModule = ref('')

const placeholders: Record<string, string> = {
  inventario: 'Buscar insumo...',
  recetas: 'Buscar receta...',
  compras: 'Buscar por proveedor...',
  gastos: 'Buscar por concepto...',
  ventas: 'Buscar por receta...',
  caja: 'Buscar por concepto...',
  proveedores: 'Buscar proveedor...',
  'consumo-diario': 'Buscar...',
  configuracion: 'Buscar...',
  reportes: 'Buscar...',
  dashboard: '',
}

export function useSearch() {
  const route = useRoute()

  const currentModule = computed(() => {
    const path = route.path.split('/')[1] || 'dashboard'
    return path
  })

  const placeholder = computed(() => placeholders[currentModule.value] || 'Buscar...')

  function setModule(mod: string) {
    activeModule.value = mod
  }

  function clearSearch() {
    searchQuery.value = ''
  }

  return {
    searchQuery,
    activeModule,
    currentModule,
    placeholder,
    setModule,
    clearSearch,
  }
}
