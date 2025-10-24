import React, { useState, useRef } from "react";
import { MediaItem, MediaType } from "../types";
import {
  FileText,
  Film,
  Image,
  Youtube,
  Download,
  Heart,
  HeartOff,
  Maximize,
} from "lucide-react";
import ImageGalleryModal from "./ImageGalleryModal";

interface MediaCardProps {
  item: MediaItem;
  onFavoriteToggle?: (item: MediaItem) => void;
  isFavorite?: boolean;
}

const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onFavoriteToggle,
  isFavorite,
}) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isLocalFile = (src: string) => {
    // Check if the source is a local file (not a URL)
    return !src.startsWith("http") && !src.startsWith("//") && src !== "#";
  };

  const getFilePath = (src: string) => {
    // If it's a local file, prepend the uploads directory
    if (isLocalFile(src)) {
      return `/uploads/${src}`;
    }
    return src;
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === MediaType.IMAGE) {
      setIsGalleryOpen(true);
      setImageIndex(0); // In a real implementation, this would be the index of this image in the gallery
    }
  };

  const enterFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        // Safari
        (videoRef.current as any).webkitRequestFullscreen();
      } else if ((videoRef.current as any).msRequestFullscreen) {
        // IE11
        (videoRef.current as any).msRequestFullscreen();
      }
    }
  };

  const renderMedia = () => {
    const filePath = getFilePath(item.src);

    switch (item.type) {
      case MediaType.IMAGE:
        return (
          <div className="relative cursor-pointer" onClick={handleImageClick}>
            <img
              src={filePath}
              alt={item.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="text-white font-bold text-lg">عرض الصورة</span>
            </div>
            <a
              href={filePath}
              download
              className="absolute bottom-2 left-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="تحميل الصورة"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        );
      case MediaType.VIDEO:
        return (
          <div className="relative">
            <video
              ref={videoRef}
              src={filePath}
              controls
              className="w-full h-48 object-cover rounded-t-lg bg-black"
            ></video>
            <button
              onClick={(e) => {
                e.stopPropagation();
                enterFullscreen();
              }}
              className="absolute bottom-2 left-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="ملء الشاشة"
            >
              <Maximize className="w-4 h-4" />
            </button>
            <a
              href={filePath}
              download
              className="absolute bottom-2 left-12 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="تحميل الفيديو"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        );
      case MediaType.YOUTUBE:
        return (
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={item.src}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="w-full h-48 rounded-t-lg"
            ></iframe>
          </div>
        );
      case MediaType.FILE:
        return (
          <div className="w-full h-48 flex flex-col justify-center items-center bg-gray-800 rounded-t-lg">
            <FileText className="w-16 h-16 text-brand-blue" />
            {item.src !== "#" ? (
              <a
                href={filePath}
                download
                className="mt-4 bg-brand-blue text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 me-2" />
                تحميل الملف
              </a>
            ) : (
              <div className="mt-4 text-gray-400">الملف غير متوفر حالياً</div>
            )}
          </div>
        );
      default:
        return (
          <div className="w-full h-48 flex flex-col justify-center items-center bg-gray-800 rounded-t-lg">
            <FileText className="w-16 h-16 text-brand-blue" />
            <div className="mt-4 text-gray-400">نوع الوسائط غير مدعوم</div>
          </div>
        );
    }
  };

  const getCategoryColor = () => {
    const colors: { [key: string]: string } = {
      شرح: "bg-blue-500/20 text-blue-300 border-blue-500",
      حل: "bg-green-500/20 text-green-300 border-green-500",
      امتحانات: "bg-red-500/20 text-red-300 border-red-500",
      ملخصات: "bg-yellow-500/20 text-yellow-300 border-yellow-500",
      مراجعة: "bg-purple-500/20 text-purple-300 border-purple-500",
    };
    return (
      colors[item.category] || "bg-gray-500/20 text-gray-300 border-gray-500"
    );
  };

  return (
    <>
      <div className="bg-dark-card rounded-lg overflow-hidden border border-dark-border shadow-md flex flex-col hover:shadow-xl transition-shadow">
        {renderMedia()}
        <div className="p-4 flex-grow flex flex-col">
          <div className="flex justify-between items-start">
            <h4 className="text-lg font-bold text-white flex-grow">
              {item.title}
            </h4>
            {onFavoriteToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteToggle(item);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors ms-2"
                aria-label={
                  isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"
                }
              >
                {isFavorite ? (
                  <HeartOff className="w-5 h-5 fill-current text-red-500" />
                ) : (
                  <Heart className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
          {item.description && (
            <p className="text-gray-400 text-sm mt-2">{item.description}</p>
          )}
          <div className="mt-4 pt-4 border-t border-dark-border">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border ${getCategoryColor()}`}
            >
              {item.category}
            </span>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {isGalleryOpen && item.type === MediaType.IMAGE && (
        <ImageGalleryModal
          images={[item]} // In a full implementation, this would be all images in the subject
          initialIndex={imageIndex}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}
    </>
  );
};

export default MediaCard;
