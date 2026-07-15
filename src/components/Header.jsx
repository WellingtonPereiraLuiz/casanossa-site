import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  const links = [
    { to: '/', label: 'Início' },
    { to: '/imoveis', label: 'Imóveis' },
    { to: '/servicos', label: 'Serviços' },
    { to: '/contato', label: 'Contato' },
  ];

  return (
    <header className="fixed w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/">
              <img src="/logo.jpeg" alt="Casanossa Imobiliária" className="h-12 w-auto object-contain" />
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {links.map((link, idx) => (
              <Link key={idx} to={link.to} state={link.state} className="text-slate-600 hover:text-marca-primaria font-medium transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="text-slate-600 hover:text-marca-primaria focus:outline-none">
              {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-inner">
            {links.map((link, idx) => (
              <Link 
                key={idx} 
                to={link.to}
                state={link.state}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-marca-primaria hover:bg-marca-claro"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
