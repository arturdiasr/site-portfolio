import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import DeliveryApp from "@/components/DeliveryApp";

export const revalidate = 0;
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DeliveryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const delivery = await client.fetch(
    `*[_type == "delivery" && slug.current == $slug][0]{ title, externalUrl }`,
    { slug }
  );

  if (!delivery) notFound();

  return (
    <div className="w-full pt-8 pb-20">
      <div className="text-center space-y-4 mb-10">
        <Link href="/" className="text-gray-400 hover:text-black uppercase tracking-widest text-xs transition-colors inline-block">
          &larr; Voltar ao Portfólio
        </Link>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase">{delivery.title}</h1>
        <p className="text-xs tracking-widest uppercase text-gray-400">Entrega das Fotos Finais</p>
      </div>

      <DeliveryApp
        downloadUrl={delivery.externalUrl}
      />
    </div>
  );
}
