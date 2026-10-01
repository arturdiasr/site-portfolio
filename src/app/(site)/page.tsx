import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import HomeMasonry from "@/components/HomeMasonry";
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
        <HomeMasonry items={items} />
      )}

      {/* Sessão de Últimos Trabalhos (Carrossel) */}
      <LatestWorksCarousel galleries={formattedLatestGalleries} />
      
    </div>
  );
}
