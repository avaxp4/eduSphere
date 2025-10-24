import React, { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { MediaItem } from "../types";

interface ImageGalleryModalProps {
  images: MediaItem[];
  initialIndex: number;
  onClose: () => void;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  images,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];

  const isLocalFile = (src: string) => {
    return !src.startsWith("http") && !src.startsWith("//") && src !== "#";
  };

  const getFilePath = (src: string) => {
    if (isLocalFile(src)) {
      return `/uploads/${src}`;
    }
    return src;
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsLoading(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsLoading(true);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowLeft") {
      handlePrev();
    } else if (e.key === "ArrowRight") {
      handleNext();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left
      handleNext();
    } else if (touchEnd - touchStart > 50) {
      // Swipe right
      handlePrev();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-2 sm:p-4"
      dir="ltr"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={modalRef}
        className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black/30 rounded-full p-2"
          aria-label="إغلاق المعرض"
        >
          <X className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/30 rounded-full p-2"
              aria-label="الصورة السابقة"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/30 rounded-full p-2"
              aria-label="الصورة التالية"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 text-white text-xs sm:text-sm bg-black/30 rounded-full px-2 py-1 sm:px-3 sm:py-1 z-10">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Image info */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-center text-white bg-black/30 rounded-lg px-3 py-1 sm:px-4 sm:py-2 max-w-md truncate z-10">
          <h3 className="font-bold text-sm sm:text-lg">{currentImage.title}</h3>
          {currentImage.description && (
            <p className="text-xs sm:text-sm mt-1 hidden sm:block">
              {currentImage.description}
            </p>
          )}
        </div>

        {/* Download button */}
        <a
          href={getFilePath(currentImage.src)}
          download
          className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black/30 rounded-full p-2"
          aria-label="تحميل الصورة"
        >
          <Download className="w-5 h-5 sm:w-6 sm:h-6" />
        </a>

        {/* Image display */}
        <div className="flex items-center justify-center w-full h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-brand-gold"></div>
            </div>
          )}
          <img
            src={getFilePath(currentImage.src)}
            alt={currentImage.title}
            className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={handleImageLoad}
            onError={() => setIsLoading(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageGalleryModal;
