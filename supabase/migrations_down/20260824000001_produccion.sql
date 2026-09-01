-- =============================================================================
-- DOWN: 20260824000001_produccion
-- Revierte las tablas de producción y su función RPC.
-- ⚠️ DESTRUCTIVO: elimina todo el historial de producción registrado.
-- =============================================================================

DROP FUNCTION IF EXISTS public.registrar_produccion(uuid, uuid, uuid, numeric, unidad_medida, text);

DROP POLICY IF EXISTS "produccion_select" ON produccion;
DROP POLICY IF EXISTS "produccion_insert" ON produccion;
DROP POLICY IF EXISTS "produccion_detalles_select" ON produccion_detalles;
DROP POLICY IF EXISTS "produccion_detalles_insert" ON produccion_detalles;

DROP TABLE IF EXISTS produccion_detalles;
DROP TABLE IF EXISTS produccion;
