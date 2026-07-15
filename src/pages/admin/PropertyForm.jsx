import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Save, ArrowLeft, ImagePlus, X, Plus, Trash2 } from 'lucide-react';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) { setPosition(e.latlng); }
  });
  return position ? <Marker position={position} /> : null;
}

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== 'novo';
  
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]); 
  const [newImageFiles, setNewImageFiles] = useState([]); 
  const [newImagePreviews, setNewImagePreviews] = useState([]); 
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    codigo: '', titulo: '', descricao: '', preco: '', preco_desconto: '', 
    area_m2: '', quartos: '', banheiros: '', vagas: '',
    finalidade: 'venda', categoria: 'residencial', tipo: 'Casa', status: 'disponivel', destaque: false,
    endereco: '', complemento: '', bairro: '', cidade: 'Ariquemes', uf: 'RO',
    latitude: -9.912, longitude: -63.038,
    ambientes: [], complementos: []
  });

  const [ambienteInput, setAmbienteInput] = useState('');
  const [complementoInput, setComplementoInput] = useState('');
  const [opcoes, setOpcoes] = useState({ categorias: [], tipos: [], bairros: [] });

  useEffect(() => {
    async function loadOptions() {
      const { data } = await supabase.from('properties').select('categoria, tipo, bairro');
      if (data) {
        setOpcoes({
          categorias: [...new Set(data.map(d => d.categoria))].filter(Boolean),
          tipos: [...new Set(data.map(d => d.tipo))].filter(Boolean),
          bairros: [...new Set(data.map(d => d.bairro))].filter(Boolean),
        });
      }
    }
    loadOptions();
    if (isEdit) {
      loadProperty();
      loadImages();
    }
  }, [id]);

  async function loadProperty() {
    const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
    if (data) {
      setForm({ ...data, ambientes: data.ambientes || [], complementos: data.complementos || [] });
    }
    if (error) console.error("Erro ao carregar imóvel:", error);
  }

  async function loadImages() {
    const { data, error } = await supabase.from('property_images').select('*').eq('property_id', id).order('posicao', { ascending: true });
    if (data) setImages(data);
  }

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleArrayAdd = (field, inputVal, setInputVal) => {
    if (!inputVal.trim()) return;
    setForm(prev => ({ ...prev, [field]: [...(prev[field] || []), inputVal.trim()] }));
    setInputVal('');
  };

  const handleArrayRemove = (field, index) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImageFiles(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews(prev => [...prev, ...previews]);
  };

  const removeNewImage = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleExistingImageDelete = async (imgId, url) => {
    if (!window.confirm('Tem certeza que deseja excluir esta foto permanentemente?')) return;
    await supabase.from('property_images').delete().eq('id', imgId);
    try {
      const filePath = url.split('/imoveis/')[1];
      if (filePath) await supabase.storage.from('imoveis').remove([filePath]);
    } catch (e) {
      console.warn('Falha no storage', e);
    }
    loadImages();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let propertyId = id;
      
      const payload = {
        ...form,
        preco: Number(form.preco) || 0,
        preco_desconto: form.preco_desconto ? Number(form.preco_desconto) : null,
        area_m2: form.area_m2 ? Number(form.area_m2) : null,
        quartos: Number(form.quartos) || 0,
        banheiros: Number(form.banheiros) || 0,
        vagas: Number(form.vagas) || 0,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude)
      };

      if (isEdit) {
        const { error } = await supabase.from('properties').update(payload).eq('id', propertyId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('properties').insert([payload]).select().single();
        if (error) throw error;
        propertyId = data.id;
      }

      if (newImageFiles.length > 0) {
        let currentPos = images.length;
        for (const file of newImageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${propertyId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage.from('imoveis').upload(fileName, file);
          if (uploadError) continue; 

          const { data: urlData } = supabase.storage.from('imoveis').getPublicUrl(fileName);

          await supabase.from('property_images').insert([{
            property_id: propertyId,
            url: urlData.publicUrl,
            posicao: currentPos++
          }]);
        }
      }

      alert('Imóvel salvo com sucesso!');
      navigate('/admin/imoveis');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar imóvel. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/imoveis" className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold text-slate-800">
          {isEdit ? 'Editar Imóvel' : 'Cadastrar Novo Imóvel'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-marca-primaria mb-6 border-b border-gray-100 pb-2">Dados Básicos</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Código Ref.</label>
              <input type="text" name="codigo" value={form.codigo} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" placeholder="Ex: AP123" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-bold text-slate-700 mb-2">Título do Anúncio</label>
              <input required type="text" name="titulo" value={form.titulo} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" placeholder="Ex: Lindo apartamento..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Finalidade</label>
              <select name="finalidade" value={form.finalidade} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria">
                <option value="venda">Venda</option>
                <option value="locacao">Locação</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Categoria</label>
              <input type="text" list="cat-list" name="categoria" value={form.categoria} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" placeholder="Ex: Residencial" />
              <datalist id="cat-list">
                {opcoes.categorias.map((c, i) => <option key={i} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tipo (Casa, Apto...)</label>
              <input type="text" list="tipo-list" name="tipo" value={form.tipo} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" placeholder="Ex: Casa" />
              <datalist id="tipo-list">
                {opcoes.tipos.map((t, i) => <option key={i} value={t} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria">
                <option value="disponivel">Disponível</option>
                <option value="vendido">Vendido</option>
                <option value="alugado">Alugado</option>
              </select>
            </div>
          </div>
          
          <div className="mb-6 flex items-center">
             <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="destaque" checked={form.destaque} onChange={handleChange} className="w-5 h-5 text-marca-primaria rounded focus:ring-marca-primaria" />
                <span className="font-bold text-slate-700">Imóvel Destaque (Home)</span>
              </label>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Descrição Completa</label>
            <textarea rows="6" name="descricao" value={form.descricao} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria"></textarea>
          </div>
        </section>

        <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-marca-primaria mb-6 border-b border-gray-100 pb-2">Valores e Medidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Preço (R$)</label>
              <input required type="number" name="preco" value={form.preco} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Preço de/desconto (R$)</label>
              <input type="number" name="preco_desconto" value={form.preco_desconto} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" placeholder="Opcional" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Área Total (m²)</label>
              <input type="number" name="area_m2" value={form.area_m2} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Quartos</label>
              <input type="number" name="quartos" value={form.quartos} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Banheiros</label>
              <input type="number" name="banheiros" value={form.banheiros} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Vagas de Garagem</label>
              <input type="number" name="vagas" value={form.vagas} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" />
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-marca-primaria mb-6 border-b border-gray-100 pb-2">Características (Arrays)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Ambientes (Ex: Sala de TV, Suíte Master)</label>
              <div className="flex gap-2 mb-4">
                <input type="text" value={ambienteInput} onChange={e => setAmbienteInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleArrayAdd('ambientes', ambienteInput, setAmbienteInput))} className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" placeholder="Digite e aperte Enter ou Add" />
                <button type="button" onClick={() => handleArrayAdd('ambientes', ambienteInput, setAmbienteInput)} className="bg-marca-primaria text-white px-4 rounded-lg font-bold hover:bg-blue-800 transition-colors">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.ambientes.map((amb, i) => (
                  <span key={i} className="bg-gray-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    {amb} <button type="button" onClick={() => handleArrayRemove('ambientes', i)} className="text-red-500 hover:text-red-700"><X size={14} /></button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Complementos (Ex: Piscina, Churrasqueira)</label>
              <div className="flex gap-2 mb-4">
                <input type="text" value={complementoInput} onChange={e => setComplementoInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleArrayAdd('complementos', complementoInput, setComplementoInput))} className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" placeholder="Digite e aperte Enter ou Add" />
                <button type="button" onClick={() => handleArrayAdd('complementos', complementoInput, setComplementoInput)} className="bg-marca-primaria text-white px-4 rounded-lg font-bold hover:bg-blue-800 transition-colors">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.complementos.map((comp, i) => (
                  <span key={i} className="bg-gray-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    {comp} <button type="button" onClick={() => handleArrayRemove('complementos', i)} className="text-red-500 hover:text-red-700"><X size={14} /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-marca-primaria mb-6 border-b border-gray-100 pb-2">Localização</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Endereço (Rua/Avenida)</label>
              <input type="text" name="endereco" value={form.endereco} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Número / Comp.</label>
              <input type="text" name="complemento" value={form.complemento} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Bairro</label>
              <input type="text" list="bairro-list" name="bairro" value={form.bairro} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" />
              <datalist id="bairro-list">
                {opcoes.bairros.map((b, i) => <option key={i} value={b} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Cidade</label>
              <input type="text" name="cidade" value={form.cidade} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Estado (UF)</label>
              <input type="text" name="uf" value={form.uf} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-primaria" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Coordenadas no Mapa (Clique para marcar)</label>
            <div className="flex gap-4 mb-4">
               <input type="text" readOnly value={`Lat: ${form.latitude}`} className="bg-gray-100 p-2 rounded text-sm text-slate-600 flex-1" />
               <input type="text" readOnly value={`Lng: ${form.longitude}`} className="bg-gray-100 p-2 rounded text-sm text-slate-600 flex-1" />
            </div>
            <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-300 z-0 relative">
              <MapContainer center={[form.latitude, form.longitude]} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
                <RecenterMap lat={form.latitude} lng={form.longitude} />
                <LocationMarker 
                  position={{lat: form.latitude, lng: form.longitude}} 
                  setPosition={(pos) => setForm({...form, latitude: pos.lat, longitude: pos.lng})} 
                />
              </MapContainer>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-marca-primaria mb-6 border-b border-gray-100 pb-2">Galeria de Fotos</h2>
          {images.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Fotos Publicadas</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {images.map(img => (
                  <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-square">
                    <img src={img.url} alt="Imóvel" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => handleExistingImageDelete(img.id, img.url)} className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Fazer Upload de Novas Fotos</h3>
            <div className="flex flex-wrap gap-4 mb-4">
              {newImagePreviews.map((url, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden border-2 border-marca-primaria bg-gray-50 aspect-square w-32">
                  <img src={url} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-md">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-32 aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-marca-primaria hover:text-marca-primaria transition-colors bg-gray-50">
                <ImagePlus size={32} className="mb-2" />
                <span className="text-xs font-bold text-center px-2">Adicionar<br/>Fotos</span>
              </button>
            </div>
            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="bg-marca-secundaria hover:bg-green-600 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'Salvando aguarde...' : <><Save size={24} /> Salvar Imóvel</>}
          </button>
        </div>
      </form>
    </div>
  );
}
