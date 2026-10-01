'use client';

import { useEffect, useState } from 'react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Aparece após o usuário rolar 400px para baixo
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      // Posicionado perfeitamente centralizado logo acima da foto do WhatsApp
      className={`fixed bottom-[90px] right-[28px] md:bottom-[110px] md:right-[40px] z-40 bg-black text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-700 hover:bg-gray-800 hover:scale-110 focus:outline-none group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
      }`}
    >
      {/* Ícone de seta com animação suave de sobe-e-desce contínua para chamar a atenção */}
      <svg
        className="w-5 h-5 animate-bounce group-hover:animate-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}
