import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const API_URL = '/api';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMyReports = async () => {
      try {
        const response = await axios.get(`${API_URL}/reports/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setReports(response.data);
      } catch (err) {
        setError('Error al cargar tus reportes personales.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyReports();
  }, [user, token, navigate]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pendiente': return 'badge-pendiente';
      case 'en progreso': return 'badge-en-progreso';
      case 'resuelto': return 'badge-resuelto';
      default: return 'badge-pendiente';
    }
  };

  if (loading) return <div className="text-center mt-8 text-primary font-medium">Cargando tus reportes...</div>;
  if (error) return <div className="text-center mt-8 text-danger">{error}</div>;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-6"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex justify-between items-center mb-4 border-b pb-4" 
        style={{ borderColor: 'var(--border)' }}
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Mis Reportes</h1>
          <p className="text-muted">Da seguimiento a los problemas que has reportado en la comunidad.</p>
        </div>
        <div className="text-center bg-white p-3 rounded shadow-sm border">
          <span className="block text-2xl font-bold text-primary">{reports.length}</span>
          <span className="text-xs text-muted font-semibold uppercase tracking-wider">Total</span>
        </div>
      </motion.div>

      {reports.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center p-12 bg-white rounded-lg shadow-sm border"
        >
          <h3 className="text-xl font-semibold mb-2">Aún no tienes reportes</h3>
          <p className="text-muted mb-6">Ayuda a mejorar tu ciudad reportando problemas en la vía pública.</p>
          <button onClick={() => navigate('/nuevo-reporte')} className="btn btn-primary">
            Crear mi primer reporte
          </button>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}
        >
          {reports.map((report) => (
            <motion.div 
              key={report.id} 
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: 'var(--shadow-lg)' }}
              className="card relative"
            >
              {report.image_url && (
                <img 
                  src={report.image_url} 
                  alt={report.title} 
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
                />
              )}
              <div className="card-body">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg leading-tight pr-2">{report.title}</h3>
                  <span className={`badge ${getStatusBadgeClass(report.status)} whitespace-nowrap`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-sm text-primary mb-3 font-semibold">{report.category}</p>
                <p className="text-sm mb-4 text-muted" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {report.description}
                </p>
                <div className="flex justify-between items-center pt-3 border-t mt-auto" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs text-muted font-medium">#{report.id}</span>
                  <span className="text-xs text-muted">{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {/* Progress bar visual indicator */}
              <div style={{
                height: '4px',
                width: report.status === 'resuelto' ? '100%' : (report.status === 'en progreso' ? '50%' : '10%'),
                backgroundColor: report.status === 'resuelto' ? 'var(--success)' : (report.status === 'en progreso' ? 'var(--warning)' : 'var(--danger)'),
                transition: 'width 1s ease-in-out'
              }} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default MyReports;
