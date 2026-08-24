import type { Database } from '~/types/database.types'

type CategoriaRow = Database['public']['Tables']['categorias']['Row']
type CategoriaInsert = Database['public']['Tables']['categorias']['Insert']

export type { CategoriaRow }

export function useCategorias() {
  const client = useSupabaseClient<Database>()
  const { addToast } = useToast()
  const { profile } = useAuth()

  const categorias = ref<CategoriaRow[]>([])
  const isLoading = ref(false)

  function getCategoriasPorTipo(tipo: string) {
    return computed(() =>
      categorias.value
        .filter(c => c.tipo === tipo && c.activo)
        .map(c => ({ value: c.nombre, label: c.nombre }))
    )
  }

  async function fetchCategorias(tipo?: string) {
    isLoading.value = true
    let query = client.from('categorias').select('*').order('nombre')

    if (tipo) {
      query = query.eq('tipo', tipo)
    }

    const { data, error } = await query

    isLoading.value = false

    if (error) {
      addToast('error', 'Error al cargar categorías', error.message)
      return
    }

    categorias.value = data || []
  }

  async function createCategoria(tipo: string, nombre: string) {
    if (!profile.value) throw new Error('No hay usuario autenticado')

    const insert: CategoriaInsert = {
      organization_id: profile.value.organization_id,
      tipo,
      nombre: nombre.trim(),
    }

    const { error } = await client.from('categorias').insert(insert)

    if (error) {
      if (error.code === '23505') {
        addToast('error', 'Categoría duplicada', 'Ya existe una categoría con ese nombre')
      } else {
        addToast('error', 'Error al crear categoría', error.message)
      }
      throw error
    }

    addToast('success', 'Categoría creada', nombre.trim())
    await fetchCategorias(tipo)
  }

  async function updateCategoria(id: string, nombre: string, tipo: string) {
    const { error } = await client
      .from('categorias')
      .update({ nombre: nombre.trim() })
      .eq('id', id)

    if (error) {
      addToast('error', 'Error al editar categoría', error.message)
      throw error
    }

    addToast('success', 'Categoría actualizada', nombre.trim())
    await fetchCategorias(tipo)
  }

  async function deleteCategoria(id: string, tipo: string) {
    const { error } = await client
      .from('categorias')
      .delete()
      .eq('id', id)

    if (error) {
      addToast('error', 'Error al eliminar categoría', error.message)
      throw error
    }

    addToast('success', 'Categoría eliminada')
    await fetchCategorias(tipo)
  }

  return {
    categorias,
    isLoading,
    getCategoriasPorTipo,
    fetchCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
  }
}
