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

  async function uploadImagen(file: File): Promise<string | null> {
    if (!profile.value) return null
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${profile.value.organization_id}/${Date.now()}.${ext}`
    const { error } = await client.storage.from('insumos').upload(path, file, { upsert: true })
    if (error) {
      addToast('error', 'Error al subir imagen', error.message)
      return null
    }
    const { data } = client.storage.from('insumos').getPublicUrl(path)
    return data.publicUrl
  }

  async function createInsumo(data: {
    nombre: string
    categoria: string
    unidad_medida: string
    precio_compra: number
    contenido_por_unidad: number
    stock_inicial: number
    stock_minimo: number
    proveedor_principal_id?: string | null
    imagen_url?: string | null
  }) {
    if (!profile.value) throw new Error('No hay usuario autenticado')

    const costo_unitario = data.contenido_por_unidad > 0
      ? data.precio_compra / data.contenido_por_unidad
      : data.precio_compra

    const stock_en_unidad_base = data.stock_inicial * data.contenido_por_unidad

    const insumoData: InsumoInsert = {
      organization_id: profile.value.organization_id,
      nombre: data.nombre,
      categoria: data.categoria || 'general',
      unidad_medida: data.unidad_medida as any,
      costo_unitario,
      costo_promedio: costo_unitario,
      cantidad_por_unidad: data.contenido_por_unidad,
      stock_actual: stock_en_unidad_base,
      stock_minimo: data.stock_minimo,
      proveedor_principal_id: data.proveedor_principal_id || null,
      activo: true,
      imagen_url: data.imagen_url || null,
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
        cantidad: stock_en_unidad_base,
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
    precio_compra: number
    contenido_por_unidad: number
    stock_minimo: number
    proveedor_principal_id?: string | null
    activo: boolean
    imagen_url?: string | null
  }) {
    const costo_unitario = data.contenido_por_unidad > 0
      ? data.precio_compra / data.contenido_por_unidad
      : data.precio_compra

    // Las recetas costean con costo_promedio, no con costo_unitario.
    // Si el precio/contenido cambió, el costo vigente pasa a ser el nuevo.
    const actual = insumos.value.find(i => i.id === id)
    let costoUnitarioPrevio: number | null = actual ? Number(actual.costo_unitario) : null
    if (costoUnitarioPrevio === null) {
      const { data: fila } = await client.from('insumos').select('costo_unitario').eq('id', id).single()
      if (fila) costoUnitarioPrevio = Number(fila.costo_unitario)
    }
    const cambioPrecio = costoUnitarioPrevio !== null && Math.abs(costoUnitarioPrevio - costo_unitario) > 0.005

    const { error } = await client
      .from('insumos')
      .update({
        nombre: data.nombre,
        categoria: data.categoria,
        unidad_medida: data.unidad_medida as any,
        costo_unitario,
        ...(cambioPrecio ? { costo_promedio: costo_unitario } : {}),
        stock_minimo: data.stock_minimo,
        cantidad_por_unidad: data.contenido_por_unidad,
        proveedor_principal_id: data.proveedor_principal_id || null,
        activo: data.activo,
        imagen_url: data.imagen_url || null,
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
    uploadImagen,
    createInsumo,
    updateInsumo,
    deactivateInsumo,
    deleteInsumo,
  }
}
