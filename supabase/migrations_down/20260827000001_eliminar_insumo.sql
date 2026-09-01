-- =============================================================================
-- DOWN: 20260827000001_eliminar_insumo
-- Revierte la función de eliminación en cascada de insumos.
-- =============================================================================

DROP FUNCTION IF EXISTS public.eliminar_insumo(uuid);
