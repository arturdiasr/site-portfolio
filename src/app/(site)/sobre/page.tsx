import Image from "next/image";

export default function SobrePage() {
  return (
    <div className="w-full pb-20">
      <div className="pt-8 space-y-4 text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase">Sobre & Contato</h1>
        <p className="text-gray-500 tracking-widest uppercase text-sm">A pessoa por trás da lente</p>
      </div>
      
      {/* Container com largura máxima menor para aproximar a foto do texto */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* Foto */}
        <div className="relative aspect-[4/5] w-full max-w-sm mx-auto md:ml-auto md:mr-0 overflow-hidden shadow-2xl">
          <Image 
            src="/artur_perfil.jpg" 
            alt="Artur Dias" 
            fill 
            className="object-cover"
          />
        </div>

        {/* Texto e Contato */}
        <div className="prose prose-lg text-gray-700 leading-relaxed space-y-6 mx-auto md:mx-0 text-justify md:text-left max-w-lg">
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
          <p className="font-semibold italic text-black">
            Atualmente fotografando Shows, Bandas, Arquitetura, Eventos Sociais e Institucionais, Retratos, Natureza e Fotografia de Viagens.
          </p>

          {/* Seção de Contato incorporada */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-black mb-6">Orçamentos e Contato</h2>
            <div className="space-y-4 text-base text-gray-800">
              <p className="flex items-center gap-3">
                <strong className="uppercase tracking-widest text-xs text-gray-400">Email</strong> 
                <a href="mailto:arturdiasr@gmail.com" className="hover:text-black transition-colors">arturdiasr@gmail.com</a>
              </p>
              <p className="flex items-center gap-3">
                <strong className="uppercase tracking-widest text-xs text-gray-400">WhatsApp</strong> 
                <a href="https://wa.me/5561991071783" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">(61) 99107-1783</a>
              </p>
              <p className="flex items-center gap-3">
                <strong className="uppercase tracking-widest text-xs text-gray-400">Instagram</strong> 
                <a href="https://www.instagram.com/arturdias/" className="hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">@arturdias</a>
              </p>
            </div>
            
            <a href="https://wa.me/5561991071783" target="_blank" rel="noopener noreferrer" className="inline-block mt-8 bg-black text-white px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl w-full text-center md:w-auto">
              Chamar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
