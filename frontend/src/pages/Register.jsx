import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';

const API_URL = '/api';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null); // To store message and demo token

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/register`, formData);
      setSuccessData({
        message: response.data.message,
        token: response.data.verificationToken
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-4 min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring" }}
        className="w-full max-w-md"
      >
        <div className="bg-surface rounded-2xl shadow-xl border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-teal-600 p-8 text-center">
            <h2 className="text-3xl font-extrabold text-white mb-2">Únete a la Red</h2>
            <p className="text-primary-light text-sm">Crea tu cuenta de vecino para participar</p>
          </div>
          
          <div className="p-8">
            <AnimatePresence mode="wait">
              {!successData ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 bg-red-50 text-danger p-3 rounded-lg text-sm mb-6 border border-red-200">
                      <AlertCircle size={18} /> {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-group mb-0 relative">
                      <label className="form-label" htmlFor="name">Nombre Completo</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={18} />
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className="form-input pl-10"
                          placeholder="Juan Pérez"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group mb-0 relative">
                      <label className="form-label" htmlFor="email">Correo Electrónico</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={18} />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className="form-input pl-10"
                          placeholder="tu@correo.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group mb-0 relative">
                      <label className="form-label" htmlFor="password">Contraseña</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={18} />
                        <input
                          type="password"
                          id="password"
                          name="password"
                          className="form-input pl-10"
                          placeholder="Mínimo 6 caracteres"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          minLength="6"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary w-full py-3 text-base mt-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all" 
                      disabled={loading}
                    >
                      {loading ? 'Creando cuenta...' : (
                        <>Registrarme <ArrowRight size={18} /></>
                      )}
                    </button>
                  </form>

                  <div className="mt-8 text-center text-sm border-t border-border pt-6">
                    <span className="text-muted">¿Ya tienes cuenta? </span>
                    <Link to="/login" className="font-bold text-primary hover:underline">Inicia Sesión</Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-2">¡Casi listo!</h3>
                  <p className="text-muted mb-6">{successData.message}</p>
                  
                  {/* DEMO PURPOSES ONLY */}
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6">
                    <p className="text-xs text-blue-800 font-medium mb-3">
                      (Modo Demostración) En un entorno real recibirías un correo electrónico. Haz clic en el botón para simular la verificación:
                    </p>
                    <Link to={`/verify/${successData.token}`} className="btn bg-blue-600 text-white w-full py-2 shadow-sm hover:bg-blue-700">
                      Simular Verificación
                    </Link>
                  </div>

                  <Link to="/login" className="text-sm font-bold text-primary hover:underline block mt-4">
                    Ir a Iniciar Sesión
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
