-- =============================================================================
-- VAINILLA DRINKS — Core Database Functions
-- Migration: 003_functions.sql
-- Date: 2026-08-22
-- =============================================================================
-- Fundamental RPC functions for the application:
--   1. calcular_stock_insumo() — Source-of-truth stock calculation
--   2. obtener_costo_receta() — Recipe cost using weighted average
-- =============================================================================

-- =============================================================================
-- 1. calcular_stock_insumo(insumo_id uuid)
-- =============================================================================
-- Calculates the current stock of an insumo from movimientos_stock.
-- This is the SOURCE OF TRUTH. The stock_actual column in insumos is a cache
-- that should be reconciled periodically or after each movement.
--
-- Logic:
--   Positive movement types (stock IN):  compra, produccion (reverse), devolucion
--   Negative movement types (stock OUT): venta, merma, ajuste (negative)
--
-- Note: 'produccion' can be either IN or OUT depending on context.
-- For MVP, 'produccion' is treated as OUT (consuming ingredients to make products).
-- If a production run results in unused material, it should be registered as a
-- separate 'ajuste' with positive quantity.
--
-- Returns: numeric (current stock in the insumo's unidad_medida)
-- =============================================================================

CREATE OR REPLACE FUNCTION calcular_stock_insumo(p_insumo_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    SUM(
      CASE
        -- ENTRADAS: aumentan stock
        WHEN tipo = 'compra' THEN cantidad
        WHEN tipo = 'devolucion' THEN cantidad
        -- SALIDAS: disminuyen stock
        WHEN tipo = 'venta' THEN -cantidad
        WHEN tipo = 'merma' THEN -cantidad
        WHEN tipo = 'produccion' THEN -cantidad
        -- AJUSTE: puede ser positivo o negativo
        WHEN tipo = 'ajuste' THEN
          CASE WHEN cantidad > 0 THEN cantidad ELSE -cantidad END
        ELSE 0
      END
    ),
    0
  )
  FROM movimientos_stock
  WHERE insumo_id = p_insumo_id;
$$;

COMMENT ON FUNCTION calcular_stock_insumo IS 'Calcula el stock actual de un insumo desde movimientos_stock (fuente de verdad).';

-- =============================================================================
-- 2. obtener_costo_receta(receta_id uuid)
-- =============================================================================
-- Calculates the total cost of producing 1 liter of a recipe.
-- Uses the weighted average cost (costo_promedio) of each insumo.
--
-- Formula:
--   SUM(insumo.costo_promedio * ingrediente.cantidad_para_1_litro)
--   for all ingredients of the recipe.
--
-- Returns: numeric (total cost in currency for 1 liter)
-- =============================================================================

CREATE OR REPLACE FUNCTION obtener_costo_receta(p_receta_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    SUM(i.costo_promedio * ri.cantidad_para_1_litro),
    0
  )
  FROM receta_ingredientes ri
  JOIN insumos i ON i.id = ri.insumo_id
  WHERE ri.receta_id = p_receta_id;
$$;

COMMENT ON FUNCTION obtener_costo_receta IS 'Calcula el costo de producir 1 litro de una receta usando costo promedio ponderado.';

-- =============================================================================
-- 3. obtener_margen_receta(receta_id uuid)
-- =============================================================================
-- Calculates the real margin for a recipe:
--   margen = (precio_venta - costo) / precio_venta * 100
--
-- Returns: numeric (margin percentage)
-- =============================================================================

CREATE OR REPLACE FUNCTION obtener_margen_receta(p_receta_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    CASE
      WHEN r.precio_venta > 0 THEN
        ROUND(((r.precio_venta - obtener_costo_receta(r.id)) / r.precio_venta * 100)::numeric, 2)
      ELSE 0
    END
  FROM recetas r
  WHERE r.id = p_receta_id;
$$;

COMMENT ON FUNCTION obtener_margen_receta IS 'Calcula el margen real de una receta (precio - costo) / precio * 100.';

-- =============================================================================
-- 4. sincronizar_stock_insumo(insumo_id uuid)
-- =============================================================================
-- Reconciles the cached stock_actual in insumos with the source of truth.
-- Should be called after each movimientos_stock INSERT (via trigger) or
-- on-demand for reconciliation.
--
-- Returns: numeric (the synchronized stock value)
-- =============================================================================

CREATE OR REPLACE FUNCTION sincronizar_stock_insumo(p_insumo_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stock numeric;
BEGIN
  v_stock := calcular_stock_insumo(p_insumo_id);

  UPDATE insumos
  SET stock_actual = v_stock,
      updated_at = now()
  WHERE id = p_insumo_id;

  RETURN v_stock;
END;
$$;

COMMENT ON FUNCTION sincronizar_stock_insumo IS 'Sincroniza el stock_actual cacheado con el cálculo real desde movimientos.';

-- =============================================================================
-- TRIGGER: Auto-sync stock after each movimientos_stock INSERT
-- =============================================================================

CREATE OR REPLACE FUNCTION trigger_sync_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM sincronizar_stock_insumo(NEW.insumo_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_movimiento_stock_insert
  AFTER INSERT ON movimientos_stock
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_stock();

-- =============================================================================
-- 5. actualizar_costo_promedio(insumo_id uuid, nueva_cantidad numeric, nuevo_costo numeric)
-- =============================================================================
-- Updates the weighted average cost of an insumo after a purchase.
--
-- Formula:
--   new_avg = ((current_avg * current_stock) + (new_cost * new_qty)) / (current_stock + new_qty)
--
-- This is called when a compra is confirmed and stock is received.
-- =============================================================================

CREATE OR REPLACE FUNCTION actualizar_costo_promedio(
  p_insumo_id uuid,
  p_nueva_cantidad numeric,
  p_nuevo_costo numeric
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stock_actual numeric;
  v_costo_promedio numeric;
  v_nuevo_promedio numeric;
BEGIN
  SELECT stock_actual, costo_promedio
  INTO v_stock_actual, v_costo_promedio
  FROM insumos
  WHERE id = p_insumo_id;

  -- If no stock yet, the new cost becomes the average
  IF v_stock_actual <= 0 THEN
    v_nuevo_promedio := p_nuevo_costo;
  ELSE
    -- Weighted average
    v_nuevo_promedio := ROUND(
      ((v_costo_promedio * v_stock_actual) + (p_nuevo_costo * p_nueva_cantidad))
      / (v_stock_actual + p_nueva_cantidad),
      2
    );
  END IF;

  UPDATE insumos
  SET costo_promedio = v_nuevo_promedio,
      costo_unitario = p_nuevo_costo,
      updated_at = now()
  WHERE id = p_insumo_id;

  RETURN v_nuevo_promedio;
END;
$$;

COMMENT ON FUNCTION actualizar_costo_promedio IS 'Actualiza el costo promedio ponderado de un insumo tras una compra.';
