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
  const [loadedSingle, setLoadedSingle] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">
        Sem foto de capa
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-neutral-100">
        <Image
          src={images[0]}
          alt={alt}
          fill
          unoptimized
          priority={priority}
          sizes={sizes}
          onLoad={() => setLoadedSingle(true)}
          className={`${className} ${loadedSingle ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(isHovered);
  const preloadedSetRef = useRef<Set<string>>(new Set());
  isHoveredRef.current = isHovered;

  const preloadUrl = (url?: string) => {
    if (!url || typeof window === 'undefined' || preloadedSetRef.current.has(url)) return;
    preloadedSetRef.current.add(url);
    const img = new window.Image();
    img.src = url;
  };

  // Observa visibilidade no viewport para só rotacionar e pré-carregar cards próximos da tela
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '250px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Ao montar no cliente: sorteia a foto inicial para que cada visita traga uma foto diferente
  useEffect(() => {
    if (images.length > 1) {
      const initialRandom = Math.floor(Math.random() * images.length);
      setCurrentIndex(initialRandom);
    }
  }, [images.length]);

  // Pré-carrega sob demanda apenas a próxima foto quando o card entra em vista
  useEffect(() => {
    if (!isInView || images.length <= 1) return;
    const nextIdx = (currentIndex + 1) % images.length;
    preloadUrl(images[nextIdx]);
  }, [isInView, currentIndex, images]);

  // Ciclo de rotação com delay longo e orgânico (desfasado entre cards), ativo apenas quando visível
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
        preloadUrl(images[next]);
        return next;
      });
    }, staggeredDelay);

    return () => clearInterval(interval);
  }, [images, indexOffset, isInView]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden bg-neutral-100"
      onMouseEnter={() => {
        setIsHovered(true);
        images.forEach(preloadUrl);
      }}
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
              unoptimized
              loading={priority && idx === 0 ? 'eager' : 'lazy'}
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
