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
    `*[_type == "delivery" && slug.current == $slug][0]{ title, externalUrl, validityDays, _createdAt }`,
    { slug }
  );

  if (!delivery) notFound();

  const days = 14; // validade fixa (dias) a partir da criação da entrega
  const expiresAt = new Date(new Date(delivery._createdAt).getTime() + days * 24 * 60 * 60 * 1000);
  const expired = expiresAt.getTime() < Date.now();
  const daysLeft = Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));

  return (
    <div className="w-full pt-8 pb-20">
      <div className="text-center space-y-4 mb-10">
        <Link href="/" className="text-gray-400 hover:text-black uppercase tracking-widest text-xs transition-colors inline-block">
          &larr; Voltar ao Portfólio
        </Link>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase">{delivery.title}</h1>
        <p className="text-xs tracking-widest uppercase text-gray-400">Entrega das Fotos Finais</p>
      </div>

      {/* O link externo só é enviado ao navegador enquanto a entrega não expirou */}
      <DeliveryApp
        expired={expired}
        daysLeft={daysLeft}
        downloadUrl={expired ? null : delivery.externalUrl}
      />
    </div>
  );
}
