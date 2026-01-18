-- ============================================
-- Security Fix: Function Search Path
-- ============================================
-- This fixes the mutable search_path warning for is_admin function

-- Recreate is_admin function with secure search_path

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  -- Check if user is admin via JWT metadata (which we now sync)
  -- This breaks recursion with the profiles table
  SELECT COALESCE(
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin',
    false
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

COMMENT ON FUNCTION public.is_admin() IS 'Securely checks if the current user is an admin with immutable search_path';
