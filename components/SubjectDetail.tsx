import React, { useState, useMemo } from "react";
import { Subject, MediaCategory } from "../types";
import MediaCard from "./MediaCard";
import { ArrowRight, Heart } from "lucide-react";
import { useFavorites } from "../contexts/FavoritesContext";

interface SubjectDetailProps {
  subject: Subject;
  onBack: () => void;
}

const allCategories = Object.values(MediaCategory);

const SubjectDetail: React.FC<SubjectDetailProps> = ({ subject, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<
    MediaCategory | "all"
  >("all");
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const filteredMedia = useMemo(() => {
    if (selectedCategory === "all") {
      return subject.media;
    }
    return subject.media.filter((item) => item.category === selectedCategory);
  }, [subject.media, selectedCategory]);

  // Filter favorites that belong to this subject
  const subjectFavorites = useMemo(() => {
    return favorites.filter((fav) =>
      subject.media.some((media) => media.id === fav.id)
    );
  }, [favorites, subject.media]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center text-brand-gold hover:text-yellow-300 transition-colors mb-8 font-semibold"
      >
        <ArrowRight className="me-2 h-5 w-5" />
        <span>العودة إلى جميع المواد</span>
      </button>

      <div className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
          {subject.name}
        </h2>
        <p className="text-xl text-gray-400">
          محتويات مادة الأستاذ: {subject.teacher}
        </p>
      </div>

      {/* Favorites section */}
      {subjectFavorites.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center mb-4">
            <Heart className="w-6 h-6 text-red-500 me-2 fill-current" />
            <h3 className="text-2xl font-bold text-white">المفضلة</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectFavorites.map((item) => (
              <MediaCard
                key={`fav-${item.id}`}
                item={item}
                onFavoriteToggle={toggleFavorite}
                isFavorite={true}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            selectedCategory === "all"
              ? "bg-brand-gold text-black"
              : "bg-dark-card text-gray-300 hover:bg-gray-700"
          }`}
        >
          الكل
        </button>
        {allCategories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              selectedCategory === category
                ? "bg-brand-gold text-black"
                : "bg-dark-card text-gray-300 hover:bg-gray-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredMedia.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onFavoriteToggle={toggleFavorite}
              isFavorite={isFavorite(item)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-dark-card rounded-lg">
          <p className="text-gray-400 text-xl">
            لا يوجد وسائط متاحة لهذا التصنيف حاليًا.
          </p>
        </div>
      )}
    </div>
  );
};

export default SubjectDetail;
