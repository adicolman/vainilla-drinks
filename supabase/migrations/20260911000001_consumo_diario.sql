-- =============================================================================
-- VAINILLA DRINKS — Consumo diario + ingredientes nota
-- Migration: 012
-- Date: 2026-09-11
-- =============================================================================

-- 1. Agregar 'consumo_diario' al ENUM de movimientos de stock
ALTER TYPE tipo_movimiento_stock ADD VALUE 'consumo_diario';

-- 2. Agregar columna es_nota a receta_ingredientes
--    Cuando es_nota = true, el ingrediente aparece en la receta pero no calcula costo
ALTER TABLE receta_ingredientes ADD COLUMN es_nota boolean DEFAULT false;
