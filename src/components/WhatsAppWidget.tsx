"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 group flex items-center gap-4"
    >
      {/* Balão de Mensagem */}
      <AnimatePresence>
        {showBubble && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 14, mass: 0.8 }}
            className="relative bg-white/90 backdrop-blur-md px-5 py-4 rounded-2xl shadow-xl border border-white/50 origin-right transition-transform duration-500 group-hover:-translate-y-1"
          >
            <p className="text-sm text-black font-semibold tracking-wide">
              Vamos conversar?
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Me chame no WhatsApp
            </p>
            
            {/* Perninha do balão apontando para a foto */}
            <div className="absolute top-1/2 -right-[6px] -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-white/90 drop-shadow-sm" />
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
