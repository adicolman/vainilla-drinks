-- =============================================================================
-- VAINILLA DRINKS — Initial Schema
-- Migration: 001_initial_schema
-- Date: 2026-08-22
-- =============================================================================
-- This migration creates the complete database schema for Vainilla Drinks.
-- All tables are designed for multi-organization support from day one.
-- Stock is source-of-truth from movimientos_stock (append-only).
-- =============================================================================

-- =============================================================================
-- 1. ENUMS
-- =============================================================================

CREATE TYPE unidad_medida AS ENUM ('ml', 'l', 'g', 'kg', 'unidad');

CREATE TYPE tipo_movimiento_stock AS ENUM (
  'compra',      -- Entrada por compra a proveedor
  'produccion',  -- Salida por producción de recetas
  'venta',       -- Salida directa (si aplica)
  'merma',       -- Pérdida/desperdicio
  'ajuste',      -- Corrección de inventario
  'devolucion'   -- Devolución de cliente
);

CREATE TYPE estado_venta AS ENUM (
  'pendiente',   -- Venta registrada, sin confirmar
  'pagado',      -- Pago confirmado
  'preparando',  -- En proceso de preparación
  'entregado',   -- Entregado al cliente
  'cancelado'    -- Venta cancelada
);

CREATE TYPE categoria_gasto AS ENUM (
  'publicidad',
  'servicios',
  'delivery',
  'equipamiento',
  'mantenimiento',
  'logistica',
  'impuestos',
  'otros'
);

CREATE TYPE medio_pago AS ENUM (
  'efectivo',
  'transferencia',
  'tarjeta',
  'mp'
);

CREATE TYPE tipo_caja AS ENUM ('ingreso', 'egreso');

CREATE TYPE user_role AS ENUM ('admin', 'operator');

-- =============================================================================
-- 2. TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- organizations
-- Multi-tenant root table. Every data entity belongs to an organization.
-- For MVP, only "Vainilla Drinks" will exist.
-- -----------------------------------------------------------------------------
CREATE TABLE organizations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text NOT NULL,
  slug        text NOT NULL UNIQUE,
  activo      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE organizations IS 'Organizaciones/negocios. Raíz del multi-tenant.';

-- -----------------------------------------------------------------------------
-- profiles
-- Extends auth.users with application-specific data.
-- Linked 1:1 to auth.users via id.
-- -----------------------------------------------------------------------------
CREATE TABLE profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  nombre          text NOT NULL,
  email           text NOT NULL,
  rol             user_role NOT NULL DEFAULT 'operator',
  activo          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_organization ON profiles(organization_id);

COMMENT ON TABLE profiles IS 'Perfiles de usuario extendidos desde auth.users.';

-- -----------------------------------------------------------------------------
-- proveedores
-- -----------------------------------------------------------------------------
CREATE TABLE proveedores (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  nombre          text NOT NULL,
  contacto        text NOT NULL DEFAULT '',
  telefono        text NOT NULL DEFAULT '',
  email           text NOT NULL DEFAULT '',
  direccion       text NOT NULL DEFAULT '',
  notas           text NOT NULL DEFAULT '',
  activo          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_proveedores_organization ON proveedores(organization_id);

COMMENT ON TABLE proveedores IS 'Proveedores de insumos y materiales.';

-- -----------------------------------------------------------------------------
-- insumos
-- Raw materials: spirits, fruits, packaging (bottles, caps, labels), etc.
-- stock_actual is a cached/materialized value — the source of truth is
-- movimientos_stock. The cache must be reconcilable via calcular_stock_insumo().
-- costos use weighted average for consistency.
-- -----------------------------------------------------------------------------
CREATE TABLE insumos (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id        uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  nombre                 text NOT NULL,
  categoria              text NOT NULL DEFAULT 'general',
  unidad_medida          unidad_medida NOT NULL,
  costo_unitario         numeric(12,2) NOT NULL DEFAULT 0,
  costo_promedio         numeric(12,2) NOT NULL DEFAULT 0,
  merma_porcentaje       numeric(5,2) NOT NULL DEFAULT 0,
  stock_actual           numeric(12,2) NOT NULL DEFAULT 0,
  stock_minimo           numeric(12,2) NOT NULL DEFAULT 0,
  proveedor_principal_id uuid REFERENCES proveedores(id) ON DELETE SET NULL,
  activo                 boolean NOT NULL DEFAULT true,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_insumos_organization ON insumos(organization_id);
CREATE INDEX idx_insumos_categoria ON insumos(organization_id, categoria);
CREATE INDEX idx_insumos_proveedor ON insumos(proveedor_principal_id);

COMMENT ON TABLE insumos IS 'Insumos: ingredientes, materiales de packaging, insumos generales.';
COMMENT ON COLUMN insumos.costo_unitario IS 'Último costo registrado por compra.';
COMMENT ON COLUMN insumos.costo_promedio IS 'Costo promedio ponderado (source of truth para costeo de recetas).';
COMMENT ON COLUMN insumos.stock_actual IS 'Cache de stock. Fuente de verdad: movimientos_stock.';

-- -----------------------------------------------------------------------------
-- recetas
-- Recipes for cocktails and other products.
-- A recipe can reference both liquid/fruit ingredients AND packaging materials.
-- -----------------------------------------------------------------------------
CREATE TABLE recetas (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  nombre           text NOT NULL,
  descripcion      text NOT NULL DEFAULT '',
  categoria        text NOT NULL DEFAULT 'general',
  precio_venta     numeric(12,2) NOT NULL DEFAULT 0,
  margen_objetivo  numeric(5,2) NOT NULL DEFAULT 0,
  activo           boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_recetas_organization ON recetas(organization_id);
CREATE INDEX idx_recetas_categoria ON recetas(organization_id, categoria);

COMMENT ON TABLE recetas IS 'Recetas de cócteles y productos. Pueden incluir ingredientes y materiales de packaging.';

-- -----------------------------------------------------------------------------
-- receta_ingredientes
-- Junction table: which insumos go into each recipe, and how much per liter.
-- -----------------------------------------------------------------------------
CREATE TABLE receta_ingredientes (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receta_id             uuid NOT NULL REFERENCES recetas(id) ON DELETE CASCADE,
  insumo_id             uuid NOT NULL REFERENCES insumos(id) ON DELETE RESTRICT,
  cantidad_para_1_litro numeric(10,4) NOT NULL,
  unidad                unidad_medida NOT NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),

  UNIQUE(receta_id, insumo_id)
);

CREATE INDEX idx_receta_ingredientes_receta ON receta_ingredientes(receta_id);
CREATE INDEX idx_receta_ingredientes_insumo ON receta_ingredientes(insumo_id);

COMMENT ON TABLE receta_ingredientes IS 'Ingredientes de cada receta. cantidad_para_1_litro define la proporción.';

-- -----------------------------------------------------------------------------
-- compras
-- Purchase orders / receipts from suppliers.
-- Linked to organization and the user who created the purchase.
-- -----------------------------------------------------------------------------
CREATE TABLE compras (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  proveedor_id    uuid NOT NULL REFERENCES proveedores(id) ON DELETE RESTRICT,
  usuario_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  fecha           date NOT NULL DEFAULT CURRENT_DATE,
  total           numeric(12,2) NOT NULL DEFAULT 0,
  medio_pago      medio_pago NOT NULL DEFAULT 'efectivo',
  estado          text NOT NULL DEFAULT 'pendiente',
  comprobante_url text,
  notas           text NOT NULL DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_compras_organization ON compras(organization_id);
CREATE INDEX idx_compras_proveedor ON compras(proveedor_id);
CREATE INDEX idx_compras_fecha ON compras(organization_id, fecha);

COMMENT ON TABLE compras IS 'Órdenes de compra / recepciones de proveedor.';

-- -----------------------------------------------------------------------------
-- compra_items
-- Line items within a purchase order.
-- Each item references an insumo and records the quantity and cost at purchase time.
-- -----------------------------------------------------------------------------
CREATE TABLE compra_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  compra_id       uuid NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  insumo_id       uuid NOT NULL REFERENCES insumos(id) ON DELETE RESTRICT,
  cantidad        numeric(12,2) NOT NULL,
  unidad          unidad_medida NOT NULL,
  costo_unitario  numeric(12,2) NOT NULL,
  subtotal        numeric(12,2) NOT NULL
);

CREATE INDEX idx_compra_items_compra ON compra_items(compra_id);
CREATE INDEX idx_compra_items_insumo ON compra_items(insumo_id);

COMMENT ON TABLE compra_items IS 'Items individuales dentro de una orden de compra.';

-- -----------------------------------------------------------------------------
-- movimientos_stock
-- SOURCE OF TRUTH for inventory levels.
-- APPEND-ONLY: RLS allows SELECT + INSERT only. No UPDATE/DELETE.
-- Errors are corrected via new 'ajuste' or 'devolucion' movements.
-- -----------------------------------------------------------------------------
CREATE TABLE movimientos_stock (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  insumo_id       uuid NOT NULL REFERENCES insumos(id) ON DELETE RESTRICT,
  usuario_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  tipo            tipo_movimiento_stock NOT NULL,
  cantidad        numeric(12,2) NOT NULL,
  unidad          unidad_medida NOT NULL,
  motivo          text NOT NULL DEFAULT '',
  referencia_id   uuid,
  fecha           timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_movimientos_stock_organization ON movimientos_stock(organization_id);
CREATE INDEX idx_movimientos_stock_insumo ON movimientos_stock(insumo_id);
CREATE INDEX idx_movimientos_stock_fecha ON movimientos_stock(organization_id, fecha);
CREATE INDEX idx_movimientos_stock_tipo ON movimientos_stock(organization_id, tipo);

COMMENT ON TABLE movimientos_stock IS 'Fuente de verdad del inventario. APPEND-ONLY: no UPDATE/DELETE permitido.';
COMMENT ON COLUMN movimientos_stock.cantidad IS 'Cantidad positiva. El tipo determina si es entrada o salida.';
COMMENT ON COLUMN movimientos_stock.referencia_id IS 'ID de la entidad referenciada (compra_id, venta_id, etc.).';

-- -----------------------------------------------------------------------------
-- ventas
-- Sales transactions.
-- costo_total_historico stores the cost at the time of sale for margin analysis.
-- -----------------------------------------------------------------------------
CREATE TABLE ventas (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id        uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  usuario_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  fecha                  timestamptz NOT NULL DEFAULT now(),
  total                  numeric(12,2) NOT NULL DEFAULT 0,
  estado                 estado_venta NOT NULL DEFAULT 'pendiente',
  medio_pago             medio_pago NOT NULL DEFAULT 'efectivo',
  costo_total_historico  numeric(12,2) NOT NULL DEFAULT 0,
  created_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ventas_organization ON ventas(organization_id);
CREATE INDEX idx_ventas_fecha ON ventas(organization_id, fecha);
CREATE INDEX idx_ventas_estado ON ventas(organization_id, estado);

COMMENT ON TABLE ventas IS 'Transacciones de venta. costo_total_historico preserva el margen real.';

-- -----------------------------------------------------------------------------
-- venta_items
-- Individual items within a sale.
-- costo_unitario_historico and costo_total_historico preserve cost at sale time.
-- -----------------------------------------------------------------------------
CREATE TABLE venta_items (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id                  uuid NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  receta_id                 uuid NOT NULL REFERENCES recetas(id) ON DELETE RESTRICT,
  cantidad                  numeric(12,2) NOT NULL,
  precio_unitario           numeric(12,2) NOT NULL,
  subtotal                  numeric(12,2) NOT NULL,
  costo_unitario_historico  numeric(12,2) NOT NULL DEFAULT 0,
  costo_total_historico     numeric(12,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_venta_items_venta ON venta_items(venta_id);
CREATE INDEX idx_venta_items_receta ON venta_items(receta_id);

COMMENT ON TABLE venta_items IS 'Items individuales dentro de una venta.';

-- -----------------------------------------------------------------------------
-- movimientos_gasto
-- Expense tracking.
-- Linked to organization and the user who registered the expense.
-- Optional link to a proveedor.
-- -----------------------------------------------------------------------------
CREATE TABLE movimientos_gasto (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  usuario_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  proveedor_id    uuid REFERENCES proveedores(id) ON DELETE SET NULL,
  concepto        text NOT NULL,
  categoria       categoria_gasto NOT NULL DEFAULT 'otros',
  monto           numeric(12,2) NOT NULL,
  fecha           date NOT NULL DEFAULT CURRENT_DATE,
  medio_pago      medio_pago NOT NULL DEFAULT 'efectivo',
  tipo            text NOT NULL DEFAULT 'general',
  comprobante_url text,
  descripcion     text NOT NULL DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_movimientos_gasto_organization ON movimientos_gasto(organization_id);
CREATE INDEX idx_movimientos_gasto_fecha ON movimientos_gasto(organization_id, fecha);
CREATE INDEX idx_movimientos_gasto_categoria ON movimientos_gasto(organization_id, categoria);

COMMENT ON TABLE movimientos_gasto IS 'Registro de gastos del negocio.';

-- -----------------------------------------------------------------------------
-- movimientos_caja
-- Cash register movements. Tracks all inflows and outflows.
-- Referencia_tipo + referencia_id allow linking to ventas, gastos, etc.
-- -----------------------------------------------------------------------------
CREATE TABLE movimientos_caja (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  usuario_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  tipo            tipo_caja NOT NULL,
  concepto        text NOT NULL,
  monto           numeric(12,2) NOT NULL,
  fecha           timestamptz NOT NULL DEFAULT now(),
  referencia_tipo text NOT NULL DEFAULT '',
  referencia_id   uuid,
  estado          text NOT NULL DEFAULT 'confirmado',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_movimientos_caja_organization ON movimientos_caja(organization_id);
CREATE INDEX idx_movimientos_caja_fecha ON movimientos_caja(organization_id, fecha);
CREATE INDEX idx_movimientos_caja_tipo ON movimientos_caja(organization_id, tipo);

COMMENT ON TABLE movimientos_caja IS 'Movimientos de caja: ingresos y egresos.';

-- =============================================================================
-- 3. UPDATED_AT TRIGGER
-- Auto-update updated_at on any row modification.
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_updated_at_organizations
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_updated_at_proveedores
  BEFORE UPDATE ON proveedores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_updated_at_insumos
  BEFORE UPDATE ON insumos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_updated_at_recetas
  BEFORE UPDATE ON recetas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
