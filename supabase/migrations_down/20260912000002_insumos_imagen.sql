ALTER TABLE insumos DROP COLUMN IF EXISTS imagen_url;
DELETE FROM storage.buckets WHERE id='insumos';
DROP POLICY IF EXISTS "insumos_select" ON storage.objects;
DROP POLICY IF EXISTS "insumos_insert" ON storage.objects;
DROP POLICY IF EXISTS "insumos_update" ON storage.objects;
DROP POLICY IF EXISTS "insumos_delete" ON storage.objects;
