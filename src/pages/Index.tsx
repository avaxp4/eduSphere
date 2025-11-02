import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { SubjectCard } from "@/components/SubjectCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-education.jpg";

interface Subject {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon_url: string | null;
}

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchSubjects();
    }
  }, [user]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <img
          src={heroImage}
          alt="EduSphere - المنصة التعليمية المتقدمة"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center px-4">
            <h1 className="text-5xl font-bold mb-4">مرحباً بك في EduSphere</h1>
            <p className="text-xl mb-8">
              استكشف المواد الدراسية وابدأ رحلتك التعليمية مع EduSphere
            </p>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="ابحث عن مادة دراسية..."
                  className="pr-10 bg-white/95 border-0 shadow-card h-12 text-foreground"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Grid */}
      <section className="container py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">المواد الدراسية</h2>
          <p className="text-muted-foreground">اختر المادة التي تريد دراستها</p>
        </div>

        {filteredSubjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery
                ? "لم يتم العثور على نتائج"
                : "لا توجد مواد دراسية متاحة حالياً"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                id={subject.id}
                name={subject.name}
                description={subject.description || undefined}
                color={subject.color || undefined}
                iconUrl={subject.icon_url || undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
