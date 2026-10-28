import Image from "next/image";

export default function SobrePage() {
  return (
    <div className="w-full pb-24">
      <div className="pt-8 space-y-2 text-center mb-16">
        <span className="font-sans text-[11px] tracking-[0.3em] uppercase text-neutral-400 font-semibold block">
          A pessoa por trás da lente
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-neutral-950">
          Sobre & Contato
        </h1>
      </div>

      {/* Container com largura máxima menor para aproximar a foto do texto */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-start">
        {/* Foto */}
        <div className="relative aspect-[4/5] w-full max-w-sm mx-auto md:ml-auto md:mr-0 overflow-hidden shadow-2xl bg-neutral-100">
          <Image
            src="/artur_perfil.jpg"
            alt="Artur Dias"
            fill
            sizes="(max-width: 768px) 90vw, 400px"
            className="object-cover"
          />
        </div>

        {/* Texto e Contato */}
        <div className="text-neutral-700 leading-relaxed space-y-5 mx-auto md:mx-0 text-justify md:text-left max-w-lg text-base">
          <p>
            Nascido em 1993 em Unaí-MG, moro em Brasília desde os 3 anos de idade. Formado em Comunicação Social - Publicidade e Propaganda pela Universidade de Brasília e fotógrafo profissional desde 2013.
          </p>
          <p>
            Sou uma pessoa apaixonada por música e arte. Comecei a trabalhar com fotografia de shows em 2014 e, desde então, não parei. Esta é a área fotográfica onde me sinto em casa, no meio do público, tentando capturar uma imagem que possa guardar para a vida.
          </p>
          <p>
            A fotografia me proporcionou experiências incríveis, momentos de admiração diante dos meus grandes ídolos musicais, me proporcionou trocas com pessoas que, de outra forma, não teria conhecido, e me deu um olhar atento e desperto para a vida.
          </p>
          <p>
            Na fotografia, me encontrei; consegui transmitir um pouco da minha perspectiva sobre o mundo para as pessoas ao meu redor. Hoje, digo com tranquilidade que estou onde devo estar, fazendo o que amo de todo o coração.
          </p>
          <blockquote className="font-serif italic text-xl text-neutral-900 border-l-2 border-black pl-4 py-1 my-6">
            Atualmente fotografando Shows, Bandas, Arquitetura, Eventos Sociais e Institucionais, Retratos, Natureza e Fotografia de Viagens.
          </blockquote>

          {/* Seção de Contato incorporada */}
          <div className="mt-12 pt-8 border-t border-neutral-200">
            <span className="font-sans text-[10px] uppercase tracking-[0.28em] text-neutral-400 font-semibold block mb-1">
              Canais Diretos
            </span>
            <h2 className="font-serif text-3xl font-normal tracking-tight text-neutral-950 mb-6">
              Orçamentos e Contato
            </h2>
            <div className="space-y-4 text-sm text-neutral-800">
              <p className="flex items-center gap-4">
                <strong className="uppercase tracking-[0.22em] text-[11px] text-neutral-400 w-24 shrink-0">Email</strong>
                <a href="mailto:arturdiasr@gmail.com" className="hover:text-black transition-colors font-medium">
                  arturdiasr@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-4">
                <strong className="uppercase tracking-[0.22em] text-[11px] text-neutral-400 w-24 shrink-0">WhatsApp</strong>
                <a href="https://wa.me/5561991071783" className="hover:text-black transition-colors font-medium" target="_blank" rel="noopener noreferrer">
                  (61) 99107-1783
                </a>
              </p>
              <p className="flex items-center gap-4">
                <strong className="uppercase tracking-[0.22em] text-[11px] text-neutral-400 w-24 shrink-0">Instagram</strong>
                <a href="https://www.instagram.com/arturdias/" className="hover:text-black transition-colors font-medium" target="_blank" rel="noopener noreferrer">
                  @arturdias
                </a>
              </p>
            </div>

            <a
              href="https://wa.me/5561991071783"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-8 bg-black text-white px-8 py-4 uppercase tracking-[0.22em] text-xs font-bold hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-300 w-full text-center md:w-auto"
            >
              Chamar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
