import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Home, Users, CheckCircle, TrendingUp, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalImoveis: 0,
    leads: 0,
    disponiveis: 0,
    alugados: 0,
    visitasHoje: 0,
    visitasTotal: 0
  });
  
  const [recentes, setRecentes] = useState([]);
  const [topImoveis, setTopImoveis] = useState([]);

  useEffect(() => {
    async function loadData() {
      // Contagens
      const { count: totalImoveis } = await supabase.from('properties').select('*', { count: 'exact', head: true });
      const { count: leads } = await supabase.from('leads').select('*', { count: 'exact', head: true });
      const { count: disponiveis } = await supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'disponivel');
      
      // Visitas
      const { count: visitasTotal } = await supabase.from('page_views').select('*', { count: 'exact', head: true });
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const { count: visitasHoje } = await supabase.from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('criado_em', hoje.toISOString());

      setStats({
        totalImoveis: totalImoveis || 0,
        leads: leads || 0,
        disponiveis: disponiveis || 0,
        alugados: (totalImoveis || 0) - (disponiveis || 0),
        visitasHoje: visitasHoje || 0,
        visitasTotal: visitasTotal || 0
      });

      // Últimos 5 imóveis
      const { data: ultimos } = await supabase
        .from('properties')
        .select('id, codigo, titulo, preco, status')
        .order('criado_em', { ascending: false })
        .limit(5);
      setRecentes(ultimos || []);

      // Top Imóveis (Simplificado - SQL manual seria ideal, mas fazemos em JS pra facilitar)
      // Como não temos RPC, vamos pegar as page views recentes que tem property_id
      const { data: views } = await supabase.from('page_views').select('property_id').not('property_id', 'is', null);
      if (views) {
        const contagem = {};
        views.forEach(v => {
          contagem[v.property_id] = (contagem[v.property_id] || 0) + 1;
        });
        const topIds = Object.keys(contagem).sort((a, b) => contagem[b] - contagem[a]).slice(0, 5);
        
        if (topIds.length > 0) {
          const { data: topProps } = await supabase.from('properties').select('id, titulo, codigo').in('id', topIds);
          if (topProps) {
            // Reordenar pelos mais vistos
            const ordenados = topProps.map(p => ({...p, views: contagem[p.id]})).sort((a,b) => b.views - a.views);
            setTopImoveis(ordenados);
          }
        }
      }
    }
    loadData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Dashboard Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        
        <div className="bg-gradient-to-br from-marca-primaria to-blue-800 p-6 rounded-xl shadow-lg flex items-center gap-4 text-white">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <Eye size={28} />
          </div>
          <div>
            <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Visitas Hoje</p>
            <p className="text-3xl font-black">{stats.visitasHoje}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Acessos</p>
            <p className="text-2xl font-black text-slate-800">{stats.visitasTotal}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-marca-primaria flex items-center justify-center">
            <Home size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Imóveis Ativos</p>
            <p className="text-2xl font-black text-slate-800">{stats.disponiveis} <span className="text-sm text-slate-400 font-medium">de {stats.totalImoveis}</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Leads & Contatos</p>
            <p className="text-2xl font-black text-slate-800">{stats.leads}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Mais Vistos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><TrendingUp size={20} className="text-marca-primaria" /> Imóveis Mais Visualizados</h2>
          {topImoveis.length === 0 ? (
             <p className="text-slate-500 text-center py-8">Nenhum dado de acesso suficiente ainda.</p>
          ) : (
             <ul className="space-y-4">
               {topImoveis.map((imovel, i) => (
                 <li key={imovel.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                   <div className="flex items-center gap-4">
                     <span className="font-black text-2xl text-slate-300 w-6">{i + 1}</span>
                     <div>
                       <p className="font-bold text-slate-800 line-clamp-1">{imovel.titulo}</p>
                       <p className="text-xs text-slate-500 font-mono">Cód: {imovel.codigo}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                     <Eye size={16} className="text-marca-primaria" />
                     <span className="font-bold text-slate-700 text-sm">{imovel.views}</span>
                   </div>
                 </li>
               ))}
             </ul>
          )}
        </div>

        {/* Últimos Cadastros */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Home size={20} className="text-marca-primaria" /> Últimos Imóveis Cadastrados</h2>
            <Link to="/admin/imoveis" className="text-sm font-bold text-marca-primaria hover:underline">Ver todos</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-slate-700 font-bold text-sm">
                  <th className="p-3">Cód.</th>
                  <th className="p-3">Título</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-600">
                {recentes.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-slate-500 font-medium">Nenhum imóvel cadastrado.</td>
                  </tr>
                ) : (
                  recentes.map(prop => (
                    <tr 
                      key={prop.id} 
                      onClick={() => navigate(`/admin/imoveis/${prop.id}`)}
                      className="hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Clique para editar este imóvel"
                    >
                      <td className="p-3 font-mono font-bold text-slate-500">{prop.codigo}</td>
                      <td className="p-3 font-bold text-slate-800 max-w-[200px] truncate">{prop.titulo}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider text-white ${prop.status === 'disponivel' ? 'bg-[#25D366]' : 'bg-slate-400'}`}>
                          {{ disponivel: 'Disponível', alugado: 'Alugado', vendido: 'Vendido' }[prop.status] || prop.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
