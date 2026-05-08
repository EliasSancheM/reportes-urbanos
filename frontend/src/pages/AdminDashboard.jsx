import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = '/api';

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si es admin
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
      // Actualizar estado localmente
      setReports(reports.map(report => report.id === id ? { ...report, status: newStatus } : report));
    } catch (err) {
      alert('Error al actualizar el estado');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pendiente': return 'badge-pendiente';
      case 'en progreso': return 'badge-en-progreso';
      case 'resuelto': return 'badge-resuelto';
      default: return 'badge-pendiente';
    }
  };

  if (loading) return <div className="text-center mt-8">Cargando panel de administración...</div>;
  if (error) return <div className="text-center mt-8 text-danger">{error}</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Panel de Gestión Municipal</h1>
          <p className="text-muted">Administra y actualiza el estado de los reportes ciudadanos.</p>
        </div>
        <div className="badge" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem 1rem' }}>
          Módulo de Administrador
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Título / Categoría</th>
                <th className="p-4 font-semibold">Reportado por</th>
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Estado Actual</th>
                <th className="p-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="p-4">#{report.id}</td>
                  <td className="p-4">
                    <div className="font-bold">{report.title}</div>
                    <div className="text-sm text-muted">{report.category}</div>
                  </td>
                  <td className="p-4">{report.user_name}</td>
                  <td className="p-4">{new Date(report.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`badge ${getStatusBadgeClass(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select 
                      className="form-select" 
                      style={{ padding: '0.25rem 0.5rem', width: 'auto' }}
                      value={report.status}
                      onChange={(e) => handleStatusChange(report.id, e.target.value)}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en progreso">En Progreso</option>
                      <option value="resuelto">Resuelto</option>
                    </select>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-muted">No hay reportes disponibles.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
