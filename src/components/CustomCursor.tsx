'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Apenas desktop
    if (window.innerWidth < 768) return;

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
      
      const target = e.target as HTMLElement;
      
      // Busca se o elemento atual ou algum pai tem data-cursor
      const cursorElement = target.closest('[data-cursor]');
      
      if (cursorElement) {
        setIsHovering(true);
        setCursorText(cursorElement.getAttribute('data-cursor') || 'VER');
      } else {
        setIsHovering(false);
        setCursorText('');
      }
    };

    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isVisible]);

  if (typeof window !== 'undefined' && window.innerWidth < 768) return null;
  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center rounded-full text-white font-bold text-xs tracking-widest mix-blend-difference"
      animate={{
        x: position.x - (isHovering ? 40 : 10),
        y: position.y - (isHovering ? 40 : 10),
        width: isHovering ? 80 : 20,
        height: isHovering ? 80 : 20,
        backgroundColor: isHovering ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.8)',
        color: isHovering ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0)',
      }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300,
        mass: 0.5
      }}
      style={{
        transformOrigin: 'center'
      }}
    >
      {isHovering && <span className="mix-blend-normal">{cursorText}</span>}
    </motion.div>
  );
}
