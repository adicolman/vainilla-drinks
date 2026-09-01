-- =============================================================================
-- DOWN: 20260824000002_compras_proveedor
-- Revierte proveedor_nombre y vuelve proveedor_id obligatorio.
-- ⚠️ Falla si existen compras con proveedor_id NULL (compras creadas con
-- solo el nombre de texto libre) — hay que resolver esos datos primero.
-- =============================================================================

ALTER TABLE compras DROP COLUMN IF EXISTS proveedor_nombre;
ALTER TABLE compras ALTER COLUMN proveedor_id SET NOT NULL;
