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
    coverImage,
    "images": images[] {
      "url": asset->url,
      "originalFilename": asset->originalFilename,
      "aspectRatio": asset->metadata.dimensions.aspectRatio
    }
  }`;

  const album = await client.fetch(query, { slug });

  if (!album) notFound();

  // Para garantir segurança, não renderizamos o Header completo do site na área logada (fica parecendo um app privativo)
  return (
    <div className="w-full pt-8">
      <div className="text-center space-y-4 mb-10">
        <Link href="/" className="text-gray-400 hover:text-black uppercase tracking-widest text-xs transition-colors inline-block">
          &larr; Voltar ao Portfólio
        </Link>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase">{album.title}</h1>
        <p className="text-xs tracking-widest uppercase text-gray-400">Área Exclusiva do Cliente</p>
      </div>

      {/* O componente Client lida com a Senha e com a Seleção */}
      <ClientGalleryApp album={album} />
    </div>
  );
}
