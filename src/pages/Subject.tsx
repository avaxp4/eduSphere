import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, BookOpen, FileText, Image as ImageIcon, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface Module {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
}

interface Media {
  id: string;
  title: string;
  media_type: 'image' | 'video' | 'document' | 'text' | 'iframe';
}

interface Subject {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
}

const Subject = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [mediaCounts, setMediaCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchSubjectData();
    }
  }, [user, id]);

  const fetchSubjectData = async () => {
    try {
      // Fetch subject details
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single();

      if (subjectError) throw subjectError;
      setSubject(subjectData);

      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('subject_id', id)
        .order('order_index', { ascending: true });

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      // Fetch media counts for each module
      const counts: Record<string, number> = {};
      for (const module of modulesData || []) {
        const { count, error } = await supabase
          .from('media')
          .select('*', { count: 'exact', head: true })
          .eq('module_id', module.id);
        
        if (!error) {
          counts[module.id] = count || 0;
        }
      }
      setMediaCounts(counts);
    } catch (error) {
      console.error('Error fetching subject data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !subject) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      
      {/* Subject Header */}
      <section 
        className="py-16 px-4"
        style={{ 
          background: `linear-gradient(135deg, ${subject.color || 'hsl(var(--primary))'}, ${subject.color || 'hsl(var(--secondary))'})`
        }}
      >
        <div className="container">
          <Link to="/">
            <Button variant="ghost" className="mb-4 text-white hover:text-white/80 hover:bg-white/10">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة للصفحة الرئيسية
            </Button>
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{subject.name}</h1>
              {subject.description && (
                <p className="text-white/90 text-lg">{subject.description}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="container py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">الوحدات الدراسية</h2>
          <p className="text-muted-foreground">اختر الوحدة للوصول إلى الوسائط التعليمية</p>
        </div>

        {modules.length === 0 ? (
          <Card className="p-12 text-center shadow-card">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">لا توجد وحدات دراسية متاحة حالياً</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {modules.map((module, index) => (
              <Link key={module.id} to={`/module/${module.id}`}>
                <Card className="transition-all hover:shadow-hover cursor-pointer border-r-4" style={{ borderRightColor: subject.color || 'hsl(var(--primary))' }}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                          style={{ background: subject.color || 'hsl(var(--primary))' }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <CardTitle className="text-xl">{module.name}</CardTitle>
                          {module.description && (
                            <CardDescription className="mt-1">{module.description}</CardDescription>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-sm">
                        {mediaCounts[module.id] || 0} وسيط
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Subject;
