'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion } from "framer-motion";
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
    return null; // Não mostra nada se não houver galerias
  }

  return (
    <div className="w-full mt-24 mb-0">
      <div className="relative mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-widest uppercase">Últimos Trabalhos</h2>
        
        {/* Setas de navegação desktop */}
        <div className="hidden md:flex gap-4 absolute right-0 top-1/2 -translate-y-1/2">
          <button 
            onClick={scrollLeft}
            className="p-3 border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all cursor-pointer group"
            aria-label="Anterior"
          >
            <svg className="w-5 h-5 text-black group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={scrollRight}
            className="p-3 border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all cursor-pointer group"
            aria-label="Próximo"
          >
            <svg className="w-5 h-5 text-black group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
            <div className="flex-grow flex items-end justify-center mb-3">
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-center group-hover:text-gray-500 transition-colors">
                {gallery.title}
              </h3>
            </div>
            
            {/* Foto de capa com rotação suave */}
            <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              <RotatingCardImage
                images={gallery.rotationImages && gallery.rotationImages.length > 0 ? gallery.rotationImages : (gallery.coverImageUrl ? [gallery.coverImageUrl] : [])}
                alt={gallery.title}
                sizes="(max-width: 640px) 75vw, (max-width: 768px) 45vw, 30vw"
                indexOffset={index}
              />
            </div>
            
            {/* Data discreta abaixo da foto */}
            {gallery.workDate && (
              <p className="text-[10px] md:text-xs text-gray-400 text-center mt-3 uppercase tracking-wider">
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
