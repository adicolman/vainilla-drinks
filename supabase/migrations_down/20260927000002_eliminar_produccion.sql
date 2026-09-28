-- =============================================================================
-- VAINILLA DRINKS — Reversa: Eliminar producción del sistema
-- =============================================================================
-- Restaura tablas, RLS, policies y funciones de producción tal como quedaron
-- después de la ultima migracion que las toco (20260911000003: registrar_produccion
-- con factor_conversion y exclusion de es_nota).
-- Nota: los movimientos_stock tipo 'produccion' existentes no se modifican.
-- =============================================================================

-- 1. Tablas
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

-- 2. RLS
ALTER TABLE produccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE produccion_detalles ENABLE ROW LEVEL SECURITY;

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

-- 3. registrar_produccion() (version final: factor_conversion + es_nota)
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
  INSERT INTO produccion (
    organization_id, usuario_id, receta_id,
    cantidad_producida, unidad, notas
  ) VALUES (
    p_organization_id, p_usuario_id, p_receta_id,
    p_cantidad_producida, p_unidad, p_notas
  ) RETURNING id INTO v_produccion_id;

  FOR v_ingrediente IN
    SELECT ri.insumo_id, ri.cantidad_para_1_litro, ri.unidad, ri.factor_conversion, ri.es_nota, i.costo_promedio
    FROM receta_ingredientes ri
    JOIN insumos i ON i.id = ri.insumo_id
    WHERE ri.receta_id = p_receta_id
      AND COALESCE(ri.es_nota, false) = false
  LOOP
    v_cantidad_consumida := v_ingrediente.cantidad_para_1_litro * COALESCE(v_ingrediente.factor_conversion, 1) * p_cantidad_producida;
    v_costo_linea := v_cantidad_consumida * v_ingrediente.costo_promedio;
    v_costo_total := v_costo_total + v_costo_linea;

    INSERT INTO produccion_detalles (
      produccion_id, insumo_id, cantidad_consumida,
      unidad, costo_unitario
    ) VALUES (
      v_produccion_id, v_ingrediente.insumo_id, v_cantidad_consumida,
      v_ingrediente.unidad, v_ingrediente.costo_promedio
    );

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

  UPDATE produccion
  SET costo_total = v_costo_total
  WHERE id = v_produccion_id;

  RETURN v_produccion_id;
END;
$$;

COMMENT ON FUNCTION registrar_produccion IS 'Registra un lote de producción: crea cabecera, detalle de ingredientes consumidos y movimientos de stock.';

-- 4. eliminar_insumo(): restaura la limpieza de produccion_detalles
CREATE OR REPLACE FUNCTION public.eliminar_insumo(p_insumo_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM receta_ingredientes WHERE insumo_id = p_insumo_id;
  DELETE FROM compra_items WHERE insumo_id = p_insumo_id;
  DELETE FROM produccion_detalles WHERE insumo_id = p_insumo_id;
  DELETE FROM movimientos_stock WHERE insumo_id = p_insumo_id;
  DELETE FROM insumos WHERE id = p_insumo_id;
END;
$$;
