-- Fix search_path for validate_video_url function to prevent security issues
CREATE OR REPLACE FUNCTION validate_video_url()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.media_type = 'video' AND NEW.url !~ '^(https?://)?(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[a-zA-Z0-9_-]{11}' THEN
    RAISE EXCEPTION 'Invalid YouTube URL format. Please provide a valid YouTube video URL.';
  END IF;
  RETURN NEW;
END;
$$;