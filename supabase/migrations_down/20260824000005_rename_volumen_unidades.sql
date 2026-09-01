-- =============================================================================
-- DOWN: 20260824000005_rename_volumen_unidades
-- Revierte el rename de cantidad_por_unidad a volumen_botella.
-- =============================================================================

ALTER TABLE insumos RENAME COLUMN cantidad_por_unidad TO volumen_botella;
