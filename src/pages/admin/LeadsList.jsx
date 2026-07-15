import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Trash2, X, Phone, Copy, CheckSquare, Square, ChevronDown, MailOpen, Mail } from 'lucide-react';

export default function LeadsList() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('leadsActiveTab') || 'novos');
  const [showFullMessage, setShowFullMessage] = useState(false);

  useEffect(() => {
    localStorage.setItem('leadsActiveTab', activeTab);
  }, [activeTab]);
  
  // Seleção em massa
  const [selectedIds, setSelectedIds] = useState([]);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('criado_em', { ascending: false });
    
    if (error) console.error(error);
    else setLeads(data || []);
    
    setLoading(false);
  }

  // Se 'status' não existir na tabela, consideramos como 'novo' por padrão (tratamento de segurança)
  const filteredLeads = leads.filter(l => {
    const s = l.status || 'novo';
    return activeTab === 'novos' ? s === 'novo' : s === 'lido';
  });

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) setSelectedIds([]);
    else setSelectedIds(filteredLeads.map(l => l.id));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja apagar este lead? Esta ação não pode ser desfeita.')) {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) {
        alert("Erro ao excluir no banco de dados. Verifique as permissões (RLS) no Supabase.");
        console.error(error);
        return;
      }
      setLeads(leads.filter(l => l.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Tem certeza que deseja apagar ${selectedIds.length} lead(s)?`)) {
      const { error } = await supabase.from('leads').delete().in('id', selectedIds);
      if (error) {
        alert("Erro ao excluir no banco de dados. Verifique as permissões (RLS) no Supabase.");
        console.error(error);
        return;
      }
      setLeads(leads.filter(l => !selectedIds.includes(l.id)));
      setSelectedIds([]);
      setShowActions(false);
    }
  };

  const handleBulkStatus = async (novoStatus) => {
    const { error } = await supabase.from('leads').update({ status: novoStatus }).in('id', selectedIds);
    if (!error) {
      setLeads(leads.map(l => selectedIds.includes(l.id) ? { ...l, status: novoStatus } : l));
    } else {
      console.error(error);
      alert("Erro ao atualizar. Você criou a coluna 'status' (tipo texto) na tabela 'leads' no Supabase?");
    }
    setSelectedIds([]);
    setShowActions(false);
  };

  const handleViewLead = async (lead) => {
    setSelectedLead(lead);
    if (lead.status !== 'lido') {
      const { error } = await supabase.from('leads').update({ status: 'lido' }).eq('id', lead.id);
      if (!error) {
        setLeads(prevLeads => prevLeads.map(l => l.id === lead.id ? { ...l, status: 'lido' } : l));
      }
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert('Texto copiado!');
  };

  const openWhatsApp = (telefone) => {
    const limpo = telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${limpo}?text=Olá, vi que você entrou em contato pelo site da Casanossa. Como posso ajudar?`, '_blank');
  };



  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Leads & Contatos</h1>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white p-2 rounded-lg border border-gray-100 shadow-sm w-fit">
        <button onClick={() => { setActiveTab('novos'); setSelectedIds([]); }} className={`px-4 py-2 rounded-md font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'novos' ? 'bg-marca-primaria text-white' : 'text-slate-600 hover:bg-gray-100'}`}><Mail size={16} /> Novos</button>
        <button onClick={() => { setActiveTab('lidos'); setSelectedIds([]); }} className={`px-4 py-2 rounded-md font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'lidos' ? 'bg-slate-500 text-white' : 'text-slate-600 hover:bg-gray-100'}`}><MailOpen size={16} /> Lidos / Respondidos</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
        
        {/* Barra de Ações em Massa */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 border-b border-blue-100 p-3 flex justify-between items-center absolute top-0 w-full z-10 animate-fadeIn">
            <span className="text-blue-800 font-bold text-sm">{selectedIds.length} selecionado(s)</span>
            <div className="relative">
              <button onClick={() => setShowActions(!showActions)} className="bg-white border border-blue-200 text-blue-700 px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-blue-100 transition-colors">
                Ações <ChevronDown size={16} />
              </button>
              {showActions && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1">
                  <button onClick={() => handleBulkStatus('lido')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-gray-100 font-medium">Marcar como Lido</button>
                  <button onClick={() => handleBulkStatus('novo')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-gray-100 font-medium border-b border-gray-100">Marcar como Novo</button>
                  <button onClick={handleBulkDelete} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold">Apagar Selecionados</button>
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-slate-500 font-bold">Carregando contatos...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-medium mt-10">Nenhum contato nesta lista.</div>
        ) : (
          <div className="overflow-x-auto mt-14">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-slate-700 font-bold text-sm">
                  <th className="p-4 w-10">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-marca-primaria">
                      {selectedIds.length > 0 && selectedIds.length === filteredLeads.length ? <CheckSquare size={20} className="text-marca-primaria" /> : <Square size={20} />}
                    </button>
                  </th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Telefone</th>
                  <th className="p-4">Mensagem</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-600">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className={`transition-colors ${selectedIds.includes(lead.id) ? 'bg-blue-50/50' : 'hover:bg-gray-50'} ${lead.status !== 'lido' ? 'font-medium' : ''}`}>
                    <td className="p-4">
                      <button onClick={() => toggleSelect(lead.id)} className="text-slate-400 hover:text-marca-primaria">
                        {selectedIds.includes(lead.id) ? <CheckSquare size={20} className="text-marca-primaria" /> : <Square size={20} />}
                      </button>
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(lead.criado_em).toLocaleDateString('pt-BR')} <br/>
                      <span className="text-xs">{new Date(lead.criado_em).toLocaleTimeString('pt-BR')}</span>
                    </td>
                    <td className="p-4 text-slate-800 max-w-[150px]">
                      <div className={`truncate ${lead.status !== 'lido' ? 'font-bold' : ''}`} title={lead.nome}>{lead.nome}</div>
                      <div className="text-xs text-slate-500 truncate" title={lead.email}>{lead.email}</div>
                    </td>
                    <td className="p-4">{lead.telefone}</td>
                    <td className="p-4 text-sm max-w-[200px] truncate text-slate-500">
                      {lead.mensagem}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewLead(lead)}
                          className="bg-gray-100 hover:bg-gray-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                        >
                          Ver Detalhes
                        </button>
                        <button 
                          onClick={() => handleDelete(lead.id)}
                          className="bg-red-50 text-red-600 p-2 rounded hover:bg-red-100 transition-colors"
                          title="Apagar Lead"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Visualização */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full relative animate-fadeIn flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-slate-800">Detalhes do Contato</h2>
              <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nome</p>
                  <p className="font-medium text-slate-800 break-words">{selectedLead.nome}</p>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Telefone</p>
                    <button onClick={() => copyText(selectedLead.telefone)} className="text-xs text-marca-primaria font-bold hover:underline flex items-center gap-1" title="Copiar Telefone">
                      <Copy size={12} /> Copiar
                    </button>
                  </div>
                  <p className="font-medium text-slate-800 truncate">{selectedLead.telefone}</p>
                </div>
                {selectedLead.email && (
                  <div className="col-span-2 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">E-mail</p>
                      <button onClick={() => copyText(selectedLead.email)} className="text-xs text-marca-primaria font-bold hover:underline flex items-center gap-1" title="Copiar E-mail">
                        <Copy size={12} /> Copiar
                      </button>
                    </div>
                    <p className="font-medium text-slate-800 break-all">{selectedLead.email}</p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mensagem</p>
                  <button onClick={() => copyText(selectedLead.mensagem)} className="text-xs text-marca-primaria font-bold hover:underline flex items-center gap-1">
                    <Copy size={14} /> Copiar texto
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-slate-600 whitespace-pre-wrap break-words relative">
                  <div className={!showFullMessage && selectedLead.mensagem.length > 250 ? "max-h-[120px] overflow-hidden" : ""}>
                    {selectedLead.mensagem}
                  </div>
                  {!showFullMessage && selectedLead.mensagem.length > 250 && (
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-50 to-transparent flex items-end justify-center pb-1">
                      <button onClick={() => setShowFullMessage(true)} className="text-xs font-bold text-marca-primaria bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
                        Ver mais
                      </button>
                    </div>
                  )}
                  {showFullMessage && (
                    <div className="mt-4 text-center">
                      <button onClick={() => setShowFullMessage(false)} className="text-xs font-bold text-slate-500 hover:text-marca-primaria">
                        Ver menos
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex gap-4 shrink-0">
              <button 
                onClick={() => openWhatsApp(selectedLead.telefone)}
                className="flex-1 bg-[#25D366] hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <Phone size={18} /> Responder via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
