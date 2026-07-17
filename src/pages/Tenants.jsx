import { useEffect } from 'react';
import { FileText, Home, KeyRound } from 'lucide-react';

export default function Tenants() {
  useEffect(() => {
    document.title = "Casanossa | Inquilino";
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-[60vh]">
      <h1 className="text-3xl font-bold text-marca-primaria mb-10 tracking-widest uppercase border-b-2 border-marca-claro pb-4 max-w-4xl mx-auto text-center md:text-left">Área do Inquilino</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
          <FileText size={48} className="text-marca-primaria mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-gray-100 pb-2">Documentação Necessária</h2>
          <ul className="space-y-4 text-slate-600 mb-6 flex-grow">
            <li className="flex items-start gap-3">
              <span className="text-marca-primaria font-bold text-xl leading-none">•</span> 
              <span>Documentos pessoais (RG, CPF).</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-marca-primaria font-bold text-xl leading-none">•</span> 
              <span>Comprovante de renda atualizado.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-marca-primaria font-bold text-xl leading-none">•</span> 
              <span>Comprovante de residência atual.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-marca-primaria font-bold text-xl leading-none">•</span> 
              <span>Fiador ou Seguro-fiança.</span>
            </li>
          </ul>
          {/* Cliente: Preencher aqui outros documentos específicos se houver (ex: cópia autenticada, certidões negativas) */}
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
          <Home size={48} className="text-marca-primaria mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-gray-100 pb-2">Manual do Inquilino</h2>
          <p className="text-slate-600 mb-6 font-medium">
            Direitos e deveres durante a vigência do contrato:
          </p>
          <ul className="space-y-4 text-slate-600 flex-grow">
            <li className="flex items-start gap-3">
              <span className="text-marca-primaria font-bold text-xl leading-none">•</span> 
              <span>Pagamentos em dia de taxas e aluguéis.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-marca-primaria font-bold text-xl leading-none">•</span> 
              <span>Reparos e manutenções de uso diário.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-marca-primaria font-bold text-xl leading-none">•</span> 
              <span>Regras do condomínio (se aplicável).</span>
            </li>
          </ul>
          {/* Cliente: O manual completo poderá ser disponibilizado para download em PDF futuramente */}
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
          <KeyRound size={48} className="text-marca-primaria mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-gray-100 pb-2">Desocupação do Imóvel</h2>
          <p className="text-slate-600 mb-6 font-medium">
            Passos simples para o encerramento do contrato:
          </p>
          <ul className="space-y-4 text-slate-600 flex-grow">
            <li className="flex items-start gap-3">
              <span className="text-marca-primaria font-bold text-xl leading-none">•</span> 
              <span>Emitir aviso prévio de desocupação de 30 dias.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-marca-primaria font-bold text-xl leading-none">•</span> 
              <span>Solicitar a vistoria de saída.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-marca-primaria font-bold text-xl leading-none">•</span> 
              <span>Entrega final das chaves após os reparos exigidos.</span>
            </li>
          </ul>
          {/* Cliente: Adicionar aqui link/formulário de solicitação de desocupação se desejar automatizar */}
        </div>

      </div>
    </div>
  );
}
