-- Create RPC function to get users with their roles and email
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ,
  roles TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Server-side authorization check
  IF NOT public.has_role(auth.uid(), 'admin'::user_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;
  
  -- Return users with their roles
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    COALESCE(au.email::TEXT, 'غير متوفر'::TEXT) as email,
    p.created_at,
    COALESCE(
      ARRAY_AGG(DISTINCT ur.role::TEXT) FILTER (WHERE ur.role IS NOT NULL),
      ARRAY[]::TEXT[]
    ) as roles
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  LEFT JOIN auth.users au ON p.id = au.id
  GROUP BY p.id, p.full_name, p.avatar_url, p.created_at, au.email
  ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users (authorization handled within function)
GRANT EXECUTE ON FUNCTION public.get_users_with_roles() TO authenticated;

