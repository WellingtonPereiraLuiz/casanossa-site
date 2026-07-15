import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/5569984086548"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-marca-secundaria text-white p-4 rounded-full shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:bg-[#20bd5a] transition-all transform hover:scale-110 z-50 flex items-center justify-center"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}
