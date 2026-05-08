import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MapPin, LogOut, User, PlusCircle, Settings, FileText } from 'lucide-react';

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
        <Link to="/" className="brand">
          <MapPin size={24} />
          Reportes Urbanos
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/mis-reportes" className="btn btn-outline" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                <FileText size={18} />
                Mis Reportes
              </Link>
              <Link to="/nuevo-reporte" className="btn btn-primary">
                <PlusCircle size={18} />
                Nuevo Reporte
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-outline" title="Panel de Administración">
                  <Settings size={18} />
                  Panel Admin
                </Link>
              )}
              <div className="flex items-center gap-2 text-muted">
                <User size={18} />
                <span className="font-medium">{user.name || 'Usuario'}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline" title="Cerrar sesión">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Iniciar Sesión</Link>
              <Link to="/register" className="btn btn-primary">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
