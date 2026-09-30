import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function CategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Puxa a categoria
  const catQuery = `*[_type == "category" && _id == $id][0] { title }`;
  const category = await client.fetch(catQuery, { id });

  if (!category) notFound();

  // Puxa todas as galerias/projetos que pertencem a esta categoria
  const subQuery = `*[_type == "gallery" && category._ref == $id] | order(_createdAt desc) {
    _id,
    title,
    coverImage
  }`;
  const subGalleries = await client.fetch(subQuery, { id });

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="pt-8 space-y-4 text-center">
        <Link href="/" className="text-gray-400 hover:text-black uppercase tracking-widest text-xs transition-colors mb-6 inline-block">
          &larr; Voltar às Categorias
        </Link>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase">{category.title}</h1>
      </div>

      {subGalleries.length === 0 ? (
        <p className="text-center text-gray-400 py-20 border border-dashed border-gray-200">
          Nenhuma galeria encontrada dentro de {category.title}. Volte no painel /studio e crie projetos vinculando-os a esta categoria!
        </p>
      ) : (
        <section className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 2xl:columns-5 gap-6 space-y-6">
          {subGalleries.map((gallery: any) => (
            <Link href={`/galeria/${gallery._id}`} key={gallery._id} className="group relative break-inside-avoid overflow-hidden bg-gray-50 cursor-pointer shadow-sm hover:shadow-xl transition-all block">
              {gallery.coverImage ? (
                <img 
                  src={urlForImage(gallery.coverImage).url()} 
                  alt={gallery.title}
                  className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              ) : (
                <div className="w-full aspect-[4/5] bg-gray-200 flex items-center justify-center">Sem foto</div>
              )}
              {/* Texto hover */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-white bg-black/60 px-6 py-2 text-xl font-bold tracking-widest uppercase">{gallery.title}</h2>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
