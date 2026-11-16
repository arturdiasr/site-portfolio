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
  title,
  downloadUrl,
  coverImageUrl,
}: {
  title?: string;
  downloadUrl: string | null;
  coverImageUrl?: string | null;
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
    setTimeout(() => setShowReview(true), 1200);
  };

  const handleCopyLink = async () => {
    const target = downloadUrl || window.location.href;
    await navigator.clipboard.writeText(target);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : downloadUrl || '';
    const message = title
      ? `Confira as fotos de "${title}" por Artur Dias Fotografia: ${pageUrl}`
      : `Confira as fotos prontas por Artur Dias Fotografia: ${pageUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );
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
      <div className="max-w-xl mx-auto text-center bg-white shadow-xl border border-neutral-100 overflow-hidden">
        {/* Banner Cinematográfico Comemorativo (se houver capa) */}
        {coverImageUrl && (
          <div className="relative w-full aspect-[16/9] bg-neutral-100 overflow-hidden">
            <img
              src={coverImageUrl}
              alt={title || 'Capa da entrega'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center p-5">
              <span className="text-[10px] uppercase tracking-[0.28em] text-white/90 font-bold bg-black/40 backdrop-blur-md px-3 py-1 rounded-xs border border-white/15">
                Arquivos Finais Prontos
              </span>
            </div>
          </div>
        )}

        <div className="p-8 sm:p-10 md:p-12">
          {/* Ícone Vetorial Minimalista de Entrega (exibido quando não há banner de capa) */}
          {!coverImageUrl && (
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-900">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </div>
          )}

          <h2 className="text-xl font-bold uppercase tracking-widest mb-3">Suas memórias estão prontas!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">
            Foi uma alegria registrar esse momento. Clique abaixo para acessar e baixar todas as fotos em máxima resolução.
          </p>

          <button
            onClick={handleDownload}
            className="w-full bg-black text-white p-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            Baixar Fotos em Alta Resolução
          </button>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full border border-gray-200 text-gray-700 p-3.5 text-xs font-bold uppercase tracking-widest hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-600">Link Copiado!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar Link
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full border border-gray-200 text-gray-700 p-3.5 text-xs font-bold uppercase tracking-widest hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Compartilhar
            </button>
          </div>

          {/* Dica de Preservação */}
          <div className="mt-8 pt-6 border-t border-neutral-100 text-left flex items-start gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 shrink-0 mt-0.5">
              Dica:
            </span>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Para preservar suas fotografias por muitos anos, recomendamos salvar uma cópia no seu computador e outra em nuvem (Google Drive ou iCloud).
            </p>
          </div>

          {!showReview && !done && (
            <button
              onClick={() => setShowReview(true)}
              className="mt-6 text-xs uppercase tracking-widest text-gray-500 hover:text-black font-semibold underline underline-offset-4 transition-colors cursor-pointer"
            >
              Avaliar meu trabalho
            </button>
          )}
        </div>
      </div>

      {showReview && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowReview(false)}
        >
          <div
            className="bg-white max-w-md w-full p-8 md:p-10 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowReview(false)}
              className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-black cursor-pointer"
              aria-label="Fechar"
            >
              &times;
            </button>

            {done ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-900">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold uppercase tracking-widest mb-2">Muito obrigado!</h3>
                <p className="text-gray-500 text-sm">Sua avaliação foi enviada e significa muito para mim.</p>
              </div>
            ) : (
              <form onSubmit={submitReview} className="flex flex-col gap-4 text-center">
                <h3 className="text-xl font-bold uppercase tracking-widest">Como foi a experiência?</h3>
                <p className="text-gray-500 text-sm">
                  Deixe sua avaliação ou um depoimento sobre o nosso trabalho juntos.
                </p>

                <div className="flex justify-center gap-1" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onMouseEnter={() => setHover(n)}
                      onClick={() => setRating(n)}
                      aria-label={`${n} estrelas`}
                      className="cursor-pointer"
                    >
                      <Star
                        filled={n <= (hover || rating)}
                        className="w-9 h-9 text-amber-400 transition-transform hover:scale-110"
                      />
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
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="hidden"
                  aria-hidden="true"
                />

                {error && <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{error}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-black text-white p-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
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
