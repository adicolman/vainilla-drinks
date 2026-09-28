ALTER TABLE recetas DROP COLUMN IF EXISTS imagen_url;
DELETE FROM storage.buckets WHERE id='recetas';
DROP POLICY IF EXISTS "recetas_select" ON storage.objects;
DROP POLICY IF EXISTS "recetas_insert" ON storage.objects;
DROP POLICY IF EXISTS "recetas_update" ON storage.objects;
DROP POLICY IF EXISTS "recetas_delete" ON storage.objects;
