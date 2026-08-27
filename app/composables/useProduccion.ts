import type { Database } from '~/types/database.types'

type ProduccionRow = Database['public']['Tables']['produccion']['Row']
type ProduccionDetalleRow = Database['public']['Tables']['produccion_detalles']['Row']
type RecetaRow = Database['public']['Tables']['recetas']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']

export type { ProduccionRow }

export interface ProduccionConDetalle extends ProduccionRow {
  receta: Pick<RecetaRow, 'id' | 'nombre' | 'categoria'> | null
  profiles: Pick<ProfileRow, 'id' | 'nombre'> | null
  produccion_detalles: (ProduccionDetalleRow & { insumo: { id: string; nombre: string } | null })[]
}

export function useProduccion() {
  const client = useSupabaseClient<Database>()
  const { addToast } = useToast()
  const { profile } = useAuth()

  const produccion = useState<ProduccionConDetalle[]>('produccion', () => [])
  const isLoading = useState('produccion-loading', () => false)
  const searchQuery = ref('')

  const filteredProduccion = computed(() => {
    if (!searchQuery.value) return produccion.value
    const q = searchQuery.value.toLowerCase()
    return produccion.value.filter(p =>
      p.receta?.nombre?.toLowerCase().includes(q) ||
      p.notas?.toLowerCase().includes(q)
    )
  })

  async function fetchProduccion() {
    isLoading.value = true
    const { data, error } = await client
      .from('produccion')
      .select(`
        *,
        receta: recetas ( id, nombre, categoria ),
        profiles ( id, nombre ),
        produccion_detalles (
          *,
          insumo: insumos ( id, nombre )
        )
      `)
      .order('fecha', { ascending: false })

    isLoading.value = false

    if (error) {
      addToast('error', 'Error al cargar producciones', error.message)
      return
    }

    produccion.value = (data || []) as unknown as ProduccionConDetalle[]
  }

  async function registrarProduccion(
    recetaId: string,
    cantidadProducida: number,
    unidad: string,
    notas: string
  ) {
    if (!profile.value) throw new Error('No hay usuario autenticado')

    const { data, error } = await client.rpc('registrar_produccion', {
      p_organization_id: profile.value.organization_id,
      p_usuario_id: profile.value.id,
      p_receta_id: recetaId,
      p_cantidad_producida: cantidadProducida,
      p_unidad: unidad as any,
      p_notas: notas || '',
    })

    if (error) {
      addToast('error', 'Error al registrar producción', error.message)
      throw error
    }

    addToast('success', 'Producción registrada', `${cantidadProducida} ${unidad} producidos`)
    await fetchProduccion()
    return data
  }

  return {
    produccion,
    isLoading,
    searchQuery,
    filteredProduccion,
    fetchProduccion,
    registrarProduccion,
  }
}
