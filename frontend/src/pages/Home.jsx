import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const API_URL = '/api';

const Home = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`${API_URL}/reports`);
        setReports(response.data);
        setLoading(false);
      } catch (err) {
        console.warn('Backend not available, using mock data for demonstration.');
        // Fallback a datos falsos para demostración visual
        setReports([
          {
            id: 1,
            title: 'Bache gigante en la calle principal',
            description: 'Hay un bache profundo que está dañando los vehículos que pasan.',
            category: 'Baches y pavimento dañado',
            status: 'pendiente',
            lat: -33.4489,
            lng: -70.6693,
            user_name: 'Juan Pérez',
            created_at: new Date().toISOString(),
            image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=400&q=80'
          },
          {
            id: 2,
            title: 'Luminaria rota en el parque',
            description: 'El parque está completamente a oscuras de noche.',
            category: 'Luminarias en mal estado',
            status: 'en progreso',
            lat: -33.4569,
            lng: -70.6483,
            user_name: 'María Silva',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            image_url: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=400&q=80'
          },
          {
            id: 3,
            title: 'Basura acumulada en esquina',
            description: 'Vecinos han dejado escombros y basura en la esquina por semanas.',
            category: 'Microbasurales y acumulación de escombros',
            status: 'resuelto',
            lat: -33.4389,
            lng: -70.6593,
            user_name: 'Carlos Muñoz',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=80'
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

  if (loading) return <div className="text-center mt-8">Cargando reportes...</div>;
  if (error) return <div className="text-center mt-8 text-danger">{error}</div>;

  const defaultCenter = [-33.4489, -70.6693]; // Santiago, Chile as default

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Reportes Ciudadanos</h1>
        <p className="text-muted">Explora los problemas urbanos reportados en tu comunidad</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Mapa de Incidentes</h2>
        </div>
        <div className="map-container">
          <MapContainer center={defaultCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {reports.map((report) => (
              report.lat && report.lng && (
                <Marker key={report.id} position={[report.lat, report.lng]}>
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
        <h2 className="text-2xl font-bold mb-4">Últimos Reportes</h2>
        {reports.length === 0 ? (
          <p className="text-muted">No hay reportes registrados aún.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {reports.map((report) => (
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
