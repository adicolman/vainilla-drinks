-- Reversa: eliminar la función de descuento de stock por venta
-- Nota: los movimientos_stock ya generados son append-only y se conservan.

DROP FUNCTION IF EXISTS public.registrar_stock_por_venta(uuid, uuid, uuid, uuid, numeric);
