-- =============================================================================
-- VAINILLA DRINKS — Categorías editables
-- Migration: 008_categorias
-- Date: 2026-08-24
-- =============================================================================
-- Adds a categorias table to store allowed category values per type.
-- insumos.categoria and recetas.categoria remain as text (no FK change).
-- The categorias table is the dictionary of allowed values.
-- =============================================================================

-- =============================================================================
-- 1. TABLE
-- =============================================================================

CREATE TABLE categorias (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tipo            text NOT NULL CHECK (tipo IN ('insumo', 'receta')),
  nombre          text NOT NULL,
  activo          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),

  UNIQUE(organization_id, tipo, nombre)
);

CREATE INDEX idx_categorias_organization ON categorias(organization_id, tipo);

COMMENT ON TABLE categorias IS 'Diccionario de categorías permitidas para insumos y recetas.';

-- =============================================================================
-- 2. RLS
-- =============================================================================

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categorias_select"
  ON categorias FOR SELECT
  TO authenticated
  USING (organization_id = public.user_organization_id());

CREATE POLICY "categorias_insert"
  ON categorias FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = public.user_organization_id());

CREATE POLICY "categorias_update"
  ON categorias FOR UPDATE
  TO authenticated
  USING (organization_id = public.user_organization_id());

CREATE POLICY "categorias_delete"
  ON categorias FOR DELETE
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
    AND public.is_admin()
  );

-- =============================================================================
-- 3. SEED — Existing hardcoded categories for 'vainilla-drinks'
-- =============================================================================

INSERT INTO categorias (organization_id, tipo, nombre)
SELECT o.id, t.tipo, t.nombre
FROM organizations o
CROSS JOIN (VALUES
  ('insumo', 'General'),
  ('insumo', 'Fruta'),
  ('insumo', 'Espíritu'),
  ('insumo', 'Mixer'),
  ('insumo', 'Packaging'),
  ('insumo', 'Hielo'),
  ('insumo', 'Otro'),
  ('receta', 'General'),
  ('receta', 'Clásico'),
  ('receta', 'De firma'),
  ('receta', 'Sin alcohol'),
  ('receta', 'De temporada'),
  ('receta', 'Otro')
) AS t(tipo, nombre)
WHERE o.slug = 'vainilla-drinks'
ON CONFLICT (organization_id, tipo, nombre) DO NOTHING;
