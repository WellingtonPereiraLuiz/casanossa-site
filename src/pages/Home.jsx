import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Building, Key, Star, BedDouble, Bath, Car, Ruler } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function Home() {
  const [destaques, setDestaques] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dados para os selects
  const [bairros, setBairros] = useState([]);
  const [tipos, setTipos] = useState([]);

  // Estado da busca
  const [search, setSearch] = useState({
    finalidade: '',
    tipo: '',
    bairro: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Casanossa | Imóveis";
    async function loadData() {
      // Buscar opções únicas do banco de dados (Bairros e Tipos) para o filtro
      const { data: filterData } = await supabase.from('properties').select('bairro, tipo').eq('status', 'disponivel');
      if (filterData) {
        const uniqueBairros = [...new Set(filterData.map(p => p.bairro))].filter(Boolean);
        const uniqueTipos = [...new Set(filterData.map(p => p.tipo))].filter(Boolean);
        setBairros(uniqueBairros);
        setTipos(uniqueTipos);
      }

      // Buscar propriedades destaque
      const { data: props } = await supabase
        .from('properties')
        .select(`
          id, titulo, preco, finalidade, tipo, bairro, cidade, uf, quartos, banheiros, vagas, area_m2,
          property_images(url, posicao)
        `)
        .eq('destaque', true)
        .eq('status', 'disponivel')
        .limit(3);

      if (props && props.length > 0) {
        const formatados = props.map(p => {
          const imgs = p.property_images?.sort((a, b) => a.posicao - b.posicao) || [];
          return { ...p, image: imgs.length > 0 ? imgs[0].url : 'https://placehold.co/600x400?text=Sem+Foto' };
        });
        setDestaques(formatados);
      } else {
        const { data: ultimos } = await supabase
          .from('properties')
          .select(`
            id, titulo, preco, finalidade, tipo, bairro, cidade, uf, quartos, banheiros, vagas, area_m2,
            property_images(url, posicao)
          `)
          .eq('status', 'disponivel')
          .order('criado_em', { ascending: false })
          .limit(3);
          
        if (ultimos) {
          const formatados = ultimos.map(p => {
            const imgs = p.property_images?.sort((a, b) => a.posicao - b.posicao) || [];
            return { ...p, image: imgs.length > 0 ? imgs[0].url : 'https://placehold.co/600x400?text=Sem+Foto' };
          });
          setDestaques(formatados);
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Envia o state para a tela de listagem
    navigate('/imoveis', { state: search });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="/imagen_de_fundo.jpg" 
            alt="Casanossa Imóveis" 
            className="w-full h-full object-cover brightness-[0.4]"
          />
        </div>
        
        <div className="relative z-10 text-center px-4 w-full max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Sua nova casa <span className="text-[#25D366]">está aqui</span>
          </h1>
          <p className="text-xl text-gray-200 mb-10 drop-shadow-md">
            Desde 1984 realizando sonhos em Ariquemes e região
          </p>

          <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl shadow-2xl flex flex-col md:flex-row gap-4 items-end animate-fadeIn">
            
            <div className="w-full text-left">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Quero</label>
              <select 
                value={search.finalidade} 
                onChange={(e) => setSearch({...search, finalidade: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria transition-all text-slate-700 font-medium"
              >
                <option value="">Comprar ou Alugar?</option>
                <option value="venda">Comprar (Venda)</option>
                <option value="locacao">Alugar (Locação)</option>
              </select>
            </div>

            <div className="w-full text-left">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tipo</label>
              <select 
                value={search.tipo} 
                onChange={(e) => setSearch({...search, tipo: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria transition-all text-slate-700 font-medium"
              >
                <option value="">Todos os tipos</option>
                {tipos.map((t, idx) => <option key={idx} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="w-full text-left">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Localização</label>
              <select 
                value={search.bairro} 
                onChange={(e) => setSearch({...search, bairro: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:border-marca-primaria focus:ring-1 focus:ring-marca-primaria transition-all text-slate-700 font-medium"
              >
                <option value="">Qualquer bairro</option>
                {bairros.map((b, idx) => <option key={idx} value={b}>{b}</option>)}
              </select>
            </div>

            <button type="submit" className="w-full md:w-auto bg-marca-primaria hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md shrink-0 h-[50px]">
              <Search size={20} /> Buscar
            </button>
          </form>
        </div>
      </section>

      {/* Destaques */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-10 justify-center">
            <Star className="text-marca-primaria" size={32} />
            <h2 className="text-3xl font-bold text-marca-primaria uppercase tracking-widest">Imóveis em Destaque</h2>
          </div>

          {loading ? (
             <div className="text-center py-20 text-slate-500 font-bold">Carregando imóveis...</div>
          ) : destaques.length === 0 ? (
             <div className="text-center py-20 text-slate-500 font-bold">Nenhum imóvel disponível no momento.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destaques.map(prop => (
                <Link key={prop.id} to={`/imovel/${prop.id}`} className="group bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-2 block">
                  <div className="relative h-64 overflow-hidden">
                    <img src={prop.image} alt={prop.titulo} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-4 left-4 bg-marca-primaria text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                      {prop.finalidade}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-gray-500 mb-2 font-medium flex items-center gap-1">
                      <MapPin size={14} /> {prop.bairro}, {prop.cidade}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-1 group-hover:text-marca-primaria transition-colors">{prop.titulo}</h3>
                    <p className="text-marca-primaria font-black text-2xl mb-6">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prop.preco)}
                      {prop.finalidade === 'locacao' && <span className="text-sm text-gray-500 font-normal"> /mês</span>}
                    </p>
                    
                    <div className="flex items-center justify-between text-slate-600 text-sm border-t border-gray-100 pt-4 bg-gray-50/50 -mx-6 px-6 -mb-6 pb-6">
                      <div className="flex flex-col items-center gap-1" title="Quartos"><BedDouble size={20} className="text-gray-400" /> <span className="font-bold">{prop.quartos}</span></div>
                      <div className="flex flex-col items-center gap-1" title="Banheiros"><Bath size={20} className="text-gray-400" /> <span className="font-bold">{prop.banheiros}</span></div>
                      <div className="flex flex-col items-center gap-1" title="Vagas"><Car size={20} className="text-gray-400" /> <span className="font-bold">{prop.vagas}</span></div>
                      <div className="flex flex-col items-center gap-1" title="Área m²"><Ruler size={20} className="text-gray-400" /> <span className="font-bold">{prop.area_m2}</span></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/imoveis" className="inline-block border-2 border-marca-primaria text-marca-primaria hover:bg-marca-primaria hover:text-white font-bold py-3 px-8 rounded-lg transition-all">
              Ver Todos os Imóveis
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="p-6">
            <div className="w-16 h-16 mx-auto bg-blue-50 text-marca-primaria rounded-full flex items-center justify-center mb-6">
              <Building size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Tradição</h3>
            <p className="text-gray-600">Mais de 40 anos de história no mercado imobiliário de Ariquemes e região.</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 mx-auto bg-green-50 text-[#25D366] rounded-full flex items-center justify-center mb-6">
              <Key size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Aluguel Sem Burocracia</h3>
            <p className="text-gray-600">Processo ágil, seguro e totalmente digital para você pegar as chaves mais rápido.</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 mx-auto bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6">
              <Star size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Atendimento VIP</h3>
            <p className="text-gray-600">Nossa equipe de corretores é treinada para entender perfeitamente sua necessidade.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
