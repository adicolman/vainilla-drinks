-- Recetas con imagen
ALTER TABLE recetas ADD COLUMN IF NOT EXISTS imagen_url text;

-- Bucket público para imágenes de tragos
INSERT INTO storage.buckets (id, name, public)
VALUES ('recetas', 'recetas', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas públicas para recetas bucket
DROP POLICY IF EXISTS "recetas_select" ON storage.objects;
CREATE POLICY "recetas_select" ON storage.objects FOR SELECT TO public USING (bucket_id = 'recetas');

DROP POLICY IF EXISTS "recetas_insert" ON storage.objects;
CREATE POLICY "recetas_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'recetas');

DROP POLICY IF EXISTS "recetas_update" ON storage.objects;
CREATE POLICY "recetas_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'recetas');

DROP POLICY IF EXISTS "recetas_delete" ON storage.objects;
CREATE POLICY "recetas_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'recetas');
