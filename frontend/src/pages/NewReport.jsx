import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, CheckCircle, AlertCircle, UploadCloud, AlertTriangle, Lightbulb, Trash2, TreePine, Droplets, PawPrint, Home, AlertOctagon } from 'lucide-react';

const API_URL = '/api';

const CATEGORIES = [
  { id: 'Baches y pavimento dañado', icon: AlertTriangle },
  { id: 'Luminarias en mal estado', icon: Lightbulb },
  { id: 'Microbasurales', icon: Trash2 },
  { id: 'Árboles caídos o peligrosos', icon: TreePine },
  { id: 'Filtraciones de agua', icon: Droplets },
  { id: 'Animales en riesgo', icon: PawPrint },
  { id: 'Inmuebles abandonados', icon: Home },
  { id: 'Señalética dañada', icon: AlertOctagon }
];

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  const customIcon = L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<svg width="32" height="48" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12zm0 16.5c-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 7.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z" fill="#059669"/>
           </svg>`,
    iconSize: [32, 48],
    iconAnchor: [16, 48]
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon}></Marker>
  );
}

const NewReport = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0].id,
  });
  const [position, setPosition] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      setError('Por favor, indica la ubicación en el mapa.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('lat', position.lat);
    data.append('lng', position.lng);
    if (image) {
      data.append('image', image);
    }

    try {
      await axios.post(`${API_URL}/reports`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el reporte');
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto"
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-secondary mb-2">Crear Nuevo Reporte</h1>
        <p className="text-muted">Ayúdanos a mejorar nuestra comuna reportando incidentes</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-200 text-danger px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
          >
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="bg-surface rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="flex flex-col md:flex-row">
          
          {/* Left Column: Form Details */}
          <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-border">
            <h3 className="text-lg font-bold text-secondary mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center">1</span>
              Detalles del Incidente
            </h3>

            <div className="form-group mb-6">
              <label className="form-label mb-2 block" htmlFor="title">¿Qué está ocurriendo?</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-input text-lg py-3"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Ej: Bache profundo en la calzada..."
              />
            </div>

            <div className="form-group mb-6">
              <label className="form-label mb-3 block">Categoría del problema</label>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({...formData, category: cat.id})}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 text-center transition-all ${
                      formData.category === cat.id 
                      ? 'bg-primary-light border-primary text-primary shadow-md transform scale-[1.02]' 
                      : 'bg-surface border-border text-secondary hover:border-primary-light hover:bg-gray-50'
                    }`}
                    style={{ minHeight: '100px' }}
                  >
                    <Icon size={28} className={`mb-2 ${formData.category === cat.id ? 'text-primary' : 'text-muted'}`} strokeWidth={formData.category === cat.id ? 2.5 : 1.5} />
                    <span className="text-xs font-bold leading-tight">{cat.id}</span>
                  </button>
                )})}
              </div>
            </div>

            <div className="form-group mb-6">
              <label className="form-label mb-2 block" htmlFor="description">Descripción detallada</label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Brinda más detalles para que los equipos puedan evaluar la situación..."
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label mb-2 block">Evidencia fotográfica (Opcional)</label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-xl hover:border-primary transition-colors bg-gray-50 overflow-hidden group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                {preview ? (
                  <div className="relative h-48 w-full">
                    <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-medium flex items-center gap-2"><Camera /> Cambiar foto</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 flex flex-col items-center justify-center text-muted gap-2">
                    <UploadCloud size={40} className="text-gray-400 group-hover:text-primary transition-colors" />
                    <span className="font-medium">Haz clic o arrastra una imagen aquí</span>
                    <span className="text-xs">PNG, JPG hasta 5MB</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Map Location */}
          <div className="flex-1 p-6 md:p-8 bg-gray-50 flex flex-col">
            <h3 className="text-lg font-bold text-secondary mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center">2</span>
              Ubicación Exacta
            </h3>
            
            <p className="text-sm text-muted mb-4">Navega por el mapa y haz clic en el punto exacto donde ocurre el incidente.</p>
            
            <div className="flex-grow rounded-xl overflow-hidden shadow-inner border border-border relative min-h-[350px]">
              <MapContainer center={[-33.5289, -70.5983]} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
              
              {!position && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-warning text-warning font-medium text-sm flex items-center gap-2 z-[1000] pointer-events-none">
                  <MapPin size={16} /> Haz clic en el mapa
                </div>
              )}
              {position && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-primary text-primary font-bold text-sm flex items-center gap-2 z-[1000] pointer-events-none"
                >
                  <CheckCircle size={16} /> Ubicación capturada
                </motion.div>
              )}
            </div>
            
            <div className="mt-8">
              <button 
                type="submit" 
                className={`w-full btn py-4 text-lg font-bold shadow-lg transition-all ${position ? 'btn-primary hover:-translate-y-1 hover:shadow-xl' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                disabled={loading || !position}
              >
                {loading ? 'Enviando reporte...' : 'Publicar Reporte'}
              </button>
            </div>
          </div>

        </div>
      </form>
    </motion.div>
  );
};

export default NewReport;
