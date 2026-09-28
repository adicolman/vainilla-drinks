-- =============================================================================
-- VAINILLA DRINKS — Reversa: Unidades por ingrediente en recetas
-- Migration: 013-reverse
-- Date: 2026-09-11
-- =============================================================================

ALTER TABLE receta_ingredientes DROP COLUMN IF EXISTS unidad_receta;
ALTER TABLE receta_ingredientes DROP COLUMN IF EXISTS factor_conversion;
