import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";
import Image from "next/image";
import LightboxGallery from "@/components/LightboxGallery";
import MasonryGrid from "@/components/MasonryGrid";

export const revalidate = 0;

export default async function CategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const catQuery = `*[_type == "category" && _id == $id][0] { 
    title,
    images[] {
      ...,
      "aspectRatio": asset->metadata.dimensions.aspectRatio
    }
  }`;
  const category = await client.fetch(catQuery, { id });

  if (!category) notFound();

  const subQuery = `*[_type == "gallery" && category._ref == $id] | order(_createdAt desc) {
    _id,
    title,
    "coverImage": coalesce(images[isCover == true][0], coverImage),
    "aspectRatio": coalesce(images[isCover == true][0].asset->metadata.dimensions.aspectRatio, coverImage.asset->metadata.dimensions.aspectRatio)
  }`;
  const subGalleries = await client.fetch(subQuery, { id });

  const looseImages = category.images?.map((img: any, index: number) => ({
    url: urlForImage(img).width(1600).url(),
    alt: img.caption || `${category.title} - Foto ${index + 1}`,
    aspectRatio: img.aspectRatio
  })) || [];

  return (
    <div className="w-full space-y-14 pb-20">
      <div className="pt-4 space-y-3 text-center">
        <Link
          href="/"
          className="font-sans text-neutral-400 hover:text-black uppercase tracking-[0.25em] text-[11px] font-semibold transition-colors mb-2 inline-block"
        >
          &larr; Voltar às Categorias
        </Link>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-neutral-950">
          {category.title}
        </h1>
      </div>

      {subGalleries.length === 0 && looseImages.length === 0 ? (
        <p className="text-center text-neutral-400 py-20 border border-dashed border-neutral-200">
          Nenhuma foto ou galeria encontrada nesta categoria.
        </p>
      ) : (
        <div className="space-y-24">
          {subGalleries.length > 0 && (
            <MasonryGrid>
              {subGalleries.map((gallery: any, idx: number) => {
                const isLandscape = gallery.aspectRatio && gallery.aspectRatio > 1;
                const aspectClass = isLandscape ? "aspect-[3/2]" : "aspect-[4/5]";
                const seriesNumber = String(idx + 1).padStart(2, '0');

                return (
                  <Link
                    href={`/galeria/${gallery._id}`}
                    key={gallery._id}
                    className="group relative break-inside-avoid mb-6 w-full block overflow-hidden bg-neutral-900 cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-700"
                  >
                    <div className={`w-full relative ${aspectClass} overflow-hidden`}>
                      {gallery.coverImage ? (
                        <Image
                          src={urlForImage(gallery.coverImage).width(1200).url()}
                          alt={gallery.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-xs text-neutral-400">
                          Sem foto de capa
                        </div>
                      )}
                    </div>

                    {/* Número de Série Editorial no Topo Esquerdo (Desktop) */}
                    <div className="hidden md:block absolute top-4 left-4 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <span className="font-mono text-[10px] tracking-[0.2em] text-white/80 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xs border border-white/10">
                        {seriesNumber}
                      </span>
                    </div>

                    {/* Desktop: Gradiente Scrim Inferior Cinematográfico */}
                    <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex-col justify-end p-6 z-20 pointer-events-none">
                      <div className="transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <span className="font-sans text-[10px] uppercase tracking-[0.28em] text-neutral-300 font-medium block mb-1">
                          Ensaio / Cobertura
                        </span>
                        <div className="flex items-end justify-between gap-4">
                          <h2 className="text-white font-serif text-2xl lg:text-3xl tracking-wide font-normal leading-tight">
                            {gallery.title}
                          </h2>
                          <span className="font-sans text-white/90 text-[11px] uppercase tracking-[0.22em] font-semibold flex items-center gap-1.5 shrink-0 pb-0.5">
                            Ver <span className="text-sm leading-none transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile: Barra Translúcida Editorial na Base */}
                    <div className="md:hidden absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
                      <div className="flex items-center justify-between bg-black/45 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-xs shadow-lg">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-[9px] text-white/60 tracking-widest">
                            {seriesNumber}
                          </span>
                          <span className="text-white text-xs font-medium uppercase tracking-[0.2em]">
                            {gallery.title}
                          </span>
                        </div>
                        <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </MasonryGrid>
          )}

          {looseImages.length > 0 && (
            <div>
              {subGalleries.length > 0 && (
                <div className="text-center mb-12">
                  <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-semibold block mb-1">
                    Acervo Individual
                  </span>
                  <h2 className="font-serif text-3xl font-normal tracking-tight text-neutral-900">
                    Outros Trabalhos
                  </h2>
                </div>
              )}
              <LightboxGallery images={looseImages} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
