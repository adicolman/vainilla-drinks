import type { Database } from '~/types/database.types'

type CompraRow = Database['public']['Tables']['compras']['Row']
type CompraInsert = Database['public']['Tables']['compras']['Insert']
type CompraItemInsert = Database['public']['Tables']['compra_items']['Insert']
type MovimientoInsert = Database['public']['Tables']['movimientos_stock']['Insert']
type InsumoRow = Database['public']['Tables']['insumos']['Row']

export type { CompraRow }

export interface CompraItemForm {
  insumo_id: string
  cantidad: number
  costo_unitario: number
}

export interface CompraConDetalle extends CompraRow {
  compra_items: (Database['public']['Tables']['compra_items']['Row'] & {
    insumo: Pick<InsumoRow, 'id' | 'nombre' | 'unidad_medida'> | null
  })[]
}

export function useCompras() {
  const client = useSupabaseClient<Database>()
  const { addToast } = useToast()
  const { profile } = useAuth()

  const compras = ref<CompraConDetalle[]>([])
  const insumos = ref<InsumoRow[]>([])
  const isLoading = ref(false)
  const searchQuery = ref('')
  const filterEstado = ref('')

  const filteredCompras = computed(() => {
    let result = compras.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(c =>
        c.proveedor_nombre?.toLowerCase().includes(q) ||
        c.notas?.toLowerCase().includes(q)
      )
    }

    if (filterEstado.value) {
      result = result.filter(c => c.estado === filterEstado.value)
    }

    return result
  })

  async function fetchCompras() {
    isLoading.value = true
    const { data, error } = await client
      .from('compras')
      .select(`
        *,
        compra_items (
          *,
          insumo: insumos ( id, nombre, unidad_medida )
        )
      `)
      .order('fecha', { ascending: false })

    isLoading.value = false

    if (error) {
      addToast('error', 'Error al cargar compras', error.message)
      return
    }

    compras.value = (data || []) as unknown as CompraConDetalle[]
  }

  async function fetchInsumos() {
    const { data, error } = await client
      .from('insumos')
      .select('*')
      .eq('activo', true)
      .order('nombre')

    if (!error) {
      insumos.value = data || []
    }
  }

  async function createCompra(
    proveedorNombre: string,
    items: CompraItemForm[],
    medioPago: string,
    notas: string
  ) {
    if (!profile.value) throw new Error('No hay usuario autenticado')
    if (items.length === 0) throw new Error('Agregá al menos un item')

    const total = items.reduce((sum, item) => sum + (item.cantidad * item.costo_unitario), 0)

    const compraData: CompraInsert = {
      organization_id: profile.value.organization_id,
      usuario_id: profile.value.id,
      proveedor_nombre: proveedorNombre,
      fecha: new Date().toISOString().split('T')[0],
      total,
      medio_pago: medioPago as any,
      estado: 'recibido',
      notas: notas || '',
    }

    const { data: newCompra, error } = await client
      .from('compras')
      .insert(compraData)
      .select()
      .single()

    if (error) {
      addToast('error', 'Error al crear compra', error.message)
      throw error
    }

    if (!newCompra) throw new Error('No se pudo crear la compra')

    // Insert items + stock movements + update cost
    for (const item of items) {
      const insumo = insumos.value.find(i => i.id === item.insumo_id)
      const subtotal = item.cantidad * item.costo_unitario

      // Insert compra item
      const itemData: CompraItemInsert = {
        compra_id: newCompra.id,
        insumo_id: item.insumo_id,
        cantidad: item.cantidad,
        unidad: insumo?.unidad_medida || 'unidad',
        costo_unitario: item.costo_unitario,
        subtotal,
      }

      await client.from('compra_items').insert(itemData)

      // Insert stock movement (entrada por compra)
      const movimiento: MovimientoInsert = {
        organization_id: profile.value.organization_id,
        insumo_id: item.insumo_id,
        usuario_id: profile.value.id,
        tipo: 'compra',
        cantidad: item.cantidad,
        unidad: insumo?.unidad_medida || 'unidad',
        motivo: `Compra ${proveedorNombre}`,
        referencia_id: newCompra.id,
      }

      await client.from('movimientos_stock').insert(movimiento)

      // Update weighted average cost
      await client.rpc('actualizar_costo_promedio', {
        p_insumo_id: item.insumo_id,
        p_nueva_cantidad: item.cantidad,
        p_nuevo_costo: item.costo_unitario,
      })
    }

    addToast('success', 'Compra registrada', proveedorNombre)
    await fetchCompras()
    return newCompra
  }

  async function updateCompraEstado(id: string, estado: string) {
    const { error } = await client
      .from('compras')
      .update({ estado })
      .eq('id', id)

    if (error) {
      addToast('error', 'Error al actualizar compra', error.message)
      throw error
    }

    addToast('success', 'Compra actualizada', `Estado: ${estado}`)
    await fetchCompras()
  }

  return {
    compras,
    insumos,
    isLoading,
    searchQuery,
    filterEstado,
    filteredCompras,
    fetchCompras,
    fetchInsumos,
    createCompra,
    updateCompraEstado,
  }
}
