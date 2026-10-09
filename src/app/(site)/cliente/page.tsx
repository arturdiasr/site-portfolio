'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientHubPage() {
  const [slug, setSlug] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !password) return;

    // Formata o nome ou código do ensaio removendo acentos e espaços para padrão slug
    const formattedSlug = slug
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Salva a senha informada no localStorage temporário para a tela do ensaio validar
    localStorage.setItem(`temp_pwd_${formattedSlug}`, password);

    router.push(`/cliente/${formattedSlug}`);
  };

  return (
    <div className="w-full pt-8 pb-32 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-4 mb-10">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase">Área do Cliente</h1>
        <p className="text-xs tracking-widest uppercase text-gray-400">Acesse suas fotografias privadas</p>
      </div>

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
              required
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
            className="w-full bg-black text-white p-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors mt-4"
          >
            Acessar Minhas Fotos
          </button>
        </form>
      </div>
    </div>
  );
}
