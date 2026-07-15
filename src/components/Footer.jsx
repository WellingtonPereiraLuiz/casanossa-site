export default function Footer() {
  return (
    <footer className="bg-marca-escuro text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <img src="/logo.jpeg" alt="Casanossa Imobiliária" className="h-10 w-auto mb-4 object-contain opacity-90" />
          <p className="text-gray-300 mb-2 font-medium">Desde 1984</p>
          <p className="text-gray-300 text-sm">CRECI: J-XXXX</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-marca-claro tracking-widest">CONTATO</h3>
          <p className="text-gray-300 text-sm mb-2">Ariquemes / RO</p>
          <p className="text-gray-300 text-sm mb-2">Endereço da Imobiliária, Centro</p>
          <p className="text-gray-300 text-sm mb-2">Telefone: (69) 3535-0000</p>
          <p className="text-gray-300 text-sm">E-mail: contato@casanossa.com.br</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-marca-claro tracking-widest">REDES SOCIAIS</h3>
          <div className="flex flex-col space-y-2">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
              Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
              Facebook
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
