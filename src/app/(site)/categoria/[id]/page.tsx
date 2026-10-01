import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import LightboxGallery from "@/components/LightboxGallery";

export const revalidate = 0;

export default async function CategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const catQuery = `*[_type == "category" && _id == $id][0] { 
    title,
    images
  }`;
  const category = await client.fetch(catQuery, { id });

  if (!category) notFound();

  const subQuery = `*[_type == "gallery" && category._ref == $id] | order(_createdAt desc) {
    _id,
    title,
    "coverImage": coalesce(images[isCover == true][0], coverImage)
  }`;
  const subGalleries = await client.fetch(subQuery, { id });

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
          
          {subGalleries.length > 0 && (
            <section className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 2xl:columns-5 gap-6">
              {subGalleries.map((gallery: any) => (
                <Link href={`/galeria/${gallery._id}`} key={gallery._id} className="group break-inside-avoid mb-6 w-full block cursor-pointer transition-all">
                  <div className="relative overflow-hidden bg-gray-50 shadow-sm group-hover:shadow-xl transition-shadow duration-500">
                    {gallery.coverImage ? (
                      <img 
                        src={urlForImage(gallery.coverImage).url()} 
                        alt={gallery.title}
                        className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full aspect-[4/5] bg-gray-200 flex items-center justify-center text-xs text-gray-400">Sem foto de capa</div>
                    )}
                    
                    {/* Faixa Translúcida no Canto Superior Esquerdo */}
                    <div className="absolute top-6 left-0 bg-white/80 backdrop-blur-md text-black px-6 py-2.5 text-xs font-bold tracking-widest uppercase shadow-md group-hover:bg-white group-hover:pl-8 transition-all duration-300">
                      {gallery.title}
                    </div>
                    
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 pointer-events-none" />
                  </div>
                </Link>
              ))}
            </section>
          )}

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
