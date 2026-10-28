'use client';

import { useState, useEffect } from 'react';
import { Link } from 'next-view-transitions';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderNavProps {
  categories: Array<{ _id: string; title: string }>;
  videoCount: number;
}

export default function HeaderNav({ categories, videoCount }: HeaderNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPortfolioActive =
    pathname === '/' ||
    pathname.startsWith('/categoria') ||
    pathname === '/videos' ||
    pathname.startsWith('/galeria');

  const isAboutActive = pathname === '/sobre';
  const isClientActive = pathname.startsWith('/cliente') || pathname.startsWith('/entrega');

  // Fecha a gaveta mobile ao trocar de rota
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Bloqueia o scroll do body quando o menu fullscreen está aberto
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      {/* NAVEGAÇÃO DESKTOP */}
      <div className="hidden md:flex items-center space-x-6 sm:space-x-8 text-xs sm:text-sm uppercase tracking-widest font-semibold mix-blend-multiply text-black/90">
        {/* Dropdown de Portfólio */}
        <div className="relative group py-2">
          <Link
            href="/"
            className={`relative py-1 transition-colors duration-200 cursor-pointer block ${
              isPortfolioActive ? 'text-black' : 'text-black/60 hover:text-black'
            }`}
          >
            Portfólio
            {isPortfolioActive && (
              <motion.span
                layoutId="header-active-line"
                className="absolute -bottom-1 left-0 right-0 h-[2px] bg-black rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </Link>

          {/* Submenu visível ao passar o mouse */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-56 bg-white/95 backdrop-blur-md border border-gray-100 shadow-[0_12px_36px_rgb(0,0,0,0.12)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 flex flex-col py-2 rounded-sm">
            {categories.map((cat) => {
              const isCatActive = pathname === `/categoria/${cat._id}`;
              return (
                <Link
                  key={cat._id}
                  href={`/categoria/${cat._id}`}
                  className={`px-6 py-2.5 text-xs transition-colors text-center flex items-center justify-center gap-1.5 ${
                    isCatActive
                      ? 'bg-gray-100/80 text-black font-bold'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  {isCatActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-black inline-block animate-pulse" />
                  )}
                  {cat.title}
                </Link>
              );
            })}
            {videoCount > 0 && (
              <Link
                href="/videos"
                className={`px-6 py-2.5 text-xs transition-colors text-center flex items-center justify-center gap-1.5 ${
                  pathname === '/videos'
                    ? 'bg-gray-100/80 text-black font-bold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                }`}
              >
                {pathname === '/videos' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-black inline-block animate-pulse" />
                )}
                VÍDEOS
              </Link>
            )}
          </div>
        </div>

        {/* Sobre & Contato */}
        <div className="relative py-2">
          <Link
            href="/sobre"
            className={`relative py-1 transition-colors duration-200 block ${
              isAboutActive ? 'text-black' : 'text-black/60 hover:text-black'
            }`}
          >
            Sobre & Contato
            {isAboutActive && (
              <motion.span
                layoutId="header-active-line"
                className="absolute -bottom-1 left-0 right-0 h-[2px] bg-black rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        </div>

        {/* Área do Cliente */}
        <div className="relative py-2">
          <Link
            href="/cliente"
            className={`relative py-1 transition-colors duration-200 block ${
              isClientActive ? 'text-black' : 'text-black/60 hover:text-black'
            }`}
          >
            Área do Cliente
            {isClientActive && (
              <motion.span
                layoutId="header-active-line"
                className="absolute -bottom-1 left-0 right-0 h-[2px] bg-black rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        </div>

        {/* Ícone Instagram */}
        <div className="relative py-2">
          <Link
            href="https://www.instagram.com/arturdias/"
            target="_blank"
            rel="noopener noreferrer"
            className="py-1 text-black/60 hover:text-black hover:scale-110 transition-all duration-200 flex items-center"
            aria-label="Instagram"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* BARRA DE NAVEGAÇÃO MOBILE + BOTÃO GAVETA FULLSCREEN */}
      <div className="flex md:hidden items-center justify-center gap-5 text-xs uppercase tracking-widest font-semibold text-black/90">
        <Link
          href="/"
          className={`py-1.5 transition-colors ${isPortfolioActive ? 'text-black border-b-2 border-black' : 'text-black/60'}`}
        >
          Portfólio
        </Link>
        <Link
          href="/sobre"
          className={`py-1.5 transition-colors ${isAboutActive ? 'text-black border-b-2 border-black' : 'text-black/60'}`}
        >
          Sobre
        </Link>
        <Link
          href="/cliente"
          className={`py-1.5 transition-colors ${isClientActive ? 'text-black border-b-2 border-black' : 'text-black/60'}`}
        >
          Cliente
        </Link>

        {/* Botão Minimalista de Abertura da Gaveta Fullscreen (Categorias & Contato) */}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-3.5 py-2 text-[10px] uppercase tracking-widest font-bold rounded-xs shadow-sm active:scale-95 transition-transform cursor-pointer"
          aria-label="Abrir Menu de Categorias"
        >
          <span>Menu</span>
          <div className="w-3.5 flex flex-col gap-1">
            <span className="block h-[1.5px] w-full bg-white" />
            <span className="block h-[1.5px] w-2.5 bg-white ml-auto" />
          </div>
        </button>
      </div>

      {/* GAVETA FULLSCREEN MOBILE (CURTAIN MENU) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[120] bg-white/[0.98] backdrop-blur-xl flex flex-col justify-between p-8 overflow-y-auto md:hidden"
          >
            {/* Topo da Gaveta */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-5">
              <span className="text-lg font-extrabold uppercase tracking-tighter text-black">
                Artur Dias
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-neutral-600 hover:text-black py-2 px-3 border border-neutral-200 rounded-xs cursor-pointer"
                aria-label="Fechar Menu"
              >
                <span>Fechar</span>
                <span className="text-base leading-none">&times;</span>
              </button>
            </div>

            {/* Links Principais */}
            <div className="my-auto py-8 space-y-8">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-4">
                  Navegação
                </p>
                <nav className="flex flex-col space-y-5">
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="text-2xl font-extrabold uppercase tracking-tighter text-neutral-900 hover:text-neutral-600 transition-colors"
                  >
                    Portfólio Principal
                  </Link>

                  {/* Sub-lista de Categorias */}
                  {categories.length > 0 && (
                    <div className="pl-4 py-1 flex flex-col space-y-2.5 border-l-2 border-neutral-200">
                      {categories.map((c, idx) => (
                        <Link
                          key={c._id}
                          href={`/categoria/${c._id}`}
                          onClick={() => setMobileOpen(false)}
                          className={`text-xs uppercase tracking-widest flex items-center gap-2 transition-colors ${
                            pathname === `/categoria/${c._id}`
                              ? 'text-black font-bold'
                              : 'text-neutral-500 hover:text-black font-medium'
                          }`}
                        >
                          <span className="text-[10px] text-neutral-300 font-bold">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          {c.title}
                        </Link>
                      ))}
                      {videoCount > 0 && (
                        <Link
                          href="/videos"
                          onClick={() => setMobileOpen(false)}
                          className={`text-xs uppercase tracking-widest flex items-center gap-2 transition-colors ${
                            pathname === '/videos'
                              ? 'text-black font-bold'
                              : 'text-neutral-500 hover:text-black font-medium'
                          }`}
                        >
                          <span className="text-[10px] text-neutral-300 font-bold">
                            {String(categories.length + 1).padStart(2, '0')}
                          </span>
                          Vídeos
                        </Link>
                      )}
                    </div>
                  )}

                  <Link
                    href="/sobre"
                    onClick={() => setMobileOpen(false)}
                    className="text-2xl font-extrabold uppercase tracking-tighter text-neutral-900 hover:text-neutral-600 transition-colors pt-1"
                  >
                    Sobre & Contato
                  </Link>

                  <Link
                    href="/cliente"
                    onClick={() => setMobileOpen(false)}
                    className="text-2xl font-extrabold uppercase tracking-tighter text-neutral-900 hover:text-neutral-600 transition-colors"
                  >
                    Área do Cliente
                  </Link>
                </nav>
              </div>
            </div>

            {/* Rodapé da Gaveta com Contato Direto */}
            <div className="pt-6 border-t border-neutral-100 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                <span className="uppercase tracking-widest text-[10px] font-bold">Brasília • DF</span>
                <a
                  href="https://www.instagram.com/arturdias/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="uppercase tracking-widest text-[10px] font-bold text-black hover:underline"
                >
                  Instagram @arturdias &rarr;
                </a>
              </div>
              <a
                href="https://wa.me/5561991071783?text=Ol%C3%A1%2C%20Artur!%20Gostaria%20de%20conversar%20sobre%20o%20seu%20trabalho%20de%20fotografia."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white text-center py-4 text-xs uppercase tracking-widest font-bold shadow-lg"
              >
                Solicitar Orçamento no WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
