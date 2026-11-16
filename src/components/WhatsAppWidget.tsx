"use client";

import { useState, useEffect } from "react";

export default function WhatsAppWidget() {
  const [showBubble, setShowBubble] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const whatsappLink = "https://wa.me/5561991071783?text=Ol%C3%A1%2C%20Artur!%20Gostaria%20de%20conversar%20sobre%20o%20seu%20trabalho%20de%20fotografia.";
  
  useEffect(() => {
    // Exibe uma única boas-vindas discreta após 5s por 7s, sem loop repetitivo que distraia a leitura das fotos
    const showTimer = setTimeout(() => {
      setShowBubble(true);
    }, 5000);

    const hideTimer = setTimeout(() => {
      setShowBubble(false);
    }, 12000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const visible = showBubble || isHovered;

  return (
    <a 
      href={whatsappLink} 
      target="_blank" 
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 group flex items-end gap-2"
    >
      {/* Balão de Mensagem Limpo */}
      <div 
        className={`relative bg-white/95 backdrop-blur-md px-4 py-2 mb-6 md:mb-8 shadow-lg border border-black/5 rounded-2xl transition-all duration-500 ease-out transform ${
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 pointer-events-none"
        }`}
      >
        <p className="text-xs text-black font-bold uppercase tracking-widest whitespace-nowrap">
          Vamos conversar?
        </p>

        {/* Ponta do Balão desenhada com SVG apontando para a foto */}
        <svg 
          className="absolute -bottom-[13px] right-5 w-6 h-[14px] text-white/95" 
          viewBox="0 0 24 16" 
          fill="currentColor"
          style={{ filter: "drop-shadow(0px 3px 2px rgba(0,0,0,0.04))" }}
        >
          <path d="M0 0 L16 0 L24 16 C 16 12 8 6 0 0 Z" />
        </svg>
      </div>

      {/* Círculo com a Foto */}
      <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-full border-2 border-white shadow-lg overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover:scale-105 relative z-10">
        <img 
          src="/artur_perfil.jpg" 
          alt="Artur Dias Fotografia" 
          className="w-full h-full object-cover object-[center_25%]"
        />
      </div>
    </a>
  );
}
