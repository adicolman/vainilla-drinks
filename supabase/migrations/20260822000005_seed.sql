-- =============================================================================
-- VAINILLA DRINKS — Seed Data
-- Run AFTER migrations 001-004.
-- =============================================================================
-- Inserts the default organization for MVP.
-- The auth trigger (004) looks up this org by slug.
-- =============================================================================

INSERT INTO organizations (nombre, slug, activo)
VALUES ('Vainilla Drinks', 'vainilla-drinks', true)
ON CONFLICT (slug) DO NOTHING;

-- Verify:
-- SELECT * FROM organizations;
-- Should show: Vainilla Drinks | vainilla-drinks | true
