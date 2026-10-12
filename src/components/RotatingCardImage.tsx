'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface RotatingCardImageProps {
  images: string[];
  alt: string;
  priority?: boolean;
  sizes?: string;
  indexOffset?: number;
  className?: string;
}

export default function RotatingCardImage({
  images,
  alt,
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  indexOffset = 0,
  className = 'object-cover transition-transform duration-1000 group-hover:scale-105',
}: RotatingCardImageProps) {
  // Se não houver imagens, não renderiza nada
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">
        Sem foto de capa
      </div>
    );
  }

  // Se houver apenas 1 imagem, renderiza estático com efeito blur-up
  if (images.length === 1) {
    return (
      <SingleCardImage
        src={images[0]}
        alt={alt}
        priority={priority}
        sizes={sizes}
        className={className}
      />
    );
  }

  return (
    <RotatingCardCarousel
      images={images}
      alt={alt}
      priority={priority}
      sizes={sizes}
      indexOffset={indexOffset}
      className={className}
    />
  );
}

function SingleCardImage({
  src,
  alt,
  priority,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-neutral-100">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        className={`${className} transition-all duration-700 ease-out ${
          loaded ? 'blur-0 opacity-100' : 'blur-md opacity-70'
        }`}
      />
    </div>
  );
}

function RotatingCardCarousel({
  images,
  alt,
  priority,
  sizes,
  indexOffset = 0,
  className,
}: RotatingCardImageProps) {
  // Começa no 0 para SSR consistente
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(isHovered);
  isHoveredRef.current = isHovered;

  // Pré-carrega todas as imagens na memória para rotação instantânea e sem engasgos
  useEffect(() => {
    if (typeof window === 'undefined' || !images || images.length <= 1) return;
    images.forEach((url) => {
      if (url) {
        const img = new window.Image();
        img.src = url;
      }
    });
  }, [images]);

  // Ao montar no cliente: sorteia a foto inicial para que cada visita traga uma foto diferente!
  useEffect(() => {
    if (images.length > 1) {
      const initialRandom = Math.floor(Math.random() * images.length);
      setCurrentIndex(initialRandom);
    }
  }, [images.length]);

  // Ciclo de rotação com delay longo e orgânico (desfasado entre cards)
  useEffect(() => {
    if (images.length <= 1) return;

    // Delay base longo: 8500ms a 12500ms, desfasado pelo índice do card
    // Isso garante que os cards não troquem todos juntos no mesmo segundo
    const staggeredDelay = 8500 + (indexOffset % 5) * 1200;

    const interval = setInterval(() => {
      if (isHoveredRef.current) return;

      setCurrentIndex((prev) => {
        // Escolhe aleatoriamente uma próxima foto diferente da atual
        let next = Math.floor(Math.random() * images.length);
        if (next === prev) {
          next = (prev + 1) % images.length;
        }
        return next;
      });
    }, staggeredDelay);

    return () => clearInterval(interval);
  }, [images.length, indexOffset]);

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden bg-neutral-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {images.map((imgUrl, idx) => {
        const isActive = idx === currentIndex;
        const isLoaded = !!loadedImages[idx];

        return (
          <div
            key={imgUrl + idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1200 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
            style={{ willChange: 'opacity' }}
          >
            <Image
              src={imgUrl}
              alt={alt}
              fill
              priority={priority && idx === 0}
              sizes={sizes}
              onLoad={() => setLoadedImages((prev) => ({ ...prev, [idx]: true }))}
              className={`${className} transition-all duration-700 ease-out ${
                isLoaded ? 'blur-0 opacity-100' : 'blur-md opacity-70'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
