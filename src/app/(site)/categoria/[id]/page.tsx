import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import LightboxGallery from "@/components/LightboxGallery";

export const revalidate = 0;

export default async function CategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Puxa a categoria e suas fotos soltas
  const catQuery = `*[_type == "category" && _id == $id][0] { 
    title,
    images
  }`;
  const category = await client.fetch(catQuery, { id });

  if (!category) notFound();

  // Puxa as sub-galerias ordenadas pelo mais recente no topo
  const subQuery = `*[_type == "gallery" && category._ref == $id] | order(_createdAt desc) {
    _id,
    title,
    "coverImage": coalesce(images[isCover == true][0], coverImage)
  }`;
  const subGalleries = await client.fetch(subQuery, { id });

  // Fotos soltas no formato pro Lightbox
  const looseImages = category.images?.map((img: any, index: number) => ({
    url: urlForImage(img).width(1600).url(),
    alt: img.caption || `${category.title} - Foto solta ${index + 1}`
  })) || [];

  return (
    <div className="w-full space-y-20 pb-20">
      <div className="pt-8 space-y-4 text-center">
        <Link href="/" className="text-gray-400 hover:text-black uppercase tracking-widest text-xs transition-colors mb-6 inline-block">
          &larr; Voltar às Categorias
        </Link>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase">{category.title}</h1>
      </div>

      {subGalleries.length === 0 && looseImages.length === 0 ? (
        <p className="text-center text-gray-400 py-20 border border-dashed border-gray-200">
          Nenhuma foto ou galeria encontrada nesta categoria.
        </p>
      ) : (
        <div className="space-y-24">
          
          {/* Sub-galerias primeiro (Recentes no topo) */}
          {subGalleries.length > 0 && (
            <section className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 2xl:columns-5 gap-6">
              {subGalleries.map((gallery: any) => (
                <Link href={`/galeria/${gallery._id}`} key={gallery._id} className="group relative break-inside-avoid mb-6 w-full block overflow-hidden bg-gray-50 cursor-pointer shadow-sm hover:shadow-xl transition-all">
                  {gallery.coverImage ? (
                    <img 
                      src={urlForImage(gallery.coverImage).url()} 
                      alt={gallery.title}
                      className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full aspect-[4/5] bg-gray-200 flex items-center justify-center">Sem foto de capa</div>
                  )}
                  {/* Texto hover estilo Branco/Preto */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center pointer-events-none">
                    <div className="text-center w-full px-4">
                      <h2 className="text-black bg-white/95 px-6 py-3 text-xl font-bold tracking-widest uppercase shadow-xl inline-block">{gallery.title}</h2>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          )}

          {/* Fotos Soltas da Categoria usando Lightbox */}
          {looseImages.length > 0 && (
            <div>
              {subGalleries.length > 0 && <h2 className="text-2xl font-bold uppercase tracking-widest text-center mb-10">Outros Trabalhos</h2>}
              <LightboxGallery images={looseImages} />
            </div>
          )}

        </div>
      )}
    </div>
  );
}
