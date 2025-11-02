-- تحديث media_type ENUM لإضافة 'text' و 'iframe'
ALTER TYPE public.media_type ADD VALUE IF NOT EXISTS 'text';
ALTER TYPE public.media_type ADD VALUE IF NOT EXISTS 'iframe';

-- إضافة حقل content لحفظ المحتوى النصي
ALTER TABLE public.media 
ADD COLUMN IF NOT EXISTS content TEXT;

-- تحديث constraint على url ليسمح بـ NULL للأنواع التي لا تحتاج URL
-- أولاً، نحذف constraint القديم إذا كان موجوداً
ALTER TABLE public.media 
ALTER COLUMN url DROP NOT NULL;

-- تحديث دالة التحقق من YouTube لتسمح فقط بـ 'video' type
DROP TRIGGER IF EXISTS check_video_url ON public.media;

CREATE OR REPLACE FUNCTION validate_video_url()
RETURNS TRIGGER AS $$
BEGIN
  -- التحقق من روابط YouTube فقط للأنواع من نوع 'video'
  IF NEW.media_type = 'video' THEN
    IF NEW.url IS NULL OR NEW.url !~ '^(https?://)?(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[a-zA-Z0-9_-]{11}' THEN
      RAISE EXCEPTION 'Invalid YouTube URL format. Please provide a valid YouTube video URL.';
    END IF;
  END IF;
  
  -- للأنواع 'text'، يجب أن يكون هناك محتوى
  IF NEW.media_type = 'text' THEN
    IF NEW.content IS NULL OR TRIM(NEW.content) = '' THEN
      RAISE EXCEPTION 'Content is required for text media type.';
    END IF;
    -- للأنواع 'text'، لا نحتاج URL
    NEW.url := NULL;
  END IF;
  
  -- للأنواع 'iframe'، يجب أن يكون هناك URL
  IF NEW.media_type = 'iframe' THEN
    IF NEW.url IS NULL OR TRIM(NEW.url) = '' THEN
      RAISE EXCEPTION 'URL is required for iframe media type.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إعادة إنشاء trigger للتحقق من روابط YouTube
CREATE TRIGGER check_video_url
BEFORE INSERT OR UPDATE ON public.media
FOR EACH ROW EXECUTE FUNCTION validate_video_url();

