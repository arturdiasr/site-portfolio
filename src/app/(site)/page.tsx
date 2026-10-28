import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import { Link } from "next-view-transitions";
import HomeMasonry from "@/components/HomeMasonry";
import LatestWorksCarousel from "@/components/LatestWorksCarousel";
import TestimonialsSection from "@/components/TestimonialsSection";

export const revalidate = 0;

function extractUniqueRotationUrls(
  coverPhoto: any,
  favoritePhotos: any[] = [],
  fallbackPhotos: any[] = []
): string[] {
  const cover = coverPhoto ? [coverPhoto] : [];
  const favs = (favoritePhotos || []).filter(Boolean);
  
  // Se houver fotos favoritas selecionadas pelo usuário, usamos apenas a capa + favoritas.
  // Caso contrário, usamos fallback para que o site já ganhe dinamismo imediato!
  const candidatePool = favs.length > 0 ? favs : (fallbackPhotos || []).filter(Boolean);
  
  const allList = [...cover, ...candidatePool];
  const seenRefs = new Set<string>();
  const uniqueUrls: string[] = [];
  
  for (const item of allList) {
    if (!item) continue;
    const ref = item.asset?._ref || item._key;
    if (ref && seenRefs.has(ref)) continue;
    if (ref) seenRefs.add(ref);
    
    try {
      const url = urlForImage(item).url();
      if (url && !uniqueUrls.includes(url)) {
        uniqueUrls.push(url);
      }
    } catch {
      // Ignora item caso falhe na geração da URL
    }
    
    if (uniqueUrls.length >= 6) break; // Capa + até 5 fotos favoritas
  }
  
  return uniqueUrls;
}

export default async function Portfolio() {
  // Busca categorias
  const catQuery = `*[_type == "category"] | order(order asc, _createdAt asc) {
    _id,
    _type,
    title,
    order,
    "categoryCover": coalesce(images[isCover == true][0], coverImage),
    "categoryAspect": coalesce(images[isCover == true][0].asset->metadata.dimensions.aspectRatio, coverImage.asset->metadata.dimensions.aspectRatio),
    "favoriteImages": favoriteImages[],
    "markedFavorites": images[isFavorite == true],
    "galleryFavorites": *[_type == "gallery" && category._ref == ^._id].images[isFavorite == true][0...8],
    "galleryCovers": *[_type == "gallery" && category._ref == ^._id]{
      "cover": coalesce(images[isCover == true][0], coverImage)
    }.cover[0...5],
    "fallbackImages": images[0...6]
  }`;
  const rawCategories = await client.fetch(catQuery);

  const categories = rawCategories.map((cat: any) => {
    const favCandidates = [
      ...(cat.favoriteImages || []),
      ...(cat.markedFavorites || []),
      ...(cat.galleryFavorites || [])
    ];
    const fallbackCandidates = [
      ...(cat.galleryCovers || []),
      ...(cat.fallbackImages || [])
    ];
    const rotationImages = extractUniqueRotationUrls(
      cat.categoryCover,
      favCandidates,
      fallbackCandidates
    );

    return {
      ...cat,
      rotationImages
    };
  });

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
    const videoCoverUrl = videos[0].videoCover ? urlForImage(videos[0].videoCover).url() : '';
    items.push({
      _id: 'videos',
      _type: 'category',
      title: 'Vídeos',
      categoryCover: videos[0].videoCover,
      categoryAspect: videos[0].format === 'Horizontal (ex: YouTube/Cinema)' ? 1.5 : 0.8,
      rotationImages: videoCoverUrl ? [videoCoverUrl] : [],
      isMockVideoCategory: true
    });
  }

  // Busca os 10 trabalhos mais recentes (sub-galerias)
  const latestQuery = `*[_type == "gallery"] | order(workDate desc, _createdAt desc)[0...10] {
    _id,
    title,
    workDate,
    "coverImage": coalesce(images[isCover == true][0], coverImage),
    "favoriteImages": favoriteImages[],
    "markedFavorites": images[isFavorite == true][0...8],
    "fallbackImages": images[0...6]
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

    const favCandidates = [
      ...(gal.favoriteImages || []),
      ...(gal.markedFavorites || [])
    ];
    const rotationImages = extractUniqueRotationUrls(
      gal.coverImage,
      favCandidates,
      gal.fallbackImages || []
    );
    
    return {
      _id: gal._id,
      title: gal.title,
      workDate: formattedDate,
      coverImageUrl: gal.coverImage ? urlForImage(gal.coverImage).url() : '',
      rotationImages
    };
  });

  const testimonials = await client.fetch(
    `*[_type == "testimonial" && approved == true] | order(_createdAt desc)[0...12] { _id, name, rating, text }`
  );

  return (
    <div className="w-full">
      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-20">Nenhum item encontrado. Crie categorias ou vídeos no Painel /studio.</p>
      ) : (
        <HomeMasonry items={items} />
      )}

      {/* Sessão de Últimos Trabalhos (Carrossel) */}
      <div className="relative">
        {/* Gradiente do papel para o branco (começa acima do carrossel) */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[100vw] h-32 bg-gradient-to-b from-white/0 to-white -z-10 pointer-events-none" />
        
        {/* Fundo branco sólido que acompanha apenas a altura da sessão */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[100vw] bg-white -z-10 pointer-events-none" />

        <LatestWorksCarousel galleries={formattedLatestGalleries} />

        <TestimonialsSection testimonials={testimonials} />

        {/* Seção Pré-Footer de Conversão Editorial */}
        <section className="w-full max-w-4xl mx-auto py-20 px-6 text-center border-t border-neutral-100">
          <span className="font-sans text-[11px] uppercase tracking-[0.3em] text-neutral-400 font-semibold block mb-3">
            Disponibilidade para Novos Projetos
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-neutral-950 font-normal tracking-tight mb-5">
            Vamos criar memórias e imagens inesquecíveis juntos?
          </h2>
          <p className="font-sans text-neutral-500 text-sm max-w-xl mx-auto leading-relaxed mb-9">
            Atendendo ensaios, arquitetura, música e eventos em Brasília e em todo o território nacional. Entre em contato para consultar datas disponíveis e propostas personalizadas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/5561991071783?text=Ol%C3%A1%2C%20Artur!%20Gostaria%20de%20solicitar%20um%20or%C3%A7amento%20de%20fotografia."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-black text-white px-8 py-4 text-xs uppercase tracking-[0.22em] font-bold hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-300"
            >
              Solicitar Orçamento via WhatsApp
            </a>
            <Link
              href="/sobre"
              className="w-full sm:w-auto border border-neutral-300 text-neutral-800 px-8 py-4 text-xs uppercase tracking-[0.22em] font-semibold hover:border-black hover:text-black transition-colors"
            >
              Conhecer Minha Trajetória
            </Link>
          </div>
        </section>
      </div>
      
    </div>
  );
}
