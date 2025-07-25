-- Phase 1: Critical RLS Security Fixes

-- 1. Enable RLS on tables that are missing it
ALTER TABLE public.phenom_risk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phenom_risk_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phenom_risk_raw ENABLE ROW LEVEL SECURITY;

-- 2. Create security definer function to check admin role (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.check_admin_role(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.roles 
    WHERE id = user_uuid AND role = 'admin'
  );
$$;

-- 3. Create RLS policies for phenom_risk table
CREATE POLICY "Allow authenticated users to read phenom_risk data"
ON public.phenom_risk
FOR SELECT
TO authenticated
USING (true);

-- Admin users can modify phenom_risk data
CREATE POLICY "Allow admin users to modify phenom_risk data"
ON public.phenom_risk
FOR ALL
TO authenticated
USING (public.check_admin_role(auth.uid()));

-- 4. Create RLS policies for phenom_risk_summary table
CREATE POLICY "Allow authenticated users to read phenom_risk_summary data"
ON public.phenom_risk_summary
FOR SELECT
TO authenticated
USING (true);

-- Admin users can modify phenom_risk_summary data
CREATE POLICY "Allow admin users to modify phenom_risk_summary data"
ON public.phenom_risk_summary
FOR ALL
TO authenticated
USING (public.check_admin_role(auth.uid()));

-- 5. Create RLS policies for phenom_risk_raw table
CREATE POLICY "Allow authenticated users to read phenom_risk_raw data"
ON public.phenom_risk_raw
FOR SELECT
TO authenticated
USING (true);

-- Admin users can modify phenom_risk_raw data
CREATE POLICY "Allow admin users to modify phenom_risk_raw data"
ON public.phenom_risk_raw
FOR ALL
TO authenticated
USING (public.check_admin_role(auth.uid()));

-- 6. Update existing overly permissive policies to be more restrictive
-- Drop and recreate patient table policies with better access control
DROP POLICY IF EXISTS "Allow authenticated users to read patient data" ON public.patient;

CREATE POLICY "Allow authenticated users to read patient data"
ON public.patient
FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify patient data
CREATE POLICY "Allow admin users to modify patient data"
ON public.patient
FOR ALL
TO authenticated
USING (public.check_admin_role(auth.uid()));

-- 7. Update phenom_risk_dist policies
DROP POLICY IF EXISTS "Allow authenticated users to read risk distribution data" ON public.phenom_risk_dist;

CREATE POLICY "Allow authenticated users to read risk distribution data"
ON public.phenom_risk_dist
FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify risk distribution data
CREATE POLICY "Allow admin users to modify risk distribution data"
ON public.phenom_risk_dist
FOR ALL
TO authenticated
USING (public.check_admin_role(auth.uid()));