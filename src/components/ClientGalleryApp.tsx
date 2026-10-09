'use client';

import { useState, useEffect } from 'react';
import { urlForImage } from "@/sanity/lib/image";

import MasonryGrid from '@/components/MasonryGrid';

type ClientAlbumData = {
  title: string;
  slug: string;
  password: string;
  requireEmail?: boolean;
  coverImage: any;
  images: {
    url: string;
    originalFilename: string;
    aspectRatio: number;
  }[];
};

export default function ClientGalleryApp({ album }: { album: ClientAlbumData }) {
  // Não aplica exigência de e-mail para a galeria que já existia nem quando desativado
  const isLegacyGallery = album.slug === 'paula-carvalho-sqn-304';
  const requireEmail = !isLegacyGallery && album.requireEmail !== false;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Lista de nomes de arquivos selecionados
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Novos estados para lightbox, toast e sidebar
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasMinimizedSidebar, setHasMinimizedSidebar] = useState(false);

  // Usamos localStorage para manter o estado
  useEffect(() => {
    setIsClient(true);
    
    // Verifica se já estava logado antes
    const authStatus = localStorage.getItem(`auth_${album.slug}`);
    const savedEmail = localStorage.getItem(`client_email_${album.slug}`) || '';

    if (authStatus === 'true') {
      if (requireEmail && !savedEmail) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        setClientEmail(savedEmail);
      }
    } else {
      const tempPwd = localStorage.getItem(`temp_pwd_${album.slug}`);
      if (tempPwd) {
        if (tempPwd === album.password) {
          if (!requireEmail) {
            setIsAuthenticated(true);
            localStorage.setItem(`auth_${album.slug}`, 'true');
          } else {
            setPasswordInput(tempPwd);
          }
        } else {
          setPasswordInput(tempPwd);
          setError(true);
          setErrorMessage('Senha Incorreta');
        }
        localStorage.removeItem(`temp_pwd_${album.slug}`);
      }
    }

    const savedSelections = localStorage.getItem(`selections_${album.slug}`);
    if (savedSelections) {
      try {
        const parsed = JSON.parse(savedSelections);
        setSelectedFiles(parsed);
        // Se já existiam itens selecionados e ele entra novamente, assume que já minimizou para não forçar a barra toda vez
        if (parsed.length > 0) {
          setHasMinimizedSidebar(true);
        }
      } catch (e) {}
    }
  }, [album.slug, album.password, requireEmail]);

  // Salva seleções ao alterar no localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(`selections_${album.slug}`, JSON.stringify(selectedFiles));
    }
  }, [selectedFiles, album.slug, isClient]);

  // Sincroniza seleções em tempo real com o Sanity para monitoramento no Studio
  useEffect(() => {
    if (!isClient || !isAuthenticated) return;

    const timer = setTimeout(() => {
      fetch('/api/client-selections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          albumSlug: album.slug,
          albumTitle: album.title,
          clientEmail: clientEmail || (requireEmail ? '' : 'cliente-direto'),
          selectedFiles: selectedFiles,
          status: 'in_progress',
        }),
      }).catch((err) => {
        console.warn('Erro ao sincronizar seleção em tempo real:', err);
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedFiles, album.slug, album.title, clientEmail, isClient, isAuthenticated, requireEmail]);

  // Keyboard events for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev! + 1) % (album.images?.length || 1));
      }
      if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev! - 1 + (album.images?.length || 1)) % (album.images?.length || 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, album.images]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput !== album.password) {
      setError(true);
      setErrorMessage('Senha Incorreta');
      return;
    }

    if (requireEmail) {
      const trimmedEmail = emailInput.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
        setError(true);
        setErrorMessage('Por favor, digite um e-mail válido');
        return;
      }
      localStorage.setItem(`client_email_${album.slug}`, trimmedEmail);
      setClientEmail(trimmedEmail);
    }

    setIsAuthenticated(true);
    localStorage.setItem(`auth_${album.slug}`, 'true');
    setError(false);
    setErrorMessage('');
  };

  const toggleSelection = (filename: string) => {
    if (!filename) return;
    setSelectedFiles(prev => {
      const isSelecting = !prev.includes(filename);
      const newFiles = isSelecting 
        ? [...prev, filename] 
        : prev.filter(f => f !== filename);
      
      // Abre a sidebar se for a primeira foto sendo selecionada e o usuário não a minimizou ainda
      if (isSelecting && prev.length === 0 && !hasMinimizedSidebar) {
        setSidebarOpen(true);
      }
      
      return newFiles;
    });
  };

  const handleMinimizeSidebar = () => {
    setSidebarOpen(false);
    setHasMinimizedSidebar(true);
  };

  const handleSendList = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/send-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          albumTitle: album.title,
          albumSlug: album.slug,
          clientEmail: clientEmail,
          selectedFiles: selectedFiles
        })
      });
      if (res.ok) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);

        // Atualiza status no Sanity para submitted
        fetch('/api/client-selections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            albumSlug: album.slug,
            albumTitle: album.title,
            clientEmail: clientEmail || (requireEmail ? '' : 'cliente-direto'),
            selectedFiles: selectedFiles,
            status: 'submitted',
          }),
        }).catch(() => {});
      } else {
        alert("Ocorreu um erro ao enviar as fotos. Verifique as configurações de email ou tente novamente.");
      }
    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro de rede. Tente novamente.");
    } finally {
      setIsSending(false);
    }
  };

  // Previne SSR Hydration Mismatch
  if (!isClient) return <div className="min-h-screen bg-gray-50" />;

  // TELA DE LOGIN
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        {album.coverImage && (
          <div className="absolute inset-0 opacity-40">
            <img 
              src={urlForImage(album.coverImage).url()} 
              alt="Capa do Ensaio" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="relative z-10 bg-white p-10 md:p-14 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-widest mb-2">{album.title}</h1>
          <p className="text-gray-500 mb-8 text-sm">
            {requireEmail 
              ? 'Informe seu e-mail e a senha para acessar suas fotos.'
              : 'Digite a senha para acessar suas fotos.'}
          </p>
          
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            {requireEmail && (
              <input 
                type="email" 
                placeholder="Seu e-mail"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full p-4 border border-gray-200 text-center text-base focus:outline-none focus:border-black transition-colors"
                required
              />
            )}
            <input 
              type="password" 
              placeholder="Senha de Acesso"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full p-4 border border-gray-200 text-center text-lg tracking-widest focus:outline-none focus:border-black transition-colors"
              required
            />
            {error && <p className="text-red-500 text-xs uppercase font-bold tracking-widest">{errorMessage || 'Senha Incorreta'}</p>}
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

  // TELA DA GALERIA
  return (
    <div className={`w-full pb-32 transition-all duration-500 ${sidebarOpen ? 'md:pr-96' : ''}`}>
      
      {/* Toast Animado */}
      <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-500 transform ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        <span className="font-bold tracking-wide">Fotos enviadas com sucesso! Agora é só aguardar as fotos editadas!</span>
      </div>

      {/* Sidebar Lateral */}
      <div 
        className={`fixed top-0 right-0 h-full bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-50 transition-transform duration-500 flex flex-col ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} w-80 md:w-96`}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold uppercase tracking-widest text-sm">Fotos Selecionadas ({selectedFiles.length})</h3>
            {clientEmail && (
              <p className="text-[11px] text-gray-500 truncate mt-0.5">{clientEmail}</p>
            )}
          </div>
          <button onClick={handleMinimizeSidebar} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
          {selectedFiles.length === 0 ? (
            <p className="text-gray-400 text-sm text-center mt-10 uppercase tracking-widest">Nenhuma foto selecionada.</p>
          ) : (
            selectedFiles.map(filename => {
              const img = album.images?.find(i => i.originalFilename === filename);
              return (
                <div key={filename} className="flex items-center gap-4 group bg-gray-50 p-2 rounded-lg border border-gray-100">
                  {img ? (
                    <img src={img.url} alt={filename} className="w-16 h-16 object-cover rounded shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded shadow-sm"></div>
                  )}
                  <span className="text-xs tracking-wider flex-1 truncate font-medium text-gray-700">{filename}</span>
                  <button 
                    onClick={() => toggleSelection(filename)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    title="Remover"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Botão flutuante para abrir a sidebar quando fechada */}
      {!sidebarOpen && selectedFiles.length > 0 && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className="fixed top-1/2 right-0 -translate-y-1/2 bg-black text-white p-3 md:p-4 rounded-l-xl shadow-2xl z-40 hover:bg-gray-800 transition-colors group flex items-center cursor-pointer"
        >
          <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap ml-0 group-hover:ml-3 font-bold text-xs md:text-sm tracking-widest">
            VER SELEÇÃO ({selectedFiles.length})
          </span>
        </button>
      )}

      {/* Lightbox Overlay */}
      {selectedIndex !== null && album.images && album.images[selectedIndex] && (
        <div 
          className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedIndex(null)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button 
            className="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 transition-colors z-[120] w-12 h-12 flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
          >
            &times;
          </button>
          
          <img 
            src={album.images[selectedIndex].url} 
            alt={album.images[selectedIndex].originalFilename}
            className="max-w-full max-h-[85vh] object-contain select-none"
            onClick={(e) => e.stopPropagation()} 
          />

          <button 
            className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 md:p-4 z-[120]"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex((prev) => (prev! - 1 + album.images!.length) % album.images!.length);
            }}
          >
            <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <button 
            className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 md:p-4 z-[120]"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex((prev) => (prev! + 1) % album.images!.length);
            }}
          >
            <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          {/* Heart button inside lightbox */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[120]">
             <button 
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                  selectedFiles.includes(album.images[selectedIndex].originalFilename) ? 'bg-white scale-110' : 'bg-black/50 text-white hover:bg-black/80 border border-white/20'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelection(album.images![selectedIndex!].originalFilename);
                }}
              >
                <svg 
                  className={`w-8 h-8 ${selectedFiles.includes(album.images[selectedIndex].originalFilename) ? 'text-red-500 fill-red-500' : 'text-white'}`} 
                  fill={selectedFiles.includes(album.images[selectedIndex].originalFilename) ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={selectedFiles.includes(album.images[selectedIndex].originalFilename) ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
          </div>
        </div>
      )}

      {/* Grade de Fotos */}
      <MasonryGrid>
        {album.images?.map((img, index) => {
          const isSelected = selectedFiles.includes(img.originalFilename);
          const isLandscape = img.aspectRatio && img.aspectRatio > 1;
          const aspectClass = isLandscape ? "aspect-[3/2]" : "aspect-[4/5]";

          return (
            <div 
              key={index} 
              className={`relative break-inside-avoid mb-6 w-full block shadow-sm hover:shadow-xl transition-all duration-300 group cursor-zoom-in ${aspectClass}`}
              onClick={() => setSelectedIndex(index)}
            >
              <img 
                src={img.url} 
                alt={img.originalFilename}
                className={`w-full h-full object-cover transition-all duration-300 ${isSelected ? 'brightness-75 scale-[0.98]' : ''}`}
                loading="lazy"
              />
              
              {/* Botão Coração */}
              <button 
                className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
                  isSelected ? 'bg-white opacity-100 shadow-lg scale-110' : 'bg-black/30 opacity-0 group-hover:opacity-100 hover:bg-black/60 text-white backdrop-blur-sm'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelection(img.originalFilename);
                }}
                title={isSelected ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                <svg 
                  className={`w-6 h-6 ${isSelected ? 'text-red-500 fill-red-500' : 'text-white'}`} 
                  fill={isSelected ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isSelected ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              <div className="absolute bottom-4 left-4 bg-black/60 text-white text-[10px] px-2 py-1 tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {img.originalFilename || 'S/ NOME'}
              </div>

              {isSelected && (
                <div className="absolute inset-0 border-4 border-green-500 pointer-events-none transition-all duration-300" />
              )}
            </div>
          );
        })}
      </MasonryGrid>

      {/* Barra Inferior Fixa */}
      <div className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-10px_30px_rgb(0,0,0,0.05)] z-40 p-4 md:p-6 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 transition-all duration-500 ${sidebarOpen ? 'md:w-[calc(100%-24rem)]' : ''}`}>
        <div className="text-center">
          <p className="text-xl font-bold uppercase tracking-widest text-black">{selectedFiles.length} Favoritas</p>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">de {album.images?.length || 0} fotos totais</p>
        </div>
        
        <button 
          onClick={handleSendList}
          disabled={selectedFiles.length === 0 || isSending}
          className={`px-8 py-4 font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 w-full md:w-auto min-w-[280px] ${
            selectedFiles.length === 0 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-black text-white hover:bg-gray-800 hover:scale-105 shadow-xl hover:shadow-2xl'
          }`}
        >
          {isSending ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              Enviar Lista de Fotos
            </>
          )}
        </button>
      </div>
    </div>
  );
}
