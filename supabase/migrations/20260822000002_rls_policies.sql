-- =============================================================================
-- VAINILLA DRINKS — Row Level Security Policies
-- Migration: 002_rls_policies
-- Date: 2026-08-22
-- =============================================================================
-- RLS policies for all tables. Policies enforce:
--   1. Authentication (must be logged in)
--   2. Organization scope (users can only access their org's data)
--   3. Role-based access (admin vs operator)
--   4. Append-only for movimientos_stock (no UPDATE/DELETE)
-- =============================================================================

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE receta_ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE compra_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_gasto ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_caja ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- HELPER: Get current user's organization_id
-- =============================================================================

CREATE OR REPLACE FUNCTION public.user_organization_id()
RETURNS uuid AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- HELPER: Check if current user is admin
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- organizations
-- Users can read their own organization. Admins can update it.
-- =============================================================================

CREATE POLICY "org_select_own"
  ON organizations FOR SELECT
  TO authenticated
  USING (id = public.user_organization_id());

CREATE POLICY "org_update_admin"
  ON organizations FOR UPDATE
  TO authenticated
  USING (id = public.user_organization_id() AND public.is_admin());

-- =============================================================================
-- profiles
-- Users can read all profiles in their org.
-- Users can update their own profile.
-- Admins can update any profile in their org.
-- =============================================================================

CREATE POLICY "profiles_select_own_org"
  ON profiles FOR SELECT
  TO authenticated
  USING (organization_id = public.user_organization_id());

CREATE POLICY "profiles_update_self"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
    AND public.is_admin()
  );

-- =============================================================================
-- proveedores
-- Authenticated users in the same org can CRUD.
-- =============================================================================

CREATE POLICY "proveedores_select"
  ON proveedores FOR SELECT
  TO authenticated
  USING (organization_id = public.user_organization_id());

CREATE POLICY "proveedores_insert"
  ON proveedores FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = public.user_organization_id());

CREATE POLICY "proveedores_update"
  ON proveedores FOR UPDATE
  TO authenticated
  USING (organization_id = public.user_organization_id());

CREATE POLICY "proveedores_delete"
  ON proveedores FOR DELETE
  TO authenticated
  USING (organization_id = public.user_organization_id() AND public.is_admin());

-- =============================================================================
-- insumos
-- Authenticated users in the same org can CRUD.
-- Only admin can delete.
-- =============================================================================

CREATE POLICY "insumos_select"
  ON insumos FOR SELECT
  TO authenticated
  USING (organization_id = public.user_organization_id());

CREATE POLICY "insumos_insert"
  ON insumos FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = public.user_organization_id());

CREATE POLICY "insumos_update"
  ON insumos FOR UPDATE
  TO authenticated
  USING (organization_id = public.user_organization_id());

CREATE POLICY "insumos_delete"
  ON insumos FOR DELETE
  TO authenticated
  USING (organization_id = public.user_organization_id() AND public.is_admin());

-- =============================================================================
-- recetas
-- Authenticated users in the same org can CRUD.
-- Only admin can delete.
-- =============================================================================

CREATE POLICY "recetas_select"
  ON recetas FOR SELECT
  TO authenticated
  USING (organization_id = public.user_organization_id());

CREATE POLICY "recetas_insert"
  ON recetas FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = public.user_organization_id());

CREATE POLICY "recetas_update"
  ON recetas FOR UPDATE
  TO authenticated
  USING (organization_id = public.user_organization_id());

CREATE POLICY "recetas_delete"
  ON recetas FOR DELETE
  TO authenticated
  USING (organization_id = public.user_organization_id() AND public.is_admin());

-- =============================================================================
-- receta_ingredientes
-- Access controlled through the parent receta's organization.
-- =============================================================================

CREATE POLICY "ri_select"
  ON receta_ingredientes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recetas
      WHERE recetas.id = receta_ingredientes.receta_id
      AND recetas.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "ri_insert"
  ON receta_ingredientes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recetas
      WHERE recetas.id = receta_ingredientes.receta_id
      AND recetas.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "ri_delete"
  ON receta_ingredientes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recetas
      WHERE recetas.id = receta_ingredientes.receta_id
      AND recetas.organization_id = public.user_organization_id()
    )
  );

-- =============================================================================
-- compras
-- Authenticated users in the same org can SELECT and INSERT.
-- Only the creator can UPDATE (e.g., to correct status).
-- Only admin can DELETE.
-- =============================================================================

CREATE POLICY "compras_select"
  ON compras FOR SELECT
  TO authenticated
  USING (organization_id = public.user_organization_id());

CREATE POLICY "compras_insert"
  ON compras FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id = public.user_organization_id()
    AND usuario_id = auth.uid()
  );

CREATE POLICY "compras_update_creator"
  ON compras FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
    AND usuario_id = auth.uid()
  );

CREATE POLICY "compras_delete_admin"
  ON compras FOR DELETE
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
    AND public.is_admin()
  );

-- =============================================================================
-- compra_items
-- Access controlled through parent compra.
-- =============================================================================

CREATE POLICY "ci_select"
  ON compra_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM compras
      WHERE compras.id = compra_items.compra_id
      AND compras.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "ci_insert"
  ON compra_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM compras
      WHERE compras.id = compra_items.compra_id
      AND compras.organization_id = public.user_organization_id()
      AND compras.usuario_id = auth.uid()
    )
  );

CREATE POLICY "ci_delete"
  ON compra_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM compras
      WHERE compras.id = compra_items.compra_id
      AND compras.organization_id = public.user_organization_id()
    )
  );

-- =============================================================================
-- movimientos_stock
-- APPEND-ONLY: SELECT + INSERT only. No UPDATE/DELETE policies.
-- This enforces that inventory corrections must be new adjustment movements.
-- =============================================================================

CREATE POLICY "ms_select"
  ON movimientos_stock FOR SELECT
  TO authenticated
  USING (organization_id = public.user_organization_id());

CREATE POLICY "ms_insert"
  ON movimientos_stock FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id = public.user_organization_id()
    AND usuario_id = auth.uid()
  );

-- NO UPDATE policy → RLS blocks updates
-- NO DELETE policy → RLS blocks deletes

-- =============================================================================
-- ventas
-- Authenticated users in the same org can SELECT and INSERT.
-- Only the creator can UPDATE (e.g., status changes).
-- Only admin can DELETE.
-- =============================================================================

CREATE POLICY "ventas_select"
  ON ventas FOR SELECT
  TO authenticated
  USING (organization_id = public.user_organization_id());

CREATE POLICY "ventas_insert"
  ON ventas FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id = public.user_organization_id()
    AND usuario_id = auth.uid()
  );

CREATE POLICY "ventas_update_creator"
  ON ventas FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
    AND usuario_id = auth.uid()
  );

CREATE POLICY "ventas_delete_admin"
  ON ventas FOR DELETE
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
    AND public.is_admin()
  );

-- =============================================================================
-- venta_items
-- Access controlled through parent venta.
-- =============================================================================

CREATE POLICY "vi_select"
  ON venta_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventas
      WHERE ventas.id = venta_items.venta_id
      AND ventas.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "vi_insert"
  ON venta_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventas
      WHERE ventas.id = venta_items.venta_id
      AND ventas.organization_id = public.user_organization_id()
      AND ventas.usuario_id = auth.uid()
    )
  );

CREATE POLICY "vi_delete"
  ON venta_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventas
      WHERE ventas.id = venta_items.venta_id
      AND ventas.organization_id = public.user_organization_id()
    )
  );

-- =============================================================================
-- movimientos_gasto
-- Authenticated users in the same org can SELECT and INSERT.
-- Only the creator can UPDATE.
-- Only admin can DELETE.
-- =============================================================================

CREATE POLICY "mg_select"
  ON movimientos_gasto FOR SELECT
  TO authenticated
  USING (organization_id = public.user_organization_id());

CREATE POLICY "mg_insert"
  ON movimientos_gasto FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id = public.user_organization_id()
    AND usuario_id = auth.uid()
  );

CREATE POLICY "mg_update_creator"
  ON movimientos_gasto FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
    AND usuario_id = auth.uid()
  );

CREATE POLICY "mg_delete_admin"
  ON movimientos_gasto FOR DELETE
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
    AND public.is_admin()
  );

-- =============================================================================
-- movimientos_caja
-- Authenticated users in the same org can SELECT and INSERT.
-- Only admin can UPDATE or DELETE.
-- =============================================================================

CREATE POLICY "mc_select"
  ON movimientos_caja FOR SELECT
  TO authenticated
  USING (organization_id = public.user_organization_id());

CREATE POLICY "mc_insert"
  ON movimientos_caja FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id = public.user_organization_id()
    AND usuario_id = auth.uid()
  );

CREATE POLICY "mc_update_admin"
  ON movimientos_caja FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
    AND public.is_admin()
  );

CREATE POLICY "mc_delete_admin"
  ON movimientos_caja FOR DELETE
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
    AND public.is_admin()
  );
