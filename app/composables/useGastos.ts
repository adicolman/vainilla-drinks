import type { Database } from '~/types/database.types'

type GastoRow = Database['public']['Tables']['movimientos_gasto']['Row']
type GastoInsert = Database['public']['Tables']['movimientos_gasto']['Insert']
type MovimientoCajaInsert = Database['public']['Tables']['movimientos_caja']['Insert']
type ProveedorRow = Database['public']['Tables']['proveedores']['Row']

export type { GastoRow }

export function useGastos() {
  const client = useSupabaseClient<Database>()
  const { addToast } = useToast()
  const { profile } = useAuth()

  const gastos = ref<GastoRow[]>([])
  const proveedores = ref<ProveedorRow[]>([])
  const isLoading = useState('gastos-loading', () => false)
  const searchQuery = ref('')
  const filterCategoria = ref('')
  const filterFechaDesde = ref('')
  const filterFechaHasta = ref('')

  const filteredGastos = computed(() => {
    let result = gastos.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(g =>
        g.concepto?.toLowerCase().includes(q) ||
        g.descripcion?.toLowerCase().includes(q)
      )
    }

    if (filterCategoria.value) {
      result = result.filter(g => g.categoria === filterCategoria.value)
    }

    if (filterFechaDesde.value) {
      result = result.filter(g => new Date(g.fecha) >= new Date(filterFechaDesde.value))
    }

    if (filterFechaHasta.value) {
      const hasta = new Date(filterFechaHasta.value)
      hasta.setHours(23, 59, 59, 999)
      result = result.filter(g => new Date(g.fecha) <= hasta)
    }

    return result
  })

  const resumen = computed(() => {
    const all = gastos.value
    const total = all.reduce((sum, g) => sum + Number(g.monto), 0)

    const porCategoria = new Map<string, number>()
    all.forEach(g => {
      const cat = g.categoria || 'otros'
      porCategoria.set(cat, (porCategoria.get(cat) || 0) + Number(g.monto))
    })

    const categorias = Array.from(porCategoria.entries())
      .map(([nombre, monto]) => ({ nombre, monto }))
      .sort((a, b) => b.monto - a.monto)

    return { total, categorias }
  })

  async function fetchGastos() {
    isLoading.value = true
    const { data, error } = await client
      .from('movimientos_gasto')
      .select('*')
      .order('fecha', { ascending: false })

    isLoading.value = false

    if (error) {
      addToast('error', 'Error al cargar gastos', error.message)
      return
    }

    gastos.value = (data || []) as GastoRow[]
  }

  async function fetchProveedores() {
    const { data, error } = await client
      .from('proveedores')
      .select('*')
      .eq('activo', true)
      .order('nombre')

    if (!error) {
      proveedores.value = (data || []) as ProveedorRow[]
    }
  }

  async function createGasto(
    concepto: string,
    categoria: string,
    monto: number,
    medioPago: string,
    descripcion: string,
    proveedorId?: string | null
  ) {
    if (!profile.value) throw new Error('No hay usuario autenticado')

    const data: GastoInsert = {
      organization_id: profile.value.organization_id,
      usuario_id: profile.value.id,
      concepto: concepto.trim(),
      categoria: categoria as any,
      monto,
      fecha: new Date().toISOString().split('T')[0],
      medio_pago: medioPago as any,
      tipo: 'general',
      descripcion: descripcion.trim() || '',
      proveedor_id: proveedorId || null,
    }

    const { data: newGasto, error } = await client
      .from('movimientos_gasto')
      .insert(data)
      .select()
      .single()

    if (error) {
      addToast('error', 'Error al registrar gasto', error.message)
      throw error
    }

    // Link to caja: insert egreso
    const cajaData: MovimientoCajaInsert = {
      organization_id: profile.value.organization_id,
      usuario_id: profile.value.id,
      tipo: 'egreso',
      concepto: `Gasto — ${concepto.trim()}`,
      monto,
      fecha: new Date().toISOString(),
      referencia_tipo: 'gasto',
      referencia_id: newGasto.id,
      estado: 'confirmado',
    }

    await client.from('movimientos_caja').insert(cajaData)

    addToast('success', 'Gasto registrado', concepto.trim())
    await fetchGastos()
    return newGasto
  }

  async function deleteGasto(id: string) {
    const { error } = await client
      .from('movimientos_gasto')
      .delete()
      .eq('id', id)

    if (error) {
      addToast('error', 'Error al eliminar gasto', error.message)
      throw error
    }

    addToast('success', 'Gasto eliminado')
    await fetchGastos()
  }

  return {
    gastos,
    proveedores,
    isLoading,
    searchQuery,
    filterCategoria,
    filterFechaDesde,
    filterFechaHasta,
    filteredGastos,
    resumen,
    fetchGastos,
    fetchProveedores,
    createGasto,
    deleteGasto,
  }
}
