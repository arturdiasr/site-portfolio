'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

export default function CustomCursor() {
  const [cursorText, setCursorText] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 28, stiffness: 360, mass: 0.45 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    setIsEnabled(true);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);

      const target = (e.target as HTMLElement | null)?.closest('[data-cursor]');
      if (target) {
        const label = target.getAttribute('data-cursor') || '';
        setCursorText(label);
        setIsHovered(Boolean(label));
      } else {
        setIsHovered(false);
        setCursorText('');
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  if (!isEnabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:flex items-center justify-center rounded-full text-[9px] uppercase font-bold tracking-[0.2em] text-white backdrop-blur-xs shadow-lg select-none"
      style={{
        x: smoothX,
        y: smoothY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        width: isHovered ? 64 : 8,
        height: isHovered ? 64 : 8,
        opacity: isVisible ? (isHovered ? 1 : 0.45) : 0,
        backgroundColor: isHovered ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.5)',
        scale: isHovered ? 1 : 1,
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 320 }}
    >
      {isHovered && (
        <span className="px-1 text-center leading-none">{cursorText}</span>
      )}
    </motion.div>
  );
}
