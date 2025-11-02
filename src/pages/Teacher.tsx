import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Header } from '@/components/Header';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SubjectManagement } from '@/components/teacher/SubjectManagement';
import { ModuleManagement } from '@/components/teacher/ModuleManagement';
import { MediaManagement } from '@/components/teacher/MediaManagement';

type View = 'subjects' | 'modules' | 'media';

const Teacher = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, isAdmin, loading: roleLoading } = useUserRole(user?.id);
  const [currentView, setCurrentView] = useState<View>('subjects');
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
        if (!isTeacher && !isAdmin) {
          toast.error('ليس لديك صلاحية الوصول إلى هذه الصفحة');
          navigate('/');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isTeacher, isAdmin, roleLoading, authLoading, user, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || (!isTeacher && !isAdmin)) {
    return null;
  }

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setCurrentView('modules');
  };

  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setCurrentView('media');
  };

  const handleBackToSubjects = () => {
    setCurrentView('subjects');
    setSelectedSubjectId('');
  };

  const handleBackToModules = () => {
    setCurrentView('modules');
    setSelectedModuleId('');
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      
      <section className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">لوحة المعلم</h1>
          <p className="text-muted-foreground">إدارة المحتوى التعليمي</p>
        </div>

        {currentView === 'subjects' && (
          <SubjectManagement onSelectSubject={handleSelectSubject} />
        )}

        {currentView === 'modules' && (
          <ModuleManagement
            subjectId={selectedSubjectId}
            onBack={handleBackToSubjects}
            onSelectModule={handleSelectModule}
          />
        )}

        {currentView === 'media' && (
          <MediaManagement
            moduleId={selectedModuleId}
            onBack={handleBackToModules}
          />
        )}
      </section>
    </div>
  );
};

export default Teacher;
