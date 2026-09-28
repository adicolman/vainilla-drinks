-- Corregir calcular_stock_insumo: consumo_diario era ignorado (ELSE 0)
-- Ahora se trata como salida de stock, igual que venta y merma.

CREATE OR REPLACE FUNCTION calcular_stock_insumo(p_insumo_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    SUM(
      CASE
        -- ENTRADAS: aumentan stock
        WHEN tipo = 'compra' THEN cantidad
        WHEN tipo = 'devolucion' THEN cantidad
        -- SALIDAS: disminuyen stock
        WHEN tipo = 'venta' THEN -cantidad
        WHEN tipo = 'merma' THEN -cantidad
        WHEN tipo = 'produccion' THEN -cantidad
        WHEN tipo = 'consumo_diario' THEN -cantidad
        -- AJUSTE: puede ser positivo o negativo
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
