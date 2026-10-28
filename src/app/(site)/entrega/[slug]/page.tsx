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
    <div className="w-full pt-6 pb-24">
      <div className="text-center space-y-2 mb-12">
        <Link
          href="/"
          className="font-sans text-neutral-400 hover:text-black uppercase tracking-[0.25em] text-[11px] font-semibold transition-colors inline-block mb-1"
        >
          &larr; Voltar ao Portfólio
        </Link>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-neutral-950">
          {delivery.title}
        </h1>
        <p className="font-sans text-[11px] tracking-[0.28em] uppercase text-neutral-400 font-medium">
          Entrega das Fotografias Finais
        </p>
      </div>

      <DeliveryApp downloadUrl={delivery.externalUrl} />
    </div>
  );
}
