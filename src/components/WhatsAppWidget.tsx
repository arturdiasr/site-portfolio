"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function WhatsAppWidget() {
  const [showBubble, setShowBubble] = useState(false);
  const whatsappLink = "https://wa.me/5561991071783?text=Ol%C3%A1%2C%20Artur!%20Gostaria%20de%20conversar%20sobre%20o%20seu%20trabalho%20de%20fotografia.";
  
  useEffect(() => {
    // Mostra o balão de conversa 2.5 segundos após o carregamento da página
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
      {/* Balão de Mensagem (AnimatePresence para animar entrada e saída, se necessário) */}
      <AnimatePresence>
        {showBubble && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, x: 20, y: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="origin-bottom-right bg-white/80 backdrop-blur-md px-5 py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
          >
            <p className="text-sm text-black font-semibold tracking-wide">
              Vamos conversar?
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Me chame no WhatsApp
            </p>
          </motion.div>
        )}
      </AnimatePresence>

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
