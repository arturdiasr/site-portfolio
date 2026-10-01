'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Gallery = {
  _id: string;
  title: string;
  workDate?: string;
  coverImageUrl: string;
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
    <div className="w-full mt-24 mb-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-widest uppercase">Últimos Trabalhos</h2>
        
        {/* Setas de navegação desktop */}
        <div className="hidden md:flex gap-4">
          <button 
            onClick={scrollLeft}
            className="p-3 border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all cursor-pointer group"
          >
            <svg className="w-5 h-5 text-black group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={scrollRight}
            className="p-3 border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all cursor-pointer group"
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
        {galleries.map((gallery) => (
          <Link 
            key={gallery._id} 
            href={`/galeria/${gallery._id}`}
            data-cursor="VER"
            className="flex flex-col flex-none w-[75vw] sm:w-[45vw] md:w-[30vw] lg:w-[18vw] snap-start group cursor-pointer"
          >
            {/* Título fixo acima da foto */}
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-center mb-3 line-clamp-1 group-hover:text-gray-500 transition-colors">
              {gallery.title}
            </h3>
            
            {/* Foto de capa */}
            <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              {gallery.coverImageUrl ? (
                <div className="absolute inset-0 w-full h-full">
                  <Image 
                    src={gallery.coverImageUrl} 
                    alt={gallery.title}
                    fill
                    sizes="(max-width: 640px) 75vw, (max-width: 768px) 45vw, 30vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sem capa</div>
              )}
            </div>
            
            {/* Data discreta abaixo da foto */}
            {gallery.workDate && (
              <p className="text-[10px] md:text-xs text-gray-400 text-center mt-3 uppercase tracking-wider">
                {gallery.workDate}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
