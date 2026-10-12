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
    <header className="w-full flex flex-col items-center pt-12 pb-6 px-8 relative z-50">
      {/* Logo Centralizada */}
      <RevealFade delay={0.1}>
        <Link href="/" className="text-4xl font-extrabold tracking-tighter uppercase mb-8 hover:text-gray-700 transition-colors mix-blend-multiply text-black/90 inline-block">
          Artur Dias
        </Link>
      </RevealFade>
      
      {/* Menu Centralizado com Indicador Ativo e Microinterações */}
      <RevealNav delay={0.3}>
        <HeaderNav categories={categories} videoCount={videoCount} />
      </RevealNav>
    </header>
  );
}
