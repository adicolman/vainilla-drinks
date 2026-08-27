// =============================================================================
// Domain Types — Vainilla Drinks
// These types represent the application-level domain models.
// For raw database types, see database.types.ts
// =============================================================================

// =============================================================================
// AUTH & ORGANIZATION
// =============================================================================

export type UserRole = 'admin' | 'operator'

export interface Organization {
  id: string
  nombre: string
  slug: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  organization_id: string
  nombre: string
  email: string
  rol: UserRole
  activo: boolean
  created_at: string
  updated_at: string
}

// =============================================================================
// DOMAIN ENTITIES
// =============================================================================

export interface Proveedor {
  id: string
  organization_id: string
  nombre: string
  contacto: string
  telefono: string
  email: string
  direccion: string
  notas: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Insumo {
  id: string
  organization_id: string
  nombre: string
  categoria: string
  unidad_medida: UnidadMedida
  costo_unitario: number
  costo_promedio: number
  cantidad_por_unidad: number | null
  stock_actual: number
  stock_minimo: number
  proveedor_principal_id: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Receta {
  id: string
  organization_id: string
  nombre: string
  descripcion: string
  categoria: string
  precio_venta: number
  margen_objetivo: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface RecetaIngrediente {
  id: string
  receta_id: string
  insumo_id: string
  cantidad_para_1_litro: number
  unidad: UnidadMedida
  created_at: string
}

export interface Compra {
  id: string
  organization_id: string
  proveedor_id: string | null
  proveedor_nombre: string
  usuario_id: string
  fecha: string
  total: number
  medio_pago: MedioPago
  estado: string
  comprobante_url: string | null
  notas: string
  created_at: string
}

export interface CompraItem {
  id: string
  compra_id: string
  insumo_id: string
  cantidad: number
  unidad: UnidadMedida
  costo_unitario: number
  subtotal: number
}

export interface MovimientoStock {
  id: string
  organization_id: string
  insumo_id: string
  usuario_id: string
  tipo: TipoMovimientoStock
  cantidad: number
  unidad: UnidadMedida
  motivo: string
  referencia_id: string | null
  fecha: string
  created_at: string
}

export interface Venta {
  id: string
  organization_id: string
  usuario_id: string
  fecha: string
  total: number
  estado: EstadoVenta
  medio_pago: MedioPago
  costo_total_historico: number
  created_at: string
}

export interface VentaItem {
  id: string
  venta_id: string
  receta_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  costo_unitario_historico: number
  costo_total_historico: number
}

export interface MovimientoGasto {
  id: string
  organization_id: string
  usuario_id: string
  proveedor_id: string | null
  concepto: string
  categoria: CategoriaGasto
  monto: number
  fecha: string
  medio_pago: MedioPago
  tipo: string
  comprobante_url: string | null
  descripcion: string
  created_at: string
}

export interface MovimientoCaja {
  id: string
  organization_id: string
  usuario_id: string
  tipo: TipoCaja
  concepto: string
  monto: number
  fecha: string
  referencia_tipo: string
  referencia_id: string | null
  estado: string
  created_at: string
}

export interface Produccion {
  id: string
  organization_id: string
  usuario_id: string
  receta_id: string
  fecha: string
  cantidad_producida: number
  unidad: UnidadMedida
  costo_total: number
  notas: string
  created_at: string
}

export interface ProduccionDetalle {
  id: string
  produccion_id: string
  insumo_id: string
  cantidad_consumida: number
  unidad: UnidadMedida
  costo_unitario: number
  created_at: string
}

export interface Categoria {
  id: string
  organization_id: string
  tipo: string
  nombre: string
  activo: boolean
  created_at: string
}

// =============================================================================
// ENUMS
// =============================================================================

export type UnidadMedida = 'ml' | 'l' | 'kg' | 'unidad'

export type TipoMovimientoStock = 'compra' | 'produccion' | 'venta' | 'merma' | 'ajuste' | 'devolucion'

export type EstadoVenta = 'pendiente' | 'pagado' | 'preparando' | 'entregado' | 'cancelado'

export type CategoriaGasto = 'publicidad' | 'servicios' | 'delivery' | 'equipamiento' | 'mantenimiento' | 'logistica' | 'impuestos' | 'otros'

export type MedioPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'mp'

export type TipoCaja = 'ingreso' | 'egreso'

// =============================================================================
// UI / DASHBOARD TYPES
// =============================================================================

export interface MetricData {
  label: string
  value: number
  variation: number
  trend: 'up' | 'down' | 'neutral'
  icon: string
  format: 'currency' | 'percent' | 'number'
  extra?: string
}

export interface TimelineEvent {
  id: string
  time: string
  title: string
  description: string
  color: 'brand' | 'vanilla' | 'success' | 'danger' | 'sand'
}

export interface InsightData {
  type: 'warning' | 'info' | 'success'
  message: string
  action?: string
}

export interface MovementData {
  id: string
  concepto: string
  categoria: string
  proveedor: string
  fecha: string
  monto: number
  tipo: 'ingreso' | 'egreso'
}

export interface PaymentData {
  id: string
  proveedor: string
  concepto: string
  monto: number
  fecha: string
  estado: 'pendiente' | 'pagado' | 'vencido'
}

export interface ReviewItem {
  id: string
  type: 'stock_bajo' | 'costo_aumento' | 'merma_alta' | 'gasto_inusual'
  title: string
  description: string
  action?: string
  actionTo?: string
}

export interface ExpenseChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }[]
}
