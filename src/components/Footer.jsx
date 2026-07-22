export default function Footer() {
  return (
    <footer className="bg-marca-escuro text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="bg-white p-3 rounded-2xl shadow-lg inline-block mb-6 ring-4 ring-marca-claro/20 transition-transform hover:scale-105">
            <img src="/logo.png" alt="Casanossa Imobiliária" className="h-20 w-auto object-contain" />
          </div>
          <p className="text-gray-300 mb-2 font-medium">Desde 1984</p>
          <p className="text-gray-300 text-sm">CRECI: J-3825 / F-0942</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-marca-claro tracking-widest">CONTATO</h3>
          <p className="text-gray-300 text-sm mb-2">Ariquemes / RO</p>
          <p className="text-gray-300 text-sm mb-2">Travessa Violeta, 3861, Setor 04 - Ariquemes/RO</p>
          <p className="text-gray-300 text-sm mb-2">Telefone: (69) 3535-7090</p>
          <p className="text-gray-300 text-sm mb-2">WhatsApp: (69) 9.8408-6548</p>
          <p className="text-gray-300 text-sm">E-mail: casanossa_imobiliaria@hotmail.com</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-marca-claro tracking-widest">REDES SOCIAIS</h3>
          <div className="flex flex-col space-y-2">
            <a href="https://instagram.com/imobiliariacasanossa" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
              Instagram
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-700 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Casanossa Imobiliária. Todos os direitos reservados.
      </div>
    </footer>
  );
}
