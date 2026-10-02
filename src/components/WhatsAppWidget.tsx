"use client";

import { useState, useEffect } from "react";

export default function WhatsAppWidget() {
  const [showBubble, setShowBubble] = useState(false);
  const whatsappLink = "https://wa.me/5561991071783?text=Ol%C3%A1%2C%20Artur!%20Gostaria%20de%20conversar%20sobre%20o%20seu%20trabalho%20de%20fotografia.";
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBubble(true);
    }, 2500);
    return () => clearTimeout(timer);
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
        className={`bg-white px-5 py-4 shadow-xl border border-gray-100 transition-all duration-700 ease-out transform ${
          showBubble ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
        } group-hover:-translate-y-1`}
        style={{ borderRadius: "20px 20px 0px 20px" }}
      >
        <p className="text-sm text-black font-semibold tracking-wide">
          Vamos conversar?
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Me chame no WhatsApp
        </p>
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
