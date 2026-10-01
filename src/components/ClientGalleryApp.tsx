'use client';

import { useState, useEffect } from 'react';
import { urlForImage } from "@/sanity/lib/image";

type ClientAlbumData = {
  title: string;
  slug: string;
  password: string;
  coverImage: any;
  images: {
    url: string;
    originalFilename: string;
    aspectRatio: number;
  }[];
};

export default function ClientGalleryApp({ album }: { album: ClientAlbumData }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(false);
  
  // Lista de nomes de arquivos selecionados (usamos originalFilename)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Usamos localStorage para manter o estado caso o cliente atualize a página acidentalmente
  useEffect(() => {
    setIsClient(true);
    const authStatus = localStorage.getItem(`auth_${album.slug}`);
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }

    const savedSelections = localStorage.getItem(`selections_${album.slug}`);
    if (savedSelections) {
      try {
        setSelectedFiles(JSON.parse(savedSelections));
      } catch (e) {}
    }
  }, [album.slug]);

  // Salva seleções ao alterar
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(`selections_${album.slug}`, JSON.stringify(selectedFiles));
    }
  }, [selectedFiles, album.slug, isClient]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === album.password) {
      setIsAuthenticated(true);
      localStorage.setItem(`auth_${album.slug}`, 'true');
      setError(false);
    } else {
      setError(true);
    }
  };

  const toggleSelection = (filename: string) => {
    if (!filename) return;
    setSelectedFiles(prev => 
      prev.includes(filename) 
        ? prev.filter(f => f !== filename) 
        : [...prev, filename]
    );
  };

  const copyToLightroom = () => {
    const textToCopy = selectedFiles.join(", ");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Previne SSR Hydration Mismatch
  if (!isClient) return <div className="min-h-screen bg-gray-50" />;

  // TELA DE LOGIN
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        {/* Fundo com a foto de capa */}
        {album.coverImage && (
          <div className="absolute inset-0 opacity-40">
            <img 
              src={urlForImage(album.coverImage).url()} 
              alt="Capa do Ensaio" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Formulário */}
        <div className="relative z-10 bg-white p-10 md:p-14 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-widest mb-2">{album.title}</h1>
          <p className="text-gray-500 mb-8 text-sm">Digite a senha para acessar suas fotos.</p>
          
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <input 
              type="password" 
              placeholder="Senha de Acesso"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full p-4 border border-gray-200 text-center text-lg tracking-widest focus:outline-none focus:border-black transition-colors"
            />
            {error && <p className="text-red-500 text-xs uppercase font-bold tracking-widest">Senha Incorreta</p>}
            <button 
              type="submit"
              className="w-full bg-black text-white p-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
            >
              Acessar Galeria
            </button>
          </form>
        </div>
      </div>
    );
  }

  // TELA DA GALERIA (Selecionador de Fotos)
  return (
    <div className="w-full pb-32">
      {/* Grade de Fotos */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 2xl:columns-5 gap-6">
        {album.images?.map((img, index) => {
          const isSelected = selectedFiles.includes(img.originalFilename);
          const isLandscape = img.aspectRatio && img.aspectRatio > 1;
          const aspectClass = isLandscape ? "aspect-[3/2]" : "aspect-[4/5]";

          return (
            <div 
              key={index} 
              className={`relative break-inside-avoid mb-6 w-full block shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer ${aspectClass}`}
              onClick={() => toggleSelection(img.originalFilename)}
            >
              <img 
                src={img.url} 
                alt={img.originalFilename}
                className={`w-full h-full object-cover transition-all duration-300 ${isSelected ? 'brightness-75 scale-[0.98]' : ''}`}
                loading="lazy"
              />
              
              {/* Botão Coração */}
              <button 
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isSelected ? 'bg-white opacity-100 shadow-md scale-110' : 'bg-black/20 opacity-0 group-hover:opacity-100 hover:bg-black/40 text-white'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelection(img.originalFilename);
                }}
              >
                <svg 
                  className={`w-5 h-5 ${isSelected ? 'text-red-500 fill-red-500' : 'text-white'}`} 
                  fill={isSelected ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isSelected ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              {/* Tag com o nome original do arquivo para referência */}
              <div className="absolute bottom-4 left-4 bg-black/60 text-white text-[10px] px-2 py-1 tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                {img.originalFilename || 'S/ NOME'}
              </div>

              {/* Borda Verde quando Selecionado */}
              {isSelected && (
                <div className="absolute inset-0 border-4 border-green-500 pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {/* Barra Inferior Fixa */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-10px_30px_rgb(0,0,0,0.05)] z-40 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <p className="text-xl font-bold uppercase tracking-widest">{selectedFiles.length} Favoritas</p>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">de {album.images?.length || 0} fotos totae</p>
        </div>
        
        <button 
          onClick={copyToLightroom}
          disabled={selectedFiles.length === 0}
          className={`px-8 py-4 font-bold uppercase tracking-widest text-sm transition-all flex items-center gap-2 ${
            selectedFiles.length === 0 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : copied 
                ? 'bg-green-500 text-white' 
                : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Lista Copiada!
            </>
          ) : (
            'Copiar Nomes para Lightroom'
          )}
        </button>
      </div>
    </div>
  );
}
