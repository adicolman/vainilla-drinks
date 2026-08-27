import type { Database } from '~/types/database.types'

type InsumoRow = Database['public']['Tables']['insumos']['Row']
type InsumoInsert = Database['public']['Tables']['insumos']['Insert']
type MovimientoInsert = Database['public']['Tables']['movimientos_stock']['Insert']

export type { InsumoRow }

export function useInsumos() {
  const client = useSupabaseClient<Database>()
  const { addToast } = useToast()
  const { profile } = useAuth()

  const insumos = useState<InsumoRow[]>('insumos', () => [])
  const isLoading = useState('insumos-loading', () => false)
  const searchQuery = ref('')
  const filterCategoria = ref('')
  const filterUnidad = ref('')
  const filterEstado = ref('')

  const categorias = computed(() => {
    const cats = new Set(insumos.value.map(i => i.categoria).filter(Boolean))
    return Array.from(cats).sort()
  })

  const filteredInsumos = computed(() => {
    let result = insumos.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(i => i.nombre.toLowerCase().includes(q))
    }

    if (filterCategoria.value) {
      result = result.filter(i => i.categoria === filterCategoria.value)
    }

    if (filterUnidad.value) {
      result = result.filter(i => i.unidad_medida === filterUnidad.value)
    }

    if (filterEstado.value === 'activo') {
      result = result.filter(i => i.activo)
    } else if (filterEstado.value === 'inactivo') {
      result = result.filter(i => !i.activo)
    }

    return result
  })

  async function fetchInsumos() {
    isLoading.value = true
    const { data, error } = await client
      .from('insumos')
      .select('*')
      .order('nombre')

    isLoading.value = false

    if (error) {
      addToast('error', 'Error al cargar insumos', error.message)
      return
    }

    insumos.value = data || []
  }

  async function createInsumo(data: {
    nombre: string
    categoria: string
    unidad_medida: string
    costo_unitario: number
    stock_inicial: number
    stock_minimo: number
    cantidad_por_unidad: number | null
    proveedor_principal_id?: string | null
  }) {
    if (!profile.value) throw new Error('No hay usuario autenticado')

    const insumoData: InsumoInsert = {
      organization_id: profile.value.organization_id,
      nombre: data.nombre,
      categoria: data.categoria || 'general',
      unidad_medida: data.unidad_medida as any,
      costo_unitario: data.costo_unitario,
      costo_promedio: data.costo_unitario,
      cantidad_por_unidad: data.cantidad_por_unidad,
      stock_actual: 0,
      stock_minimo: data.stock_minimo,
      proveedor_principal_id: data.proveedor_principal_id || null,
      activo: true,
    }

    const { data: newInsumo, error } = await client
      .from('insumos')
      .insert(insumoData)
      .select()
      .single()

    if (error) {
      addToast('error', 'Error al crear insumo', error.message)
      throw error
    }

    if (data.stock_inicial > 0 && newInsumo) {
      const movimiento: MovimientoInsert = {
        organization_id: profile.value.organization_id,
        insumo_id: newInsumo.id,
        usuario_id: profile.value.id,
        tipo: 'ajuste',
        cantidad: data.stock_inicial,
        unidad: data.unidad_medida as any,
        motivo: 'Stock inicial',
      }

      const { error: movError } = await client
        .from('movimientos_stock')
        .insert(movimiento)

      if (movError) {
        addToast('warning', 'Insumo creado, pero error al registrar stock inicial', movError.message)
      }
    }

    addToast('success', 'Insumo creado', data.nombre)
    await fetchInsumos()
    return newInsumo
  }

  async function updateInsumo(id: string, data: {
    nombre: string
    categoria: string
    unidad_medida: string
    costo_unitario: number
    stock_minimo: number
    cantidad_por_unidad: number | null
    proveedor_principal_id?: string | null
    activo: boolean
  }) {
    const { error } = await client
      .from('insumos')
      .update({
        nombre: data.nombre,
        categoria: data.categoria,
        unidad_medida: data.unidad_medida as any,
        costo_unitario: data.costo_unitario,
        stock_minimo: data.stock_minimo,
        cantidad_por_unidad: data.cantidad_por_unidad,
        proveedor_principal_id: data.proveedor_principal_id || null,
        activo: data.activo,
      })
      .eq('id', id)

    if (error) {
      addToast('error', 'Error al editar insumo', error.message)
      throw error
    }

    addToast('success', 'Insumo actualizado', data.nombre)
    await fetchInsumos()
  }

  async function deactivateInsumo(id: string, nombre: string) {
    const { error } = await client
      .from('insumos')
      .update({ activo: false })
      .eq('id', id)

    if (error) {
      addToast('error', 'Error al desactivar insumo', error.message)
      throw error
    }

    addToast('success', 'Insumo desactivado', nombre)
    await fetchInsumos()
  }

  async function deleteInsumo(id: string, nombre: string) {
    const { error } = await client.rpc('eliminar_insumo', { p_insumo_id: id })

    if (error) {
      addToast('error', 'Error al eliminar insumo', error.message)
      throw error
    }

    addToast('success', 'Insumo eliminado', nombre)
    await fetchInsumos()
  }

  return {
    insumos,
    isLoading,
    searchQuery,
    filterCategoria,
    filterUnidad,
    filterEstado,
    categorias,
    filteredInsumos,
    fetchInsumos,
    createInsumo,
    updateInsumo,
    deactivateInsumo,
    deleteInsumo,
  }
}
