-- =============================================================================
-- DOWN: 20260822000005_seed
-- ⚠️ NO se elimina la organización semilla automáticamente: es probable que
-- ya existan usuarios, insumos, recetas, etc. vinculados a ella (con
-- ON DELETE RESTRICT/CASCADE), y borrarla implicaría perder todos los datos
-- del negocio.
--
-- Si estás SEGURO de que no hay ningún dato dependiente, ejecutá manualmente:
--   DELETE FROM organizations WHERE slug = 'vainilla-drinks';
-- =============================================================================

SELECT 1; -- no-op intencional
