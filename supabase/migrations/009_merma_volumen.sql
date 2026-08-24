-- =============================================================================
-- VAINILLA DRINKS — Drop merma, add volumen_botella
-- Migration: 009
-- Date: 2026-08-24
-- =============================================================================
-- Removes merma_porcentaje from insumos (not needed).
-- Adds volumen_botella: total ml per purchase unit (e.g. 750 for a 750ml bottle).
-- This lets the system calculate cost per ml automatically.
-- =============================================================================

ALTER TABLE insumos DROP COLUMN IF EXISTS merma_porcentaje;
ALTER TABLE insumos ADD COLUMN volumen_botella numeric;

COMMENT ON COLUMN insumos.volumen_botella IS 'Volumen total en ml de la unidad de compra (ej: 750 para una botella de 750ml). Se usa para calcular costo por ml.';
