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
  className = 'object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]',
}: RotatingCardImageProps) {
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-xs text-neutral-400">
        Sem foto de capa
      </div>
    );
  }

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const isHoveredRef = useRef(isHovered);
  isHoveredRef.current = isHovered;

  // Detecta visibilidade no viewport para pré-carregar e rotacionar apenas cards próximos/visíveis
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { rootMargin: '250px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Ao montar no cliente: sorteia a foto inicial para dinamismo a cada visita
  useEffect(() => {
    if (images.length > 1) {
      const initialRandom = Math.floor(Math.random() * images.length);
      setCurrentIndex(initialRandom);
    }
  }, [images.length]);

  // Ciclo de rotação orgânico e desfasado (apenas quando visível no viewport)
  useEffect(() => {
    if (images.length <= 1 || !isInView) return;

    const staggeredDelay = 8500 + (indexOffset % 5) * 1200;

    const interval = setInterval(() => {
      if (isHoveredRef.current) return;

      setCurrentIndex((prev) => {
        let next = Math.floor(Math.random() * images.length);
        if (next === prev) {
          next = (prev + 1) % images.length;
        }
        return next;
      });
    }, staggeredDelay);

    return () => clearInterval(interval);
  }, [images.length, indexOffset, isInView]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden bg-neutral-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {images.map((imgUrl, idx) => {
        const isActive = idx === currentIndex;
        const isLoaded = !!loadedImages[idx];
        // Renderiza imediatamente a imagem ativa/inicial, e as demais assim que o card entra na área de visão
        if (!isActive && idx !== 0 && !isInView) return null;

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
