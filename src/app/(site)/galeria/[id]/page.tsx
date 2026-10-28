import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import { notFound } from "next/navigation";
import LightboxGallery from "@/components/LightboxGallery";
import { Link } from "next-view-transitions";

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

  const formattedImages = gallery.images?.map((img: any, index: number) => ({
    url: urlForImage(img).width(1600).url(),
    alt: img.caption || `${gallery.title} - Imagem ${index + 1}`,
    aspectRatio: img.aspectRatio
  })) || [];

  return (
    <div className="w-full space-y-14 pb-20">
      <div className="pt-4 space-y-3 text-center">
        {gallery.category && (
          <Link
            href={`/categoria/${gallery.category._id}`}
            className="font-sans text-neutral-400 hover:text-black uppercase tracking-[0.25em] text-[11px] font-semibold transition-colors mb-2 inline-block"
          >
            &larr; Voltar para {gallery.category.title}
          </Link>
        )}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-neutral-950">
          {gallery.title}
        </h1>
        {formattedImages.length > 0 && (
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
            {formattedImages.length} {formattedImages.length === 1 ? 'Fotografia' : 'Fotografias'}
          </p>
        )}
      </div>

      {formattedImages.length === 0 ? (
        <p className="text-center text-neutral-400 py-20 border border-dashed border-neutral-200">
          Nenhuma foto adicionada nesta galeria ainda.
        </p>
      ) : (
        <LightboxGallery images={formattedImages} />
      )}
    </div>
  );
}
