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

    // Formata o código do ensaio para garantir que não haja espaços ou letras maiúsculas (padrão slug)
    const formattedSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');

    // Salva a senha informada no localStorage para que a página do ensaio não pergunte novamente
    localStorage.setItem(`auth_${formattedSlug}`, password); // Temporariamente salvar a senha. A validação real ocorre na próxima tela.
    // Dica: na próxima página, o componente ClientGalleryApp vai validar se a senha bate com o banco de dados.
    // O correto seria apenas redirecionar, e lá a página checa se a senha no localStorage confere.
    // Mas para fluidez, vamos deixar a página final validar.
    
    // Na verdade, a página final checa se auth_slug == 'true'.
    // Mas como não sabemos se a senha tá certa AQUI, precisamos que a próxima tela receba a senha.
    // Vamos armazenar a senha em um localStorage temporário `temp_pwd_slug`.
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
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Código do Ensaio</label>
            <input 
              type="text" 
              placeholder="ex: casamento-joao"
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
