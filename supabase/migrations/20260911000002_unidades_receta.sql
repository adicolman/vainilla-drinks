-- =============================================================================
-- VAINILLA DRINKS — Unidades por ingrediente en recetas
-- Migration: 013
-- Date: 2026-09-11
-- =============================================================================

-- 1. Agregar unidad_receta y factor_conversion a receta_ingredientes
--    unidad_receta: la unidad que usa el bartender (g, ml, bocha, unidad, oz)
--    factor_conversion: cuánto equivale 1 unidad_receta en la unidad base del stock
--    Ej: helado = 'bocha', factor = 0.0375 (1 bocha = 37.5g, stock en kg)

ALTER TABLE receta_ingredientes ADD COLUMN unidad_receta text;
ALTER TABLE receta_ingredientes ADD COLUMN factor_conversion numeric(10,4) DEFAULT 1;
