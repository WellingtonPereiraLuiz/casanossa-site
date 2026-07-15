import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Plus, Edit, Trash2, CheckSquare, Square, ChevronDown, Search, Share2, X, FileText } from 'lucide-react';

export default function PropertiesList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showActions, setShowActions] = useState(false);
  const [activeTab, setActiveTab] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Status Modal
  const [statusModal, setStatusModal] = useState({ open: false, newStatus: '', title: '' });
  const [contractInfo, setContractInfo] = useState({ cliente: '', valor: '', data: '', obs: '' });
  
  // View Contract Modal
  const [viewContractModal, setViewContractModal] = useState({ open: false, data: null });

  async function fetchProperties() {
    setLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('criado_em', { ascending: false });
    
    if (error) console.error(error);
    else setProperties(data || []);
    
    setLoading(false);
  }

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este imóvel permanentemente?')) {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) {
        alert('Erro ao excluir imóvel. Verifique o console.');
        console.error(error);
      } else {
        fetchProperties();
      }
    }
  };
  const filteredProperties = properties.filter(prop => {
    let matchTab = true;
    if (activeTab === 'disponivel') matchTab = prop.status === 'disponivel';
    if (activeTab === 'indisponivel') matchTab = prop.status !== 'disponivel';
    
    if (!matchTab) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (prop.codigo && prop.codigo.toLowerCase().includes(term)) ||
        (prop.titulo && prop.titulo.toLowerCase().includes(term)) ||
        (prop.status && prop.status.toLowerCase().includes(term)) ||
        (prop.preco && prop.preco.toString().includes(term))
      );
    }
    
    return true;
  });

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProperties.length) setSelectedIds([]);
    else setSelectedIds(filteredProperties.map(p => p.id));
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Tem certeza que deseja apagar ${selectedIds.length} imóvel(is)?`)) {
      await supabase.from('properties').delete().in('id', selectedIds);
      setProperties(properties.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      setShowActions(false);
    }
  };

  const openStatusModal = (statusLabel) => {
    setStatusModal({ open: true, newStatus: statusLabel, title: `Marcar selecionados como ${statusLabel.toUpperCase()}` });
    setContractInfo({ cliente: '', valor: '', data: '', obs: '' });
  };

  const handleBulkStatus = async (e) => {
    if (e) e.preventDefault();
    const { newStatus } = statusModal;
    
    const payload = { status: newStatus };
    if (newStatus !== 'disponivel') {
      payload.info_contrato = contractInfo;
    }

    const { error } = await supabase.from('properties').update(payload).in('id', selectedIds);
    if (!error) {
      setProperties(properties.map(p => selectedIds.includes(p.id) ? { ...p, status: newStatus, info_contrato: payload.info_contrato } : p));
    } else {
      console.error(error);
      alert("Erro ao atualizar o status. Verifique se a coluna 'info_contrato' (tipo JSON) existe na tabela 'properties'.");
    }
    setSelectedIds([]);
    setShowActions(false);
    setStatusModal({ open: false, newStatus: '', title: '' });
  };

  const copyShareLink = (prop) => {
    const link = `${window.location.origin}/imovel/${prop.id}`;
    let text = `🏠 *${prop.titulo}*\n\n`;
    text += `📍 *Localização:* ${prop.bairro}, ${prop.cidade} - ${prop.uf}\n`;
    text += `💰 *Valor:* R$ ${new Intl.NumberFormat('pt-BR').format(prop.preco)}\n`;
    if (prop.quartos) text += `🛏️ *Quartos:* ${prop.quartos}\n`;
    if (prop.banheiros) text += `🚿 *Banheiros:* ${prop.banheiros}\n`;
    if (prop.vagas) text += `🚗 *Vagas:* ${prop.vagas}\n`;
    if (prop.area_m2) text += `📏 *Área:* ${prop.area_m2}m²\n`;
    text += `\n*Código:* ${prop.codigo || 'S/N'}\n\n`;
    text += `👉 *Veja mais fotos e detalhes acessando o link abaixo:*\n${link}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Meus Imóveis</h1>
        <Link to="/admin/imoveis/novo" className="bg-marca-primaria hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap">
          <Plus size={20} /> Cadastrar Imóvel
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div className="flex gap-2 bg-white p-2 rounded-lg border border-gray-100 shadow-sm overflow-x-auto w-full md:w-auto">
          <button onClick={() => { setActiveTab('todos'); setSelectedIds([]); }} className={`px-4 py-2 rounded-md font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'todos' ? 'bg-marca-primaria text-white' : 'text-slate-600 hover:bg-gray-100'}`}>Todos</button>
          <button onClick={() => { setActiveTab('disponivel'); setSelectedIds([]); }} className={`px-4 py-2 rounded-md font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'disponivel' ? 'bg-[#25D366] text-white' : 'text-slate-600 hover:bg-gray-100'}`}>Disponíveis</button>
          <button onClick={() => { setActiveTab('indisponivel'); setSelectedIds([]); }} className={`px-4 py-2 rounded-md font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'indisponivel' ? 'bg-slate-500 text-white' : 'text-slate-600 hover:bg-gray-100'}`}>Alugados / Vendidos</button>
        </div>
        
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Buscar (código, título, preço...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria shadow-sm"
          />
          <Search size={18} className="text-gray-400 absolute left-3 top-3" />
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 border-b border-blue-100 p-3 flex justify-between items-center absolute top-0 w-full z-10 animate-fadeIn">
            <span className="text-blue-800 font-bold text-sm">{selectedIds.length} selecionado(s)</span>
            <div className="relative">
              <button onClick={() => setShowActions(!showActions)} className="bg-white border border-blue-200 text-blue-700 px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-blue-100 transition-colors">
                Ações <ChevronDown size={16} />
              </button>
              {showActions && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1">
                  <button onClick={() => { setStatusModal({newStatus: 'disponivel'}); handleBulkStatus(); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-gray-100 font-medium">Marcar como Disponível</button>
                  <button onClick={() => openStatusModal('alugado')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-gray-100 font-medium">Marcar como Alugado</button>
                  <button onClick={() => openStatusModal('vendido')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-gray-100 font-medium border-b border-gray-100">Marcar como Vendido</button>
                  <button onClick={handleBulkDelete} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold">Apagar Selecionados</button>
                </div>
              )}
            </div>
          </div>
        )}
        {loading ? (
          <div className="p-10 text-center text-slate-500 font-bold">Carregando catálogo de imóveis...</div>
        ) : properties.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <p className="text-slate-500 font-medium text-lg mb-4">Nenhum imóvel cadastrado no banco de dados.</p>
            <Link to="/admin/imoveis/novo" className="text-marca-primaria font-bold hover:underline">Cadastre o seu primeiro imóvel</Link>
          </div>
        ) : (
          <div className={`overflow-x-auto ${selectedIds.length > 0 ? 'mt-14' : ''}`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-slate-700 font-bold text-sm">
                  <th className="p-4 w-10">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-marca-primaria">
                      {selectedIds.length > 0 && selectedIds.length === filteredProperties.length ? <CheckSquare size={20} className="text-marca-primaria" /> : <Square size={20} />}
                    </button>
                  </th>
                  <th className="p-4">Cód.</th>
                  <th className="p-4">Título</th>
                  <th className="p-4">Finalidade</th>
                  <th className="p-4">Preço (R$)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-600">
                {filteredProperties.map(prop => (
                  <tr key={prop.id} className={`transition-colors ${selectedIds.includes(prop.id) ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                    <td className="p-4">
                      <button onClick={() => toggleSelect(prop.id)} className="text-slate-400 hover:text-marca-primaria">
                        {selectedIds.includes(prop.id) ? <CheckSquare size={20} className="text-marca-primaria" /> : <Square size={20} />}
                      </button>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-500">{prop.codigo}</td>
                    <td className="p-4 font-bold text-slate-800 max-w-xs truncate" title={prop.titulo}>{prop.titulo}</td>
                    <td className="p-4 uppercase text-xs font-bold tracking-wider">{prop.finalidade}</td>
                    <td className="p-4 font-bold text-marca-primaria">
                      {new Intl.NumberFormat('pt-BR').format(prop.preco)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider text-white ${prop.status === 'disponivel' ? 'bg-[#25D366]' : 'bg-slate-400'}`}>
                        {prop.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        {prop.info_contrato && (
                          <button onClick={() => setViewContractModal({ open: true, data: prop.info_contrato })} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver Informações do Contrato">
                            <FileText size={18} />
                          </button>
                        )}
                        <button onClick={() => copyShareLink(prop)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Compartilhar no WhatsApp">
                          <Share2 size={18} />
                        </button>
                        <Link to={`/admin/imoveis/${prop.id}`} className="p-2 text-marca-primaria hover:bg-marca-claro rounded-lg transition-colors" title="Editar">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => handleDelete(prop.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
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

      {/* Modal de Status/Contrato */}
      {statusModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full relative animate-fadeIn p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">{statusModal.title}</h2>
              <button onClick={() => setStatusModal({ open: false, newStatus: '', title: '' })} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleBulkStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nome do {statusModal.newStatus === 'alugado' ? 'Inquilino' : 'Comprador'} (Opcional)</label>
                <input type="text" value={contractInfo.cliente} onChange={e => setContractInfo({...contractInfo, cliente: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" placeholder="Ex: João da Silva" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Data (Opcional)</label>
                  <input type="date" value={contractInfo.data} onChange={e => setContractInfo({...contractInfo, data: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Valor (Opcional)</label>
                  <input type="text" value={contractInfo.valor} onChange={e => setContractInfo({...contractInfo, valor: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" placeholder="R$" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Observações do Contrato / Detalhes</label>
                <textarea rows="3" value={contractInfo.obs} onChange={e => setContractInfo({...contractInfo, obs: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" placeholder="Nº do contrato, informações de pagamento..."></textarea>
              </div>
              <button type="submit" className="w-full bg-marca-secundaria hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors mt-2">
                Salvar Status e Informações
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualizar Contrato */}
      {viewContractModal.open && viewContractModal.data && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full relative animate-fadeIn p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FileText size={24} className="text-marca-primaria" /> Informações do Contrato</h2>
              <button onClick={() => setViewContractModal({ open: false, data: null })} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Cliente</p>
                <p className="font-bold text-slate-800">{viewContractModal.data.cliente || 'Não informado'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Data</p>
                  <p className="font-medium text-slate-800">{viewContractModal.data.data ? new Date(viewContractModal.data.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'Não informada'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Valor</p>
                  <p className="font-medium text-slate-800">{viewContractModal.data.valor || 'Não informado'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Observações</p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-slate-600 whitespace-pre-wrap text-sm">
                  {viewContractModal.data.obs || 'Nenhuma observação.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
