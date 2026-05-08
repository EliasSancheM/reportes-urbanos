import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, Filter, AlertCircle, Clock, CheckCircle, Activity, X, MapPin, User, Calendar, Image as ImageIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

const API_URL = '/api';

// Reusing the map icon
const customIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<svg width="32" height="48" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12zm0 16.5c-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 7.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z" fill="#059669"/>
         </svg>`,
  iconSize: [32, 48],
  iconAnchor: [16, 48]
});

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering and Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  
  // Slide-over State
  const [selectedReport, setSelectedReport] = useState(null);

  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchReports();
  }, [user, navigate]);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports`);
      setReports(response.data);
    } catch (err) {
      setError('Error al cargar los reportes.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/reports/${id}/status`, { status: newStatus }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setReports(reports.map(report => report.id === id ? { ...report, status: newStatus } : report));
      if (selectedReport && selectedReport.id === id) {
        setSelectedReport({ ...selectedReport, status: newStatus });
      }
    } catch (err) {
      alert('Error al actualizar el estado');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este reporte para siempre?')) return;
    try {
      await axios.delete(`${API_URL}/reports/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setReports(reports.filter(report => report.id !== id));
      if (selectedReport && selectedReport.id === id) setSelectedReport(null);
    } catch (err) {
      alert('Error al eliminar el reporte');
    }
  };

  // Metrics Calculation
  const total = reports.length;
  const pendientes = reports.filter(r => r.status === 'pendiente').length;
  const enProgreso = reports.filter(r => r.status === 'en progreso').length;
  const resueltos = reports.filter(r => r.status === 'resuelto').length;

  // Filtering Logic
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          report.user_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="text-center mt-12 text-muted animate-pulse">Cargando Centro de Control...</div>;
  if (error) return <div className="text-center mt-12 text-danger font-bold flex items-center justify-center gap-2"><AlertCircle /> {error}</div>;

  return (
    <div className="relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-8 max-w-7xl mx-auto pb-12"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-secondary mb-1">Centro de Control</h1>
            <p className="text-muted">Gestión general de problemas y requerimientos ciudadanos.</p>
          </div>
          <div className="bg-primary-light text-primary px-4 py-2 rounded-full font-bold text-sm shadow-sm border border-primary">
            Administrador Municipal
          </div>
        </div>

        {/* KPIs Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl p-6 shadow-md border border-border">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted font-medium">Total Reportes</span>
              <Activity className="text-primary" size={24} />
            </div>
            <h3 className="text-4xl font-extrabold text-secondary">{total}</h3>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl p-6 shadow-md border border-border">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted font-medium">Pendientes</span>
              <AlertCircle className="text-danger" size={24} />
            </div>
            <h3 className="text-4xl font-extrabold text-danger">{pendientes}</h3>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl p-6 shadow-md border border-border">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted font-medium">En Progreso</span>
              <Clock className="text-warning" size={24} />
            </div>
            <h3 className="text-4xl font-extrabold text-warning">{enProgreso}</h3>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="bg-white rounded-2xl p-6 shadow-md border border-border">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted font-medium">Resueltos</span>
              <CheckCircle className="text-success" size={24} />
            </div>
            <h3 className="text-4xl font-extrabold text-success">{resueltos}</h3>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-4 shadow-md border border-border flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {['todos', 'pendiente', 'en progreso', 'resuelto'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-all ${
                  statusFilter === status 
                  ? 'bg-secondary text-white shadow-md' 
                  : 'bg-gray-100 text-muted hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="Buscar por título o vecino..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-md border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="p-4 font-semibold text-muted text-sm uppercase tracking-wider">Detalles</th>
                  <th className="p-4 font-semibold text-muted text-sm uppercase tracking-wider">Vecino</th>
                  <th className="p-4 font-semibold text-muted text-sm uppercase tracking-wider">Fecha</th>
                  <th className="p-4 font-semibold text-muted text-sm uppercase tracking-wider">Estado</th>
                  <th className="p-4 font-semibold text-muted text-sm uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredReports.map((report) => (
                    <motion.tr 
                      key={report.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-border hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedReport(report)}
                    >
                      <td className="p-4">
                        <div className="font-bold text-secondary mb-1 group-hover:text-primary transition-colors">{report.title}</div>
                        <div className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-md inline-block text-muted">{report.category}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                            {report.user_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-secondary">{report.user_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted">
                        {new Date(report.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <select 
                            className={`appearance-none font-bold text-xs px-3 py-1.5 rounded-full outline-none cursor-pointer border-2 transition-all ${
                              report.status === 'pendiente' ? 'bg-red-50 text-danger border-red-200 focus:border-danger' : 
                              report.status === 'en progreso' ? 'bg-yellow-50 text-warning border-yellow-200 focus:border-warning' : 
                              'bg-green-50 text-success border-green-200 focus:border-success'
                            }`}
                            value={report.status}
                            onChange={(e) => handleStatusChange(report.id, e.target.value)}
                          >
                            <option value="pendiente">🔴 Pendiente</option>
                            <option value="en progreso">🟡 En Progreso</option>
                            <option value="resuelto">🟢 Resuelto</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {report.status === 'resuelto' && (
                          <button 
                            onClick={() => handleDelete(report.id)}
                            className="p-2 rounded-lg text-danger hover:bg-red-50 transition-colors"
                            title="Eliminar reporte permanentemente"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-muted flex flex-col items-center justify-center gap-3">
                      <Filter size={32} className="opacity-50" />
                      No se encontraron reportes que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Slide-over Details Panel */}
      <AnimatePresence>
        {selectedReport && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSelectedReport(null)}
            />
            {/* Panel */}
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto flex flex-col"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                <h2 className="text-lg font-bold text-secondary">Detalles del Caso #{selectedReport.id}</h2>
                <button onClick={() => setSelectedReport(null)} className="p-2 bg-white rounded-full text-muted hover:text-danger shadow-sm border border-border">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 flex-grow space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-secondary mb-2">{selectedReport.title}</h3>
                  <span className="px-3 py-1 bg-gray-100 text-muted rounded-md text-xs font-bold inline-block mb-4">{selectedReport.category}</span>
                  <p className="text-secondary leading-relaxed bg-gray-50 p-4 rounded-xl border border-border">
                    {selectedReport.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-border flex flex-col gap-1">
                    <span className="text-xs text-muted font-semibold flex items-center gap-1"><User size={14}/> Reportado por</span>
                    <span className="font-bold text-sm text-secondary">{selectedReport.user_name}</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-border flex flex-col gap-1">
                    <span className="text-xs text-muted font-semibold flex items-center gap-1"><Calendar size={14}/> Fecha</span>
                    <span className="font-bold text-sm text-secondary">{new Date(selectedReport.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-muted mb-3 flex items-center gap-2"><MapPin size={16}/> Ubicación Exacta</h4>
                  <div className="h-48 rounded-xl overflow-hidden border border-border relative z-0">
                    <MapContainer center={[selectedReport.lat, selectedReport.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                      <Marker position={[selectedReport.lat, selectedReport.lng]} icon={customIcon} />
                    </MapContainer>
                  </div>
                </div>

                {selectedReport.image_url && (
                  <div>
                    <h4 className="text-sm font-bold text-muted mb-3 flex items-center gap-2"><ImageIcon size={16}/> Evidencia Fotográfica</h4>
                    <img src={selectedReport.image_url} alt="Evidencia" className="w-full rounded-xl border border-border shadow-sm" />
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-border bg-gray-50 sticky bottom-0">
                <label className="text-xs font-bold text-muted block mb-2">Cambiar estado del caso:</label>
                <select 
                  className={`w-full appearance-none font-bold text-sm px-4 py-3 rounded-xl outline-none cursor-pointer border-2 transition-all shadow-sm ${
                    selectedReport.status === 'pendiente' ? 'bg-red-50 text-danger border-red-200' : 
                    selectedReport.status === 'en progreso' ? 'bg-yellow-50 text-warning border-yellow-200' : 
                    'bg-green-50 text-success border-green-200'
                  }`}
                  value={selectedReport.status}
                  onChange={(e) => handleStatusChange(selectedReport.id, e.target.value)}
                >
                  <option value="pendiente">🔴 Marcar como Pendiente</option>
                  <option value="en progreso">🟡 Marcar como En Progreso</option>
                  <option value="resuelto">🟢 Marcar como Resuelto</option>
                </select>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
