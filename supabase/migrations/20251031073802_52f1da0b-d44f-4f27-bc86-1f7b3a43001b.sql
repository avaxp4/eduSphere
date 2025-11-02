-- Fix 1: Restrict profiles table to authenticated users only
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix 2: Restrict user_roles table to authenticated users only
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;
CREATE POLICY "Users can view all roles" ON public.user_roles
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix 3: Add YouTube URL validation function
CREATE OR REPLACE FUNCTION validate_video_url()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.media_type = 'video' AND NEW.url !~ '^(https?://)?(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[a-zA-Z0-9_-]{11}' THEN
    RAISE EXCEPTION 'Invalid YouTube URL format. Please provide a valid YouTube video URL.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate video URLs
CREATE TRIGGER check_video_url
BEFORE INSERT OR UPDATE ON media
FOR EACH ROW EXECUTE FUNCTION validate_video_url();

-- Fix 4: Configure storage bucket restrictions (50MB limit and allowed MIME types)
UPDATE storage.buckets
SET 
  file_size_limit = 52428800, -- 50MB in bytes
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
WHERE id = 'media-files';

-- Add file size constraint to media table
ALTER TABLE media 
DROP CONSTRAINT IF EXISTS check_file_size;

ALTER TABLE media 
ADD CONSTRAINT check_file_size 
CHECK (file_size IS NULL OR file_size <= 52428800);