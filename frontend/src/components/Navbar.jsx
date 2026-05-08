import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MapPin, LogOut, User, Plus, Settings, List } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="brand hover:scale-105 transition-transform">
          <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-primary shadow-sm">
            <MapPin size={22} fill="currentColor" className="text-primary" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-teal-600">
            Reportes Urbanos
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/mis-reportes" className="btn btn-outline text-sm" style={{ padding: '0.4rem 1rem' }}>
                <List size={16} />
                Mis Reportes
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-outline text-sm" title="Panel de Administración" style={{ padding: '0.4rem 1rem' }}>
                  <Settings size={16} />
                  Admin
                </Link>
              )}
              <div className="h-8 w-px bg-border mx-2"></div>
              <div className="flex items-center gap-2 bg-background py-1 px-3 rounded-full border border-border">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="font-semibold text-sm text-secondary">{user.name || 'Usuario'}</span>
              </div>
              <button onClick={handleLogout} className="p-2 text-muted hover:text-danger hover:bg-red-50 rounded-full transition-colors" title="Cerrar sesión">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline text-sm">Iniciar Sesión</Link>
              <Link to="/register" className="btn btn-primary text-sm shadow-md">Crear Cuenta</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
