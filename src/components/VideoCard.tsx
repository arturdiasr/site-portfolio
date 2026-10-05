'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useInView, motion, AnimatePresence } from 'framer-motion';

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
  const [isMounted, setIsMounted] = useState(false);
  const nativeVideoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { amount: 0.5 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isMobile = isMounted && window.innerWidth < 768;
  const isNative = video.videoType === 'Arquivo Nativo (Upload)';
  const isYouTube = video.videoType === 'Link do YouTube';
  const youtubeId = isYouTube ? getYouTubeId(video.youtubeUrl) : null;

  // No mobile, se for nativo e estiver na tela, ele toca. 
  // No desktop, não toca sozinho, pois faremos o "scrubbing" com o mouse.
  const shouldAutoplayMobile = isMobile && isInView && isNative;

  useEffect(() => {
    if (shouldAutoplayMobile && nativeVideoRef.current) {
      nativeVideoRef.current.play().catch(() => {});
    } else if (isMobile && !shouldAutoplayMobile && nativeVideoRef.current) {
      nativeVideoRef.current.pause();
    }
  }, [shouldAutoplayMobile, isMobile]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Para vídeos nativos no desktop, nós vamos fazer o scrubbing, não precisa dar play.
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isNative || !nativeVideoRef.current || isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const duration = nativeVideoRef.current.duration;
    if (duration > 0) {
      nativeVideoRef.current.currentTime = percentage * duration;
    }
  };

  return (
    <>
      <motion.div 
        layoutId={`video-card-${video._id}`}
        ref={cardRef}
        data-cursor="PLAY"
        className="group relative w-full h-full block overflow-hidden bg-gray-50 cursor-pointer shadow-sm hover:shadow-xl transition-all"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={() => setIsOpen(true)}
      >
        <div className={`w-full relative ${aspectClass}`}>
          {/* Capa estática */}
          <div className={`absolute inset-0 w-full h-full transition-opacity duration-500 z-10 ${isHovered || shouldAutoplayMobile ? 'opacity-0' : 'opacity-100'}`}>
            <Image 
              src={video.coverImage} 
              alt={video.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-1000"
            />
          </div>

          {/* Player no Fundo (Rodando mudo ao passar o mouse ou fazer o scrubbing) */}
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
            {/* Removido o Iframe do YouTube aqui (Facade Pattern) para não destruir a performance da rede e bateria. */}
          </div>
        </div>

        {/* Ícone de Play surgindo no centro */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center z-20 pointer-events-none">
          <div className="text-center w-full px-4 flex flex-col items-center">
            <svg className="w-16 h-16 text-white drop-shadow-2xl opacity-90 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </motion.div>

      {/* MODAL FULLSCREEN PARA ASSISTIR COM ÁUDIO */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          >
            {/* AMBIENT MODE (GLOW) */}
            <motion.div 
              layoutId={`video-glow-${video._id}`}
              className="absolute inset-0 max-w-6xl max-h-[85vh] m-auto opacity-30 blur-3xl"
              style={{ backgroundImage: `url(${video.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />

            <button 
              className="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 transition-colors z-[110]"
              onClick={() => setIsOpen(false)}
            >
              &times;
            </button>
            
            <motion.div 
              layoutId={`video-card-${video._id}`}
              className="w-full h-full max-w-6xl max-h-[85vh] flex flex-col relative bg-black shadow-2xl rounded-sm overflow-hidden z-10"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
