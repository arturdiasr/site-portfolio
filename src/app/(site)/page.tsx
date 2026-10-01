import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import Link from "next/link";

export const revalidate = 0;

export default async function Portfolio() {
  const query = `*[_type == "category"] | order(order asc, _createdAt asc) {
    _id,
    title,
    "coverImage": coalesce(images[isCover == true][0], coverImage),
    "aspectRatio": coalesce(images[isCover == true][0].asset->metadata.dimensions.aspectRatio, coverImage.asset->metadata.dimensions.aspectRatio)
  }`;
  
  const categories = await client.fetch(query);

  return (
    <div className="w-full">
      {categories.length === 0 ? (
        <p className="text-center text-gray-500 py-20">Nenhuma categoria encontrada. Crie categorias no Painel /studio e adicione uma foto de capa.</p>
      ) : (
        <section className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 2xl:columns-5 gap-6">
          {categories.map((cat: any) => {
            // Padroniza as proporções: 3/2 para horizontais e 4/5 para verticais
            // Isso evita a quebra de simetria do Masonry causada por formatos variados (16:9, 4:3, etc)
            const isLandscape = cat.aspectRatio && cat.aspectRatio > 1;
            const aspectClass = isLandscape ? "aspect-[3/2]" : "aspect-[4/5]";

            return (
              <Link href={`/categoria/${cat._id}`} key={cat._id} className="group relative break-inside-avoid mb-6 w-full block overflow-hidden bg-gray-50 cursor-pointer shadow-sm hover:shadow-xl transition-all">
                
                <div className={`w-full ${aspectClass}`}>
                  {cat.coverImage ? (
                    <img 
                      src={urlForImage(cat.coverImage).url()} 
                      alt={cat.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">Sem foto de capa</div>
                  )}
                </div>

                {/* Texto surgindo no centro ao passar o mouse */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center pointer-events-none">
                  <div className="text-center w-full px-4">
                    <h2 className="text-black bg-white/95 px-6 py-3 text-xl font-bold tracking-widest uppercase shadow-xl inline-block">{cat.title}</h2>
                  </div>
                </div>
                  
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
