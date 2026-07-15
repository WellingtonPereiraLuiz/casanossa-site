import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BedDouble, Bath, Car, Ruler, MapPin } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function PropertiesListing() {
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    finalidade: location.state?.finalidade || '',
    categoria: '',
    tipo: location.state?.tipo || '',
    bairro: location.state?.bairro || '',
    minPrice: '',
    maxPrice: '',
    quartos: '',
    banheiros: '',
    vagas: ''
  });

  useEffect(() => {
    async function loadProperties() {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id, titulo, preco, finalidade, categoria, tipo, bairro, cidade, uf, quartos, banheiros, vagas, area_m2, status,
          property_images(url, posicao)
        `)
        .eq('status', 'disponivel')
        .order('criado_em', { ascending: false });

      if (data) {
        const formatados = data.map(p => {
          const imgs = p.property_images?.sort((a, b) => a.posicao - b.posicao) || [];
          return { ...p, image: imgs.length > 0 ? imgs[0].url : 'https://placehold.co/600x400?text=Sem+Foto' };
        });
        setProperties(formatados);
      }
      setLoading(false);
    }
    loadProperties();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredProperties = properties.filter(prop => {
    if (filters.finalidade && prop.finalidade !== filters.finalidade) return false;
    if (filters.categoria && prop.categoria !== filters.categoria) return false;
    if (filters.tipo && prop.tipo.toLowerCase() !== filters.tipo.toLowerCase()) return false;
    if (filters.bairro && prop.bairro.toLowerCase() !== filters.bairro.toLowerCase()) return false;
    if (filters.quartos && prop.quartos < parseInt(filters.quartos)) return false;
    if (filters.banheiros && prop.banheiros < parseInt(filters.banheiros)) return false;
    if (filters.vagas && prop.vagas < parseInt(filters.vagas)) return false;
    if (filters.minPrice && prop.preco < parseInt(filters.minPrice)) return false;
    if (filters.maxPrice && prop.preco > parseInt(filters.maxPrice)) return false;
    return true;
  });

  const uniqueBairros = [...new Set(properties.map(p => p.bairro))].filter(Boolean);
  const uniqueTipos = [...new Set(properties.map(p => p.tipo))].filter(Boolean);
  const uniqueCategorias = [...new Set(properties.map(p => p.categoria))].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-marca-primaria mb-8 tracking-widest uppercase border-b-2 border-marca-claro pb-4">
        {filters.finalidade === 'venda' ? 'Imóveis à Venda' : filters.finalidade === 'locacao' ? 'Imóveis para Locação' : 'Nossos Imóveis'}
      </h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de Filtros */}
        <aside className="w-full lg:w-1/4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-lg font-bold text-slate-800 mb-4 tracking-wide">Busca Avançada</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Finalidade</label>
                <select name="finalidade" onChange={handleFilterChange} className="w-full p-2 border border-gray-200 rounded text-slate-700 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria">
                  <option value="">Todas</option>
                  <option value="venda">Venda</option>
                  <option value="locacao">Locação</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select name="categoria" onChange={handleFilterChange} className="w-full p-2 border border-gray-200 rounded text-slate-700 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria">
                  <option value="">Todas</option>
                  {uniqueCategorias.map((c, i) => (
                    <option key={i} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select name="tipo" onChange={handleFilterChange} className="w-full p-2 border border-gray-200 rounded text-slate-700 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria">
                  <option value="">Todos</option>
                  {uniqueTipos.map((t, i) => (
                    <option key={i} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                <select name="bairro" onChange={handleFilterChange} className="w-full p-2 border border-gray-200 rounded text-slate-700 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria">
                  <option value="">Todos</option>
                  {uniqueBairros.map((b, i) => (
                    <option key={i} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço Mín.</label>
                  <input type="number" name="minPrice" onChange={handleFilterChange} placeholder="R$ 0" className="w-full p-2 border border-gray-200 rounded text-slate-700 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço Máx.</label>
                  <input type="number" name="maxPrice" onChange={handleFilterChange} placeholder="R$ 0" className="w-full p-2 border border-gray-200 rounded text-slate-700 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" title="Quartos Mínimos">Qts.</label>
                  <select name="quartos" onChange={handleFilterChange} className="w-full p-2 border border-gray-200 rounded text-slate-700 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria">
                    <option value="">Indif.</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" title="Banheiros Mínimos">Banh.</label>
                  <select name="banheiros" onChange={handleFilterChange} className="w-full p-2 border border-gray-200 rounded text-slate-700 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria">
                    <option value="">Indif.</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" title="Vagas Mínimas">Vagas</label>
                  <select name="vagas" onChange={handleFilterChange} className="w-full p-2 border border-gray-200 rounded text-slate-700 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria">
                    <option value="">Indif.</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Grid de Resultados */}
        <div className="w-full lg:w-3/4">
          <div className="mb-4 text-slate-600 font-medium">
            Encontramos <span className="text-marca-primaria font-bold">{loading ? '...' : filteredProperties.length}</span> imóvel(is).
          </div>

          {loading ? (
             <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center text-slate-500 font-bold">
               Buscando imóveis no banco de dados...
             </div>
          ) : filteredProperties.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center">
              <p className="text-xl text-slate-500 mb-4">Nenhum imóvel encontrado com esses filtros.</p>
              <button onClick={() => window.location.reload()} className="text-marca-primaria font-bold underline hover:text-blue-800">Limpar filtros</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProperties.map(prop => (
                <Link key={prop.id} to={`/imovel/${prop.id}`} className="group bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1 block">
                  <div className="relative h-60 overflow-hidden bg-gray-200">
                    <img src={prop.image} alt={prop.titulo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute top-4 left-4 bg-marca-primaria text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider shadow">
                      {prop.finalidade}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-sm text-gray-500 mb-1 font-medium flex items-center gap-1">
                      <MapPin size={14} /> {prop.bairro}, {prop.cidade}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-marca-primaria transition-colors">{prop.titulo}</h3>
                    <p className="text-marca-primaria font-bold text-2xl mb-4">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prop.preco)}
                      {prop.finalidade === 'locacao' && <span className="text-sm text-gray-500 font-normal"> /mês</span>}
                    </p>
                    
                    <div className="flex items-center justify-between text-slate-600 text-sm border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-1" title="Quartos"><BedDouble size={18} className="text-gray-400" /> {prop.quartos}</div>
                      <div className="flex items-center gap-1" title="Banheiros"><Bath size={18} className="text-gray-400" /> {prop.banheiros}</div>
                      <div className="flex items-center gap-1" title="Vagas"><Car size={18} className="text-gray-400" /> {prop.vagas}</div>
                      <div className="flex items-center gap-1" title="Área"><Ruler size={18} className="text-gray-400" /> {prop.area_m2}m²</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
