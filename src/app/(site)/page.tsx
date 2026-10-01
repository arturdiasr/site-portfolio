import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import Link from "next/link";

export const revalidate = 0;

export default async function Portfolio() {
  // Busca Categorias ordenadas pelo novo campo numérico "order"
  // Também resolve a capa: se alguma foto dentro de images estiver marcada como capa (isCover == true), usa ela, senão cai pro coverImage tradicional
  const query = `*[_type == "category"] | order(order asc, _createdAt asc) {
    _id,
    title,
    "coverImage": coalesce(images[isCover == true][0], coverImage)
  }`;
  
  const categories = await client.fetch(query);

  return (
    <div className="w-full">
      {categories.length === 0 ? (
        <p className="text-center text-gray-500 py-20">Nenhuma categoria encontrada. Crie categorias no Painel /studio e adicione uma foto de capa.</p>
      ) : (
        // Masonry Grid sem space-y para não quebrar o espaçamento nativo do columns
        <section className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 2xl:columns-5 gap-6">
          {categories.map((cat: any) => (
            <Link href={`/categoria/${cat._id}`} key={cat._id} className="group relative break-inside-avoid mb-6 w-full block overflow-hidden bg-gray-50 cursor-pointer shadow-sm hover:shadow-xl transition-all">
              {cat.coverImage ? (
                <img 
                  src={urlForImage(cat.coverImage).url()} 
                  alt={cat.title}
                  className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              ) : (
                <div className="w-full aspect-[4/5] bg-gray-200 flex items-center justify-center">Sem foto de capa</div>
              )}
              {/* Texto hover (Fundo Branco, Texto Preto para melhor visibilidade) */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center pointer-events-none">
                <div className="text-center w-full px-4">
                  <h2 className="text-black bg-white/95 px-6 py-3 text-xl font-bold tracking-widest uppercase shadow-xl inline-block">{cat.title}</h2>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
