import type { Database } from '~/types/database.types'

type MovimientoCajaRow = Database['public']['Tables']['movimientos_caja']['Row']
type MovimientoCajaInsert = Database['public']['Tables']['movimientos_caja']['Insert']

export type { MovimientoCajaRow }

export function useCaja() {
  const client = useSupabaseClient<Database>()
  const { addToast } = useToast()
  const { profile } = useAuth()

  const movimientos = useState<MovimientoCajaRow[]>('caja-movimientos', () => [])
  const isLoading = useState('caja-loading', () => false)
  const searchQuery = ref('')
  const filterTipo = ref('')
  const filterFechaDesde = ref('')
  const filterFechaHasta = ref('')

  const filteredMovimientos = computed(() => {
    let result = movimientos.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(m =>
        m.concepto?.toLowerCase().includes(q) ||
        m.referencia_tipo?.toLowerCase().includes(q)
      )
    }

    if (filterTipo.value) {
      result = result.filter(m => m.tipo === filterTipo.value)
    }

    if (filterFechaDesde.value) {
      result = result.filter(m => new Date(m.fecha) >= new Date(filterFechaDesde.value))
    }

    if (filterFechaHasta.value) {
      const hasta = new Date(filterFechaHasta.value)
      hasta.setHours(23, 59, 59, 999)
      result = result.filter(m => new Date(m.fecha) <= hasta)
    }

    return result
  })

  const resumen = computed(() => {
    const hoy = new Date().toISOString().split('T')[0]
    const all = movimientos.value

    const ingresosHoy = all
      .filter(m => m.tipo === 'ingreso' && m.fecha.startsWith(hoy))
      .reduce((sum, m) => sum + Number(m.monto), 0)

    const egresosHoy = all
      .filter(m => m.tipo === 'egreso' && m.fecha.startsWith(hoy))
      .reduce((sum, m) => sum + Number(m.monto), 0)

    const totalIngresos = all
      .filter(m => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + Number(m.monto), 0)

    const totalEgresos = all
      .filter(m => m.tipo === 'egreso')
      .reduce((sum, m) => sum + Number(m.monto), 0)

    return {
      ingresosHoy,
      egresosHoy,
      saldoHoy: ingresosHoy - egresosHoy,
      totalIngresos,
      totalEgresos,
      saldo: totalIngresos - totalEgresos,
    }
  })

  async function fetchMovimientos() {
    isLoading.value = true
    const { data, error } = await client
      .from('movimientos_caja')
      .select('*')
      .order('fecha', { ascending: false })

    isLoading.value = false

    if (error) {
      addToast('error', 'Error al cargar movimientos de caja', error.message)
      return
    }

    movimientos.value = (data || []) as MovimientoCajaRow[]
  }

  async function createMovimiento(
    tipo: 'ingreso' | 'egreso',
    concepto: string,
    monto: number,
    referenciaTipo?: string,
    referenciaId?: string
  ) {
    if (!profile.value) throw new Error('No hay usuario autenticado')

    const data: MovimientoCajaInsert = {
      organization_id: profile.value.organization_id,
      usuario_id: profile.value.id,
      tipo,
      concepto: concepto.trim(),
      monto,
      fecha: new Date().toISOString(),
      referencia_tipo: referenciaTipo || '',
      referencia_id: referenciaId || null,
      estado: 'confirmado',
    }

    const { error } = await client
      .from('movimientos_caja')
      .insert(data)

    if (error) {
      addToast('error', 'Error al registrar movimiento', error.message)
      throw error
    }

    addToast('success', tipo === 'ingreso' ? 'Ingreso registrado' : 'Egreso registrado', concepto.trim())
    await fetchMovimientos()
  }

  async function updateEstado(id: string, estado: string) {
    const { error } = await client
      .from('movimientos_caja')
      .update({ estado })
      .eq('id', id)

    if (error) {
      addToast('error', 'Error al actualizar movimiento', error.message)
      throw error
    }

    addToast('success', 'Movimiento actualizado', `Estado: ${estado}`)
    await fetchMovimientos()
  }

  return {
    movimientos,
    isLoading,
    searchQuery,
    filterTipo,
    filterFechaDesde,
    filterFechaHasta,
    filteredMovimientos,
    resumen,
    fetchMovimientos,
    createMovimiento,
    updateEstado,
  }
}
