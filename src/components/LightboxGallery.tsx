'use client';

import { useState, useEffect } from 'react';

export default function LightboxGallery({ images }: { images: { url: string; alt: string; aspectRatio?: number }[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowRight' && selectedIndex !== null) {
        setSelectedIndex((prev) => (prev! + 1) % images.length);
      }
      if (e.key === 'ArrowLeft' && selectedIndex !== null) {
        setSelectedIndex((prev) => (prev! - 1 + images.length) % images.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, images.length]);

  return (
    <>
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 2xl:columns-5 gap-6">
        {images.map((img, index) => {
          const isLandscape = img.aspectRatio && img.aspectRatio > 1;
          const aspectClass = isLandscape ? "aspect-[3/2]" : "aspect-[4/5]";

          return (
            <div 
              key={index} 
              className={`break-inside-avoid mb-6 w-full block shadow-sm hover:shadow-xl transition-shadow duration-500 cursor-zoom-in ${aspectClass}`}
              onClick={() => setSelectedIndex(index)}
              onContextMenu={(e) => e.preventDefault()}
            >
              <img 
                src={img.url} 
                alt={img.alt}
                className="w-full h-full object-cover select-none pointer-events-none"
                loading="lazy"
              />
            </div>
          );
        })}
      </div>

      {/* Lightbox Overlay */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedIndex(null)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button 
            className="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 transition-colors z-50"
            onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
          >
            &times;
          </button>
          
          <img 
            src={images[selectedIndex].url} 
            alt={images[selectedIndex].alt}
            className="max-w-full max-h-full object-contain select-none pointer-events-none"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </>
  );
}
