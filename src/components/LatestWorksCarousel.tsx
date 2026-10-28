'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion } from "motion/react";
import RotatingCardImage from "@/components/RotatingCardImage";

type Gallery = {
  _id: string;
  title: string;
  workDate?: string;
  coverImageUrl: string;
  rotationImages?: string[];
};

export default function LatestWorksCarousel({ galleries }: { galleries: Gallery[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  if (!galleries || galleries.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-24 mb-8">
      <div className="relative mb-10 text-center">
        <span className="font-sans text-[11px] uppercase tracking-[0.3em] text-neutral-400 font-semibold block mb-2">
          Arquivo Recente
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-neutral-950">
          Últimos Trabalhos
        </h2>

        {/* Setas de navegação desktop */}
        <div className="hidden md:flex gap-3 absolute right-0 top-1/2 -translate-y-1/2">
          <button
            onClick={scrollLeft}
            className="p-3 border border-neutral-200 hover:border-black hover:bg-black hover:text-white transition-all cursor-pointer group"
            aria-label="Anterior"
          >
            <svg className="w-4 h-4 text-black group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={scrollRight}
            className="p-3 border border-neutral-200 hover:border-black hover:bg-black hover:text-white transition-all cursor-pointer group"
            aria-label="Próximo"
          >
            <svg className="w-4 h-4 text-black group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Carrossel */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto gap-6 snap-x snap-mandatory pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full"
      >
        {galleries.map((gallery, index) => (
          <motion.div
            key={gallery._id}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
            className="flex flex-col flex-none w-[75vw] sm:w-[45vw] md:w-[30vw] lg:w-[18vw] snap-start group cursor-pointer"
          >
            <Link
              href={`/galeria/${gallery._id}`}
              data-cursor="VER"
              className="flex flex-col h-full w-full"
            >
              {/* Título flexível acima da foto */}
              <div className="flex-grow flex items-end justify-center mb-3 px-1">
                <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-center text-neutral-800 group-hover:text-black transition-colors">
                  {gallery.title}
                </h3>
              </div>

              {/* Foto de capa com rotação suave */}
              <div className="relative w-full aspect-[4/5] bg-neutral-100 overflow-hidden shadow-sm group-hover:shadow-xl transition-shadow duration-500">
                <RotatingCardImage
                  images={
                    gallery.rotationImages && gallery.rotationImages.length > 0
                      ? gallery.rotationImages
                      : gallery.coverImageUrl
                      ? [gallery.coverImageUrl]
                      : []
                  }
                  alt={gallery.title}
                  sizes="(max-width: 640px) 75vw, (max-width: 768px) 45vw, 30vw"
                  indexOffset={index}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>

              {/* Data editorial abaixo da foto */}
              {gallery.workDate && (
                <p className="font-serif italic text-xs md:text-sm text-neutral-500 text-center mt-3 tracking-wide">
                  {gallery.workDate}
                </p>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
