-- =============================================================================
-- DOWN: 20260822000003_functions
-- Revierte funciones de negocio y el trigger de sincronización de stock.
-- =============================================================================

DROP TRIGGER IF EXISTS after_movimiento_stock_insert ON movimientos_stock;

DROP FUNCTION IF EXISTS public.actualizar_costo_promedio(uuid, numeric, numeric);
DROP FUNCTION IF EXISTS public.sincronizar_stock_insumo(uuid);
DROP FUNCTION IF EXISTS public.obtener_margen_receta(uuid);
DROP FUNCTION IF EXISTS public.obtener_costo_receta(uuid);
DROP FUNCTION IF EXISTS public.calcular_stock_insumo(uuid);
