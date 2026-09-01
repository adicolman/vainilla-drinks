-- =============================================================================
-- VAINILLA DRINKS — Producción
-- Migration: 006_produccion
-- Date: 2026-08-24
-- =============================================================================
-- Adds production tracking tables and a function to register production
-- batches that automatically consume ingredients from stock.
-- =============================================================================

-- =============================================================================
-- 1. TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- produccion
-- Production batch header. Tracks what was produced, when, and the total cost.
-- -----------------------------------------------------------------------------
CREATE TABLE produccion (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  usuario_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  receta_id           uuid NOT NULL REFERENCES recetas(id) ON DELETE RESTRICT,
  fecha               timestamptz NOT NULL DEFAULT now(),
  cantidad_producida  numeric(12,2) NOT NULL,
  unidad              unidad_medida NOT NULL DEFAULT 'l',
  costo_total         numeric(12,2) NOT NULL DEFAULT 0,
  notas               text NOT NULL DEFAULT '',
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_produccion_organization ON produccion(organization_id);
CREATE INDEX idx_produccion_fecha ON produccion(organization_id, fecha);
CREATE INDEX idx_produccion_receta ON produccion(receta_id);

COMMENT ON TABLE produccion IS 'Lotes de producción. Registra qué recetas se produjeron, cuánto y a qué costo.';

-- -----------------------------------------------------------------------------
-- produccion_detalles
-- Detail of ingredients consumed per production batch.
-- Each row = one insumo consumed, with the quantity and cost at production time.
-- -----------------------------------------------------------------------------
CREATE TABLE produccion_detalles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produccion_id       uuid NOT NULL REFERENCES produccion(id) ON DELETE CASCADE,
  insumo_id           uuid NOT NULL REFERENCES insumos(id) ON DELETE RESTRICT,
  cantidad_consumida  numeric(12,2) NOT NULL,
  unidad              unidad_medida NOT NULL,
  costo_unitario      numeric(12,2) NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_produccion_detalles_produccion ON produccion_detalles(produccion_id);
CREATE INDEX idx_produccion_detalles_insumo ON produccion_detalles(insumo_id);

COMMENT ON TABLE produccion_detalles IS 'Detalle de insumos consumidos por cada lote de producción.';

-- =============================================================================
-- 2. RLS
-- =============================================================================

ALTER TABLE produccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE produccion_detalles ENABLE ROW LEVEL SECURITY;

-- produccion: SELECT + INSERT for org members; DELETE admin only
CREATE POLICY "produccion_select"
  ON produccion FOR SELECT
  TO authenticated
  USING (organization_id = public.user_organization_id());

CREATE POLICY "produccion_insert"
  ON produccion FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id = public.user_organization_id()
    AND usuario_id = auth.uid()
  );

CREATE POLICY "produccion_delete_admin"
  ON produccion FOR DELETE
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
    AND public.is_admin()
  );

-- produccion_detalles: access through parent produccion
CREATE POLICY "pd_select"
  ON produccion_detalles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM produccion
      WHERE produccion.id = produccion_detalles.produccion_id
      AND produccion.organization_id = public.user_organization_id()
    )
  );

CREATE POLICY "pd_insert"
  ON produccion_detalles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM produccion
      WHERE produccion.id = produccion_detalles.produccion_id
      AND produccion.organization_id = public.user_organization_id()
      AND produccion.usuario_id = auth.uid()
    )
  );

CREATE POLICY "pd_delete"
  ON produccion_detalles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM produccion
      WHERE produccion.id = produccion_detalles.produccion_id
      AND produccion.organization_id = public.user_organization_id()
    )
  );

-- =============================================================================
-- 3. FUNCTION: registrar_produccion()
-- =============================================================================
-- Registers a production batch:
--   1. Creates the produccion header
--   2. For each ingredient in the recipe, calculates the required quantity
--      (cantidad_para_1_litro * cantidad_producida) and inserts a produccion_detalles row
--   3. Inserts a movimientos_stock row (tipo='produccion') for each ingredient
--      The trigger after_movimiento_stock_insert auto-syncs insumos.stock_actual
--
-- Returns: the new produccion id
-- =============================================================================

CREATE OR REPLACE FUNCTION registrar_produccion(
  p_organization_id uuid,
  p_usuario_id uuid,
  p_receta_id uuid,
  p_cantidad_producida numeric,
  p_unidad unidad_medida,
  p_notas text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_produccion_id uuid;
  v_costo_total numeric := 0;
  v_ingrediente record;
  v_cantidad_consumida numeric;
  v_costo_linea numeric;
BEGIN
  -- Create the production header
  INSERT INTO produccion (
    organization_id, usuario_id, receta_id,
    cantidad_producida, unidad, notas
  ) VALUES (
    p_organization_id, p_usuario_id, p_receta_id,
    p_cantidad_producida, p_unidad, p_notas
  ) RETURNING id INTO v_produccion_id;

  -- Process each ingredient
  FOR v_ingrediente IN
    SELECT ri.insumo_id, ri.cantidad_para_1_litro, ri.unidad, i.costo_promedio
    FROM receta_ingredientes ri
    JOIN insumos i ON i.id = ri.insumo_id
    WHERE ri.receta_id = p_receta_id
  LOOP
    -- Calculate quantity consumed: proportion per liter * liters produced
    v_cantidad_consumida := v_ingrediente.cantidad_para_1_litro * p_cantidad_producida;

    -- Calculate cost for this ingredient
    v_costo_linea := v_cantidad_consumida * v_ingrediente.costo_promedio;
    v_costo_total := v_costo_total + v_costo_linea;

    -- Insert production detail
    INSERT INTO produccion_detalles (
      produccion_id, insumo_id, cantidad_consumida,
      unidad, costo_unitario
    ) VALUES (
      v_produccion_id, v_ingrediente.insumo_id, v_cantidad_consumida,
      v_ingrediente.unidad, v_ingrediente.costo_promedio
    );

    -- Insert stock movement (consumption)
    INSERT INTO movimientos_stock (
      organization_id, insumo_id, usuario_id,
      tipo, cantidad, unidad, motivo, referencia_id
    ) VALUES (
      p_organization_id, v_ingrediente.insumo_id, p_usuario_id,
      'produccion', v_cantidad_consumida, v_ingrediente.unidad,
      'Producción lote ' || LEFT(v_produccion_id::text, 8),
      v_produccion_id
    );
  END LOOP;

  -- Update total cost on the production header
  UPDATE produccion
  SET costo_total = v_costo_total
  WHERE id = v_produccion_id;

  RETURN v_produccion_id;
END;
$$;

COMMENT ON FUNCTION registrar_produccion IS 'Registra un lote de producción: crea cabecera, detalle de ingredientes consumidos y movimientos de stock.';
