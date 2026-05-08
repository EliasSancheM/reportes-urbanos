import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Filter } from 'lucide-react';

const API_URL = '/api';

const CATEGORIES = [
  'Todas',
  'Baches y pavimento dañado',
  'Luminarias en mal estado',
  'Microbasurales y acumulación de escombros',
  'Árboles caídos o peligrosos',
  'Filtraciones de agua o alcantarillado',
  'Animales abandonados o en riesgo',
  'Inmuebles abandonados o peligrosos',
  'Señalética dañada o faltante'
];

// Helper to create custom SVG colored markers
const createIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12zm0 16.5c-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 7.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z" fill="${color}"/>
           </svg>`,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36]
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
  
  // States for filters
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');

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
            id: 1, title: 'Bache gigante en la calle principal', description: 'Hay un bache profundo...', category: 'Baches y pavimento dañado', status: 'pendiente', lat: -33.4489, lng: -70.6693, user_name: 'Juan Pérez', created_at: new Date().toISOString(), image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=400&q=80'
          },
          {
            id: 2, title: 'Luminaria rota en el parque', description: 'El parque está completamente a oscuras...', category: 'Luminarias en mal estado', status: 'en progreso', lat: -33.4569, lng: -70.6483, user_name: 'María Silva', created_at: new Date(Date.now() - 86400000).toISOString(), image_url: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=400&q=80'
          },
          {
            id: 3, title: 'Basura acumulada en esquina', description: 'Vecinos han dejado escombros...', category: 'Microbasurales y acumulación de escombros', status: 'resuelto', lat: -33.4389, lng: -70.6593, user_name: 'Carlos Muñoz', created_at: new Date(Date.now() - 172800000).toISOString(), image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=80'
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

  // Filter logic
  const filteredReports = reports.filter(report => {
    const matchCategory = filterCategory === 'Todas' || report.category === filterCategory;
    const matchStatus = filterStatus === 'Todos' || report.status === filterStatus;
    return matchCategory && matchStatus;
  });

  if (loading) return <div className="text-center mt-8 text-lg font-medium text-primary">Cargando reportes en vivo...</div>;
  if (error) return <div className="text-center mt-8 text-danger">{error}</div>;

  const defaultCenter = [-33.4489, -70.6693];

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Reportes Ciudadanos</h1>
        <p className="text-muted">Explora los problemas urbanos reportados en tu comunidad</p>
      </div>

      {/* Filters Section */}
      <div className="card p-4 flex flex-col md:flex-row gap-4 items-center justify-between" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="flex items-center gap-2 font-semibold text-primary">
          <Filter size={20} />
          <span>Filtros Rápidos:</span>
        </div>
        <div className="flex flex-wrap gap-4" style={{ flex: 1, justifyContent: 'flex-end' }}>
          <select 
            className="form-select" 
            style={{ width: 'auto', minWidth: '200px' }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <select 
            className="form-select" 
            style={{ width: 'auto' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Todos">Todos los Estados</option>
            <option value="pendiente">Solo Pendientes (Rojo)</option>
            <option value="en progreso">En Progreso (Amarillo)</option>
            <option value="resuelto">Resueltos (Verde)</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h2 className="text-xl font-semibold">Mapa de Incidentes</h2>
          <span className="text-sm text-muted">Mostrando {filteredReports.length} reportes</span>
        </div>
        <div className="map-container">
          <MapContainer center={defaultCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredReports.map((report) => (
              report.lat && report.lng && (
                <Marker 
                  key={report.id} 
                  position={[report.lat, report.lng]}
                  icon={icons[report.status] || icons['pendiente']}
                >
                  <Popup>
                    <div style={{ minWidth: '200px' }}>
                      <h3 className="font-bold">{report.title}</h3>
                      <p className="text-sm text-muted mb-2">{report.category}</p>
                      <span className={`badge ${getStatusBadgeClass(report.status)}`}>
                        {report.status}
                      </span>
                      {report.image_url && (
                        <img 
                          src={report.image_url} 
                          alt={report.title} 
                          style={{ width: '100%', height: '120px', objectFit: 'cover', marginTop: '8px', borderRadius: '4px' }} 
                        />
                      )}
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Listado de Reportes</h2>
        {filteredReports.length === 0 ? (
          <div className="text-center p-8 border" style={{ borderRadius: 'var(--radius-lg)', borderColor: 'var(--border)' }}>
            <p className="text-muted text-lg">No se encontraron reportes con los filtros seleccionados.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {filteredReports.map((report) => (
              <div key={report.id} className="card">
                {report.image_url && (
                  <img 
                    src={report.image_url} 
                    alt={report.title} 
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
                  />
                )}
                <div className="card-body">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{report.title}</h3>
                    <span className={`badge ${getStatusBadgeClass(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-3 font-medium">{report.category}</p>
                  <p className="text-sm mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {report.description}
                  </p>
                  <div className="flex justify-between text-xs text-muted">
                    <span>Reportado por: {report.user_name}</span>
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
