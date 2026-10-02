import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import HomeMasonry from "@/components/HomeMasonry";
import LatestWorksCarousel from "@/components/LatestWorksCarousel";

export const revalidate = 0;

export default async function Portfolio() {
  // Busca categorias
  const catQuery = `*[_type == "category"] | order(order asc, _createdAt asc) {
    _id,
    _type,
    title,
    order,
    "categoryCover": coalesce(images[isCover == true][0], coverImage),
    "categoryAspect": coalesce(images[isCover == true][0].asset->metadata.dimensions.aspectRatio, coverImage.asset->metadata.dimensions.aspectRatio)
  }`;
  const categories = await client.fetch(catQuery);

  // Busca vídeos
  const vidQuery = `*[_type == "featuredVideo"] | order(order asc, _createdAt asc) {
    _id,
    videoType,
    "videoCover": coverImage,
    format
  }`;
  const videos = await client.fetch(vidQuery);

  const items = [...categories];

  // Cria um card de categoria "Vídeos" no final usando a capa do primeiro vídeo
  if (videos.length > 0) {
    items.push({
      _id: 'videos',
      _type: 'category',
      title: 'Vídeos',
      categoryCover: videos[0].videoCover,
      categoryAspect: videos[0].format === 'Horizontal (ex: YouTube/Cinema)' ? 1.5 : 0.8,
      isMockVideoCategory: true
    });
  }

  // Busca os 10 trabalhos mais recentes (sub-galerias)
  const latestQuery = `*[_type == "gallery"] | order(workDate desc, _createdAt desc)[0...10] {
    _id,
    title,
    workDate,
    "coverImage": coalesce(images[isCover == true][0], coverImage)
  }`;
  
  const latestGalleries = await client.fetch(latestQuery);
  const formattedLatestGalleries = latestGalleries.map((gal: any) => {
    let formattedDate = gal.workDate || null;
    if (formattedDate && formattedDate.includes('-')) {
      const parts = formattedDate.split('-');
      if (parts.length === 3) {
        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const month = date.toLocaleString('pt-BR', { month: 'long' });
        formattedDate = month.charAt(0).toUpperCase() + month.slice(1) + " " + date.getFullYear();
      }
    }
    
    return {
      _id: gal._id,
      title: gal.title,
      workDate: formattedDate,
      coverImageUrl: gal.coverImage ? urlForImage(gal.coverImage).url() : ''
    };
  });

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
