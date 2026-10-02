export default function WhatsAppWidget() {
  const whatsappLink = "https://wa.me/5561991071783?text=Ol%C3%A1%2C%20Artur!%20Gostaria%20de%20conversar%20sobre%20o%20seu%20trabalho%20de%20fotografia.";
  
  return (
    <a 
      href={whatsappLink} 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 group flex items-end gap-3"
    >
      {/* Balão de Mensagem */}
      <div className="bg-white/80 backdrop-blur-md px-5 py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 transition-all duration-500 transform group-hover:-translate-y-2 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
        <p className="text-sm text-black font-semibold tracking-wide">
          Vamos conversar?
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Me chame no WhatsApp
        </p>
      </div>

      {/* Círculo com a Foto */}
      <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
        <img 
          src="/artur_perfil.jpg" 
          alt="Artur Dias Fotografia" 
          className="w-full h-full object-cover object-[center_25%]"
        />
      </div>
    </a>
  );
}
