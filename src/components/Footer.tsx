import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-32 pb-10 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-8 lg:px-12 pt-16 flex flex-col items-center justify-center space-y-4">
        
        {/* Simple Link to IG */}
        <Link href="https://www.instagram.com/arturdias/" target="_blank" className="font-bold tracking-widest uppercase text-sm hover:text-gray-500 transition-colors">
          Siga no Instagram
        </Link>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-400 uppercase tracking-widest">
          © {new Date().getFullYear()} Artur Dias Fotografia. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
