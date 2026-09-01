-- =============================================================================
-- DOWN: 20260824000004_merma_volumen
-- Revierte: quita volumen_botella, restaura merma_porcentaje.
-- =============================================================================

ALTER TABLE insumos DROP COLUMN IF EXISTS volumen_botella;
ALTER TABLE insumos ADD COLUMN IF NOT EXISTS merma_porcentaje numeric(5,2) NOT NULL DEFAULT 0;
