'use client';

import { useState, useRef } from 'react';
import ReactPlayer from 'react-player';

type VideoItem = {
  _id: string;
  title: string;
  videoType: string;
  videoFileUrl?: string;
  youtubeUrl?: string;
  coverImage: string;
  format: string;
};

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

  return (
    <>
      <div 
        className="group relative break-inside-avoid mb-6 w-full block overflow-hidden bg-gray-50 cursor-pointer shadow-sm hover:shadow-xl transition-all"
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
            {isYouTube && video.youtubeUrl && (
              <div className="w-[150%] h-[150%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                {/* @ts-ignore */}
                <ReactPlayer 
                  url={video.youtubeUrl} 
                  playing={isHovered} 
                  muted 
                  loop 
                  width="100%" 
                  height="100%" 
                  style={{ pointerEvents: 'none' }}
                  config={{ youtube: { playerVars: { disablekb: 1, modestbranding: 1 } } }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Ícone de Play e Título surgindo no centro */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center z-20 pointer-events-none">
          <div className="text-center w-full px-4 flex flex-col items-center">
            <svg className="w-12 h-12 text-white mb-2 shadow-sm drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            <h2 className="text-black bg-white/95 px-6 py-3 text-xl font-bold tracking-widest uppercase shadow-xl inline-block">{video.title}</h2>
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
            className="w-full h-full max-w-6xl max-h-[80vh] flex items-center justify-center relative bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Impede que o clique no vídeo feche o modal
          >
            {isNative && video.videoFileUrl && (
              <video 
                src={video.videoFileUrl}
                className="w-full h-full object-contain"
                controls
                autoPlay
              />
            )}
            {isYouTube && video.youtubeUrl && (
              // @ts-ignore
              <ReactPlayer 
                url={video.youtubeUrl} 
                playing 
                controls 
                width="100%" 
                height="100%" 
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
