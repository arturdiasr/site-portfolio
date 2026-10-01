'use client';

import { useState, useRef } from 'react';

type VideoItem = {
  _id: string;
  title: string;
  videoType: string;
  videoFileUrl?: string;
  youtubeUrl?: string;
  coverImage: string;
  format: string;
};

// Extrai o ID do YouTube de qualquer formato de link
function getYouTubeId(url?: string) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
}

export default function VideoCard({ video, aspectClass }: { video: VideoItem, aspectClass: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const nativeVideoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (nativeVideoRef.current) {
      nativeVideoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (nativeVideoRef.current) {
      nativeVideoRef.current.pause();
    }
  };

  const isNative = video.videoType === 'Arquivo Nativo (Upload)';
  const isYouTube = video.videoType === 'Link do YouTube';
  const youtubeId = isYouTube ? getYouTubeId(video.youtubeUrl) : null;

  return (
    <>
      <div 
        className="group relative w-full h-full block overflow-hidden bg-gray-50 cursor-pointer shadow-sm hover:shadow-xl transition-all"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsOpen(true)}
      >
        <div className={`w-full relative ${aspectClass}`}>
          {/* Capa estática */}
          <img 
            src={video.coverImage} 
            alt={video.title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-10 ${isHovered ? 'opacity-0' : 'opacity-100'} group-hover:scale-105`}
          />

          {/* Player no Fundo (Rodando mudo ao passar o mouse) */}
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-black pointer-events-none">
            {isNative && video.videoFileUrl && (
              <video 
                ref={nativeVideoRef}
                src={video.videoFileUrl}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
              />
            )}
            {isYouTube && youtubeId && isHovered && (
              <div className="w-[150%] h-[150%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <iframe 
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${youtubeId}`}
                  allow="autoplay"
                  className="w-full h-full border-0 pointer-events-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Ícone de Play surgindo no centro */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center z-20 pointer-events-none">
          <div className="text-center w-full px-4 flex flex-col items-center">
            <svg className="w-16 h-16 text-white drop-shadow-2xl opacity-90 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>

      {/* MODAL FULLSCREEN PARA ASSISTIR COM ÁUDIO */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10 backdrop-blur-md"
          onClick={() => setIsOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 transition-colors z-[110]"
            onClick={() => setIsOpen(false)}
          >
            &times;
          </button>
          
          <div 
            className="w-full h-full max-w-6xl max-h-[85vh] flex flex-col relative bg-black shadow-2xl rounded-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Impede que o clique no vídeo feche o modal
          >
            <div className="flex-1 w-full bg-black relative flex items-center justify-center">
              {isNative && video.videoFileUrl && (
                <video 
                  src={video.videoFileUrl}
                  className="absolute inset-0 w-full h-full object-contain"
                  controls
                  autoPlay
                />
              )}
              {isYouTube && youtubeId && (
                <iframe 
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                  allow="autoplay; fullscreen"
                  className="absolute inset-0 w-full h-full border-0"
                />
              )}
            </div>
            
            <div className="w-full bg-black text-white p-4 md:p-6 text-center border-t border-white/10 shrink-0">
              <h2 className="text-lg md:text-2xl font-bold tracking-widest uppercase">{video.title}</h2>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
