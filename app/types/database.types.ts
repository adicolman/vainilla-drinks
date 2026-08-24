// =============================================================================
// VAINILLA DRINKS — Database Types
// Auto-generated from schema (manually maintained for now).
// Run `supabase gen types typescript` after applying migrations to regenerate.
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// =============================================================================
// ENUMS
// =============================================================================

export type UnidadMedida = 'ml' | 'l' | 'g' | 'kg' | 'unidad'
export type TipoMovimientoStock = 'compra' | 'produccion' | 'venta' | 'merma' | 'ajuste' | 'devolucion'
export type EstadoVenta = 'pendiente' | 'pagado' | 'preparando' | 'entregado' | 'cancelado'
export type CategoriaGasto = 'publicidad' | 'servicios' | 'delivery' | 'equipamiento' | 'mantenimiento' | 'logistica' | 'impuestos' | 'otros'
export type MedioPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'mp'
export type TipoCaja = 'ingreso' | 'egreso'
export type UserRole = 'admin' | 'operator'

// =============================================================================
// DATABASE TABLES
// =============================================================================

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          nombre: string
          slug: string
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          slug: string
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          slug?: string
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          organization_id: string
          nombre: string
          email: string
          rol: UserRole
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id: string
          nombre: string
          email: string
          rol?: UserRole
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          nombre?: string
          email?: string
          rol?: UserRole
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      proveedores: {
        Row: {
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
        Insert: {
          id?: string
          organization_id: string
          nombre: string
          contacto?: string
          telefono?: string
          email?: string
          direccion?: string
          notas?: string
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          nombre?: string
          contacto?: string
          telefono?: string
          email?: string
          direccion?: string
          notas?: string
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      insumos: {
        Row: {
          id: string
          organization_id: string
          nombre: string
          categoria: string
          unidad_medida: UnidadMedida
          costo_unitario: number
          costo_promedio: number
          volumen_botella: number | null
          stock_actual: number
          stock_minimo: number
          proveedor_principal_id: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          nombre: string
          categoria?: string
          unidad_medida: UnidadMedida
          costo_unitario?: number
          costo_promedio?: number
          volumen_botella?: number | null
          stock_actual?: number
          stock_minimo?: number
          proveedor_principal_id?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          nombre?: string
          categoria?: string
          unidad_medida?: UnidadMedida
          costo_unitario?: number
          costo_promedio?: number
          volumen_botella?: number | null
          stock_actual?: number
          stock_minimo?: number
          proveedor_principal_id?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recetas: {
        Row: {
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
        Insert: {
          id?: string
          organization_id: string
          nombre: string
          descripcion?: string
          categoria?: string
          precio_venta?: number
          margen_objetivo?: number
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          nombre?: string
          descripcion?: string
          categoria?: string
          precio_venta?: number
          margen_objetivo?: number
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      receta_ingredientes: {
        Row: {
          id: string
          receta_id: string
          insumo_id: string
          cantidad_para_1_litro: number
          unidad: UnidadMedida
          created_at: string
        }
        Insert: {
          id?: string
          receta_id: string
          insumo_id: string
          cantidad_para_1_litro: number
          unidad: UnidadMedida
          created_at?: string
        }
        Update: {
          id?: string
          receta_id?: string
          insumo_id?: string
          cantidad_para_1_litro?: number
          unidad?: UnidadMedida
          created_at?: string
        }
      }
      compras: {
        Row: {
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
        Insert: {
          id?: string
          organization_id: string
          proveedor_id?: string | null
          proveedor_nombre?: string
          usuario_id: string
          fecha?: string
          total?: number
          medio_pago?: MedioPago
          estado?: string
          comprobante_url?: string | null
          notas?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          proveedor_id?: string | null
          proveedor_nombre?: string
          usuario_id?: string
          fecha?: string
          total?: number
          medio_pago?: MedioPago
          estado?: string
          comprobante_url?: string | null
          notas?: string
          created_at?: string
        }
      }
      compra_items: {
        Row: {
          id: string
          compra_id: string
          insumo_id: string
          cantidad: number
          unidad: UnidadMedida
          costo_unitario: number
          subtotal: number
        }
        Insert: {
          id?: string
          compra_id: string
          insumo_id: string
          cantidad: number
          unidad: UnidadMedida
          costo_unitario: number
          subtotal: number
        }
        Update: {
          id?: string
          compra_id?: string
          insumo_id?: string
          cantidad?: number
          unidad?: UnidadMedida
          costo_unitario?: number
          subtotal?: number
        }
      }
      movimientos_stock: {
        Row: {
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
        Insert: {
          id?: string
          organization_id: string
          insumo_id: string
          usuario_id: string
          tipo: TipoMovimientoStock
          cantidad: number
          unidad: UnidadMedida
          motivo?: string
          referencia_id?: string | null
          fecha?: string
          created_at?: string
        }
        Update: {
          // APPEND-ONLY: Update is disabled via RLS
        }
      }
      ventas: {
        Row: {
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
        Insert: {
          id?: string
          organization_id: string
          usuario_id: string
          fecha?: string
          total?: number
          estado?: EstadoVenta
          medio_pago?: MedioPago
          costo_total_historico?: number
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          usuario_id?: string
          fecha?: string
          total?: number
          estado?: EstadoVenta
          medio_pago?: MedioPago
          costo_total_historico?: number
          created_at?: string
        }
      }
      venta_items: {
        Row: {
          id: string
          venta_id: string
          receta_id: string
          cantidad: number
          precio_unitario: number
          subtotal: number
          costo_unitario_historico: number
          costo_total_historico: number
        }
        Insert: {
          id?: string
          venta_id: string
          receta_id: string
          cantidad: number
          precio_unitario: number
          subtotal: number
          costo_unitario_historico?: number
          costo_total_historico?: number
        }
        Update: {
          id?: string
          venta_id?: string
          receta_id?: string
          cantidad?: number
          precio_unitario?: number
          subtotal?: number
          costo_unitario_historico?: number
          costo_total_historico?: number
        }
      }
      produccion: {
        Row: {
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
        Insert: {
          id?: string
          organization_id: string
          usuario_id: string
          receta_id: string
          fecha?: string
          cantidad_producida: number
          unidad?: UnidadMedida
          costo_total?: number
          notas?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          usuario_id?: string
          receta_id?: string
          fecha?: string
          cantidad_producida?: number
          unidad?: UnidadMedida
          costo_total?: number
          notas?: string
          created_at?: string
        }
      }
      produccion_detalles: {
        Row: {
          id: string
          produccion_id: string
          insumo_id: string
          cantidad_consumida: number
          unidad: UnidadMedida
          costo_unitario: number
          created_at: string
        }
        Insert: {
          id?: string
          produccion_id: string
          insumo_id: string
          cantidad_consumida: number
          unidad: UnidadMedida
          costo_unitario?: number
          created_at?: string
        }
        Update: {
          id?: string
          produccion_id?: string
          insumo_id?: string
          cantidad_consumida?: number
          unidad?: UnidadMedida
          costo_unitario?: number
          created_at?: string
        }
      }
      movimientos_gasto: {
        Row: {
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
        Insert: {
          id?: string
          organization_id: string
          usuario_id: string
          proveedor_id?: string | null
          concepto: string
          categoria?: CategoriaGasto
          monto: number
          fecha?: string
          medio_pago?: MedioPago
          tipo?: string
          comprobante_url?: string | null
          descripcion?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          usuario_id?: string
          proveedor_id?: string | null
          concepto?: string
          categoria?: CategoriaGasto
          monto?: number
          fecha?: string
          medio_pago?: MedioPago
          tipo?: string
          comprobante_url?: string | null
          descripcion?: string
          created_at?: string
        }
      }
      movimientos_caja: {
        Row: {
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
        Insert: {
          id?: string
          organization_id: string
          usuario_id: string
          tipo: TipoCaja
          concepto: string
          monto: number
          fecha?: string
          referencia_tipo?: string
          referencia_id?: string | null
          estado?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          usuario_id?: string
          tipo?: TipoCaja
          concepto?: string
          monto?: number
          fecha?: string
          referencia_tipo?: string
          referencia_id?: string | null
          estado?: string
          created_at?: string
        }
      }
      categorias: {
        Row: {
          id: string
          organization_id: string
          tipo: string
          nombre: string
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          tipo: string
          nombre: string
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          tipo?: string
          nombre?: string
          activo?: boolean
          created_at?: string
        }
      }
    }
    Functions: {
      calcular_stock_insumo: {
        Args: { p_insumo_id: string }
        Returns: number
      }
      obtener_costo_receta: {
        Args: { p_receta_id: string }
        Returns: number
      }
      obtener_margen_receta: {
        Args: { p_receta_id: string }
        Returns: number
      }
      sincronizar_stock_insumo: {
        Args: { p_insumo_id: string }
        Returns: number
      }
      actualizar_costo_promedio: {
        Args: {
          p_insumo_id: string
          p_nueva_cantidad: number
          p_nuevo_costo: number
        }
        Returns: number
      }
      registrar_produccion: {
        Args: {
          p_organization_id: string
          p_usuario_id: string
          p_receta_id: string
          p_cantidad_producida: number
          p_unidad: UnidadMedida
          p_notas?: string
        }
        Returns: string
      }
    }
    Enums: {
      unidad_medida: UnidadMedida
      tipo_movimiento_stock: TipoMovimientoStock
      estado_venta: EstadoVenta
      categoria_gasto: CategoriaGasto
      medio_pago: MedioPago
      tipo_caja: TipoCaja
      user_role: UserRole
    }
  }
}
