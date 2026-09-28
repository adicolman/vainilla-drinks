-- =============================================================================
-- VAINILLA DRINKS — Eliminar producción del sistema
-- =============================================================================
-- La venta descuenta stock directamente (registrar_stock_por_venta), por lo
-- que el módulo de producción no se usa y se elimina por completo.
-- Se preserva el historial de movimientos_stock tipo 'produccion' (el enum y
-- el calculo de saldo no se tocan) y el valor en referencia_id queda como
-- referencia historica sin FK.
-- =============================================================================

-- 1. eliminar_insumo(): ya no hay produccion_detalles que limpiar
CREATE OR REPLACE FUNCTION public.eliminar_insumo(p_insumo_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM receta_ingredientes WHERE insumo_id = p_insumo_id;
  DELETE FROM compra_items WHERE insumo_id = p_insumo_id;
  DELETE FROM movimientos_stock WHERE insumo_id = p_insumo_id;
  DELETE FROM insumos WHERE id = p_insumo_id;
END;
$$;

-- 2. Funcion de registro de lotes
DROP FUNCTION IF EXISTS public.registrar_produccion(uuid, uuid, uuid, numeric, unidad_medida, text);

-- 3. Tablas (detalles primero por la FK)
DROP TABLE IF EXISTS produccion_detalles;
DROP TABLE IF EXISTS produccion;
