import React, { useState, useEffect } from "react";
import { Subject as SubjectType } from "./types";
import { loadSubjects } from "./constants";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SubjectCard from "./components/SubjectCard";
import SubjectDetail from "./components/SubjectDetail";
import FavoritesPage from "./components/FavoritesPage";
import { BookOpen, Heart } from "lucide-react";
import { FavoritesProvider } from "./contexts/FavoritesContext";

const App: React.FC = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null
  );
  const [showFavorites, setShowFavorites] = useState(false);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const loadedSubjects = await loadSubjects();
        setSubjects(loadedSubjects);
      } catch (error) {
        console.error("Failed to load subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const selectedSubject =
    subjects.find((s) => s.id === selectedSubjectId) || null;

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setShowFavorites(false);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setSelectedSubjectId(null);
    setShowFavorites(false);
  };

  const handleShowFavorites = () => {
    setShowFavorites(true);
    setSelectedSubjectId(null);
  };

  const handleHideFavorites = () => {
    setShowFavorites(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg text-white font-cairo flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-gold mx-auto mb-4"></div>
          <p className="text-xl">جاري تحميل المواد الدراسية...</p>
        </div>
      </div>
    );
  }

  return (
    <FavoritesProvider>
      <div className="min-h-screen bg-dark-bg text-white font-cairo">
        <Header />
        <main className="py-10">
          {showFavorites ? (
            <FavoritesPage onBack={handleHideFavorites} />
          ) : selectedSubject ? (
            <SubjectDetail subject={selectedSubject} onBack={handleBack} />
          ) : (
            <div className="container mx-auto px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
                <div className="text-center sm:text-right">
                  <BookOpen className="w-16 h-16 mx-auto sm:mx-0 text-brand-gold mb-4" />
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    المواد الدراسية
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg text-gray-400">
                    تصفح المواد المتاحة واختر المادة التي ترغب في استعراض
                    محتوياتها التعليمية.
                  </p>
                </div>
                <button
                  onClick={handleShowFavorites}
                  className="flex items-center bg-dark-card hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Heart className="w-5 h-5 me-2 text-red-500 fill-current" />
                  <span>المفضلة</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onSelect={handleSelectSubject}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </FavoritesProvider>
  );
};

export default App;
