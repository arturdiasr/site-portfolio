"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function RevealText({ text, delay = 0, className = "" }: { text: string, delay?: number, className?: string }) {
  const chars = Array.from(text);
  
  return (
    <motion.span 
      initial="hidden" 
      animate="visible" 
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: delay } }
      }}
      className={`inline-block ${className}`}
    >
      {chars.map((char, i) => (
        <motion.span 
          key={i} 
          variants={{ 
            hidden: { opacity: 0, y: 10, filter: "blur(2px)" }, 
            visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { ease: "easeOut", duration: 0.3 } } 
          }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function RevealNav({ children, delay = 0, className = "" }: { children: ReactNode, delay?: number, className?: string }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.nav>
  );
}
