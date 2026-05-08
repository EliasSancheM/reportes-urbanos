import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const API_URL = '/api';

const Verify = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Verificando tu correo electrónico...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/verify/${token}`);
        setStatus('success');
        setMessage(response.data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'No se pudo verificar el correo. El enlace podría ser inválido o haber expirado.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex justify-center items-center py-12 px-4 min-h-[60vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-surface rounded-2xl shadow-xl border border-border overflow-hidden p-8 text-center"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 size={48} className="text-primary animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-secondary mb-2">Verificando...</h2>
            <p className="text-muted">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 text-success rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-secondary mb-2">¡Cuenta Verificada!</h2>
            <p className="text-muted mb-6">{message}</p>
            <Link to="/login" className="btn btn-primary w-full py-3 shadow-md">
              Ir a Iniciar Sesión
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 text-danger rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-secondary mb-2">Error de Verificación</h2>
            <p className="text-muted mb-6">{message}</p>
            <Link to="/register" className="btn btn-outline w-full py-3">
              Volver a Registro
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Verify;
