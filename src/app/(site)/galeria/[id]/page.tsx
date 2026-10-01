import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import { notFound } from "next/navigation";
import LightboxGallery from "@/components/LightboxGallery";
import Link from "next/link";

export const revalidate = 0;

export default async function GaleriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const query = `*[_type == "gallery" && _id == $id][0] {
    title,
    category->{
      _id,
      title
    },
    images[] {
      ...,
      "aspectRatio": asset->metadata.dimensions.aspectRatio
    }
  }`;

  const gallery = await client.fetch(query, { id });

  if (!gallery) notFound();

  // Formata as imagens para passar pro componente Client
  const formattedImages = gallery.images?.map((img: any, index: number) => ({
    url: urlForImage(img).width(1600).url(),
    alt: img.caption || `${gallery.title} - Imagem ${index + 1}`,
    aspectRatio: img.aspectRatio
  })) || [];

  return (
    <div className="w-full space-y-20 pb-20">
      <div className="pt-8 space-y-4 text-center">
        {gallery.category && (
          <Link href={`/categoria/${gallery.category._id}`} className="text-gray-400 hover:text-black uppercase tracking-widest text-xs transition-colors mb-6 inline-block">
            &larr; Voltar para {gallery.category.title}
          </Link>
        )}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase">{gallery.title}</h1>
      </div>

      {formattedImages.length === 0 ? (
        <p className="text-center text-gray-400 py-20 border border-dashed border-gray-200">
          Nenhuma foto adicionada nesta galeria ainda.
        </p>
      ) : (
        <LightboxGallery images={formattedImages} />
      )}
    </div>
  );
}
