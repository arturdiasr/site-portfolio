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

    const formattedSlug = slug
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    localStorage.setItem(`temp_pwd_${formattedSlug}`, password);

    router.push(`/cliente/${formattedSlug}`);
  };

  return (
    <div className="w-full pt-8 pb-32 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-2 mb-10">
        <span className="font-sans text-[11px] tracking-[0.3em] uppercase text-neutral-400 font-semibold block">
          Acesso Privativo
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-neutral-950">
          Área do Cliente
        </h1>
      </div>

      <div className="bg-white p-10 md:p-14 max-w-md w-full shadow-2xl border border-neutral-100 flex flex-col items-center text-center">
        <div className="w-12 h-12 mb-6 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <form onSubmit={handleAccess} className="w-full flex flex-col gap-6">
          <div className="text-left w-full">
            <label className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-500 mb-2 block">
              Nome ou Código da Galeria
            </label>
            <input
              type="text"
              placeholder="ex: Paula Carvalho"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full p-4 border border-neutral-200 text-center text-base focus:outline-none focus:border-black transition-colors"
              required
            />
          </div>

          <div className="text-left w-full">
            <label className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-500 mb-2 block">
              Senha de Acesso
            </label>
            <input
              type="password"
              placeholder="Sua senha secreta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border border-neutral-200 text-center text-base focus:outline-none focus:border-black transition-colors tracking-widest"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white p-4 text-xs font-bold uppercase tracking-[0.22em] hover:bg-neutral-800 transition-colors mt-2 cursor-pointer shadow-md"
          >
            Acessar Minhas Fotos
          </button>
        </form>
      </div>
    </div>
  );
}
