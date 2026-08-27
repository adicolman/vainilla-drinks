import type { Database } from '~/types/database.types'

type InsumoRow = Database['public']['Tables']['insumos']['Row']
type CompraConDetalle = {
  id: string
  proveedor_nombre: string
  fecha: string
  total: number
  medio_pago: string
  estado: string
  compra_items: {
    insumo_id: string
    cantidad: number
    costo_unitario: number
    subtotal: number
    insumo: { id: string; nombre: string; categoria: string } | null
  }[]
}
type ProduccionRow = Database['public']['Tables']['produccion']['Row']
type MovimientoRow = Database['public']['Tables']['movimientos_stock']['Row']

export function useReportes() {
  const client = useSupabaseClient<Database>()
  const { addToast } = useToast()
  const { profile } = useAuth()

  const insumos = ref<InsumoRow[]>([])
  const compras = ref<CompraConDetalle[]>([])
  const produccion = ref<ProduccionRow[]>([])
  const movimientos = ref<MovimientoRow[]>([])
  const isLoading = ref(false)

  async function fetchAll() {
    isLoading.value = true
    const orgId = profile.value?.organization_id

    const [insumosRes, comprasRes, prodRes, movRes] = await Promise.all([
      client.from('insumos').select('*').eq('activo', true).order('nombre'),
      client.from('compras').select('*, compra_items(*, insumo:insumos(id, nombre, categoria))').order('fecha', { ascending: false }),
      client.from('produccion').select('*').order('fecha', { ascending: false }),
      client.from('movimientos_stock').select('*').order('created_at', { ascending: false }).limit(200),
    ])

    isLoading.value = false

    if (insumosRes.error) addToast('error', 'Error al cargar insumos', insumosRes.error.message)
    else insumos.value = insumosRes.data || []

    if (comprasRes.error) addToast('error', 'Error al cargar compras', comprasRes.error.message)
    else compras.value = (comprasRes.data || []) as unknown as CompraConDetalle[]

    if (prodRes.error) addToast('error', 'Error al cargar producciones', prodRes.error.message)
    else produccion.value = prodRes.data || []

    if (movRes.error) addToast('error', 'Error al cargar movimientos', movRes.error.message)
    else movimientos.value = movRes.data || []
  }

  // ── Costos ──

  const valorTotalInventario = computed(() =>
    insumos.value.reduce((sum, i) => sum + (Number(i.costo_promedio) * Number(i.stock_actual)), 0)
  )

  const costoPorCategoria = computed(() => {
    const map = new Map<string, number>()
    insumos.value.forEach(i => {
      const cat = i.categoria || 'General'
      map.set(cat, (map.get(cat) || 0) + (Number(i.costo_promedio) * Number(i.stock_actual)))
    })
    return Array.from(map.entries())
      .map(([nombre, valor]) => ({ nombre, valor }))
      .sort((a, b) => b.valor - a.valor)
  })

  const topInsumosPorCosto = computed(() =>
    [...insumos.value]
      .filter(i => i.cantidad_por_unidad && Number(i.cantidad_por_unidad) > 0)
      .map(i => ({
        ...i,
        costo_por_unidad: Number(i.costo_unitario) / Number(i.cantidad_por_unidad),
      }))
      .sort((a, b) => b.costo_por_unidad - a.costo_por_unidad)
      .slice(0, 5)
  )

  // ── Compras ──

  const totalGastado = computed(() =>
    compras.value
      .filter(c => c.estado !== 'cancelado')
      .reduce((sum, c) => sum + Number(c.total), 0)
  )

  const comprasPorProveedor = computed(() => {
    const map = new Map<string, { count: number; total: number }>()
    compras.value
      .filter(c => c.estado !== 'cancelado')
      .forEach(c => {
        const key = c.proveedor_nombre || 'Sin proveedor'
        const prev = map.get(key) || { count: 0, total: 0 }
        map.set(key, { count: prev.count + 1, total: prev.total + Number(c.total) })
      })
    return Array.from(map.entries())
      .map(([proveedor, data]) => ({ proveedor, ...data }))
      .sort((a, b) => b.total - a.total)
  })

  const comprasPorMes = computed(() => {
    const map = new Map<string, number>()
    compras.value
      .filter(c => c.estado !== 'cancelado')
      .forEach(c => {
        const mes = c.fecha?.substring(0, 7) || 'Sin fecha'
        map.set(mes, (map.get(mes) || 0) + Number(c.total))
      })
    return Array.from(map.entries())
      .map(([mes, total]) => ({ mes, total }))
      .sort((a, b) => a.mes.localeCompare(b.mes))
  })

  const gastoPorCategoriaInsumo = computed(() => {
    const map = new Map<string, number>()
    compras.value
      .filter(c => c.estado !== 'cancelado')
      .forEach(c => {
        c.compra_items?.forEach(item => {
          const cat = item.insumo?.categoria || 'General'
          map.set(cat, (map.get(cat) || 0) + Number(item.subtotal))
        })
      })
    return Array.from(map.entries())
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total)
  })

  // ── Producción ──

  const totalProducido = computed(() =>
    produccion.value.reduce((sum, p) => sum + Number(p.cantidad_producida), 0)
  )

  const costoTotalProduccion = computed(() =>
    produccion.value.reduce((sum, p) => sum + Number(p.costo_total), 0)
  )

  // ── Stock ──

  const stockEstado = computed(() => {
    let ok = 0, bajo = 0, agotado = 0
    insumos.value.forEach(i => {
      const stock = Number(i.stock_actual)
      const min = Number(i.stock_minimo)
      if (stock <= 0) agotado++
      else if (stock < min) bajo++
      else ok++
    })
    return { ok, bajo, agotado }
  })

  const insumosStock = computed(() =>
    insumos.value.map(i => {
      const stock = Number(i.stock_actual)
      const min = Number(i.stock_minimo)
      let estado: 'ok' | 'bajo' | 'agotado' = 'ok'
      if (stock <= 0) estado = 'agotado'
      else if (stock < min) estado = 'bajo'
      return {
        ...i,
        estado,
        valor_total: stock * Number(i.costo_promedio),
      }
    }).sort((a, b) => {
      const order = { agotado: 0, bajo: 1, ok: 2 }
      return order[a.estado] - order[b.estado]
    })
  )

  const movimientosRecientes = computed(() =>
    movimientos.value.slice(0, 50)
  )

  return {
    isLoading,
    insumos,
    compras,
    produccion,
    movimientos,
    fetchAll,
    // Costos
    valorTotalInventario,
    costoPorCategoria,
    topInsumosPorCosto,
    // Compras
    totalGastado,
    comprasPorProveedor,
    comprasPorMes,
    gastoPorCategoriaInsumo,
    // Producción
    totalProducido,
    costoTotalProduccion,
    // Stock
    stockEstado,
    insumosStock,
    movimientosRecientes,
  }
}
