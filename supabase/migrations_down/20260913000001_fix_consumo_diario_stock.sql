-- Revertir: quitar consumo_diario del cálculo de stock (volver al comportamiento anterior)

CREATE OR REPLACE FUNCTION calcular_stock_insumo(p_insumo_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    SUM(
      CASE
        WHEN tipo = 'compra' THEN cantidad
        WHEN tipo = 'devolucion' THEN cantidad
        WHEN tipo = 'venta' THEN -cantidad
        WHEN tipo = 'merma' THEN -cantidad
        WHEN tipo = 'produccion' THEN -cantidad
        WHEN tipo = 'ajuste' THEN
          CASE WHEN cantidad > 0 THEN cantidad ELSE -cantidad END
        ELSE 0
      END
    ),
    0
  )
  FROM movimientos_stock
  WHERE insumo_id = p_insumo_id;
$$;
