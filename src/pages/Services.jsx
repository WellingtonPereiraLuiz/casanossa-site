import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Key, LineChart } from 'lucide-react';

export default function Services() {
  useEffect(() => {
    document.title = "Casanossa | Serviços";
  }, []);

  const servicesList = [
    {
      title: 'Manual do Proprietário',
      icon: <Key size={48} className="text-marca-primaria mb-4" />,
      description: 'Conheça nossos serviços de administração e locação de imóveis e veja as vantagens de ser nosso cliente.',
      link: '/proprietarios',
      linkText: 'Acessar Manual'
    },
    {
      title: 'Área do Inquilino',
      icon: <UserCheck size={48} className="text-marca-primaria mb-4" />,
      description: 'Documentação necessária, direitos, deveres e informações úteis para quem vai alugar um imóvel conosco.',
      link: '/inquilino',
      linkText: 'Acessar Área'
    },
    {
      title: 'Avaliação de Imóvel',
      icon: <LineChart size={48} className="text-marca-primaria mb-4" />,
      description: 'Saiba quanto vale o seu imóvel. Realizamos avaliações técnicas precisas para diversos tipos de propriedades.',
      link: '/avaliacao',
      linkText: 'Saiba Mais'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 min-h-[60vh]">
      <h1 className="text-3xl font-bold text-marca-primaria mb-4 tracking-widest uppercase text-center border-b-2 border-marca-claro pb-4 max-w-2xl mx-auto">Nossos Serviços</h1>
      <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto text-lg">Oferecemos soluções completas em negócios imobiliários com tradição e segurança desde 1984.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {servicesList.map((service, idx) => (
          <div key={idx} className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-2 text-center flex flex-col items-center">
            {service.icon}
            <h2 className="text-2xl font-bold text-slate-800 mb-4">{service.title}</h2>
            <p className="text-slate-600 mb-8 flex-grow leading-relaxed">{service.description}</p>
            <Link to={service.link} className="bg-marca-claro text-marca-primaria hover:bg-marca-primaria hover:text-white font-bold py-4 px-6 rounded-lg transition-colors w-full border border-marca-suave">
              {service.linkText}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
