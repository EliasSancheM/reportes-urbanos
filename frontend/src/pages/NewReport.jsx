import { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const API_URL = '/api';

const CATEGORIES = [
  'Baches y pavimento dañado',
  'Luminarias en mal estado',
  'Microbasurales y acumulación de escombros',
  'Árboles caídos o peligrosos',
  'Filtraciones de agua o alcantarillado',
  'Animales abandonados o en riesgo',
  'Inmuebles abandonados o peligrosos',
  'Señalética dañada o faltante'
];

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

const NewReport = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
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
      setError('Por favor, selecciona la ubicación en el mapa.');
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
    }
  };

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card-header">
        <h2 className="text-2xl font-bold">Reportar Problema Urbano</h2>
      </div>
      <div className="card-body">
        {error && <div className="text-danger mb-4 p-4" style={{ backgroundColor: '#fee2e2', borderRadius: '0.5rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="flex gap-6 flex-col" style={{ '@media(min-width: 768px)': { flexDirection: 'row' }}}>
            <div style={{ flex: 1 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Título del problema</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Bache profundo en la calle"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="category">Categoría</label>
                <select
                  id="category"
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Descripción detallada</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Describe el problema y su severidad..."
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Foto de evidencia (Opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-input"
                  style={{ padding: '0.5rem' }}
                />
                {preview && (
                  <div className="mt-4">
                    <img src={preview} alt="Vista previa" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                  </div>
                )}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div className="form-group">
                <label className="form-label">Ubicación (Haz clic en el mapa)</label>
                <div className="map-container" style={{ height: '350px' }}>
                  <MapContainer center={[-33.4489, -70.6693]} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={setPosition} />
                  </MapContainer>
                </div>
                {!position && <p className="text-sm text-warning mt-2">Requerido: Haz clic en el mapa para marcar la ubicación.</p>}
                {position && <p className="text-sm text-success mt-2">Ubicación seleccionada correctamente.</p>}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }} disabled={loading}>
              {loading ? 'Enviando reporte...' : 'Enviar Reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewReport;
