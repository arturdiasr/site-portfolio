'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

const stripExt = (name?: string) => String(name || '').replace(/\.[^/.]+$/, '');

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
  const touchStartX = useRef<number | null>(null);

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
        const normalized = Array.isArray(parsed) ? parsed.map((f: string) => stripExt(f)) : [];
        setSelectedFiles(normalized);
        if (normalized.length > 0) {
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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !album.images?.length) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      setSelectedIndex((prev) => (prev! + 1) % album.images.length);
    }
    if (diff < -45) {
      setSelectedIndex((prev) => (prev! - 1 + album.images.length) % album.images.length);
    }
    touchStartX.current = null;
  };

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

  const toggleSelection = (rawFilename: string) => {
    const filename = stripExt(rawFilename);
    if (!filename) return;
    setSelectedFiles(prev => {
      const isSelecting = !prev.includes(filename);
      const newFiles = isSelecting
        ? [...prev, filename]
        : prev.filter(f => f !== filename);

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
  if (!isClient) return <div className="min-h-screen bg-neutral-50" />;

  // TELA DE LOGIN
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950 p-4">
        {album.coverImage && (
          <div className="absolute inset-0 opacity-35">
            <img
              src={urlForImage(album.coverImage).url()}
              alt="Capa do Ensaio"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="relative z-10 bg-white p-10 md:p-14 max-w-md w-full shadow-2xl border border-neutral-100 flex flex-col items-center text-center">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-widest mb-2">
            {album.title}
          </h1>
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
                className="w-full p-4 border border-neutral-200 text-center text-sm focus:outline-none focus:border-black transition-colors"
                required
              />
            )}
            <input
              type="password"
              placeholder="Senha de Acesso"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full p-4 border border-neutral-200 text-center text-base tracking-widest focus:outline-none focus:border-black transition-colors"
              required
            />
            {error && (
              <p className="text-red-500 text-xs uppercase font-bold tracking-widest">
                {errorMessage || 'Senha Incorreta'}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-black text-white p-4 text-xs font-bold uppercase tracking-[0.22em] hover:bg-neutral-800 transition-colors cursor-pointer mt-1"
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
    <div className={`w-full pb-36 transition-all duration-500 ${sidebarOpen ? 'md:pr-96' : ''}`}>
      {/* Toast Animado Editorial */}
      <div
        className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-neutral-950 text-white px-6 py-4 rounded-xs shadow-2xl border border-white/10 flex items-center gap-3 transition-all duration-500 transform ${
          showToast ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-xs font-semibold tracking-wider uppercase">
          Seleção enviada com sucesso! Agora é só aguardar as fotos editadas.
        </span>
      </div>

      {/* Sidebar Lateral */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.08)] z-50 transition-transform duration-500 flex flex-col border-l border-neutral-100 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } w-80 md:w-96`}
      >
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/70">
          <div>
            <h3 className="font-bold uppercase tracking-[0.2em] text-xs text-neutral-900">
              Selecionadas ({selectedFiles.length})
            </h3>
            {clientEmail && (
              <p className="text-[11px] text-neutral-500 truncate mt-0.5">{clientEmail}</p>
            )}
          </div>
          <button
            onClick={handleMinimizeSidebar}
            className="p-2 hover:bg-neutral-200/70 rounded-full transition-colors text-neutral-500 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
          {selectedFiles.length === 0 ? (
            <p className="text-neutral-400 text-xs text-center mt-10 uppercase tracking-[0.2em]">
              Nenhuma foto selecionada.
            </p>
          ) : (
            selectedFiles.map(rawFilename => {
              const filename = stripExt(rawFilename);
              const img = album.images?.find(i => stripExt(i.originalFilename) === filename);
              return (
                <div
                  key={filename}
                  className="flex items-center gap-4 group bg-neutral-50/80 p-2.5 rounded-xs border border-neutral-100"
                >
                  {img ? (
                    <img src={img.url} alt={filename} className="w-14 h-14 object-cover rounded-xs shadow-xs" />
                  ) : (
                    <div className="w-14 h-14 bg-neutral-200 rounded-xs" />
                  )}
                  <span className="font-mono text-xs tracking-wider flex-1 truncate text-neutral-700">
                    {filename}
                  </span>
                  <button
                    onClick={() => toggleSelection(filename)}
                    className="text-neutral-400 hover:text-red-500 transition-colors p-2 cursor-pointer"
                    title="Remover da seleção"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
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
          className="fixed top-1/2 right-0 -translate-y-1/2 bg-black text-white p-3.5 md:p-4 rounded-l-xs shadow-2xl z-40 hover:bg-neutral-800 transition-colors group flex items-center cursor-pointer"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap ml-0 group-hover:ml-3 font-bold text-xs tracking-[0.2em]">
            VER SELEÇÃO ({selectedFiles.length})
          </span>
        </button>
      )}

      {/* Lightbox Overlay com Gestos Mobile */}
      <AnimatePresence>
        {selectedIndex !== null && album.images && album.images[selectedIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[110] bg-neutral-950/95 flex items-center justify-center p-4 backdrop-blur-md select-none"
            onClick={() => setSelectedIndex(null)}
            onContextMenu={(e) => e.preventDefault()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Topo do Lightbox */}
            <div className="absolute top-0 left-0 right-0 p-5 md:p-7 flex justify-between items-center text-white/80 z-[120] pointer-events-none">
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-xs border border-white/10 pointer-events-auto">
                <span className="font-mono text-xs tracking-[0.2em] text-neutral-300">
                  {String(selectedIndex + 1).padStart(2, '0')} <span className="text-neutral-600">/</span> {String(album.images.length).padStart(2, '0')}
                </span>
                <span className="text-neutral-600">•</span>
                <span className="font-mono text-[11px] tracking-wider text-neutral-400">
                  {stripExt(album.images[selectedIndex].originalFilename)}
                </span>
              </div>

              <button
                className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/80 hover:text-white bg-black/40 hover:bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xs border border-white/10 transition-all cursor-pointer pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(null);
                }}
              >
                <span className="hidden sm:inline text-[10px] font-semibold">Fechar</span>
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>

            <motion.img
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              src={album.images[selectedIndex].url}
              alt={album.images[selectedIndex].originalFilename}
              className="max-w-full max-h-[82vh] object-contain select-none shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white/70 hover:text-white bg-black/40 hover:bg-white/15 backdrop-blur-sm border border-white/10 rounded-full transition-all z-[120] cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev! - 1 + album.images!.length) % album.images!.length);
              }}
              aria-label="Anterior"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white/70 hover:text-white bg-black/40 hover:bg-white/15 backdrop-blur-sm border border-white/10 rounded-full transition-all z-[120] cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev! + 1) % album.images!.length);
              }}
              aria-label="Próxima"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Botão Favoritar no Lightbox */}
            <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-[120]">
              <button
                className={`px-6 py-3.5 rounded-full flex items-center gap-2.5 transition-all duration-300 shadow-2xl cursor-pointer text-xs uppercase tracking-[0.2em] font-bold ${
                  selectedFiles.includes(stripExt(album.images[selectedIndex].originalFilename))
                    ? 'bg-white text-black scale-105'
                    : 'bg-black/60 text-white hover:bg-black/85 border border-white/20 backdrop-blur-md'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelection(album.images![selectedIndex!].originalFilename);
                }}
              >
                <svg
                  className={`w-5 h-5 ${
                    selectedFiles.includes(stripExt(album.images[selectedIndex].originalFilename))
                      ? 'text-red-500 fill-red-500'
                      : 'text-white'
                  }`}
                  fill={selectedFiles.includes(stripExt(album.images[selectedIndex].originalFilename)) ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={selectedFiles.includes(stripExt(album.images[selectedIndex].originalFilename)) ? 0 : 1.75}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>
                  {selectedFiles.includes(stripExt(album.images[selectedIndex].originalFilename))
                    ? 'Selecionada'
                    : 'Selecionar Foto'}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grade de Fotos */}
      <MasonryGrid>
        {album.images?.map((img, index) => {
          const fileKey = stripExt(img.originalFilename);
          const isSelected = selectedFiles.includes(fileKey);
          const isLandscape = img.aspectRatio && img.aspectRatio > 1;
          const aspectClass = isLandscape ? "aspect-[3/2]" : "aspect-[4/5]";

          return (
            <div
              key={index}
              className={`relative break-inside-avoid mb-6 w-full block overflow-hidden bg-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-zoom-in ${aspectClass}`}
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={img.url}
                alt={fileKey}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  isSelected ? 'brightness-90 scale-[0.985]' : 'group-hover:scale-[1.02]'
                }`}
                loading="lazy"
              />

              {/* Botão Coração (Sempre acessível no mobile e visível no hover no desktop) */}
              <button
                className={`absolute top-3.5 right-3.5 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 z-10 cursor-pointer ${
                  isSelected
                    ? 'bg-white opacity-100 shadow-lg scale-105'
                    : 'bg-black/35 opacity-90 md:opacity-0 md:group-hover:opacity-100 hover:bg-black/65 text-white backdrop-blur-sm'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelection(img.originalFilename);
                }}
                title={isSelected ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                <svg
                  className={`w-5 h-5 ${isSelected ? 'text-red-500 fill-red-500' : 'text-white'}`}
                  fill={isSelected ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={isSelected ? 0 : 1.75}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>

              {/* Nome do Arquivo Discreto na Base */}
              <div className="absolute bottom-3 left-3 bg-black/55 backdrop-blur-sm text-white font-mono text-[10px] px-2.5 py-1 tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {fileKey || 'S/ NOME'}
              </div>

              {/* Destaque Editorial de Foto Selecionada (Substitui a borda verde saturada) */}
              {isSelected && (
                <div className="absolute inset-0 ring-2 ring-black/85 ring-inset pointer-events-none transition-all duration-300">
                  <div className="absolute top-3.5 left-3.5 bg-black text-white text-[9px] uppercase tracking-[0.22em] font-bold px-2.5 py-1.5 flex items-center gap-1.5 shadow-md">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Selecionada
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </MasonryGrid>

      {/* Barra Inferior Fixa */}
      <div
        className={`fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-[0_-10px_30px_rgb(0,0,0,0.05)] z-40 p-4 md:p-5 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-14 transition-all duration-500 ${
          sidebarOpen ? 'md:w-[calc(100%-24rem)]' : ''
        }`}
      >
        <div className="text-center">
          <p className="text-xl font-bold uppercase tracking-widest text-black">
            {selectedFiles.length} Favoritas
          </p>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
            de {album.images?.length || 0} fotos totais
          </p>
        </div>

        <button
          onClick={handleSendList}
          disabled={selectedFiles.length === 0 || isSending}
          className={`px-8 py-4 font-bold uppercase tracking-[0.22em] text-xs transition-all flex items-center justify-center gap-3 w-full md:w-auto min-w-[280px] ${
            selectedFiles.length === 0
              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              : 'bg-black text-white hover:bg-neutral-800 shadow-lg hover:shadow-xl cursor-pointer'
          }`}
        >
          {isSending ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Finalizar e Enviar Seleção
            </>
          )}
        </button>
      </div>
    </div>
  );
}
