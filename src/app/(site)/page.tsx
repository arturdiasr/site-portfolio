import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import Link from "next/link";

export const revalidate = 0;

export default async function Portfolio() {
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
        <section className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 2xl:columns-5 gap-6">
          {categories.map((cat: any) => (
            <Link href={`/categoria/${cat._id}`} key={cat._id} className="group break-inside-avoid mb-10 w-full block cursor-pointer transition-all">
              
              {/* Título Fixo Acima da Foto */}
              <h2 className="text-sm font-bold tracking-widest uppercase text-gray-900 mb-3 text-center group-hover:text-gray-400 transition-colors">
                {cat.title}
              </h2>

              <div className="relative overflow-hidden bg-gray-50 shadow-sm group-hover:shadow-xl transition-shadow duration-500">
                {cat.coverImage ? (
                  <img 
                    src={urlForImage(cat.coverImage).url()} 
                    alt={cat.title}
                    className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full aspect-[4/5] bg-gray-200 flex items-center justify-center text-xs text-gray-400">Sem foto de capa</div>
                )}
                
                {/* Filtro sutil ao passar o mouse para destacar o clique */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 pointer-events-none" />
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
