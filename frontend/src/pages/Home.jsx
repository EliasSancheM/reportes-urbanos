import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Filter, Search, MapPin, Activity, Clock, CheckCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = '/api';

const CATEGORIES = [
  'Todas',
  'Baches y pavimento dañado',
  'Luminarias en mal estado',
  'Microbasurales',
  'Árboles caídos o peligrosos',
  'Filtraciones de agua',
  'Animales en riesgo',
  'Inmuebles abandonados',
  'Señalética dañada',
  'Seguridad y robos'
];

// Helper to create custom SVG colored markers
const createIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<svg width="32" height="48" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12zm0 16.5c-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 7.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z" fill="${color}"/>
           </svg>`,
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48]
  });
};

const icons = {
  'pendiente': createIcon('#ef4444'),    // Rojo
  'en progreso': createIcon('#f59e0b'), // Amarillo
  'resuelto': createIcon('#10b981')     // Verde
};

const Home = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReportId, setActiveReportId] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`${API_URL}/reports`);
        setReports(response.data);
        setLoading(false);
      } catch (err) {
        console.warn('Backend not available, using mock data for demonstration.');
        setReports([
          {
            id: 1, title: 'Bache gigante en la calle principal', description: 'Hay un bache profundo que está dañando los autos que pasan. Se necesita reparación urgente.', category: 'Baches y pavimento dañado', status: 'pendiente', lat: -33.5229, lng: -70.5983, user_name: 'Juan Pérez', created_at: new Date().toISOString(), image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=400&q=80'
          },
          {
            id: 2, title: 'Luminaria rota en el parque', description: 'El parque está completamente a oscuras en el sector norte, es un peligro en la noche.', category: 'Luminarias en mal estado', status: 'en progreso', lat: -33.5169, lng: -70.6183, user_name: 'María Silva', created_at: new Date(Date.now() - 86400000).toISOString(), image_url: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=400&q=80'
          },
          {
            id: 3, title: 'Basura acumulada en esquina', description: 'Vecinos han dejado escombros y basura durante el fin de semana.', category: 'Microbasurales', status: 'resuelto', lat: -33.5389, lng: -70.5893, user_name: 'Carlos Muñoz', created_at: new Date(Date.now() - 172800000).toISOString(), image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=80'
          },
          {
            id: 4, title: 'Árbol a punto de caer', description: 'Un árbol viejo está muy inclinado hacia la calle tras la última tormenta.', category: 'Árboles caídos o peligrosos', status: 'pendiente', lat: -33.5410, lng: -70.6050, user_name: 'Ana López', created_at: new Date(Date.now() - 40000000).toISOString(), image_url: 'https://images.unsplash.com/photo-1615807713086-bfc473a21b36?auto=format&fit=crop&w=400&q=80'
          },
          {
            id: 5, title: 'Actividad sospechosa anoche', description: 'Sujetos rondando los autos estacionados en la calle de atrás.', category: 'Seguridad y robos', status: 'pendiente', lat: -33.5250, lng: -70.6100, user_name: 'Pedro Gómez', created_at: new Date(Date.now() - 10000000).toISOString()
          }
        ]);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pendiente': return 'badge-pendiente';
      case 'en progreso': return 'badge-en-progreso';
      case 'resuelto': return 'badge-resuelto';
      default: return 'badge-pendiente';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchCategory = filterCategory === 'Todas' || report.category === filterCategory;
    const matchStatus = filterStatus === 'Todos' || report.status === filterStatus;
    const matchSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        report.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchStatus && matchSearch;
  });

  if (loading) return (
    <div className="flex justify-center items-center h-full w-full">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
      />
    </div>
  );

  if (error) return <div className="text-center mt-8 text-danger font-semibold">{error}</div>;

  // Centro de La Florida aprox
  const defaultCenter = [-33.5289, -70.5983];

  return (
    <>
      {/* PANEL IZQUIERDO: Feed de Reportes */}
      <div className="home-feed-panel">
        <div className="p-4 md:p-5 border-b border-border bg-surface sticky top-0 z-20">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-secondary leading-none mb-1">Incidentes</h1>
              <p className="text-[10px] md:text-xs text-muted">Descubre lo que ocurre en tu barrio</p>
            </div>
            <Link 
              to="/nuevo-reporte"
              className="flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-lg font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-xs md:text-sm"
            >
              <Plus size={16} />
              Reportar
            </Link>
          </div>
          
          <div className="form-group relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={18} />
            <input 
              type="text" 
              className="form-input pl-10 bg-background text-sm" 
              placeholder="Buscar reportes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select 
              className="form-select text-xs py-2 bg-background flex-1" 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <select 
              className="form-select text-xs py-2 bg-background w-1/3" 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="en progreso">Progreso</option>
              <option value="resuelto">Resueltos</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4" style={{ backgroundColor: '#f8fafc' }}>
          <AnimatePresence>
            {filteredReports.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center p-8 text-muted"
              >
                No se encontraron reportes.
              </motion.div>
            ) : (
              filteredReports.map((report) => (
                <motion.div 
                  key={report.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
                  onClick={() => setActiveReportId(report.id)}
                  className={`bg-surface rounded-xl border p-3 md:p-4 cursor-pointer transition-colors ${activeReportId === report.id ? 'border-primary ring-1 ring-primary' : 'border-border'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`badge ${getStatusBadgeClass(report.status)} text-[10px]`}>
                      {report.status}
                    </span>
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Clock size={12} /> {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm md:text-base leading-tight mb-1 text-secondary">{report.title}</h3>
                  <p className="text-[10px] md:text-xs text-primary font-medium mb-2">{report.category}</p>
                  
                  {report.image_url && (
                    <div className="mt-2 mb-3 rounded-lg overflow-hidden h-24 md:h-32 w-full relative">
                      <img src={report.image_url} alt={report.title} className="object-cover w-full h-full" />
                    </div>
                  )}
                  
                  <p className="text-xs md:text-sm text-muted line-clamp-2 mb-3 leading-relaxed">
                    {report.description}
                  </p>
                  
                  <div className="flex justify-between items-center text-[10px] md:text-xs font-medium text-secondary pt-3 border-t border-border">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary-light text-primary flex items-center justify-center">
                        {report.user_name.charAt(0)}
                      </div>
                      {report.user_name}
                    </div>
                    <div className="flex items-center gap-1 text-primary hover:underline">
                      <MapPin size={12} /> Mapa
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* PANEL DERECHO: Mapa */}
      <div className="home-map-panel">
        <MapContainer 
          center={defaultCenter} 
          zoom={13} 
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {filteredReports.map((report) => (
            report.lat && report.lng && (
              <Marker 
                key={report.id} 
                position={[report.lat, report.lng]}
                icon={icons[report.status] || icons['pendiente']}
                eventHandlers={{
                  click: () => setActiveReportId(report.id),
                }}
              >
                <Popup className="premium-popup">
                  <div className="p-1" style={{ minWidth: '200px' }}>
                    <span className={`badge ${getStatusBadgeClass(report.status)} text-[10px] mb-2`}>
                      {report.status}
                    </span>
                    <h3 className="font-bold text-sm leading-tight mb-1">{report.title}</h3>
                    <p className="text-xs text-muted mb-2">{report.category}</p>
                    {report.image_url && (
                      <img 
                        src={report.image_url} 
                        alt={report.title} 
                        className="w-full h-24 object-cover rounded-md mb-2"
                      />
                    )}
                    <button className="w-full btn btn-primary py-1 text-xs mt-1">Ver detalles</button>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>
    </>
  );
};

export default Home;
