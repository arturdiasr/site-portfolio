'use client';

import { useState } from 'react';

function Star({ filled, className = '' }: { filled: boolean; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinejoin="round" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" />
    </svg>
  );
}

export default function DeliveryApp({
  downloadUrl,
}: {
  downloadUrl: string | null;
}) {
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleDownload = () => {
    if (!downloadUrl) return;
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    // Após iniciar o download, convida o cliente a avaliar
    setTimeout(() => setShowReview(true), 1200);
  };

  const handleCopyLink = async () => {
    const target = downloadUrl || window.location.href;
    await navigator.clipboard.writeText(target);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || rating < 1) {
      setError('Informe seu nome e escolha de 1 a 5 estrelas.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rating, text, website }),
      });
      if (res.ok) setDone(true);
      else setError('Não foi possível enviar agora. Tente novamente.');
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="max-w-lg mx-auto text-center bg-white shadow-xl p-10 md:p-14">
        <p className="text-5xl mb-4">📸</p>
        <h2 className="text-xl font-bold uppercase tracking-widest mb-3">Suas fotos estão prontas!</h2>
        <p className="text-gray-500 text-sm mb-8">
          Clique no botão abaixo para baixar todas as suas fotos em qualidade original.
        </p>
        <button
          onClick={handleDownload}
          className="w-full bg-black text-white p-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
          Baixar Fotos
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="mt-3 w-full border border-gray-200 text-gray-700 p-3.5 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          {copiedLink ? (
            <>
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span className="text-green-600">Link Copiado!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Copiar Link para Download
            </>
          )}
        </button>
        {!showReview && !done && (
          <button onClick={() => setShowReview(true)} className="mt-6 text-xs uppercase tracking-widest text-gray-400 hover:text-black transition-colors cursor-pointer">
            Avaliar meu trabalho
          </button>
        )}
      </div>

      {showReview && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowReview(false)}>
          <div className="bg-white max-w-md w-full p-8 md:p-10 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowReview(false)} className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-black cursor-pointer" aria-label="Fechar">&times;</button>

            {done ? (
              <div className="text-center py-6">
                <p className="text-5xl mb-4">💛</p>
                <h3 className="text-xl font-bold uppercase tracking-widest mb-2">Muito obrigado!</h3>
                <p className="text-gray-500 text-sm">Sua avaliação foi enviada e significa muito para mim.</p>
              </div>
            ) : (
              <form onSubmit={submitReview} className="flex flex-col gap-4 text-center">
                <h3 className="text-xl font-bold uppercase tracking-widest">Como foi a experiência?</h3>
                <p className="text-gray-500 text-sm">Deixe sua avaliação ou um depoimento sobre o nosso trabalho juntos.</p>

                <div className="flex justify-center gap-1" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onMouseEnter={() => setHover(n)} onClick={() => setRating(n)} aria-label={`${n} estrelas`} className="cursor-pointer">
                      <Star filled={n <= (hover || rating)} className="w-9 h-9 text-amber-400 transition-transform hover:scale-110" />
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  maxLength={60}
                  onChange={(e) => setName(e.target.value)}
                  className="p-3 border border-gray-200 focus:outline-none focus:border-black"
                />
                <textarea
                  placeholder="Escreva seu depoimento (opcional)"
                  value={text}
                  maxLength={600}
                  rows={4}
                  onChange={(e) => setText(e.target.value)}
                  className="p-3 border border-gray-200 focus:outline-none focus:border-black resize-none"
                />
                {/* Honeypot */}
                <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden="true" />

                {error && <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{error}</p>}
                <button type="submit" disabled={sending} className="bg-black text-white p-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer">
                  {sending ? 'Enviando...' : 'Enviar Avaliação'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
