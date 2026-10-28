type Testimonial = { _id: string; name: string; rating: number; text?: string };

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="w-full max-w-6xl mx-auto px-6 pb-20 pt-12">
      <div className="text-center mb-12">
        <span className="font-sans text-[11px] tracking-[0.3em] uppercase text-neutral-400 font-semibold block mb-2">
          Depoimentos de Clientes
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-neutral-950">
          Quem já trabalhou comigo
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <div
            key={t._id}
            className="relative bg-gradient-to-b from-white to-neutral-50/70 border border-neutral-100 p-8 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <span className="absolute top-4 right-6 text-6xl font-serif leading-none text-neutral-100 select-none">
              &ldquo;
            </span>
            <div className="flex gap-1 mb-5 text-amber-400" aria-label={`${t.rating} de 5 estrelas`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <svg
                  key={n}
                  className={`w-4 h-4 ${n <= t.rating ? '' : 'text-neutral-200'}`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" />
                </svg>
              ))}
            </div>
            {t.text && (
              <blockquote className="relative font-serif text-lg md:text-xl text-neutral-700 leading-relaxed italic flex-1 mb-6">
                &ldquo;{t.text}&rdquo;
              </blockquote>
            )}
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-900 mt-auto pt-4 border-t border-neutral-100">
              — {t.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
