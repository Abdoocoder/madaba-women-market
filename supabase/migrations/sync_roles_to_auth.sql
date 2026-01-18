
-- ============================================
-- Sync Profile Roles to Auth Metadata
-- ============================================
-- This script ensures that the 'role' and 'status' from public.profiles
-- are synced to the auth.users table's raw_app_metadata.
-- This allows for non-recursive RLS policy checks.

-- 1. Create the sync function
CREATE OR REPLACE FUNCTION public.handle_sync_profile_to_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER -- Run as superuser to access auth schema
SET search_path = public, auth
AS $$
BEGIN
  -- Update auth.users metadata when profile changes
  UPDATE auth.users
  SET raw_app_meta_data = 
    jsonb_set(
      jsonb_set(
        COALESCE(raw_app_meta_data, '{}'::jsonb),
        '{role}', 
        to_jsonb(NEW.role)
      ),
      '{status}',
      to_jsonb(NEW.status)
    )
  WHERE id = NEW.id::uuid;
  
  RETURN NEW;
END;
$$;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_profile_update_sync_auth ON public.profiles;
CREATE TRIGGER on_profile_update_sync_auth
  AFTER INSERT OR UPDATE OF role, status
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_sync_profile_to_auth();

-- 3. Initial sync for existing users
-- This might take a moment if you have many users
DO $$
DECLARE
  profile_rec RECORD;
BEGIN
  FOR profile_rec IN (SELECT id, role, status FROM public.profiles) LOOP
    UPDATE auth.users
    SET raw_app_meta_data = 
      jsonb_set(
        jsonb_set(
          COALESCE(raw_app_meta_data, '{}'::jsonb),
          '{role}', 
          to_jsonb(profile_rec.role)
        ),
        '{status}',
        to_jsonb(profile_rec.status)
      )
    WHERE id = profile_rec.id::uuid;
  END LOOP;
END $$;

COMMENT ON FUNCTION public.handle_sync_profile_to_auth() IS 'Automatically syncs public.profiles role/status to auth.users metadata for optimized RLS.';
