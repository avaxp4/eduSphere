import { useEffect } from 'react';
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
import { toast } from 'sonner';

interface SubjectFormData {
  name: string;
  description?: string;
  color?: string;
  order_index?: number;
}

interface SubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: { id: string; name: string; description?: string; color?: string; order_index?: number } | null;
}

export const SubjectDialog = ({ open, onOpenChange, subject }: SubjectDialogProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<SubjectFormData>({
    defaultValues: {
      name: '',
      description: '',
      color: '',
      order_index: 0,
    },
  });

  // تحديث القيم عند فتح النافذة للتعديل
  useEffect(() => {
    if (open && subject) {
      reset({
        name: subject.name || '',
        description: subject.description || '',
        color: subject.color || '',
        order_index: subject.order_index || 0,
      });
    } else if (open && !subject) {
      // إعادة تعيين القيم عند إضافة مادة جديدة
      reset({
        name: '',
        description: '',
        color: '',
        order_index: 0,
      });
    }
  }, [open, subject, reset]);

  const mutation = useMutation({
    mutationFn: async (data: SubjectFormData) => {
      if (subject?.id) {
        const { error } = await supabase
          .from('subjects')
          .update(data)
          .eq('id', subject.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('subjects').insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success(subject ? 'تم تحديث المادة بنجاح' : 'تم إضافة المادة بنجاح');
      reset();
      onOpenChange(false);
    },
    onError: () => {
      toast.error('حدث خطأ أثناء حفظ المادة');
    },
  });

  const onSubmit = (data: SubjectFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{subject ? 'تعديل المادة' : 'إضافة مادة جديدة'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">اسم المادة</Label>
            <Input id="name" {...register('name', { required: true })} />
          </div>
          <div>
            <Label htmlFor="description">الوصف</Label>
            <Textarea id="description" {...register('description')} />
          </div>
          <div>
            <Label htmlFor="color">اللون</Label>
            <Input id="color" type="color" {...register('color')} />
          </div>
          <div>
            <Label htmlFor="order_index">الترتيب</Label>
            <Input 
              id="order_index" 
              type="number" 
              min="0"
              {...register('order_index', { 
                required: true,
                valueAsNumber: true 
              })} 
              placeholder="أدخل رقم الترتيب"
            />
            <p className="text-xs text-muted-foreground mt-1">
              المواد ذات الترتيب الأقل تظهر أولاً. الرقم الأصغر = الترتيب الأعلى
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
