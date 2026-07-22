import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function Contact() {
  const [formData, setFormData] = useState({ nome: '', telefone: '', email: '', mensagem: '' });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  useEffect(() => {
    document.title = "Casanossa | Contato";
  }, []);

  const formatPhone = (val) => {
    if (!val) return '';
    let v = val.replace(/\D/g, ''); // Remove tudo que não é número
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    if (v.length > 10) v = `${v.slice(0,10)}-${v.slice(10)}`;
    return v;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telefone') {
      setFormData(prev => ({ ...prev, [name]: formatPhone(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });
    
    try {
      const { error } = await supabase.from('leads').insert([formData]);
      if (error) throw error;
      
      setStatus({ loading: false, success: true, error: null });
      setFormData({ nome: '', telefone: '', email: '', mensagem: '' });
      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
    } catch (err) {
      console.error(err);
      setStatus({ loading: false, success: false, error: 'Ocorreu um erro ao enviar a mensagem. Verifique a conexão com o Supabase e tente novamente.' });
    }
  };

  const lat = -9.912;
  const lng = -63.038;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-[60vh]">
      <h1 className="text-3xl font-bold text-marca-primaria mb-10 tracking-widest uppercase border-b-2 border-marca-claro pb-4 text-center md:text-left">Entre em contato</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        
        {/* Esquerda: Info e Mapa */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="bg-white p-5 rounded-2xl shadow-xl ring-1 ring-gray-100 border-b-4 border-marca-primaria shrink-0 transition-transform hover:-translate-y-1">
              <img src="/logo.png" alt="Casanossa Imobiliária" className="h-20 w-auto object-contain" />
            </div>
            <div>
              <p className="text-slate-600 mb-6 font-medium leading-relaxed">Desde 1984, oferecendo as melhores soluções imobiliárias para Ariquemes e região.</p>
              
              <div className="space-y-4">
                <a href="https://instagram.com/imobiliariacasanossa" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-700 hover:text-marca-primaria font-bold transition-colors">
                  <span className="bg-marca-suave p-2 rounded-full text-marca-primaria">IG</span>
                  @imobiliariacasanossa
                </a>
                <a href="https://facebook.com/imobiliariacasanossa" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-700 hover:text-marca-primaria font-bold transition-colors">
                  <span className="bg-marca-suave p-2 rounded-full text-marca-primaria">FB</span>
                  Imobiliária Casanossa
                </a>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
            <MapContainer center={[lat, lng]} zoom={16} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[lat, lng]}>
                <Popup>
                  <strong className="text-marca-primaria">Casanossa Imobiliária</strong><br/>
                  Travessa Violeta, 3861
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        {/* Direita: Contatos e Formulário */}
        <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg border border-gray-100 relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-marca-primaria rounded-t-xl"></div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-8 mt-2">Nossos Canais</h2>
          <ul className="space-y-6 mb-10 text-slate-700 font-medium">
            <li className="flex items-center gap-4">
              <div className="bg-marca-claro p-3 rounded-lg"><MapPin className="text-marca-primaria" size={24} /></div>
              <span>Travessa Violeta, 3861, Setor 04 - Ariquemes/RO</span>
            </li>
            <li className="flex items-center gap-4">
              <div className="bg-marca-claro p-3 rounded-lg"><Phone className="text-marca-primaria" size={24} /></div>
              <span>(69) 3535-7090</span>
            </li>
            <li className="flex items-center gap-4">
              <div className="bg-green-50 p-3 rounded-lg"><MessageCircle className="text-marca-secundaria" size={24} /></div>
              <span>WhatsApp: (69) 9.8408-6548</span>
            </li>
            <li className="flex items-center gap-4">
              <div className="bg-marca-claro p-3 rounded-lg"><Mail className="text-marca-primaria" size={24} /></div>
              <span>contato@casanossa.com.br</span>
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-t border-gray-100 pt-8">Envie uma mensagem</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nome Completo</label>
              <input required maxLength={50} type="text" name="nome" value={formData.nome} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria transition-shadow" placeholder="João da Silva" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                <input required minLength={14} maxLength={15} type="tel" name="telefone" value={formData.telefone} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria transition-shadow" placeholder="(99) 99999-9999" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">E-mail</label>
                <input required maxLength={60} type="email" pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$" title="Digite um e-mail válido (ex: seu.nome@dominio.com)" name="email" value={formData.email} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria transition-shadow" placeholder="seuemail@exemplo.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Mensagem</label>
              <textarea required maxLength={400} rows="4" name="mensagem" value={formData.mensagem} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria transition-shadow" placeholder="Escreva sua mensagem aqui (máx 400 caracteres)..."></textarea>
            </div>
            
            {status.error && <div className="text-red-600 text-sm font-bold p-4 bg-red-50 rounded-lg border border-red-100">{status.error}</div>}
            {status.success && <div className="text-marca-secundaria text-sm font-bold p-4 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2"><CheckCircle2 size={20} /> Mensagem enviada com sucesso! Em breve retornaremos.</div>}
            
            <button disabled={status.loading} type="submit" className="w-full bg-marca-primaria hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2">
              {status.loading ? 'Enviando...' : <><Send size={20} /> Enviar Mensagem</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
