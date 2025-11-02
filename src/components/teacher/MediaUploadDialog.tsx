import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { isValidIframeUrl, getIframeSourceInfo } from '@/config/iframe-sources';

interface MediaFormData {
  title: string;
  description?: string;
  media_type: 'image' | 'video' | 'document' | 'text' | 'iframe';
  url?: string;
  content?: string;
}

interface MediaUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId: string;
  userId: string;
}

export const MediaUploadDialog = ({ open, onOpenChange, moduleId, userId }: MediaUploadDialogProps) => {
  const queryClient = useQueryClient();
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'document' | 'text' | 'iframe'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [iframeUrl, setIframeUrl] = useState('');
  
  const { register, handleSubmit, reset, setValue } = useForm<MediaFormData>();

  // إعدادات محرر React Quill
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  }), []);

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link'
  ];

  const mutation = useMutation({
    mutationFn: async (data: MediaFormData & { url?: string | null; content?: string | null; file_size?: number }) => {
      const { error } = await supabase.from('media').insert([{
        ...data,
        module_id: moduleId,
        uploaded_by: userId,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media', moduleId] });
      toast.success('تم رفع الوسائط بنجاح');
      reset();
      setFile(null);
      setTextContent('');
      setIframeUrl('');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('حدث خطأ أثناء رفع الوسائط');
    },
  });

  const handleFileUpload = async (data: MediaFormData) => {
    // معالجة المحتوى النصي
    if (mediaType === 'text') {
      if (!textContent || textContent.trim() === '' || textContent === '<p><br></p>') {
        toast.error('يرجى إدخال محتوى نصي');
        return;
      }
      mutation.mutate({
        ...data,
        content: textContent,
        url: null,
        media_type: 'text',
      });
      return;
    }

    // معالجة المحتوى المضمن (iframe)
    if (mediaType === 'iframe') {
      if (!iframeUrl || iframeUrl.trim() === '') {
        toast.error('يرجى إدخال رابط المحتوى المضمن');
        return;
      }
      if (!isValidIframeUrl(iframeUrl)) {
        const sourceInfo = getIframeSourceInfo(iframeUrl);
        toast.error(`الرابط غير مسموح به. يرجى استخدام أحد المصادر المسموح بها: ${sourceInfo ? sourceInfo.name : 'Google Maps, Google Forms, إلخ'}`);
        return;
      }
      mutation.mutate({
        ...data,
        url: iframeUrl,
        content: null,
        media_type: 'iframe',
      });
      return;
    }

    // معالجة فيديوهات يوتيوب
    if (mediaType === 'video') {
      if (!data.url) {
        toast.error('يرجى إدخال رابط الفيديو');
        return;
      }
      mutation.mutate({ ...data, url: data.url, content: null, media_type: 'video' });
      return;
    }

    // معالجة الصور والملفات
    if (!file) {
      toast.error('يرجى اختيار ملف');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${moduleId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('media-files')
        .getPublicUrl(filePath);

      mutation.mutate({
        ...data,
        url: urlData.publicUrl,
        content: null,
        file_size: file.size,
        media_type: mediaType,
      });
    } catch (error) {
      toast.error('فشل رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>رفع وسائط جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFileUpload)} className="space-y-4">
          <div>
            <Label htmlFor="title">العنوان</Label>
            <Input id="title" {...register('title', { required: true })} />
          </div>
          <div>
            <Label htmlFor="description">الوصف</Label>
            <Textarea id="description" {...register('description')} />
          </div>
          <div>
            <Label htmlFor="media_type">نوع الوسائط</Label>
            <Select value={mediaType} onValueChange={(value: any) => {
              setMediaType(value);
              setValue('media_type', value);
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">صورة</SelectItem>
                <SelectItem value="video">فيديو (يوتيوب)</SelectItem>
                <SelectItem value="document">مستند</SelectItem>
                <SelectItem value="text">محتوى نصي</SelectItem>
                <SelectItem value="iframe">محتوى مضمن (iframe)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {mediaType === 'video' ? (
            <div>
              <Label htmlFor="url">رابط الفيديو (يوتيوب)</Label>
              <Input 
                id="url" 
                {...register('url')} 
                placeholder="https://www.youtube.com/watch?v=..." 
              />
            </div>
          ) : mediaType === 'text' ? (
            <div>
              <Label htmlFor="content">المحتوى النصي</Label>
              <div className="mt-2 border rounded-lg">
                <ReactQuill
                  theme="snow"
                  value={textContent}
                  onChange={setTextContent}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="اكتب المحتوى النصي هنا..."
                  style={{ minHeight: '200px' }}
                />
              </div>
            </div>
          ) : mediaType === 'iframe' ? (
            <div>
              <Label htmlFor="iframe-url">رابط المحتوى المضمن</Label>
              <Input 
                id="iframe-url" 
                value={iframeUrl}
                onChange={(e) => setIframeUrl(e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..." 
              />
              <p className="text-sm text-muted-foreground mt-1">
                المصادر المسموح بها: Google Maps, Google Forms, Google Drive, YouTube Embed
              </p>
            </div>
          ) : (
            <div>
              <Label htmlFor="file">الملف</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept={mediaType === 'image' ? 'image/*' : '.pdf,.doc,.docx,.ppt,.pptx'}
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={uploading || mutation.isPending}>
              {uploading || mutation.isPending ? 'جاري الرفع...' : 'رفع'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
