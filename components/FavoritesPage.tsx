import React from "react";
import { Heart, ArrowRight } from "lucide-react";
import MediaCard from "./MediaCard";
import { useFavorites } from "../contexts/FavoritesContext";

interface FavoritesPageProps {
  onBack: () => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ onBack }) => {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  return (
    <div
      className="container mx-auto px-4 sm:px-6 py-8 animate-fade-in"
      dir="rtl"
    >
      <button
        onClick={onBack}
        className="flex items-center text-brand-gold hover:text-yellow-300 transition-colors mb-8 font-semibold"
      >
        <ArrowRight className="me-2 h-5 w-5" />
        <span>العودة إلى جميع المواد</span>
      </button>

      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-red-500 me-3 fill-current" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            المفضلة
          </h2>
        </div>
        <p className="text-lg text-gray-400">
          جميع الوسائط التعليمية التي قمت بتحديدها كمفضلة
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((item) => (
            <MediaCard
              key={`fav-${item.id}`}
              item={item}
              onFavoriteToggle={toggleFavorite}
              isFavorite={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-dark-card rounded-lg">
          <Heart className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">لا توجد مفضلات</h3>
          <p className="text-gray-400 text-xl">
            قم بإضافة وسائط إلى المفضلة باستخدام زر القلب في بطاقات الوسائط
          </p>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
