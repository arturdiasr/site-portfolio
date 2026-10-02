"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function AnimatedBackground() {
  const { scrollYProgress } = useScroll();
  
  // Efeito Parallax suave: o fundo vai escalar ligeiramente e descer um pouco conforme a rolagem
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "4%"]);

  return (
    <div className="fixed inset-0 -z-50 pointer-events-none bg-white overflow-hidden">
      <motion.div 
        className="absolute inset-[-5%] w-[110%] h-[110%]" 
        style={{ scale, y }}
      >
        {/* 1. Textura de papel amassado nova (High Res) */}
        <div 
          className="absolute inset-0 opacity-[0.28] mix-blend-multiply"
          style={{
            backgroundImage: `url('/paper-texture-high-res.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* 2. Textura de Ruído (Film Grain) aumentada para ser claramente perceptível */}
        <div 
          className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </motion.div>
    </div>
  );
}
