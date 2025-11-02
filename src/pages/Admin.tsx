import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Header } from '@/components/Header';
import { Loader2, BarChart3, Users, BookOpen, FileText, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsTab } from '@/components/admin/StatsTab';
import { UserManagement } from '@/components/admin/UserManagement';
import { SubjectManagement } from '@/components/teacher/SubjectManagement';
import { ModuleManagement } from '@/components/teacher/ModuleManagement';
import { MediaManagement } from '@/components/teacher/MediaManagement';
import { useState } from 'react';

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole(user?.id);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && !roleLoading && user) {
      const timer = setTimeout(() => {
        if (!isAdmin) {
          toast.error('ليس لديك صلاحية الوصول إلى هذه الصفحة');
          navigate('/');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAdmin, roleLoading, authLoading, user, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
  };

  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
  };

  const handleBackToSubjects = () => {
    setSelectedSubjectId('');
  };

  const handleBackToModules = () => {
    setSelectedModuleId('');
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      
      <section className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">لوحة المشرف</h1>
          <p className="text-muted-foreground">إحصائيات وإدارة النظام</p>
        </div>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              الإحصائيات
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              المستخدمون
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              المواد
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              الوحدات
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              الوسائط
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="mt-6">
            <StatsTab />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="subjects" className="mt-6">
            {selectedSubjectId ? (
              <ModuleManagement
                subjectId={selectedSubjectId}
                onBack={handleBackToSubjects}
                onSelectModule={handleSelectModule}
              />
            ) : (
              <SubjectManagement onSelectSubject={handleSelectSubject} />
            )}
          </TabsContent>

          <TabsContent value="modules" className="mt-6">
            {selectedModuleId ? (
              <MediaManagement
                moduleId={selectedModuleId}
                onBack={handleBackToModules}
              />
            ) : selectedSubjectId ? (
              <ModuleManagement
                subjectId={selectedSubjectId}
                onBack={handleBackToSubjects}
                onSelectModule={handleSelectModule}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                يرجى اختيار مادة من تبويب "المواد" أولاً
              </div>
            )}
          </TabsContent>

          <TabsContent value="media" className="mt-6">
            {selectedModuleId ? (
              <MediaManagement
                moduleId={selectedModuleId}
                onBack={handleBackToModules}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                يرجى اختيار وحدة من تبويب "الوحدات" أولاً
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default Admin;