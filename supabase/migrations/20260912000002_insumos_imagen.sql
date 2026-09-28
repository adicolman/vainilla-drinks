-- Insumos con imagen
ALTER TABLE insumos ADD COLUMN IF NOT EXISTS imagen_url text;

-- Bucket público para imágenes de insumos
INSERT INTO storage.buckets (id, name, public)
VALUES ('insumos', 'insumos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas públicas para insumos bucket
DROP POLICY IF EXISTS "insumos_select" ON storage.objects;
CREATE POLICY "insumos_select" ON storage.objects FOR SELECT TO public USING (bucket_id = 'insumos');

DROP POLICY IF EXISTS "insumos_insert" ON storage.objects;
CREATE POLICY "insumos_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'insumos');

DROP POLICY IF EXISTS "insumos_update" ON storage.objects;
CREATE POLICY "insumos_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'insumos');

DROP POLICY IF EXISTS "insumos_delete" ON storage.objects;
CREATE POLICY "insumos_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'insumos');
