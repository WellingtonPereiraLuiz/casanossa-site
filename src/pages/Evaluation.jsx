import { LineChart, MessageCircle, HelpCircle } from 'lucide-react';

export default function Evaluation() {
  const wppText = "Olá! Gostaria de solicitar uma avaliação técnica do meu imóvel. Como funciona?";
  const wppLink = `https://wa.me/5569984086548?text=${encodeURIComponent(wppText)}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 min-h-[60vh]">
      {/* Banner */}
      <div className="bg-marca-escuro text-white rounded-2xl p-10 mb-12 text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-marca-escuro to-marca-primaria opacity-90 z-0"></div>
        <div className="relative z-10 py-4">
          <LineChart size={72} className="mx-auto mb-6 text-marca-claro opacity-80" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md tracking-wide">Você sabe quanto vale seu imóvel?</h1>
          <p className="text-xl text-gray-200 font-medium">A importância de uma avaliação técnica e precisa para o seu patrimônio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-7 space-y-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-marca-primaria mb-8 flex items-center gap-3 border-b border-gray-100 pb-4"><HelpCircle size={28} /> Perguntas Frequentes</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-bold text-slate-800 text-lg mb-2">O que é o serviço?</h3>
                <p className="text-slate-600">É a determinação técnica e criteriosa do valor de mercado do seu patrimônio.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-bold text-slate-800 text-lg mb-2">Qual o objetivo?</h3>
                <p className="text-slate-600">Garantir um preço justo e realista, seja para venda, locação, partilha de bens ou financiamento, evitando prejuízos.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-bold text-slate-800 text-lg mb-2">Que tipos de imóveis avaliamos?</h3>
                <ul className="list-disc pl-5 text-slate-600 space-y-1">
                  <li>Imóveis residenciais, comerciais e industriais.</li>
                  <li>Terrenos e glebas urbanas.</li>
                  <li>Imóveis rurais e chácaras.</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-bold text-slate-800 text-lg mb-2">O que o avaliador precisa conhecer?</h3>
                <p className="text-slate-600">O perito examina a localização, infraestrutura, tamanho, estado de conservação, tendências do mercado local e documentação.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-bold text-slate-800 text-lg mb-2">Qual o melhor método?</h3>
                <p className="text-slate-600">Utilizamos predominantemente o Método Comparativo Direto de Dados de Mercado, analisando propriedades semelhantes na mesma região.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-bold text-slate-800 text-lg mb-2">Por que contratar um perito?</h3>
                <p className="text-slate-600">Apenas um perito habilitado pelo CNAI pode emitir o PTAM (Parecer Técnico de Avaliação Mercadológica), um documento com validade legal inclusive em processos judiciais.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 space-y-8">
          <div className="bg-marca-claro p-8 rounded-xl border border-marca-suave text-center sticky top-24">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Assinatura Técnica</h3>
            <div className="bg-white p-8 rounded-xl shadow-md border-2 border-marca-suave mb-8">
              <p className="text-2xl font-extrabold text-marca-escuro mb-1">Claus Agorreta Lima</p>
              <p className="text-marca-primaria font-bold text-lg">Perito Avaliador Imobiliário</p>
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-1">
                <p className="text-slate-600 font-medium">CNAI - 5507</p>
                <p className="text-slate-600 font-medium">CRECI - F-0942</p>
              </div>
            </div>

            <a href={wppLink} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-3 bg-marca-secundaria hover:bg-[#20bd5a] text-white font-bold py-5 rounded-xl transition-all text-xl shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-lg hover:-translate-y-1">
              <MessageCircle size={28} /> Solicitar Avaliação
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
