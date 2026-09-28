-- Revert fix costo conversion

CREATE OR REPLACE FUNCTION obtener_costo_receta(p_receta_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    SUM(i.costo_promedio * ri.cantidad_para_1_litro),
    0
  )
  FROM receta_ingredientes ri
  JOIN insumos i ON i.id = ri.insumo_id
  WHERE ri.receta_id = p_receta_id;
$$;

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
    SELECT ri.insumo_id, ri.cantidad_para_1_litro, ri.unidad, i.costo_promedio
    FROM receta_ingredientes ri
    JOIN insumos i ON i.id = ri.insumo_id
    WHERE ri.receta_id = p_receta_id
  LOOP
    v_cantidad_consumida := v_ingrediente.cantidad_para_1_litro * p_cantidad_producida;
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
