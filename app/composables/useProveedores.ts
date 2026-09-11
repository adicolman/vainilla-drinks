import type { Database } from '~/types/database.types'

type ProveedorRow = Database['public']['Tables']['proveedores']['Row']
type ProveedorInsert = Database['public']['Tables']['proveedores']['Insert']
type ProveedorUpdate = Database['public']['Tables']['proveedores']['Update']

export type { ProveedorRow }

export function useProveedores() {
  const client = useSupabaseClient<Database>()
  const { addToast } = useToast()
  const { profile } = useAuth()

  const proveedores = useState<ProveedorRow[]>('proveedores', () => [])
  const isLoading = useState('proveedores-loading', () => false)
  const searchQuery = ref('')
  const filterEstado = ref('')

  const filteredProveedores = computed(() => {
    let result = proveedores.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(p =>
        p.nombre?.toLowerCase().includes(q) ||
        p.contacto?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.telefono?.includes(q)
      )
    }

    if (filterEstado.value === 'activo') {
      result = result.filter(p => p.activo)
    } else if (filterEstado.value === 'inactivo') {
      result = result.filter(p => !p.activo)
    }

    return result
  })

  async function fetchProveedores() {
    isLoading.value = true
    const { data, error } = await client
      .from('proveedores')
      .select('*')
      .order('nombre')

    isLoading.value = false

    if (error) {
      addToast('error', 'Error al cargar proveedores', error.message)
      return
    }

    proveedores.value = (data || []) as ProveedorRow[]
  }

  async function createProveedor(data: {
    nombre: string
    contacto: string
    telefono: string
    email: string
    direccion: string
    notas: string
  }) {
    if (!profile.value) throw new Error('No hay usuario autenticado')

    const insert: ProveedorInsert = {
      organization_id: profile.value.organization_id,
      nombre: data.nombre.trim(),
      contacto: data.contacto.trim(),
      telefono: data.telefono.trim(),
      email: data.email.trim(),
      direccion: data.direccion.trim(),
      notas: data.notas.trim(),
      activo: true,
    }

    const { error } = await client
      .from('proveedores')
      .insert(insert)

    if (error) {
      addToast('error', 'Error al crear proveedor', error.message)
      throw error
    }

    addToast('success', 'Proveedor creado', data.nombre.trim())
    await fetchProveedores()
  }

  async function updateProveedor(id: string, data: {
    nombre: string
    contacto: string
    telefono: string
    email: string
    direccion: string
    notas: string
  }) {
    const update: ProveedorUpdate = {
      nombre: data.nombre.trim(),
      contacto: data.contacto.trim(),
      telefono: data.telefono.trim(),
      email: data.email.trim(),
      direccion: data.direccion.trim(),
      notas: data.notas.trim(),
    }

    const { error } = await client
      .from('proveedores')
      .update(update)
      .eq('id', id)

    if (error) {
      addToast('error', 'Error al editar proveedor', error.message)
      throw error
    }

    addToast('success', 'Proveedor actualizado', data.nombre.trim())
    await fetchProveedores()
  }

  async function toggleActivo(id: string, activo: boolean) {
    const { error } = await client
      .from('proveedores')
      .update({ activo })
      .eq('id', id)

    if (error) {
      addToast('error', 'Error al actualizar proveedor', error.message)
      throw error
    }

    addToast('success', activo ? 'Proveedor activado' : 'Proveedor desactivado')
    await fetchProveedores()
  }

  async function deleteProveedor(id: string) {
    const { error } = await client
      .from('proveedores')
      .delete()
      .eq('id', id)

    if (error) {
      addToast('error', 'Error al eliminar proveedor', error.message)
      throw error
    }

    addToast('success', 'Proveedor eliminado')
    await fetchProveedores()
  }

  return {
    proveedores,
    isLoading,
    searchQuery,
    filterEstado,
    filteredProveedores,
    fetchProveedores,
    createProveedor,
    updateProveedor,
    toggleActivo,
    deleteProveedor,
  }
}
