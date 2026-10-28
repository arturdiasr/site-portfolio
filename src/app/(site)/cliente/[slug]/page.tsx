import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import ClientGalleryApp from "@/components/ClientGalleryApp";
import Link from "next/link";

export const revalidate = 0;

export default async function ClientAlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const query = `*[_type == "clientAlbum" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    password,
    requireEmail,
    coverImage,
    "images": images[] {
      "url": asset->url,
      "originalFilename": asset->originalFilename,
      "aspectRatio": asset->metadata.dimensions.aspectRatio
    }
  }`;

  const album = await client.fetch(query, { slug });

  if (!album) notFound();

  return (
    <div className="w-full pt-6">
      <div className="text-center space-y-2 mb-12">
        <Link
          href="/"
          className="font-sans text-neutral-400 hover:text-black uppercase tracking-[0.25em] text-[11px] font-semibold transition-colors inline-block mb-1"
        >
          &larr; Voltar ao Portfólio
        </Link>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-neutral-950">
          {album.title}
        </h1>
        <p className="font-sans text-[11px] tracking-[0.28em] uppercase text-neutral-400 font-medium">
          Área Exclusiva de Seleção do Cliente
        </p>
      </div>

      {/* O componente Client lida com a Senha e com a Seleção */}
      <ClientGalleryApp album={album} />
    </div>
  );
}
