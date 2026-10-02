"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

type Category = { _id: string; title: string };

export default function HeaderClient({ categories, videoCount }: { categories: Category[], videoCount: number }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header 
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`w-full sticky top-0 z-40 bg-white/70 backdrop-blur-md shadow-sm border-b border-transparent px-6 sm:px-12 flex items-center justify-between overflow-hidden ${
        isScrolled ? "h-16 md:h-20" : "h-36 md:h-48"
      }`}
      style={{
        // Remove the border when not scrolled, add a subtle border when scrolled
        borderBottomColor: isScrolled ? "rgba(0,0,0,0.05)" : "transparent"
      }}
    >
      <div className={`w-full flex ${isScrolled ? 'flex-row items-center justify-between' : 'flex-col items-center justify-center'} transition-none h-full`}>
        
        {/* Logo */}
        <motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }}>
          <Link 
            href="/" 
            className={`font-extrabold tracking-tighter uppercase hover:text-gray-700 block ${
              isScrolled ? "text-xl md:text-2xl mb-0" : "text-3xl md:text-5xl mb-4 md:mb-8"
            }`}
          >
            Artur Dias
          </Link>
        </motion.div>
        
        {/* Menu */}
        <motion.nav 
          layout 
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex items-center space-x-4 sm:space-x-8 text-[10px] sm:text-xs md:text-sm uppercase tracking-widest font-semibold"
        >
          {/* Dropdown de Portfólio */}
          <div className="relative group py-2 md:py-4">
            <Link href="/" className="hover:text-gray-400 transition-colors cursor-pointer">
              Portfólio
            </Link>
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-56 bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 flex flex-col py-3 origin-top scale-95 group-hover:scale-100">
              {categories.map((cat) => (
                <Link key={cat._id} href={`/categoria/${cat._id}`} className="px-6 py-3 hover:bg-gray-100/50 hover:text-black text-gray-500 text-xs transition-colors text-center">
                  {cat.title}
                </Link>
              ))}
              {videoCount > 0 && (
                <Link href="/videos" className="px-6 py-3 hover:bg-gray-100/50 hover:text-black text-gray-500 text-xs transition-colors text-center">
                  VÍDEOS
                </Link>
              )}
            </div>
          </div>

          <Link href="/sobre" className="hover:text-gray-400 transition-colors">Sobre & Contato</Link>
          <Link href="/cliente" className="hover:text-gray-400 transition-colors hidden sm:block">Área do Cliente</Link>
          
          {/* Ícone Instagram */}
          <Link href="https://www.instagram.com/arturdias/" target="_blank" className="hover:text-gray-400 transition-colors" aria-label="Instagram">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
            </svg>
          </Link>
        </motion.nav>

      </div>
    </motion.header>
  );
}
