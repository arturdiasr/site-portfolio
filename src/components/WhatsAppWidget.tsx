"use client";

import { useState, useEffect } from "react";

export default function WhatsAppWidget() {
  const [showBubble, setShowBubble] = useState(false);
  const whatsappLink = "https://wa.me/5561991071783?text=Ol%C3%A1%2C%20Artur!%20Gostaria%20de%20conversar%20sobre%20o%20seu%20trabalho%20de%20fotografia.";
  
  useEffect(() => {
    let showTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;

    const cycle = () => {
      // Mostra por 10 segundos
      setShowBubble(true);
      
      hideTimer = setTimeout(() => {
        // Esconde por 30 segundos
        setShowBubble(false);
        
        showTimer = setTimeout(() => {
          cycle(); // Reinicia o ciclo
        }, 30000);
      }, 10000);
    };

    // Delay inicial leve de 2.5s antes de começar o ciclo
    const initial = setTimeout(() => {
      cycle();
    }, 2500);

    return () => {
      clearTimeout(initial);
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <a 
      href={whatsappLink} 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 group flex items-end gap-3"
    >
      {/* Balão de Mensagem Limpo */}
      <div 
        className={`relative bg-white px-4 py-2 mb-14 md:mb-16 shadow-xl border border-gray-100 rounded-2xl transition-all duration-700 ease-out transform ${
          showBubble ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
        } group-hover:-translate-y-1`}
      >
        <p className="text-sm text-black font-semibold tracking-wide">
          Vamos conversar?
        </p>

        {/* Ponta do Balão desenhada com SVG apontando para a foto */}
        <svg 
          className="absolute -bottom-[13px] right-5 w-6 h-[14px] text-white" 
          viewBox="0 0 24 16" 
          fill="currentColor"
          style={{ filter: "drop-shadow(0px 3px 2px rgba(0,0,0,0.06))" }}
        >
          <path d="M0 0 L16 0 L24 16 C 16 12 8 6 0 0 Z" />
        </svg>
      </div>

      {/* Círculo com a Foto */}
      <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover:scale-110 relative z-10">
        <img 
          src="/artur_perfil.jpg" 
          alt="Artur Dias Fotografia" 
          className="w-full h-full object-cover object-[center_25%]"
        />
      </div>
    </a>
  );
}
