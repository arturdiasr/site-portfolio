'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import VideoCard from "@/components/VideoCard";
import { urlForImage } from "@/sanity/lib/image";

export default function HomeMasonry({ items }: { items: any[] }) {
  const [cols, setCols] = useState(3);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateCols = () => {
      if (window.innerWidth < 640) setCols(1);
      else if (window.innerWidth < 1024) setCols(2);
      else setCols(3);
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  // Evita hydration mismatch renderizando apenas 1 coluna no servidor (mobile first) ou 3, mas o CSS disfarça
  const renderCols = mounted ? cols : 3;

  const columns: { items: any[], height: number }[] = Array.from({ length: renderCols }, () => ({ items: [], height: 0 }));

  items.forEach(item => {
    // Calcula o aspecto (altura relativa)
    let isLandscape = false;
    if (item._type === 'featuredVideo') {
      isLandscape = item.format === 'Horizontal (ex: YouTube/Cinema)';
    } else {
      isLandscape = item.categoryAspect && item.categoryAspect > 1.1;
    }
    const heightWeight = isLandscape ? 0.666 : 1.25;

    // Encontra a coluna mais curta
    let shortestIndex = 0;
    let minHeight = columns[0].height;
    for (let i = 1; i < renderCols; i++) {
      if (columns[i].height < minHeight) {
        minHeight = columns[i].height;
        shortestIndex = i;
      }
    }
    columns[shortestIndex].items.push(item);
    columns[shortestIndex].height += heightWeight; 
  });

  return (
    <div className={`grid gap-6 w-full items-start transition-all ${renderCols === 1 ? 'grid-cols-1' : renderCols === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {columns.map((col, i) => (
        <div key={i} className="flex flex-col gap-6 w-full min-w-0">
          {col.items.map(item => {
            // LÓGICA PARA VÍDEOS
            if (item._type === 'featuredVideo') {
              const isLandscape = item.format === 'Horizontal (ex: YouTube/Cinema)';
              const aspectClass = isLandscape ? "aspect-[3/2]" : "aspect-[4/5]";
              
              return (
                <div className="w-full" key={item._id}>
                  <VideoCard 
                    video={{
                      ...item,
                      coverImage: item.videoCover ? urlForImage(item.videoCover).url() : ''
                    }} 
                    aspectClass={aspectClass}
                  />
                </div>
              );
            }

            // LÓGICA PARA CATEGORIAS
            const isLandscape = item.categoryAspect && item.categoryAspect > 1.1;
            const aspectClass = isLandscape ? "aspect-[3/2]" : "aspect-[4/5]";

            return (
              <Link data-cursor="VER" href={`/categoria/${item._id}`} key={item._id} className="group relative w-full block overflow-hidden bg-gray-50 cursor-pointer shadow-sm hover:shadow-xl transition-all">
                <div className={`w-full relative ${aspectClass}`}>
                  {item.categoryCover ? (
                    <div className="absolute inset-0 w-full h-full">
                      <Image 
                        src={urlForImage(item.categoryCover).url()} 
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">Sem foto de capa</div>
                  )}
                </div>

                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center pointer-events-none">
                  <div className="text-center w-full px-4">
                    <h2 className="text-black bg-white/95 px-6 py-3 text-xl font-bold tracking-widest uppercase shadow-xl inline-block">{item.title}</h2>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
