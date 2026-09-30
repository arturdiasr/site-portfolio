import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import LightboxGallery from "@/components/LightboxGallery";

export const revalidate = 0;

export default async function GalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const query = `*[_type == "gallery" && _id == $id][0] {
    title,
    "categoryId": category._ref,
    "categoryTitle": category->title,
    images
  }`;
  
  const gallery = await client.fetch(query, { id });

  if (!gallery) notFound();

  // Mapeia as imagens para o formato que o Lightbox espera
  const formattedImages = gallery.images?.map((img: any, index: number) => ({
    url: urlForImage(img).width(1600).url(),
    alt: img.caption || `${gallery.title} - Foto ${index + 1}`
  })) || [];

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="pt-8 space-y-4 text-center">
        {gallery.categoryId ? (
          <Link href={`/categoria/${gallery.categoryId}`} className="text-gray-400 hover:text-black uppercase tracking-widest text-xs transition-colors mb-6 inline-block">
            &larr; Voltar para {gallery.categoryTitle}
          </Link>
        ) : (
          <Link href="/" className="text-gray-400 hover:text-black uppercase tracking-widest text-xs transition-colors mb-6 inline-block">
            &larr; Voltar ao Portfólio
          </Link>
        )}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase">{gallery.title}</h1>
      </div>

      {formattedImages.length === 0 ? (
        <p className="text-center text-gray-400 py-20 border border-dashed border-gray-200">
          Nenhuma foto interna adicionada nesta galeria ainda.
        </p>
      ) : (
        <LightboxGallery images={formattedImages} />
      )}
    </div>
  );
}
