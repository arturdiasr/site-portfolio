import { Link } from 'next-view-transitions';
import { client } from "@/sanity/lib/client";
import { RevealFade, RevealNav } from "./HeaderAnimations";
import HeaderNav from "./HeaderNav";

export default async function Header() {
  const query = `*[_type == "category"] | order(order asc, _createdAt asc) { _id, title }`;
  const categories = await client.fetch(query);

  const videoQuery = `count(*[_type == "featuredVideo"])`;
  const videoCount = await client.fetch(videoQuery);

  return (
    <header className="w-full flex flex-col items-center pt-10 md:pt-12 pb-6 px-6 md:px-8 relative z-50">
      {/* Logo Centralizada com Assinatura Editorial */}
      <RevealFade delay={0.1}>
        <Link
          href="/"
          className="group flex flex-col items-center mb-6 md:mb-8 text-black/90 hover:text-black transition-colors"
        >
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase">
            Artur Dias
          </span>
          <span className="font-serif italic text-xs sm:text-sm tracking-[0.2em] text-neutral-500 group-hover:text-neutral-800 transition-colors -mt-1">
            Fotografia Autoral
          </span>
        </Link>
      </RevealFade>

      {/* Menu Centralizado com Indicador Ativo e Gaveta Mobile Fullscreen */}
      <RevealNav delay={0.3}>
        <HeaderNav categories={categories} videoCount={videoCount} />
      </RevealNav>
    </header>
  );
}
