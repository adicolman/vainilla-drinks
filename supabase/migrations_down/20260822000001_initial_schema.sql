-- =============================================================================
-- DOWN: 20260822000001_initial_schema
-- Revierte la creación del schema inicial completo.
-- ⚠️ DESTRUCTIVO: elimina TODAS las tablas y datos del negocio.
-- =============================================================================

DROP TRIGGER IF EXISTS trigger_updated_at_recetas ON recetas;
DROP TRIGGER IF EXISTS trigger_updated_at_insumos ON insumos;
DROP TRIGGER IF EXISTS trigger_updated_at_proveedores ON proveedores;
DROP TRIGGER IF EXISTS trigger_updated_at_profiles ON profiles;
DROP TRIGGER IF EXISTS trigger_updated_at_organizations ON organizations;
DROP FUNCTION IF EXISTS update_updated_at();

DROP TABLE IF EXISTS movimientos_caja;
DROP TABLE IF EXISTS movimientos_gasto;
DROP TABLE IF EXISTS venta_items;
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS movimientos_stock;
DROP TABLE IF EXISTS compra_items;
DROP TABLE IF EXISTS compras;
DROP TABLE IF EXISTS receta_ingredientes;
DROP TABLE IF EXISTS recetas;
DROP TABLE IF EXISTS insumos;
DROP TABLE IF EXISTS proveedores;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS organizations;

DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS tipo_caja;
DROP TYPE IF EXISTS medio_pago;
DROP TYPE IF EXISTS categoria_gasto;
DROP TYPE IF EXISTS estado_venta;
DROP TYPE IF EXISTS tipo_movimiento_stock;
DROP TYPE IF EXISTS unidad_medida;
