import type { Database } from '~/types/database.types'

type InsumoRow = Database['public']['Tables']['insumos']['Row']
type MovimientoInsert = Database['public']['Tables']['movimientos_stock']['Insert']

export interface ConsumoItem {
  insumo_id: string
  peso_inicial: number
  peso_final: number
}

export function useConsumoDiario() {
  const client = useSupabaseClient<Database>()
  const { addToast } = useToast()
  const { profile } = useAuth()

  const insumos = ref<InsumoRow[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const fecha = ref(new Date().toISOString().split('T')[0])

  async function fetchInsumos() {
    isLoading.value = true
    const { data, error } = await client
      .from('insumos')
      .select('*')
      .eq('activo', true)
      .order('nombre')

    isLoading.value = false

    if (error) {
      addToast('error', 'Error al cargar insumos', error.message)
      return
    }

    insumos.value = (data || []) as InsumoRow[]
  }

  async function registrarConsumo(items: ConsumoItem[]) {
    if (!profile.value) throw new Error('No hay usuario autenticado')

    const validItems = items.filter(i => i.peso_inicial > 0 && i.peso_final >= 0 && i.peso_inicial > i.peso_final)

    if (validItems.length === 0) {
      addToast('warning', 'Sin registros', 'No hay consumos para registrar')
      return
    }

    isSaving.value = true

    const inserts: MovimientoInsert[] = validItems.map(item => ({
      organization_id: profile.value!.organization_id,
      insumo_id: item.insumo_id,
      usuario_id: profile.value!.id,
      tipo: 'consumo_diario' as const,
      cantidad: item.peso_inicial - item.peso_final,
      unidad: (insumos.value.find(i => i.id === item.insumo_id)?.unidad_medida || 'kg') as any,
      motivo: `Consumo diario: ${item.peso_inicial} → ${item.peso_final}`,
    }))

    const { error } = await client
      .from('movimientos_stock')
      .insert(inserts)

    isSaving.value = false

    if (error) {
      addToast('error', 'Error al registrar consumo', error.message)
      throw error
    }

    const totalConsumido = validItems.reduce((sum, i) => sum + (i.peso_inicial - i.peso_final), 0)
    addToast('success', 'Consumo registrado', `${validItems.length} insumos, ${totalConsumido.toFixed(2)} unidades totales`)
  }

  return {
    insumos,
    isLoading,
    isSaving,
    fecha,
    fetchInsumos,
    registrarConsumo,
  }
}
