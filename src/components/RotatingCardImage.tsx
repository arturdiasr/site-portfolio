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

  // Se houver apenas 1 imagem, renderiza estático de forma direta e leve
  if (images.length === 1) {
    return (
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={images[0]}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={className}
        />
      </div>
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
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(isHovered);
  isHoveredRef.current = isHovered;

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
      className="absolute inset-0 w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {images.map((imgUrl, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={imgUrl + idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1200 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Image
              src={imgUrl}
              alt={alt}
              fill
              priority={priority && idx === 0}
              sizes={sizes}
              className={className}
            />
          </div>
        );
      })}
    </div>
  );
}
