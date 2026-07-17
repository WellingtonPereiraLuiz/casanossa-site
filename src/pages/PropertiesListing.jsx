import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BedDouble, Bath, Car, Ruler, MapPin } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function PropertiesListing() {
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [filterOptions, setFilterOptions] = useState({
    bairros: [],
    tipos: [],
    categorias: []
  });
  
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

  const ITEMS_PER_PAGE = 9;

  // Carregar opções de filtro únicas uma vez
  useEffect(() => {
    document.title = "Casanossa | Nossos Imóveis";
    async function loadOptions() {
      const { data } = await supabase.from('properties').select('bairro, tipo, categoria').eq('status', 'disponivel');
      if (data) {
        setFilterOptions({
          bairros: [...new Set(data.map(p => p.bairro))].filter(Boolean),
          tipos: [...new Set(data.map(p => p.tipo))].filter(Boolean),
          categorias: [...new Set(data.map(p => p.categoria))].filter(Boolean)
        });
      }
    }
    loadOptions();
  }, []);

  // Recarregar os imóveis quando os filtros mudarem
  useEffect(() => {
    setPage(0);
    fetchProperties(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchProperties = async (pageIndex, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    const start = pageIndex * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from('properties')
      .select(`
        id, titulo, preco, finalidade, categoria, tipo, bairro, cidade, uf, quartos, banheiros, vagas, area_m2, status,
        property_images(url, posicao)
      `, { count: 'exact' })
      .eq('status', 'disponivel')
      .order('criado_em', { ascending: false })
      .order('posicao', { foreignTable: 'property_images', ascending: true })
      .limit(1, { foreignTable: 'property_images' });

    if (filters.finalidade) query = query.eq('finalidade', filters.finalidade);
    if (filters.categoria) query = query.eq('categoria', filters.categoria);
    if (filters.tipo) query = query.ilike('tipo', `%${filters.tipo}%`);
    if (filters.bairro) query = query.ilike('bairro', `%${filters.bairro}%`);
    if (filters.quartos) query = query.gte('quartos', parseInt(filters.quartos));
    if (filters.banheiros) query = query.gte('banheiros', parseInt(filters.banheiros));
    if (filters.vagas) query = query.gte('vagas', parseInt(filters.vagas));
    if (filters.minPrice) query = query.gte('preco', parseInt(filters.minPrice));
    if (filters.maxPrice) query = query.lte('preco', parseInt(filters.maxPrice));

    query = query.range(start, end);

    const { data, count, error } = await query;

    if (!error && data) {
      const formatados = data.map(p => {
        const imgs = p.property_images || [];
        return { ...p, image: imgs.length > 0 ? imgs[0].url : 'https://placehold.co/600x400?text=Sem+Foto' };
      });

      setProperties(prev => reset ? formatados : [...prev, ...formatados]);
      setTotalCount(count || 0);
      setHasMore(start + ITEMS_PER_PAGE < (count || 0));
    }

    setLoading(false);
    setLoadingMore(false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProperties(nextPage, false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const limparFiltros = () => {
    setFilters({ finalidade: '', categoria: '', tipo: '', bairro: '', minPrice: '', maxPrice: '', quartos: '', banheiros: '', vagas: '' });
  };

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
                <select name="finalidade" value={filters.finalidade} onChange={handleFilterChange} className="w-full p-2 border border-gray-200 rounded text-slate-700 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria">
                  <option value="">Todas</option>
                  <option value="venda">Venda</option>
                  <option value="locacao">Locação</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select name="categoria" value={filters.categoria} onChange={handleFilterChange} className="w-full p-2 border border-gray-200 rounded text-slate-700 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria">
                  <option value="">Todas</option>
                  {filterOptions.categorias.map((c, i) => (
                    <option key={i} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select name="tipo" value={filters.tipo} onChange={handleFilterChange} className="w-full p-2 border border-gray-200 rounded text-slate-700 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria">
                  <option value="">Todos</option>
                  {filterOptions.tipos.map((t, i) => (
                    <option key={i} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                <select name="bairro" value={filters.bairro} onChange={handleFilterChange} className="w-full p-2 border border-gray-200 rounded text-slate-700 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria">
                  <option value="">Todos</option>
                  {filterOptions.bairros.map((b, i) => (
                    <option key={i} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço Mín.</label>
                  <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} placeholder="R$ 0" className="w-full p-2 border border-gray-200 rounded text-slate-700 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço Máx.</label>
                  <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="R$ 0" className="w-full p-2 border border-gray-200 rounded text-slate-700 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" title="Quartos Mínimos">Qts.</label>
                  <select name="quartos" value={filters.quartos} onChange={handleFilterChange} className="w-full p-2 border border-gray-200 rounded text-slate-700 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria">
                    <option value="">Indif.</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" title="Banheiros Mínimos">Banh.</label>
                  <select name="banheiros" value={filters.banheiros} onChange={handleFilterChange} className="w-full p-2 border border-gray-200 rounded text-slate-700 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria">
                    <option value="">Indif.</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" title="Vagas Mínimas">Vagas</label>
                  <select name="vagas" value={filters.vagas} onChange={handleFilterChange} className="w-full p-2 border border-gray-200 rounded text-slate-700 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria">
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
            Encontramos <span className="text-marca-primaria font-bold">{loading ? '...' : totalCount}</span> imóvel(is).
          </div>

          {loading ? (
             <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center text-slate-500 font-bold">
               Buscando imóveis no banco de dados...
             </div>
          ) : properties.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center">
              <p className="text-xl text-slate-500 mb-4">Nenhum imóvel encontrado com esses filtros.</p>
              <button onClick={limparFiltros} className="text-marca-primaria font-bold underline hover:text-blue-800">Limpar filtros</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map(prop => (
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
              
              {hasMore && (
                <div className="mt-8 text-center">
                  <button 
                    onClick={handleLoadMore} 
                    disabled={loadingMore}
                    className="bg-white border-2 border-marca-primaria text-marca-primaria hover:bg-marca-primaria hover:text-white font-bold py-3 px-8 rounded-full transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? 'Carregando...' : 'Carregar mais imóveis'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
