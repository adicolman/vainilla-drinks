-- =============================================================================
-- VAINILLA DRINKS — Reversa: Consumo diario + ingredientes nota
-- Migration: 012-reverse
-- Date: 2026-09-11
-- =============================================================================

-- 1. Eliminar columna es_nota
ALTER TABLE receta_ingredientes DROP COLUMN IF EXISTS es_nota;

-- 2. No se puede eliminar un valor de un ENUM en PostgreSQL directamente.
--    Se recrea el ENUM sin 'consumo_diario'. Primero se renombra el viejo.
--    NOTA: Esto solo funciona si no hay movimientos_stock con tipo = 'consumo_diario'.
--    Si los hay, migrar esos registros a otro tipo primero.

-- Crear ENUM temporal sin 'consumo_diario'
CREATE TYPE tipo_movimiento_stock_tmp AS ENUM (
  'compra', 'produccion', 'venta', 'merma', 'ajuste', 'devolucion'
);

-- Migrar datos si existen
ALTER TABLE movimientos_stock
  ALTER COLUMN tipo TYPE tipo_movimiento_stock_tmp
  USING CASE tipo
    WHEN 'consumo_diario' THEN 'ajuste'::tipo_movimiento_stock_tmp
    ELSE tipo::text::tipo_movimiento_stock_tmp
  END;

-- Eliminar ENUM viejo y renombrar el nuevo
ALTER TABLE movimientos_stock ALTER COLUMN tipo DROP DEFAULT;
DROP TYPE tipo_movimiento_stock;
ALTER TYPE tipo_movimiento_stock_tmp RENAME TO tipo_movimiento_stock;
ALTER TABLE movimientos_stock ALTER COLUMN tipo SET DEFAULT 'ajuste'::tipo_movimiento_stock;
