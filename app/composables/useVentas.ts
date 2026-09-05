import type { Database } from '~/types/database.types'

type VentaRow = Database['public']['Tables']['ventas']['Row']
type VentaInsert = Database['public']['Tables']['ventas']['Insert']
type VentaItemInsert = Database['public']['Tables']['venta_items']['Insert']
type MovimientoCajaInsert = Database['public']['Tables']['movimientos_caja']['Insert']
type RecetaRow = Database['public']['Tables']['recetas']['Row']
type RecetaIngredienteRow = Database['public']['Tables']['receta_ingredientes']['Row']
type InsumoRow = Database['public']['Tables']['insumos']['Row']

export type { VentaRow }

export interface VentaItemForm {
  receta_id: string
  cantidad: number
  precio_unitario: number
}

export interface RecetaConCosto extends RecetaRow {
  receta_ingredientes: (RecetaIngredienteRow & {
    insumo: Pick<InsumoRow, 'id' | 'nombre' | 'costo_promedio'> | null
  })[]
  costo_por_unidad?: number
}

export interface VentaConDetalle extends VentaRow {
  venta_items: (Database['public']['Tables']['venta_items']['Row'] & {
    receta: Pick<RecetaRow, 'id' | 'nombre' | 'categoria'> | null
  })[]
}

export function useVentas() {
  const client = useSupabaseClient<Database>()
  const { addToast } = useToast()
  const { profile } = useAuth()

  const ventas = useState<VentaConDetalle[]>('ventas', () => [])
  const recetas = ref<RecetaConCosto[]>([])
  const isLoading = useState('ventas-loading', () => false)
  const searchQuery = ref('')
  const filterEstado = ref('')

  const filteredVentas = computed(() => {
    let result = ventas.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(v =>
        v.venta_items?.some(item =>
          item.receta?.nombre?.toLowerCase().includes(q)
        )
      )
    }

    if (filterEstado.value) {
      result = result.filter(v => v.estado === filterEstado.value)
    }

    return result
  })

  async function fetchVentas() {
    isLoading.value = true
    const { data, error } = await client
      .from('ventas')
      .select(`
        *,
        venta_items (
          *,
          receta: recetas ( id, nombre, categoria )
        )
      `)
      .order('fecha', { ascending: false })

    isLoading.value = false

    if (error) {
      addToast('error', 'Error al cargar ventas', error.message)
      return
    }

    ventas.value = (data || []) as unknown as VentaConDetalle[]
  }

  async function fetchRecetas() {
    const { data, error } = await client
      .from('recetas')
      .select(`
        *,
        receta_ingredientes (
          *,
          insumo: insumos ( id, nombre, costo_promedio )
        )
      `)
      .eq('activo', true)
      .order('nombre')

    if (!error) {
      recetas.value = (data || []) as unknown as RecetaConCosto[]
    }
  }

  function calcularCostoReceta(receta: RecetaConCosto): number {
    if (!receta.receta_ingredientes?.length) return 0
    return receta.receta_ingredientes.reduce((sum, ing) => {
      const costo = Number(ing.insumo?.costo_promedio || 0)
      const cantidad = Number(ing.cantidad_para_1_litro || 0)
      return sum + (costo * cantidad)
    }, 0)
  }

  async function createVenta(
    items: VentaItemForm[],
    medioPago: string
  ) {
    if (!profile.value) throw new Error('No hay usuario autenticado')
    if (items.length === 0) throw new Error('Agregá al menos un item')

    let totalVenta = 0
    let costoTotalHistorico = 0

    const itemsConCosto = items.map(item => {
      const receta = recetas.value.find(r => r.id === item.receta_id)
      const costoUnitario = receta ? calcularCostoReceta(receta) : 0
      const subtotal = item.cantidad * item.precio_unitario
      const costoTotalItem = costoUnitario * item.cantidad

      totalVenta += subtotal
      costoTotalHistorico += costoTotalItem

      return { ...item, costo_unitario_historico: costoUnitario, costo_total_historico: costoTotalItem }
    })

    const ventaData: VentaInsert = {
      organization_id: profile.value.organization_id,
      usuario_id: profile.value.id,
      fecha: new Date().toISOString(),
      total: totalVenta,
      estado: 'pagado',
      medio_pago: medioPago as any,
      costo_total_historico: costoTotalHistorico,
    }

    const { data: newVenta, error } = await client
      .from('ventas')
      .insert(ventaData)
      .select()
      .single()

    if (error) {
      addToast('error', 'Error al crear venta', error.message)
      throw error
    }

    if (!newVenta) throw new Error('No se pudo crear la venta')

    // Insert items
    for (const item of itemsConCosto) {
      const itemData: VentaItemInsert = {
        venta_id: newVenta.id,
        receta_id: item.receta_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.cantidad * item.precio_unitario,
        costo_unitario_historico: item.costo_unitario_historico,
        costo_total_historico: item.costo_total_historico,
      }

      await client.from('venta_items').insert(itemData)
    }

    // Link to caja: insert ingreso
    const recetaNombre = recetas.value.find(r => r.id === items[0]?.receta_id)?.nombre || 'Venta'
    const concepto = items.length === 1
      ? `Venta — ${recetaNombre}`
      : `Venta — ${items.length} productos`

    const cajaData: MovimientoCajaInsert = {
      organization_id: profile.value.organization_id,
      usuario_id: profile.value.id,
      tipo: 'ingreso',
      concepto,
      monto: totalVenta,
      fecha: new Date().toISOString(),
      referencia_tipo: 'venta',
      referencia_id: newVenta.id,
      estado: 'confirmado',
    }

    await client.from('movimientos_caja').insert(cajaData)

    addToast('success', 'Venta registrada', `$${totalVenta.toLocaleString('es-AR')}`)
    await fetchVentas()
    return newVenta
  }

  async function updateVentaEstado(id: string, estado: string) {
    const { error } = await client
      .from('ventas')
      .update({ estado })
      .eq('id', id)

    if (error) {
      addToast('error', 'Error al actualizar venta', error.message)
      throw error
    }

    addToast('success', 'Venta actualizada', `Estado: ${estado}`)
    await fetchVentas()
  }

  return {
    ventas,
    recetas,
    isLoading,
    searchQuery,
    filterEstado,
    filteredVentas,
    fetchVentas,
    fetchRecetas,
    createVenta,
    updateVentaEstado,
  }
}
