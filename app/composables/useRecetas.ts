import type { Database } from '~/types/database.types'

type RecetaRow = Database['public']['Tables']['recetas']['Row']
type RecetaInsert = Database['public']['Tables']['recetas']['Insert']
type RecetaIngredienteRow = Database['public']['Tables']['receta_ingredientes']['Row']
type RecetaIngredienteInsert = Database['public']['Tables']['receta_ingredientes']['Insert']
type InsumoRow = Database['public']['Tables']['insumos']['Row']

export type { RecetaRow, RecetaIngredienteRow }

export interface RecetaConIngredientes extends RecetaRow {
  receta_ingredientes: (RecetaIngredienteRow & { insumo: Pick<InsumoRow, 'id' | 'nombre' | 'unidad_medida' | 'costo_promedio'> })[]
  costo_por_litro?: number
  margen_real?: number
}

export function useRecetas() {
  const client = useSupabaseClient<Database>()
  const { addToast } = useToast()
  const { profile } = useAuth()

  const recetas = useState<RecetaConIngredientes[]>('recetas', () => [])
  const insumos = ref<InsumoRow[]>([])
  const isLoading = useState('recetas-loading', () => false)
  const searchQuery = ref('')
  const filterCategoria = ref('')
  const filterEstado = ref('')

  const categorias = computed(() => {
    const cats = new Set(recetas.value.map(r => r.categoria).filter(Boolean))
    return Array.from(cats).sort()
  })

  const filteredRecetas = computed(() => {
    let result = recetas.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(r => r.nombre.toLowerCase().includes(q))
    }

    if (filterCategoria.value) {
      result = result.filter(r => r.categoria === filterCategoria.value)
    }

    if (filterEstado.value === 'activo') {
      result = result.filter(r => r.activo)
    } else if (filterEstado.value === 'inactivo') {
      result = result.filter(r => !r.activo)
    }

    return result
  })

  async function fetchRecetas() {
    isLoading.value = true
    const { data, error } = await client
      .from('recetas')
      .select(`
        *,
        receta_ingredientes (
          *,
          insumo: insumos ( id, nombre, unidad_medida, costo_promedio )
        )
      `)
      .order('nombre')

    isLoading.value = false

    if (error) {
      addToast('error', 'Error al cargar recetas', error.message)
      return
    }

    recetas.value = (data || []) as unknown as RecetaConIngredientes[]
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

  async function createReceta(
    data: { nombre: string; descripcion: string; categoria: string; precio_venta: number; margen_objetivo: number },
    ingredientes: { insumo_id: string; cantidad_para_1_litro: number; unidad: string }[]
  ) {
    if (!profile.value) throw new Error('No hay usuario autenticado')

    const recetaData: RecetaInsert = {
      organization_id: profile.value.organization_id,
      nombre: data.nombre,
      descripcion: data.descripcion || '',
      categoria: data.categoria || 'general',
      precio_venta: data.precio_venta,
      margen_objetivo: data.margen_objetivo,
      activo: true,
    }

    const { data: newReceta, error } = await client
      .from('recetas')
      .insert(recetaData)
      .select()
      .single()

    if (error) {
      addToast('error', 'Error al crear receta', error.message)
      throw error
    }

    if (ingredientes.length > 0 && newReceta) {
      const inserts: RecetaIngredienteInsert[] = ingredientes.map(ing => ({
        receta_id: newReceta.id,
        insumo_id: ing.insumo_id,
        cantidad_para_1_litro: ing.cantidad_para_1_litro,
        unidad: ing.unidad as any,
      }))

      const { error: ingError } = await client
        .from('receta_ingredientes')
        .insert(inserts)

      if (ingError) {
        addToast('warning', 'Receta creada, pero error al guardar ingredientes', ingError.message)
      }
    }

    addToast('success', 'Receta creada', data.nombre)
    await fetchRecetas()
    return newReceta
  }

  async function updateReceta(
    id: string,
    data: { nombre: string; descripcion: string; categoria: string; precio_venta: number; margen_objetivo: number; activo: boolean },
    ingredientes: { insumo_id: string; cantidad_para_1_litro: number; unidad: string }[]
  ) {
    const { error } = await client
      .from('recetas')
      .update({
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoria: data.categoria,
        precio_venta: data.precio_venta,
        margen_objetivo: data.margen_objetivo,
        activo: data.activo,
      })
      .eq('id', id)

    if (error) {
      addToast('error', 'Error al editar receta', error.message)
      throw error
    }

    // Replace ingredients: delete all + re-insert
    await client.from('receta_ingredientes').delete().eq('receta_id', id)

    if (ingredientes.length > 0) {
      const inserts: RecetaIngredienteInsert[] = ingredientes.map(ing => ({
        receta_id: id,
        insumo_id: ing.insumo_id,
        cantidad_para_1_litro: ing.cantidad_para_1_litro,
        unidad: ing.unidad as any,
      }))

      await client.from('receta_ingredientes').insert(inserts)
    }

    addToast('success', 'Receta actualizada', data.nombre)
    await fetchRecetas()
  }

  async function deactivateReceta(id: string, nombre: string) {
    const { error } = await client
      .from('recetas')
      .update({ activo: false })
      .eq('id', id)

    if (error) {
      addToast('error', 'Error al desactivar receta', error.message)
      throw error
    }

    addToast('success', 'Receta desactivada', nombre)
    await fetchRecetas()
  }

  return {
    recetas,
    insumos,
    isLoading,
    searchQuery,
    filterCategoria,
    filterEstado,
    categorias,
    filteredRecetas,
    fetchRecetas,
    fetchInsumos,
    createReceta,
    updateReceta,
    deactivateReceta,
  }
}
