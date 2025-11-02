import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ArrowRight, Image, Video, FileText, AlignLeft, Code } from 'lucide-react';
import { toast } from 'sonner';
import { MediaUploadDialog } from './MediaUploadDialog';

interface Media {
  id: string;
  title: string;
  description?: string;
  url: string | null;
  content: string | null;
  media_type: 'image' | 'video' | 'document' | 'text' | 'iframe';
  file_size?: number;
}

interface MediaManagementProps {
  moduleId: string;
  onBack: () => void;
}

export const MediaManagement = ({ moduleId, onBack }: MediaManagementProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: media, isLoading } = useQuery({
    queryKey: ['media', moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('module_id', moduleId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Media[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('media').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media', moduleId] });
      toast.success('تم حذف الوسائط بنجاح');
    },
    onError: () => {
      toast.error('فشل حذف الوسائط');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      deleteMutation.mutate(id);
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-6 w-6 text-primary" />;
      case 'video':
        return <Video className="h-6 w-6 text-primary" />;
      case 'document':
        return <FileText className="h-6 w-6 text-primary" />;
      case 'text':
        return <AlignLeft className="h-6 w-6 text-primary" />;
      case 'iframe':
        return <Code className="h-6 w-6 text-primary" />;
      default:
        return <FileText className="h-6 w-6 text-primary" />;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة للوحدات
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">إدارة الوسائط</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          رفع وسائط جديدة
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {media?.map((item) => (
          <Card key={item.id} className="transition-all hover:shadow-hover">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                {getMediaIcon(item.media_type)}
              </div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {(item.url || item.content) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      if (item.url) {
                        window.open(item.url, '_blank');
                      }
                      // للمحتوى النصي، يمكن فتحه في صفحة جديدة أو عرضه في dialog
                      // يمكن إضافة منطق إضافي هنا إذا لزم الأمر
                    }}
                    disabled={!item.url && !item.content}
                  >
                    عرض
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {media?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          لا توجد وسائط بعد. اضغط "رفع وسائط جديدة" للبدء.
        </div>
      )}

      <MediaUploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        moduleId={moduleId}
        userId={user?.id || ''}
      />
    </div>
  );
};
