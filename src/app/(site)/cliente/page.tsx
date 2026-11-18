'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type AdminAlbumSummary = {
  _id: string;
  title: string;
  slug: string;
  password?: string;
  requireEmail?: boolean;
  _createdAt?: string;
  photoCount?: number;
};

export default function ClientHubPage() {
  const [slug, setSlug] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [adminAlbums, setAdminAlbums] = useState<AdminAlbumSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const formatSlug = (raw: string) =>
    raw
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  // Se o admin já estiver com sessão fantasma ativa na aba atual, carrega a lista
  useEffect(() => {
    const savedAdminPwd = sessionStorage.getItem('artur_admin_ghost_pwd');
    if (savedAdminPwd) {
      fetch('/api/admin-albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: savedAdminPwd, action: 'list' }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data?.isAdmin) {
            setAdminMode(true);
            setAdminAlbums(data.albums || []);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    const formattedSlug = formatSlug(slug);
    const isGenericAdminKeyword =
      !formattedSlug ||
      formattedSlug === 'admin' ||
      formattedSlug === 'todos' ||
      formattedSlug === 'painel';

    setLoading(true);
    try {
      const res = await fetch('/api/admin-albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, action: 'list' }),
      });
      const data = await res.json();

      if (data?.isAdmin) {
        sessionStorage.setItem('artur_admin_ghost', 'true');
        sessionStorage.setItem('artur_admin_ghost_pwd', password);

        if (!isGenericAdminKeyword) {
          // Se digitou o nome de uma galeria específica + senha de admin, vai direto para ela em modo fantasma
          router.push(`/cliente/${formattedSlug}`);
          return;
        }

        // Caso tenha deixado o nome em branco ou digitado "admin", abre o catálogo completo de álbuns
        setAdminMode(true);
        setAdminAlbums(data.albums || []);
        setLoading(false);
        return;
      }
    } catch {
      // Se não for admin, segue fluxo normal do cliente
    }
    setLoading(false);

    if (!formattedSlug) return;

    localStorage.setItem(`temp_pwd_${formattedSlug}`, password);
    router.push(`/cliente/${formattedSlug}`);
  };

  const handleExitAdmin = () => {
    sessionStorage.removeItem('artur_admin_ghost');
    sessionStorage.removeItem('artur_admin_ghost_pwd');
    setAdminMode(false);
    setAdminAlbums([]);
    setPassword('');
  };

  const filteredAlbums = adminAlbums.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title?.toLowerCase().includes(q) ||
      a.slug?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full pt-8 pb-32 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-4 mb-10">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase">Área do Cliente</h1>
        <p className="text-xs tracking-widest uppercase text-gray-400">
          {adminMode
            ? 'Modo Fantasma Admin • Visualização Sem Rastros'
            : 'Acesse suas fotografias privadas'}
        </p>
      </div>

      {adminMode ? (
        <div className="bg-white p-6 sm:p-10 max-w-4xl w-full shadow-2xl border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-100">
            <div>
              <div className="inline-flex items-center gap-2 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 mb-2">
                <span>👁️ Modo Admin Invisível Ativo</span>
              </div>
              <p className="text-xs text-gray-500">
                Qualquer álbum aberto por aqui será exibido exatamente como para o cliente, mas <strong>sem exigir e-mail</strong>, <strong>sem criar lista de seleção</strong> e <strong>sem registrar acesso</strong> no Sanity.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExitAdmin}
              className="shrink-0 border border-gray-200 hover:border-black text-xs font-bold uppercase tracking-widest px-4 py-2.5 transition-colors cursor-pointer"
            >
              Sair do Modo Admin
            </button>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar álbum por nome ou link..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3.5 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {filteredAlbums.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">
              Nenhum álbum encontrado.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
              {filteredAlbums.map((album) => (
                <div
                  key={album._id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 px-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-black">
                        {album.title}
                      </h3>
                      <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 font-mono">
                        {album.photoCount || 0} arquivos
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono">
                      /cliente/{album.slug} • Senha do cliente: <strong className="text-gray-600">{album.password}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/cliente/${album.slug}`}
                      className="bg-black text-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors inline-block text-center"
                    >
                      👁️ Visualizar Galeria
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-10 md:p-14 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col items-center text-center">
          <form onSubmit={handleAccess} className="w-full flex flex-col gap-6">
            <div className="text-left w-full">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Nome ou Link da Galeria</label>
              <input 
                type="text" 
                placeholder="ex: Paula Carvalho ou link"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full p-4 border border-gray-200 text-center text-lg focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div className="text-left w-full">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Senha de Acesso</label>
              <input 
                type="password" 
                placeholder="Sua senha secreta"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border border-gray-200 text-center text-lg focus:outline-none focus:border-black transition-colors tracking-widest"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white p-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors mt-4 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Acessar Minhas Fotos'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
