-- =============================================================================
-- VAINILLA DRINKS — Eliminar insumo con cascade
-- Migration: 011
-- Date: 2026-08-27
-- =============================================================================
-- Function to delete an insumo and all associated records:
--   receta_ingredientes, compra_items, produccion_detalles, movimientos_stock
-- =============================================================================

CREATE OR REPLACE FUNCTION public.eliminar_insumo(p_insumo_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Eliminar ingredientes de recetas que usan este insumo
  DELETE FROM receta_ingredientes WHERE insumo_id = p_insumo_id;

  -- 2. Eliminar items de compras
  DELETE FROM compra_items WHERE insumo_id = p_insumo_id;

  -- 3. Eliminar detalles de produccion
  DELETE FROM produccion_detalles WHERE insumo_id = p_insumo_id;

  -- 4. Eliminar movimientos de stock
  DELETE FROM movimientos_stock WHERE insumo_id = p_insumo_id;

  -- 5. Eliminar el insumo
  DELETE FROM insumos WHERE id = p_insumo_id;
END;
$$;
