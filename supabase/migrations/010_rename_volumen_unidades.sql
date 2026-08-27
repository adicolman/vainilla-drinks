-- =============================================================================
-- VAINILLA DRINKS — Rename volumen_botella, simplify units
-- Migration: 010
-- Date: 2026-08-24
-- =============================================================================
-- Renames volumen_botella → cantidad_por_unidad (more generic).
-- Removes 'g' from UnidadMedida (use kg instead).
-- =============================================================================

ALTER TABLE insumos RENAME COLUMN volumen_botella TO cantidad_por_unidad;

COMMENT ON COLUMN insumos.cantidad_por_unidad IS 'Cantidad de unidades base que trae 1 unidad de compra. Ej: 750ml por botella, 1kg por paquete, 100 por paquete de vasos.';
