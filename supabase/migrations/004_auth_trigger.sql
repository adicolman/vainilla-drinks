-- =============================================================================
-- VAINILLA DRINKS — Auth Trigger
-- Migration: 004_auth_trigger
-- Date: 2026-08-22
-- =============================================================================
-- Auto-creates a profile when a new user signs up via Supabase Auth.
-- Uses SECURITY DEFINER to bypass RLS when inserting into profiles.
-- Looks up the organization by slug (no hardcoded UUIDs).
-- =============================================================================

-- =============================================================================
-- 1. FUNCTION: handle_new_user()
-- =============================================================================
-- Triggered AFTER INSERT on auth.users.
-- Creates a profile linked to the default organization (slug: 'vainilla-drinks').
-- Uses COALESCE to handle cases where the user provides a name or not.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Look up the active organization by slug (no hardcoded UUID)
  SELECT id INTO org_id
  FROM public.organizations
  WHERE slug = 'vainilla-drinks'
  AND activo = true;

  -- Fail explicitly if no organization found
  IF org_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró una organización activa con slug "vainilla-drinks". Creá la organización antes de registrar usuarios.';
  END IF;

  -- Create the profile
  INSERT INTO public.profiles (id, organization_id, nombre, email, activo, rol)
  VALUES (
    NEW.id,
    org_id,
    COALESCE(
      NEW.raw_user_meta_data->>'nombre',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    true,
    'admin'
  );

  RETURN NEW;
END;
$$;

-- =============================================================================
-- 2. TRIGGER: on_auth_user_created
-- =============================================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- NOTES:
-- - SECURITY DEFINER: The function runs as the owner (postgres), bypassing RLS.
-- - The profile is created with rol = 'admin' by default for MVP.
-- - nombre falls back to the part before @ in the email if no name is provided.
-- - The organization MUST exist before any user signs up.
-- =============================================================================
