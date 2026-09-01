-- =============================================================================
-- DOWN: 20260822000002_rls_policies
-- Revierte todas las políticas RLS y los helpers.
-- =============================================================================

DROP POLICY IF EXISTS "org_select_own" ON organizations;
DROP POLICY IF EXISTS "org_update_admin" ON organizations;

DROP POLICY IF EXISTS "profiles_select_own_org" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own_org" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own_org" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;

DROP POLICY IF EXISTS "proveedores_select" ON proveedores;
DROP POLICY IF EXISTS "proveedores_insert" ON proveedores;
DROP POLICY IF EXISTS "proveedores_update" ON proveedores;
DROP POLICY IF EXISTS "proveedores_delete" ON proveedores;

DROP POLICY IF EXISTS "insumos_select" ON insumos;
DROP POLICY IF EXISTS "insumos_insert" ON insumos;
DROP POLICY IF EXISTS "insumos_update" ON insumos;
DROP POLICY IF EXISTS "insumos_delete" ON insumos;

DROP POLICY IF EXISTS "recetas_select" ON recetas;
DROP POLICY IF EXISTS "recetas_insert" ON recetas;
DROP POLICY IF EXISTS "recetas_update" ON recetas;
DROP POLICY IF EXISTS "recetas_delete" ON recetas;

DROP POLICY IF EXISTS "receta_ingredientes_select" ON receta_ingredientes;
DROP POLICY IF EXISTS "receta_ingredientes_insert" ON receta_ingredientes;
DROP POLICY IF EXISTS "receta_ingredientes_update" ON receta_ingredientes;
DROP POLICY IF EXISTS "receta_ingredientes_delete" ON receta_ingredientes;

DROP POLICY IF EXISTS "compras_select" ON compras;
DROP POLICY IF EXISTS "compras_insert" ON compras;
DROP POLICY IF EXISTS "compras_update" ON compras;
DROP POLICY IF EXISTS "compras_delete" ON compras;

DROP POLICY IF EXISTS "compra_items_select" ON compra_items;
DROP POLICY IF EXISTS "compra_items_insert" ON compra_items;
DROP POLICY IF EXISTS "compra_items_update" ON compra_items;
DROP POLICY IF EXISTS "compra_items_delete" ON compra_items;

DROP POLICY IF EXISTS "movimientos_stock_select" ON movimientos_stock;
DROP POLICY IF EXISTS "movimientos_stock_insert" ON movimientos_stock;

DROP POLICY IF EXISTS "ventas_select" ON ventas;
DROP POLICY IF EXISTS "ventas_insert" ON ventas;
DROP POLICY IF EXISTS "ventas_update" ON ventas;
DROP POLICY IF EXISTS "ventas_delete" ON ventas;

DROP POLICY IF EXISTS "venta_items_select" ON venta_items;
DROP POLICY IF EXISTS "venta_items_insert" ON venta_items;
DROP POLICY IF EXISTS "venta_items_update" ON venta_items;
DROP POLICY IF EXISTS "venta_items_delete" ON venta_items;

DROP POLICY IF EXISTS "movimientos_gasto_select" ON movimientos_gasto;
DROP POLICY IF EXISTS "movimientos_gasto_insert" ON movimientos_gasto;
DROP POLICY IF EXISTS "movimientos_gasto_update" ON movimientos_gasto;
DROP POLICY IF EXISTS "movimientos_gasto_delete" ON movimientos_gasto;

DROP POLICY IF EXISTS "movimientos_caja_select" ON movimientos_caja;
DROP POLICY IF EXISTS "movimientos_caja_insert" ON movimientos_caja;
DROP POLICY IF EXISTS "movimientos_caja_update" ON movimientos_caja;
DROP POLICY IF EXISTS "movimientos_caja_delete" ON movimientos_caja;

ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores DISABLE ROW LEVEL SECURITY;
ALTER TABLE insumos DISABLE ROW LEVEL SECURITY;
ALTER TABLE recetas DISABLE ROW LEVEL SECURITY;
ALTER TABLE receta_ingredientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE compras DISABLE ROW LEVEL SECURITY;
ALTER TABLE compra_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_stock DISABLE ROW LEVEL SECURITY;
ALTER TABLE ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE venta_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_gasto DISABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_caja DISABLE ROW LEVEL SECURITY;

DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.user_organization_id();
