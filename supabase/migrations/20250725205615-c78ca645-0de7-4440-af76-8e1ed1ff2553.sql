-- Phase 2: Address Security Linter Warnings

-- 1. Fix function search path issue by updating the check_admin_role function
DROP FUNCTION IF EXISTS public.check_admin_role(uuid);

CREATE OR REPLACE FUNCTION public.check_admin_role(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.roles 
    WHERE id = user_uuid AND role = 'admin'
  );
$$;

-- 2. Update extensions to recommended versions
-- Note: Some extensions may require manual intervention through Supabase dashboard
-- This updates common extensions that can be safely updated
ALTER EXTENSION IF EXISTS "uuid-ossp" UPDATE;
ALTER EXTENSION IF EXISTS "pg_stat_statements" UPDATE;
ALTER EXTENSION IF EXISTS "pgcrypto" UPDATE;