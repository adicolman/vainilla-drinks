import type { Database } from '~/types/database.types'

type InsumoRow = Database['public']['Tables']['insumos']['Row']
type CompraRow = Database['public']['Tables']['compras']['Row']
type ProduccionRow = Database['public']['Tables']['produccion']['Row']

interface EventoNegocio {
  id: string
  concepto: string
  categoria: 'Compra' | 'Producción'
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
  const produccion = useState<(ProduccionRow & { receta: { nombre: string } | null })[]>('dashboard-produccion', () => [])

  async function fetchAll() {
    isLoading.value = true

    const [insumosRes, comprasRes, produccionRes] = await Promise.all([
      client.from('insumos').select('*').eq('activo', true),
      client.from('compras').select('*').eq('estado', 'recibido').order('fecha', { ascending: false }),
      client.from('produccion').select('*, receta:recetas(nombre)').order('fecha', { ascending: false }).limit(50),
    ])

    isLoading.value = false

    if (insumosRes.error) addToast('error', 'Error al cargar insumos', insumosRes.error.message)
    else insumos.value = insumosRes.data || []

    if (comprasRes.error) addToast('error', 'Error al cargar compras', comprasRes.error.message)
    else compras.value = comprasRes.data || []

    if (produccionRes.error) addToast('error', 'Error al cargar producción', produccionRes.error.message)
    else produccion.value = (produccionRes.data || []) as unknown as (ProduccionRow & { receta: { nombre: string } | null })[]
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

  // ── Gráfico: compras por semana del mes actual ──

  const comprasPorSemana = computed(() => {
    const semanas = [0, 0, 0, 0, 0] // hasta 5 semanas por mes
    compras.value
      .filter(c => esDelMes(c.fecha, mesActual, anioActual))
      .forEach(c => {
        const dia = new Date(c.fecha).getDate()
        const semanaIdx = Math.min(Math.floor((dia - 1) / 7), 4)
        semanas[semanaIdx] += Number(c.total)
      })
    // Recortar semanas vacías al final
    let ultimaConDatos = 0
    semanas.forEach((v, i) => { if (v > 0) ultimaConDatos = i })
    return {
      labels: semanas.slice(0, ultimaConDatos + 1).map((_, i) => `Sem ${i + 1}`),
      data: semanas.slice(0, ultimaConDatos + 1),
    }
  })

  // ── Eventos de negocio (compras + producción combinados) ──

  const eventosRecientes = computed<EventoNegocio[]>(() => {
    const eventosCompras: EventoNegocio[] = compras.value.map(c => ({
      id: `compra-${c.id}`,
      concepto: `Compra a ${c.proveedor_nombre || 'proveedor'}`,
      categoria: 'Compra',
      fecha: c.fecha,
      monto: Number(c.total),
      tipo: 'egreso',
    }))

    const eventosProduccion: EventoNegocio[] = produccion.value.map(p => ({
      id: `produccion-${p.id}`,
      concepto: `Producción: ${p.receta?.nombre || 'receta'}`,
      categoria: 'Producción',
      fecha: p.fecha,
      monto: Number(p.costo_total),
      tipo: 'egreso',
    }))

    return [...eventosCompras, ...eventosProduccion]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  })

  const eventosHoy = computed(() => {
    const hoyStr = hoy.toISOString().split('T')[0]
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
    comprasPorSemana,
    eventosRecientes,
    eventosHoy,
    diasConEventosEsteMes,
  }
}
