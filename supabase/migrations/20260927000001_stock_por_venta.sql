-- =============================================================================
-- VAINILLA DRINKS — Descuento de stock al registrar una venta
-- =============================================================================
-- Cada venta descuenta los ingredientes de la receta del inventario.
-- Es una salida directa de mercadería (tipo 'venta'), sin pasar por producción.
-- Aplica factor_conversion (ej: cucharadas -> gramos) y excluye los es_nota.

CREATE OR REPLACE FUNCTION registrar_stock_por_venta(
  p_organization_id uuid,
  p_usuario_id uuid,
  p_venta_id uuid,
  p_receta_id uuid,
  p_cantidad_vendida numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ing record;
  v_cantidad numeric;
  v_receta text;
BEGIN
  IF p_organization_id IS DISTINCT FROM public.user_organization_id() THEN
    RAISE EXCEPTION 'Organización no autorizada';
  END IF;

  SELECT nombre INTO v_receta FROM recetas WHERE id = p_receta_id;

  FOR v_ing IN
    SELECT ri.insumo_id, ri.cantidad_para_1_litro, ri.unidad, ri.factor_conversion
    FROM receta_ingredientes ri
    WHERE ri.receta_id = p_receta_id
      AND COALESCE(ri.es_nota, false) = false
  LOOP
    v_cantidad := v_ing.cantidad_para_1_litro
                * COALESCE(v_ing.factor_conversion, 1)
                * p_cantidad_vendida;

    CONTINUE WHEN v_cantidad <= 0;

    INSERT INTO movimientos_stock (
      organization_id, insumo_id, usuario_id,
      tipo, cantidad, unidad, motivo, referencia_id
    ) VALUES (
      p_organization_id, v_ing.insumo_id, p_usuario_id,
      'venta', v_cantidad, v_ing.unidad,
      'Venta ' || COALESCE(v_receta, ''),
      p_venta_id
    );
  END LOOP;
END;
$$;

COMMENT ON FUNCTION registrar_stock_por_venta IS
  'Descuenta de movimientos_stock los ingredientes de una receta vendida, aplicando factor_conversion y excluyendo es_nota.';
