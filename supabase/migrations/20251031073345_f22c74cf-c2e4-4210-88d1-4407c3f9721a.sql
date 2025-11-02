-- Create secure RPC function for admin statistics with server-side role validation
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats JSON;
BEGIN
  -- Server-side authorization check
  IF NOT public.has_role(auth.uid(), 'admin'::user_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  -- Gather statistics securely
  SELECT json_build_object(
    'subjects', (SELECT COUNT(*) FROM public.subjects),
    'modules', (SELECT COUNT(*) FROM public.modules),
    'media', (SELECT COUNT(*) FROM public.media),
    'users', (SELECT COUNT(*) FROM public.profiles)
  ) INTO stats;
  
  RETURN stats;
END;
$$;

-- Grant execute permission to authenticated users (authorization handled within function)
GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;