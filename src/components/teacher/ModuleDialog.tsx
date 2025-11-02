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

interface ModuleFormData {
  name: string;
  description?: string;
}

interface ModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module?: { id: string; name: string; description?: string } | null;
  subjectId: string;
}

export const ModuleDialog = ({ open, onOpenChange, module, subjectId }: ModuleDialogProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<ModuleFormData>({
    defaultValues: module || {},
  });

  const mutation = useMutation({
    mutationFn: async (data: ModuleFormData) => {
      if (module?.id) {
        const { error } = await supabase
          .from('modules')
          .update(data)
          .eq('id', module.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('modules')
          .insert([{ ...data, subject_id: subjectId }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules', subjectId] });
      toast.success(module ? 'تم تحديث الوحدة بنجاح' : 'تم إضافة الوحدة بنجاح');
      reset();
      onOpenChange(false);
    },
    onError: () => {
      toast.error('حدث خطأ أثناء حفظ الوحدة');
    },
  });

  const onSubmit = (data: ModuleFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{module ? 'تعديل الوحدة' : 'إضافة وحدة جديدة'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">اسم الوحدة</Label>
            <Input id="name" {...register('name', { required: true })} />
          </div>
          <div>
            <Label htmlFor="description">الوصف</Label>
            <Textarea id="description" {...register('description')} />
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
