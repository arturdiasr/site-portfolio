import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import Link from "next/link";

export const revalidate = 0;

export default async function Portfolio() {
  // Agora a Home busca as Categorias, e não as sub-galerias soltas
  const query = `*[_type == "category"] | order(_createdAt asc) {
    _id,
    title,
    coverImage
  }`;
  
  const categories = await client.fetch(query);

  return (
    <div className="space-y-16">
      {categories.length === 0 ? (
        <p className="text-center text-gray-500 py-20">Nenhuma categoria encontrada. Crie categorias no Painel /studio e adicione uma foto de capa.</p>
      ) : (
        <section className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 2xl:columns-5 gap-6 space-y-6">
          {categories.map((cat: any) => (
            <Link href={`/categoria/${cat._id}`} key={cat._id} className="group relative break-inside-avoid overflow-hidden bg-gray-50 cursor-pointer shadow-sm hover:shadow-xl transition-all block">
              {cat.coverImage ? (
                <img 
                  src={urlForImage(cat.coverImage).url()} 
                  alt={cat.title}
                  className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              ) : (
                <div className="w-full aspect-[4/5] bg-gray-200 flex items-center justify-center">Sem foto de capa</div>
              )}
              {/* Texto hover sutil e moderno */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-white bg-black/60 px-6 py-2 text-xl font-bold tracking-widest uppercase">{cat.title}</h2>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
