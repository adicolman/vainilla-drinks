-- =============================================================================
-- DOWN: 20260822000004_auth_trigger
-- Revierte el trigger que crea perfiles automáticamente al registrarse.
-- ⚠️ Después de aplicar esto, los nuevos usuarios de auth.users NO tendrán
-- perfil creado automáticamente.
-- =============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
