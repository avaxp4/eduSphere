-- Fix RLS policy for user_roles to use authenticated role instead of public
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;

CREATE POLICY "Users can view all roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);