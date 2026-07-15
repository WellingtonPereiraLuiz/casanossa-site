import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapPin, BedDouble, Bath, Car, Ruler, Phone, CheckCircle2, Copy, CalendarPlus, X, ChevronLeft, ChevronRight } from 'lucide-react';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Galeria e Lightbox
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  // Imóveis Semelhantes
  const [semelhantes, setSemelhantes] = useState([]);

  // Modal Agendamento
  const [modalOpen, setModalOpen] = useState(false);
  const [formLead, setFormLead] = useState({ nome: '', telefone: '', email: '', mensagem: '' });
  const [leadLoading, setLeadLoading] = useState(false);

  const formatPhone = (val) => {
    if (!val) return '';
    let v = val.replace(/\D/g, ''); // Remove tudo que não é número
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    if (v.length > 10) v = `${v.slice(0,10)}-${v.slice(10)}`;
    return v;
  };

  useEffect(() => {
    async function loadPropertyAndAnalytics() {
      // Registrar Analytics (Page View) silenciosamente
      try {
        await supabase.from('page_views').insert({ caminho: `/imovel/${id}`, property_id: id });
      } catch (e) {
        // Ignora erros de analytics
      }

      // Buscar imóvel
      const { data, error } = await supabase
        .from('properties')
        .select(`*, property_images(*)`)
        .eq('id', id)
        .single();

      if (data) {
        if (data.property_images) {
          data.property_images.sort((a, b) => a.posicao - b.posicao);
        }
        setProperty(data);
        
        // Lógica Forte de Imóveis Semelhantes
        // 1. Busca imóveis disponíveis, da mesma finalidade (venda/locação) e tipo (Casa, Apto, etc)
        const { data: simData } = await supabase
          .from('properties')
          .select('id, titulo, preco, finalidade, tipo, bairro, cidade, uf, quartos, banheiros, vagas, area_m2, property_images(url, posicao)')
          .eq('status', 'disponivel')
          .neq('id', id)
          .eq('finalidade', data.finalidade)
          .eq('tipo', data.tipo)
          .limit(15);
          
        if (simData) {
          // 2. Cria um sistema de pontuação para encontrar os mais parecidos
          const scoredProperties = simData.map(p => {
            let score = 0;
            
            // Mesmo Bairro: +3 pontos
            if (p.bairro === data.bairro) score += 3;
            
            // Preço parecido (diferença de até 20%): +3 pontos
            const diffPreco = Math.abs(p.preco - data.preco) / data.preco;
            if (diffPreco <= 0.20) score += 3;
            
            // Mesma quantidade de quartos: +2 pontos
            if (p.quartos === data.quartos) score += 2;
            
            // Mesma quantidade de banheiros: +1 ponto
            if (p.banheiros === data.banheiros) score += 1;

            // Mesma quantidade de vagas: +1 ponto
            if (p.vagas === data.vagas) score += 1;
            
            return { ...p, score };
          });

          // 3. Ordena pela maior pontuação e pega os 3 primeiros
          scoredProperties.sort((a, b) => b.score - a.score);
          const top3 = scoredProperties.slice(0, 3);

          const formatados = top3.map(p => {
            const imgs = p.property_images?.sort((a, b) => a.posicao - b.posicao) || [];
            return { ...p, image: imgs.length > 0 ? imgs[0].url : 'https://placehold.co/600x400?text=Sem+Foto' };
          });
          setSemelhantes(formatados);
        }
      }
      setLoading(false);
    }
    loadPropertyAndAnalytics();
  }, [id]);

  const copyAddress = () => {
    const enderecoCompleto = `${property.endereco}, ${property.complemento ? property.complemento + ' - ' : ''}${property.bairro}, ${property.cidade} - ${property.uf}`;
    navigator.clipboard.writeText(enderecoCompleto);
    alert('Endereço copiado para a área de transferência!');
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setLeadLoading(true);
    const { error } = await supabase.from('leads').insert([{
      ...formLead,
      property_id: property.id
    }]);
    
    setLeadLoading(false);
    if (!error) {
      alert('Mensagem enviada com sucesso! Em breve um corretor entrará em contato.');
      setModalOpen(false);
      setFormLead({ nome: '', telefone: '', email: '', mensagem: '' });
    } else {
      alert('Erro ao enviar. Tente pelo WhatsApp.');
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xl text-slate-500 font-bold">Carregando detalhes do imóvel...</div>;
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Imóvel não encontrado</h1>
        <Link to="/imoveis" className="text-marca-primaria font-bold hover:underline">Voltar para a lista de imóveis</Link>
      </div>
    );
  }

  const imagens = property.property_images && property.property_images.length > 0 ? property.property_images : [{url: 'https://placehold.co/800x600?text=Sem+Foto'}];
  const wpText = encodeURIComponent(`Olá! Tenho interesse no imóvel ${property.codigo} - ${property.titulo}. Poderia me passar mais informações?`);

  return (
    <div className="bg-gray-50 pb-20">
      
      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 text-white hover:text-gray-300 z-50">
            <X size={40} />
          </button>
          
          <button 
            onClick={() => setMainImageIndex(prev => prev === 0 ? imagens.length - 1 : prev - 1)} 
            className="absolute left-4 md:left-10 text-white hover:text-gray-300 z-50 bg-black/50 p-2 rounded-full"
          >
            <ChevronLeft size={48} />
          </button>
          
          <img src={imagens[mainImageIndex].url} alt="Galeria" className="max-h-[90vh] max-w-[90vw] object-contain select-none" />
          
          <button 
            onClick={() => setMainImageIndex(prev => prev === imagens.length - 1 ? 0 : prev + 1)} 
            className="absolute right-4 md:right-10 text-white hover:text-gray-300 z-50 bg-black/50 p-2 rounded-full"
          >
            <ChevronRight size={48} />
          </button>
          <div className="absolute bottom-6 text-white font-bold tracking-widest text-sm bg-black/50 px-4 py-1 rounded-full">
            {mainImageIndex + 1} / {imagens.length}
          </div>
        </div>
      )}

      {/* Modal Agendar Visita */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-marca-primaria mb-2">Agendar Visita</h2>
            <p className="text-gray-500 mb-6 text-sm">Preencha os dados e nossa equipe entrará em contato rapidinho.</p>
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <input required maxLength={50} type="text" placeholder="Seu Nome" value={formLead.nome} onChange={e => setFormLead({...formLead, nome: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" />
              <input required minLength={14} maxLength={15} type="tel" placeholder="Seu Telefone / WhatsApp" value={formLead.telefone} onChange={e => setFormLead({...formLead, telefone: formatPhone(e.target.value)})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" />
              <input maxLength={60} type="email" pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$" title="Digite um e-mail válido (ex: seu.nome@dominio.com)" placeholder="Seu E-mail (Opcional)" value={formLead.email} onChange={e => setFormLead({...formLead, email: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" />
              <textarea required maxLength={400} placeholder="Sua mensagem (máx 400 caracteres)" rows="3" value={formLead.mensagem} onChange={e => setFormLead({...formLead, mensagem: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria"></textarea>
              <button disabled={leadLoading} type="submit" className="w-full bg-marca-secundaria hover:bg-green-600 text-white font-bold py-4 rounded-lg transition-all shadow-md disabled:opacity-70">
                {leadLoading ? 'Enviando...' : 'Enviar Solicitação'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-marca-primaria font-bold tracking-[0.2em] uppercase text-sm mb-3">
            IMÓVEL {property.categoria}
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-800 mb-4">{property.titulo}</h1>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1 text-sm font-bold rounded-full uppercase tracking-wider text-white ${property.status === 'disponivel' ? 'bg-[#25D366]' : 'bg-slate-400'}`}>
                  {property.status}
                </span>
                <span className="text-sm font-bold text-slate-500 font-mono tracking-widest bg-gray-100 px-3 py-1 rounded-md border border-gray-200">CÓD. {property.codigo}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Galeria Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className={`grid gap-2 ${imagens.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-4'} h-[50vh] md:h-[60vh] rounded-2xl overflow-hidden cursor-pointer`} onClick={() => setLightboxOpen(true)}>
          <div className={`${imagens.length === 1 ? 'md:col-span-1' : 'md:col-span-3'} relative group overflow-hidden bg-gray-200`}>
             <img src={imagens[0].url} alt={property.titulo} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
             <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <span className="text-white font-bold bg-black/50 px-6 py-2 rounded-full border border-white/30 backdrop-blur-sm">Ampliar Galeria</span>
             </div>
          </div>
          {imagens.length > 1 && (
            <div className="hidden md:flex flex-col gap-2">
              {imagens.slice(1, 3).map((img, idx) => (
                <div key={idx} className="relative group overflow-hidden bg-gray-200 h-1/2">
                  <img src={img.url} alt={`Minha ${idx}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  {idx === 1 && imagens.length > 3 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">+{imagens.length - 3}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Principal */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Localização Bloco Azul */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div className="flex gap-4">
               <div className="bg-marca-primaria p-3 rounded-full text-white shrink-0 h-fit">
                 <MapPin size={24} />
               </div>
               <div>
                 <p className="text-marca-primaria font-bold text-sm tracking-widest uppercase mb-1">Localização</p>
                 <p className="text-slate-800 font-medium">
                   {property.endereco} 
                   {property.complemento && ` (${property.complemento})`}
                 </p>
                 <p className="text-slate-600">Bairro {property.bairro} - {property.cidade}/{property.uf}</p>
               </div>
             </div>
             <button onClick={copyAddress} className="bg-white border border-marca-primaria text-marca-primaria hover:bg-marca-primaria hover:text-white font-bold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 shrink-0">
               <Copy size={18} /> Copiar
             </button>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Características</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <BedDouble size={28} className="text-marca-primaria mb-2" />
                <span className="text-2xl font-black text-slate-800">{property.quartos}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Dormitórios</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Bath size={28} className="text-marca-primaria mb-2" />
                <span className="text-2xl font-black text-slate-800">{property.banheiros}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Banheiros</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Car size={28} className="text-marca-primaria mb-2" />
                <span className="text-2xl font-black text-slate-800">{property.vagas}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Vagas</span>
              </div>
              {property.area_m2 ? (
                <div className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <Ruler size={28} className="text-marca-primaria mb-2" />
                  <span className="text-2xl font-black text-slate-800">{property.area_m2}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Área m²</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-marca-primaria mb-2 text-xl font-bold">TIPO</span>
                  <span className="text-sm font-bold text-slate-800 capitalize">{property.tipo}</span>
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-4 mt-10">Sobre o Imóvel</h3>
            <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">
              {property.descricao}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10 border-t border-gray-100 pt-8">
              {property.ambientes && property.ambientes.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-marca-primaria mb-4 tracking-widest uppercase text-sm">Ambientes</h3>
                  <ul className="space-y-3">
                    {property.ambientes.map((amb, i) => (
                      <li key={i} className="flex items-center text-slate-600 font-medium"><CheckCircle2 className="text-[#25D366] mr-3" size={20} /> {amb}</li>
                    ))}
                  </ul>
                </div>
              )}
              {property.complementos && property.complementos.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-marca-primaria mb-4 tracking-widest uppercase text-sm">Complementos</h3>
                  <ul className="space-y-3">
                    {property.complementos.map((comp, i) => (
                      <li key={i} className="flex items-center text-slate-600 font-medium"><CheckCircle2 className="text-[#25D366] mr-3" size={20} /> {comp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar / Contato STICKY */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-24">
            
            <div className="bg-[#22337a]/5 p-6 rounded-xl text-center mb-6 border border-[#22337a]/10">
              {property.finalidade === 'locacao' ? (
                <>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">Valor do Aluguel</p>
                  <p className="text-3xl font-black text-marca-primaria mb-4">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.preco)}<span className="text-sm font-medium text-slate-500">/mês</span>
                  </p>
                  {property.preco_desconto && property.preco_desconto > 0 && (
                    <div className="pt-4 border-t border-marca-primaria/10">
                      <p className="text-marca-secundaria font-bold uppercase tracking-wider text-[10px] mb-1">Valor C/ Desconto Pontualidade</p>
                      <p className="text-2xl font-black text-marca-secundaria">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.preco_desconto)}<span className="text-sm font-medium opacity-80">/mês</span>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">Valor de Venda</p>
                  <p className="text-4xl font-black text-marca-primaria">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.preco)}
                  </p>
                </>
              )}
            </div>
            
            <a 
              href={`https://wa.me/5569984086548?text=${wpText}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl mb-3 text-lg"
            >
              <Phone size={24} fill="currentColor" />
              Chamar no WhatsApp
            </a>

            <button 
              onClick={() => setModalOpen(true)}
              className="w-full bg-white border-2 border-marca-primaria text-marca-primaria hover:bg-marca-primaria hover:text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-sm text-lg"
            >
              <CalendarPlus size={24} />
              Agendar Visita
            </button>
            
            <div className="text-center mt-6 pt-6 border-t border-gray-100">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Código Referência</p>
               <p className="text-xl font-mono font-bold text-slate-700">{property.codigo}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAPA */}
      {property.latitude && property.longitude && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="w-full h-[300px] bg-gray-200 relative z-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <MapContainer center={[property.latitude, property.longitude]} zoom={16} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[property.latitude, property.longitude]}>
                <Popup>
                  <div className="text-center font-sans">
                    <p className="font-bold text-marca-primaria">{property.titulo}</p>
                    <p className="text-sm">{property.endereco}, {property.bairro}</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}

      {/* Imóveis Semelhantes */}
      {semelhantes.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-marca-primaria mb-8 tracking-widest uppercase border-b-2 border-marca-claro pb-4">Imóveis Semelhantes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {semelhantes.map(prop => (
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
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
