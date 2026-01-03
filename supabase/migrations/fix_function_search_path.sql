-- ============================================
-- Security Fix: Function Search Path
-- ============================================
-- This fixes the mutable search_path warning for is_admin function

-- Drop and recreate is_admin function with secure search_path
DROP FUNCTION IF EXISTS public.is_admin();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()::text
    AND role = 'admin'
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

COMMENT ON FUNCTION public.is_admin() IS 'Securely checks if the current user is an admin with immutable search_path';
