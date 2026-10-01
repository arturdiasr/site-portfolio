import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import Link from "next/link";
import MasonryGrid from "@/components/MasonryGrid";
import VideoCard from "@/components/VideoCard";
import LatestWorksCarousel from "@/components/LatestWorksCarousel";

export const revalidate = 0;

export default async function Portfolio() {
  // Busca tanto categorias quanto vídeos e os ordena misturados
  const query = `*[(_type == "category" || _type == "featuredVideo")] | order(order asc, _createdAt asc) {
    _id,
    _type,
    title,
    order,
    
    // Campos de Categoria
    "categoryCover": coalesce(images[isCover == true][0], coverImage),
    "categoryAspect": coalesce(images[isCover == true][0].asset->metadata.dimensions.aspectRatio, coverImage.asset->metadata.dimensions.aspectRatio),
    
    // Campos de Vídeo
    videoType,
    "videoFileUrl": videoFile.asset->url,
    youtubeUrl,
    "videoCover": coverImage,
    format
  }`;
  
  const items = await client.fetch(query);

  // Busca os 10 trabalhos mais recentes (sub-galerias)
  const latestQuery = `*[_type == "gallery"] | order(_createdAt desc)[0...10] {
    _id,
    title,
    workDate,
    "coverImage": coalesce(images[isCover == true][0], coverImage)
  }`;
  
  const latestGalleries = await client.fetch(latestQuery);
  const formattedLatestGalleries = latestGalleries.map((gal: any) => ({
    _id: gal._id,
    title: gal.title,
    workDate: gal.workDate || null,
    coverImageUrl: gal.coverImage ? urlForImage(gal.coverImage).url() : ''
  }));

  return (
    <div className="w-full">
      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-20">Nenhum item encontrado. Crie categorias ou vídeos no Painel /studio.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 auto-rows-max">
          {items.map((item: any) => {
            
            // LÓGICA PARA VÍDEOS
            if (item._type === 'featuredVideo') {
              const isLandscape = item.format === 'Horizontal (ex: YouTube/Cinema)';
              const gridSpanClass = isLandscape ? "sm:col-span-2" : "col-span-1";
              const aspectClass = isLandscape ? "aspect-[3/2]" : "aspect-[4/5]";
              
              return (
                <div className={`${gridSpanClass}`} key={item._id}>
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
            const gridSpanClass = isLandscape ? "sm:col-span-2" : "col-span-1";
            const aspectClass = isLandscape ? "aspect-[3/2]" : "aspect-[4/5]";

            return (
              <Link href={`/categoria/${item._id}`} key={item._id} className={`group relative w-full h-full block overflow-hidden bg-gray-50 cursor-pointer shadow-sm hover:shadow-xl transition-all ${gridSpanClass}`}>
                
                <div className={`w-full h-full ${aspectClass}`}>
                  {item.categoryCover ? (
                    <img 
                      src={urlForImage(item.categoryCover).url()} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">Sem foto de capa</div>
                  )}
                </div>

                {/* Texto surgindo no centro ao passar o mouse */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center pointer-events-none">
                  <div className="text-center w-full px-4">
                    <h2 className="text-black bg-white/95 px-6 py-3 text-xl font-bold tracking-widest uppercase shadow-xl inline-block">{item.title}</h2>
                  </div>
                </div>
                  
              </Link>
            );
          })}
        </div>
      )}

      {/* Sessão de Últimos Trabalhos (Carrossel) */}
      <LatestWorksCarousel galleries={formattedLatestGalleries} />
      
    </div>
  );
}
