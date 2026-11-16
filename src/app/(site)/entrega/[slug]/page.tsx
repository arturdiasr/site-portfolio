import { client } from "@/sanity/lib/client";
import { imageThumb } from "@/sanity/lib/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import DeliveryApp from "@/components/DeliveryApp";

export const revalidate = 0;
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DeliveryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const delivery = await client.fetch(
    `*[_type == "delivery" && slug.current == $slug][0]{
      title,
      externalUrl,
      "cover": coalesce(coverImage, *[_type == "clientAlbum" && slug.current == $slug][0].coverImage)
    }`,
    { slug }
  );

  if (!delivery) notFound();

  const coverImageUrl = delivery.cover ? imageThumb(delivery.cover) : null;

  return (
    <div className="w-full pt-8 pb-20">
      <div className="text-center space-y-3 mb-10">
        <Link href="/" className="text-gray-400 hover:text-black uppercase tracking-widest text-xs transition-colors inline-block">
          &larr; Voltar ao Portfólio
        </Link>
        <div className="flex items-center justify-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-black" />
          <span className="text-[10px] tracking-[0.28em] uppercase font-bold text-neutral-500">
            Entrega Oficial em Alta Resolução
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase">{delivery.title}</h1>
      </div>

      <DeliveryApp
        title={delivery.title}
        downloadUrl={delivery.externalUrl}
        coverImageUrl={coverImageUrl}
      />
    </div>
  );
}
