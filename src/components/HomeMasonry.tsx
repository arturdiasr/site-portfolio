'use client';

import { useState, useEffect } from 'react';
import { Link } from 'next-view-transitions';
import { urlForImage } from "@/sanity/lib/image";
import { motion } from "motion/react";
import RotatingCardImage from "@/components/RotatingCardImage";

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

  const renderCols = mounted ? cols : 3;

  const columns: { items: any[]; height: number }[] = Array.from(
    { length: renderCols },
    () => ({ items: [], height: 0 })
  );

  items.forEach((item, globalIdx) => {
    const isLandscape = item.categoryAspect && item.categoryAspect > 1.1;
    const heightWeight = isLandscape ? 0.666 : 1.25;

    let shortestIndex = 0;
    let minHeight = columns[0].height;
    for (let i = 1; i < renderCols; i++) {
      if (columns[i].height < minHeight) {
        minHeight = columns[i].height;
        shortestIndex = i;
      }
    }
    columns[shortestIndex].items.push({ ...item, globalIdx });
    columns[shortestIndex].height += heightWeight;
  });

  return (
    <div
      className={`grid gap-6 w-full items-start transition-all ${
        renderCols === 1 ? 'grid-cols-1' : renderCols === 2 ? 'grid-cols-2' : 'grid-cols-3'
      }`}
    >
      {columns.map((col, i) => (
        <div key={i} className="flex flex-col gap-6 w-full min-w-0">
          {col.items.map((item, itemIdx) => {
            const isLandscape = item.categoryAspect && item.categoryAspect > 1.1;
            const aspectClass = isLandscape ? "aspect-[3/2]" : "aspect-[4/5]";
            const targetHref = item.isMockVideoCategory ? '/videos' : `/categoria/${item._id}`;
            const isTopRow = itemIdx === 0;
            const seriesNumber = String((item.globalIdx ?? itemIdx) + 1).padStart(2, '0');

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  data-cursor="VER"
                  href={targetHref}
                  className="group relative w-full block overflow-hidden bg-neutral-900 cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-700"
                >
                  <div
                    className={`w-full relative ${aspectClass} overflow-hidden`}
                    style={{ viewTransitionName: `category-cover-${item._id}` }}
                  >
                    <RotatingCardImage
                      images={
                        item.rotationImages && item.rotationImages.length > 0
                          ? item.rotationImages
                          : item.categoryCover
                          ? [urlForImage(item.categoryCover).url()]
                          : []
                      }
                      alt={item.title}
                      priority={isTopRow}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      indexOffset={item.globalIdx ?? itemIdx}
                      className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                    />
                  </div>

                  {/* Número de Série no Topo Esquerdo (Desktop) */}
                  <div className="hidden md:block absolute top-4 left-4 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-[10px] font-bold tracking-widest text-white/80 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xs border border-white/10">
                      {seriesNumber}
                    </span>
                  </div>

                  {/* Desktop: Gradiente Scrim Inferior (Imagem Desobstruída) */}
                  <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex-col justify-end p-6 z-20 pointer-events-none">
                    <div className="transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                      <span className="text-[10px] uppercase tracking-widest text-neutral-300 font-semibold block mb-1">
                        {item.isMockVideoCategory ? 'Produção Audiovisual' : 'Galeria de Trabalhos'}
                      </span>
                      <div className="flex items-end justify-between gap-4">
                        <h2 className="text-white text-xl lg:text-2xl font-extrabold tracking-widest uppercase leading-tight">
                          {item.title}
                        </h2>
                        <span className="text-white/90 text-xs uppercase tracking-widest font-bold flex items-center gap-1.5 shrink-0 pb-0.5">
                          Ver <span className="text-sm leading-none transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile: Barra Translúcida na Base */}
                  <div className="md:hidden absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
                    <div className="flex items-center justify-between bg-black/45 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-xs shadow-lg">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-bold text-white/60 tracking-widest">
                          {seriesNumber}
                        </span>
                        <span className="text-white text-xs font-extrabold uppercase tracking-widest">
                          {item.title}
                        </span>
                      </div>
                      <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
