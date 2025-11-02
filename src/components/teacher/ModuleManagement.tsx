import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, ArrowRight, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { ModuleDialog } from './ModuleDialog';

interface Module {
  id: string;
  name: string;
  description?: string;
  order_index: number;
}

interface ModuleManagementProps {
  subjectId: string;
  onBack: () => void;
  onSelectModule: (moduleId: string) => void;
}

export const ModuleManagement = ({ subjectId, onBack, onSelectModule }: ModuleManagementProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const queryClient = useQueryClient();

  const { data: modules, isLoading } = useQuery({
    queryKey: ['modules', subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('subject_id', subjectId)
        .order('order_index');
      if (error) throw error;
      return data as Module[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('modules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules', subjectId] });
      toast.success('تم حذف الوحدة بنجاح');
    },
    onError: () => {
      toast.error('فشل حذف الوحدة');
    },
  });

  const handleEdit = (module: Module) => {
    setEditingModule(module);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingModule(null);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الوحدة؟')) {
      deleteMutation.mutate(id);
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
          العودة للمواد
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">إدارة الوحدات</h2>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة وحدة جديدة
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules?.map((module) => (
          <Card key={module.id} className="transition-all hover:shadow-hover">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{module.name}</CardTitle>
              {module.description && (
                <CardDescription className="line-clamp-2">
                  {module.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onSelectModule(module.id)}
                >
                  إدارة الوسائط
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(module)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(module.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ModuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        module={editingModule}
        subjectId={subjectId}
      />
    </div>
  );
};
