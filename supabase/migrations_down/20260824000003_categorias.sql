-- =============================================================================
-- DOWN: 20260824000003_categorias
-- Revierte la tabla de categorías editables.
-- ⚠️ Después de esto, las categorías de insumos/recetas vuelven a ser
-- texto libre sin lista predefinida en la UI (hasta que se actualice el
-- código también).
-- =============================================================================

DROP TABLE IF EXISTS categorias;
