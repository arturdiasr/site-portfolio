type Testimonial = { _id: string; name: string; rating: number; text?: string };

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="w-full max-w-6xl mx-auto px-6 pb-24 pt-4">
      <h2 className="text-center text-2xl md:text-3xl font-extrabold tracking-tighter uppercase mb-2">Quem já trabalhou comigo</h2>
      <p className="text-center text-xs tracking-widest uppercase text-gray-400 mb-10">Depoimentos de clientes</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <div
            key={t._id}
            className="relative bg-gradient-to-b from-white to-gray-50 border border-gray-100 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <span className="absolute top-3 right-5 text-6xl font-serif leading-none text-gray-100 select-none">&ldquo;</span>
            <div className="flex gap-0.5 mb-4 text-amber-400" aria-label={`${t.rating} de 5 estrelas`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <svg key={n} className={`w-5 h-5 ${n <= t.rating ? '' : 'text-gray-200'}`} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" />
                </svg>
              ))}
            </div>
            {t.text && <p className="relative text-gray-600 text-sm leading-relaxed italic flex-1 mb-5">{t.text}</p>}
            <p className="text-xs font-bold uppercase tracking-widest text-gray-900 mt-auto">— {t.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
