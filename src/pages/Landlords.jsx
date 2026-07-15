import { CheckCircle2 } from 'lucide-react';

export default function Landlords() {
  const topics = [
    { title: 'Disponibilizando seu imóvel', text: 'Avaliação gratuita do valor de locação, feita por profissionais dedicados.' },
    { title: 'Documentos necessários', text: 'Documentos pessoais; título de propriedade (escritura/matrícula/contrato); faturas de água, luz, IPTU e condomínio se houver.' },
    { title: 'Divulgação', text: 'Anúncio detalhado no site e em todas as redes sociais da imobiliária (WhatsApp, Instagram, Facebook).' },
    { title: 'Vistoria', text: 'Imóvel rigorosamente vistoriado, descrito e fotografado em detalhes antes da locação, garantindo a sua preservação.' },
    { title: 'Repasse do aluguel', text: 'Feito com agilidade por depósito bancário ou diretamente no escritório, de 3 a 5 dias úteis.' },
    { title: 'Despesas do imóvel', text: 'Normalmente o inquilino paga aluguel, IPTU, condomínio, água e luz, salvo negociação em contrário.' },
    { title: 'Manutenção', text: 'Proprietário resolve vícios ocultos ou estruturais anteriores à locação; o inquilino arca com os danos de uso contínuo.' },
    { title: 'Reajustes', text: 'Anuais pelo índice IGP-M; negociação livre de descontos ou acréscimos entre as partes.' },
    { title: 'Assessoria jurídica', text: 'Advogado especializado à disposição para despejo, cobrança e ações revisionais de forma ágil.' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 min-h-[60vh]">
      <h1 className="text-3xl font-bold text-marca-primaria mb-6 tracking-widest uppercase border-b-2 border-marca-claro pb-4 text-center md:text-left">Manual do Proprietário</h1>
      <p className="text-xl text-slate-700 mb-10 leading-relaxed font-medium bg-marca-suave p-6 rounded-xl border-l-4 border-marca-primaria shadow-sm">
        Desde 1984 a Casanossa presta serviços de locação e administração de imóveis com agilidade, qualidade e credibilidade.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics.map((topic, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:border-marca-suave transition-colors">
            <CheckCircle2 className="text-marca-secundaria flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{topic.title}</h3>
              <p className="text-slate-600 leading-relaxed">{topic.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
