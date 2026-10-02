"use client";

import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-[#fafafa]">
      {/* 1. Formas com desfoque super suave (Soft blurred shapes) */}
      
      {/* Forma 1: Âmbar muito pálido, para um aquecimento sutil */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-amber-50/60 mix-blend-multiply blur-[120px]"
        animate={{
          x: ["0%", "15%", "0%"],
          y: ["0%", "20%", "0%"],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Forma 2: Azul cinza claro, traz equilíbrio e neutralidade */}
      <motion.div
        className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-slate-100/70 mix-blend-multiply blur-[140px]"
        animate={{
          x: ["0%", "-15%", "0%"],
          y: ["0%", "-10%", "0%"],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Forma 3: Muito sutil no centro */}
      <motion.div
        className="absolute top-[20%] left-[30%] w-[50vw] h-[50vw] rounded-full bg-orange-50/30 mix-blend-multiply blur-[100px]"
        animate={{
          x: ["0%", "10%", "0%"],
          y: ["0%", "-15%", "0%"],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 2. Textura de Ruído (Film Grain) super leve */}
      {/* Opacidade de 3% a 4% é o ideal para fotografias, não polui a imagem mas tira o aspecto digital do branco puro */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
