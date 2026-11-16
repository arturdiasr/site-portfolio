'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MasonryGrid from '@/components/MasonryGrid';

interface LightboxImage {
  url: string;
  thumbUrl?: string;
  alt: string;
  aspectRatio?: number;
}

export default function LightboxGallery({ images }: { images: LightboxImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [panOrigin, setPanOrigin] = useState({ x: 50, y: 50 });
  const touchStartX = useRef<number | null>(null);
  const filmstripRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setSelectedIndex(null);
    setIsZoomed(false);
  }, []);

  const next = useCallback(() => {
    setIsZoomed(false);
    setSelectedIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
  }, [images.length]);

  const prev = useCallback(() => {
    setIsZoomed(false);
    setSelectedIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));
  }, [images.length]);

  // Navegação via Teclado (ESC, Setas)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    if (selectedIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedIndex, close, next, prev]);

  // Pré-carrega a imagem anterior e a próxima ao abrir o Lightbox
  useEffect(() => {
    if (selectedIndex === null || images.length <= 1) return;
    const nextIdx = (selectedIndex + 1) % images.length;
    const prevIdx = (selectedIndex - 1 + images.length) % images.length;
    [images[nextIdx]?.url, images[prevIdx]?.url].forEach((url) => {
      if (url) {
        const img = new window.Image();
        img.src = url;
      }
    });
  }, [selectedIndex, images]);

  // Centraliza a miniatura ativa na faixa inferior (filmstrip)
  useEffect(() => {
    if (selectedIndex === null || !filmstripRef.current) return;
    const activeThumb = filmstripRef.current.querySelector<HTMLElement>(
      `[data-thumb-index="${selectedIndex}"]`
    );
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedIndex]);

  // Suporte a Touch Swipe para Smartphones e Tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || isZoomed) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) next();
    if (diff < -45) prev();
    touchStartX.current = null;
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPanOrigin({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  return (
    <>
      <MasonryGrid>
        {images.map((img, index) => {
          const isLandscape = img.aspectRatio && img.aspectRatio > 1;
          const aspectClass = isLandscape ? "aspect-[3/2]" : "aspect-[4/5]";

          return (
            <div
              key={index}
              data-cursor="AMPLIAR"
              className={`group relative break-inside-avoid mb-6 w-full block overflow-hidden bg-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500 cursor-zoom-in ${aspectClass}`}
              onClick={() => setSelectedIndex(index)}
              onContextMenu={(e) => e.preventDefault()}
            >
              <img
                src={img.thumbUrl || img.url}
                alt={img.alt}
                className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                loading="lazy"
              />
              {/* Indicador Sutil de Ampliação no Hover */}
              <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-end justify-between p-4 pointer-events-none">
                <span className="font-mono text-[10px] tracking-[0.2em] text-white/80">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-white text-[10px] tracking-[0.22em] uppercase font-medium bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-xs border border-white/10">
                  Ampliar
                </span>
              </div>
            </div>
          );
        })}
      </MasonryGrid>

      {/* Lightbox Editorial Imersivo */}
      <AnimatePresence>
        {selectedIndex !== null && images[selectedIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[110] bg-neutral-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none"
            onClick={close}
            onContextMenu={(e) => e.preventDefault()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Barra Superior: Contador Numérico + Zoom + Botão Fechar */}
            <div className="absolute top-0 left-0 right-0 p-5 md:p-7 flex justify-between items-center text-white/80 z-[120] pointer-events-none">
              <span className="font-mono text-xs tracking-[0.25em] text-neutral-300 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xs border border-white/10 pointer-events-auto">
                {String(selectedIndex + 1).padStart(2, '0')} <span className="text-neutral-500">/</span> {String(images.length).padStart(2, '0')}
              </span>

              <div className="flex items-center gap-2.5 pointer-events-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed((z) => !z);
                  }}
                  className={`flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] font-semibold px-3 py-2 rounded-xs border transition-all cursor-pointer backdrop-blur-md ${
                    isZoomed
                      ? 'bg-white text-black border-white'
                      : 'bg-black/40 hover:bg-black/70 text-white/80 hover:text-white border-white/10'
                  }`}
                  aria-label={isZoomed ? 'Reduzir zoom' : 'Inspecionar detalhes (Zoom)'}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    {isZoomed ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 8v6M8 11h6M19 11a8 8 0 11-16 0 8 8 0 0116 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 8v6M8 11h6M19 11a8 8 0 11-16 0 8 8 0 0116 0z" />
                    )}
                  </svg>
                  <span className="hidden sm:inline">{isZoomed ? '100%' : 'Detalhe'}</span>
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/80 hover:text-white bg-black/40 hover:bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xs border border-white/10 transition-all cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    close();
                  }}
                  aria-label="Fechar visualização"
                >
                  <span className="hidden sm:inline text-[10px] font-semibold">Fechar</span>
                  <span className="text-lg leading-none group-hover:rotate-90 transition-transform duration-300">&times;</span>
                </button>
              </div>
            </div>

            {/* Setas de Navegação Laterais */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white/70 hover:text-white bg-black/40 hover:bg-white/15 backdrop-blur-sm border border-white/10 rounded-full transition-all cursor-pointer z-[120]"
                  aria-label="Foto anterior"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white/70 hover:text-white bg-black/40 hover:bg-white/15 backdrop-blur-sm border border-white/10 rounded-full transition-all cursor-pointer z-[120]"
                  aria-label="Próxima foto"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Imagem Central com Transição Suave e Inspeção por Zoom */}
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`relative max-w-[92vw] ${
                images.length > 1 ? 'max-h-[75vh] mb-14' : 'max-h-[85vh]'
              } flex flex-col items-center justify-center overflow-hidden ${
                isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed((z) => !z);
              }}
              onMouseMove={handleImageMouseMove}
            >
              <img
                src={images[selectedIndex].url}
                alt={images[selectedIndex].alt}
                style={
                  isZoomed
                    ? {
                        transform: 'scale(1.85)',
                        transformOrigin: `${panOrigin.x}% ${panOrigin.y}%`,
                      }
                    : undefined
                }
                className={`max-w-full ${
                  images.length > 1 ? 'max-h-[73vh]' : 'max-h-[82vh]'
                } object-contain select-none pointer-events-none shadow-2xl transition-transform duration-300 ease-out`}
              />
            </motion.div>

            {/* Faixa Inferior de Miniaturas (Filmstrip) */}
            {images.length > 1 && (
              <div
                ref={filmstripRef}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-[90vw] md:max-w-[70vw] flex items-center gap-2 overflow-x-auto px-3 py-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-xs z-[120] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {images.map((item, idx) => {
                  const isActive = idx === selectedIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      data-thumb-index={idx}
                      onClick={() => {
                        setIsZoomed(false);
                        setSelectedIndex(idx);
                      }}
                      aria-label={`Ir para foto ${idx + 1}`}
                      className={`relative flex-none w-11 h-11 md:w-13 md:h-13 overflow-hidden transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'ring-2 ring-white opacity-100 scale-105'
                          : 'opacity-45 hover:opacity-80'
                      }`}
                    >
                      <img
                        src={item.thumbUrl || item.url}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
