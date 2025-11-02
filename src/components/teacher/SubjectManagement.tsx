import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { SubjectDialog } from './SubjectDialog';

interface Subject {
  id: string;
  name: string;
  description?: string;
  color?: string;
  order_index: number;
}

interface SubjectManagementProps {
  onSelectSubject: (subjectId: string) => void;
}

export const SubjectManagement = ({ onSelectSubject }: SubjectManagementProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const queryClient = useQueryClient();

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data as Subject[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('تم حذف المادة بنجاح');
    },
    onError: () => {
      toast.error('فشل حذف المادة');
    },
  });

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingSubject(null);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المادة؟')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">إدارة المواد</h2>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة مادة جديدة
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects?.map((subject) => (
          <Card key={subject.id} className="transition-all hover:shadow-hover">
            <CardHeader>
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center mb-4"
                style={{ background: subject.color || 'hsl(var(--primary))' }}
              >
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">{subject.name}</CardTitle>
              {subject.description && (
                <CardDescription className="line-clamp-2">
                  {subject.description}
                </CardDescription>
              )}
              <div className="text-xs text-muted-foreground mt-2">
                الترتيب: {subject.order_index}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onSelectSubject(subject.id)}
                >
                  إدارة المحتوى
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(subject)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(subject.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SubjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subject={editingSubject}
      />
    </div>
  );
};
