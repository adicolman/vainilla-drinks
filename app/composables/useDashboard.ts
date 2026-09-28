import type { Database } from '~/types/database.types'

type InsumoRow = Database['public']['Tables']['insumos']['Row']
type CompraRow = Database['public']['Tables']['compras']['Row']
type VentaRow = Database['public']['Tables']['ventas']['Row']
type MovimientoCajaRow = Database['public']['Tables']['movimientos_caja']['Row']
type GastoRow = Database['public']['Tables']['movimientos_gasto']['Row']

interface EventoNegocio {
  id: string
  concepto: string
  categoria: 'Compra' | 'Venta' | 'Gasto' | 'Caja'
  fecha: string
  monto: number
  tipo: 'ingreso' | 'egreso'
}

export function useDashboard() {
  const client = useSupabaseClient<Database>()
  const { addToast } = useToast()

  const isLoading = useState('dashboard-loading', () => false)
  const insumos = useState<InsumoRow[]>('dashboard-insumos', () => [])
  const compras = useState<CompraRow[]>('dashboard-compras', () => [])
  const ventas = useState<VentaRow[]>('dashboard-ventas', () => [])
  const cajaMovimientos = useState<MovimientoCajaRow[]>('dashboard-caja', () => [])
  const gastos = useState<GastoRow[]>('dashboard-gastos', () => [])

  async function fetchAll() {
    isLoading.value = true

    const [insumosRes, comprasRes, ventasRes, cajaRes, gastosRes] = await Promise.all([
      client.from('insumos').select('*').eq('activo', true),
      client.from('compras').select('*').eq('estado', 'recibido').order('fecha', { ascending: false }),
      client.from('ventas').select('*').eq('estado', 'pagado').order('fecha', { ascending: false }).limit(50),
      client.from('movimientos_caja').select('*').order('fecha', { ascending: false }).limit(50),
      client.from('movimientos_gasto').select('*').order('fecha', { ascending: false }).limit(50),
    ])

    isLoading.value = false

    if (insumosRes.error) addToast('error', 'Error al cargar insumos', insumosRes.error.message)
    else insumos.value = insumosRes.data || []

    if (comprasRes.error) addToast('error', 'Error al cargar compras', comprasRes.error.message)
    else compras.value = comprasRes.data || []

    if (ventasRes.error) addToast('error', 'Error al cargar ventas', ventasRes.error.message)
    else ventas.value = (ventasRes.data || []) as unknown as VentaRow[]

    if (cajaRes.error) addToast('error', 'Error al cargar caja', cajaRes.error.message)
    else cajaMovimientos.value = (cajaRes.data || []) as unknown as MovimientoCajaRow[]

    if (gastosRes.error) addToast('error', 'Error al cargar gastos', gastosRes.error.message)
    else gastos.value = (gastosRes.data || []) as unknown as GastoRow[]
  }

  const hoy = new Date()
  const mesActual = hoy.getMonth()
  const anioActual = hoy.getFullYear()
  const mesAnteriorDate = new Date(anioActual, mesActual - 1, 1)

  function esDelMes(fecha: string, mes: number, anio: number) {
    const d = new Date(fecha)
    return d.getMonth() === mes && d.getFullYear() === anio
  }

  // ── Métricas principales ──

  const valorInventario = computed(() =>
    insumos.value.reduce((sum, i) => sum + (Number(i.costo_promedio) * Number(i.stock_actual)), 0)
  )

  const comprasEsteMes = computed(() =>
    compras.value
      .filter(c => esDelMes(c.fecha, mesActual, anioActual))
      .reduce((sum, c) => sum + Number(c.total), 0)
  )

  const comprasMesAnterior = computed(() =>
    compras.value
      .filter(c => esDelMes(c.fecha, mesAnteriorDate.getMonth(), mesAnteriorDate.getFullYear()))
      .reduce((sum, c) => sum + Number(c.total), 0)
  )

  const variacionCompras = computed(() => {
    if (comprasMesAnterior.value === 0) return 0
    return ((comprasEsteMes.value - comprasMesAnterior.value) / comprasMesAnterior.value) * 100
  })

  const insumosStockBajo = computed(() =>
    insumos.value.filter(i => Number(i.stock_actual) < Number(i.stock_minimo)).length
  )

  const ventasEsteMes = computed(() =>
    ventas.value
      .filter(v => esDelMes(v.fecha, mesActual, anioActual))
      .reduce((sum, v) => sum + Number(v.total), 0)
  )

  const ventasMesAnterior = computed(() =>
    ventas.value
      .filter(v => esDelMes(v.fecha, mesAnteriorDate.getMonth(), mesAnteriorDate.getFullYear()))
      .reduce((sum, v) => sum + Number(v.total), 0)
  )

  const variacionVentas = computed(() => {
    if (ventasMesAnterior.value === 0) return ventasEsteMes.value > 0 ? 100 : 0
    return ((ventasEsteMes.value - ventasMesAnterior.value) / ventasMesAnterior.value) * 100
  })

  const gastosEsteMes = computed(() =>
    gastos.value
      .filter(g => esDelMes(g.fecha, mesActual, anioActual))
      .reduce((sum, g) => sum + Number(g.monto), 0)
  )

  const cajaSaldo = computed(() =>
    cajaMovimientos.value.reduce((sum, m) => sum + (m.tipo === 'ingreso' ? Number(m.monto) : -Number(m.monto)), 0)
  )

  const cajaIngresosMes = computed(() =>
    cajaMovimientos.value
      .filter(m => m.tipo === 'ingreso' && esDelMes(m.fecha, mesActual, anioActual))
      .reduce((sum, m) => sum + Number(m.monto), 0)
  )

  const cajaEgresosMes = computed(() =>
    cajaMovimientos.value
      .filter(m => m.tipo === 'egreso' && esDelMes(m.fecha, mesActual, anioActual))
      .reduce((sum, m) => sum + Number(m.monto), 0)
  )

  // ── Gráfico: compras por semana del mes actual ──

  const comprasPorSemana = computed(() => {
    const semanas = [0, 0, 0, 0, 0] // hasta 5 semanas por mes
    compras.value
      .filter(c => esDelMes(c.fecha, mesActual, anioActual))
      .forEach(c => {
        const dia = new Date(c.fecha).getDate()
        const semanaIdx = Math.min(Math.floor((dia - 1) / 7), 4)
        semanas[semanaIdx] = (semanas[semanaIdx] ?? 0) + Number(c.total)
      })
    // Recortar semanas vacías al final
    let ultimaConDatos = 0
    semanas.forEach((v, i) => { if (v > 0) ultimaConDatos = i })
    return {
      labels: semanas.slice(0, ultimaConDatos + 1).map((_, i) => `Sem ${i + 1}`),
      data: semanas.slice(0, ultimaConDatos + 1),
    }
  })

  // ── Eventos de negocio (compras + ventas + gastos + caja) ──

  const eventosRecientes = computed<EventoNegocio[]>(() => {
    const eventosCompras: EventoNegocio[] = compras.value.map(c => ({
      id: `compra-${c.id}`,
      concepto: `Compra a ${c.proveedor_nombre || 'proveedor'}`,
      categoria: 'Compra',
      fecha: c.fecha,
      monto: Number(c.total),
      tipo: 'egreso',
    }))

    const eventosVentas: EventoNegocio[] = ventas.value.map(v => ({
      id: `venta-${v.id}`,
      concepto: `Venta $${Number(v.total).toLocaleString('es-AR')}`,
      categoria: 'Venta',
      fecha: v.fecha,
      monto: Number(v.total),
      tipo: 'ingreso',
    }))

    const eventosGastos: EventoNegocio[] = gastos.value.map(g => ({
      id: `gasto-${g.id}`,
      concepto: `Gasto: ${g.concepto}`,
      categoria: 'Gasto',
      fecha: g.fecha,
      monto: Number(g.monto),
      tipo: 'egreso',
    }))

    const eventosCaja: EventoNegocio[] = cajaMovimientos.value
      .filter(m => !['venta', 'compra', 'gasto'].includes(m.referencia_tipo || ''))
      .map(m => ({
        id: `caja-${m.id}`,
        concepto: m.concepto,
        categoria: 'Caja',
        fecha: m.fecha,
        monto: Number(m.monto),
        tipo: m.tipo as 'ingreso' | 'egreso',
      }))

    return [...eventosCompras, ...eventosVentas, ...eventosGastos, ...eventosCaja]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  })

  const eventosHoy = computed(() => {
    const hoyStr = hoy.toISOString().slice(0, 10)
    return eventosRecientes.value.filter(e => e.fecha?.startsWith(hoyStr))
  })

  const diasConEventosEsteMes = computed(() => {
    const dias = new Set<number>()
    eventosRecientes.value.forEach(e => {
      const d = new Date(e.fecha)
      if (d.getMonth() === mesActual && d.getFullYear() === anioActual) {
        dias.add(d.getDate())
      }
    })
    return Array.from(dias)
  })

  return {
    isLoading,
    fetchAll,
    valorInventario,
    comprasEsteMes,
    comprasMesAnterior,
    variacionCompras,
    insumosStockBajo,
    ventasEsteMes,
    ventasMesAnterior,
    variacionVentas,
    gastosEsteMes,
    cajaSaldo,
    cajaIngresosMes,
    cajaEgresosMes,
    comprasPorSemana,
    eventosRecientes,
    eventosHoy,
    diasConEventosEsteMes,
  }
}
