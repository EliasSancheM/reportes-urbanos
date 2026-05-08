import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MapPin, LogOut, Settings, List, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container flex justify-between items-center w-full">
        <Link to="/" className="brand hover:scale-105 transition-transform flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-light rounded-full flex items-center justify-center text-primary shadow-sm flex-shrink-0">
            <MapPin size={18} fill="currentColor" className="text-primary md:w-[22px] md:h-[22px]" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-teal-600 font-extrabold text-lg md:text-xl truncate">
            Reportes
            <span className="hidden sm:inline"> Urbanos</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              <Link 
                to="/mis-reportes" 
                className="btn btn-outline text-sm flex items-center justify-center p-2 md:px-4 md:py-2" 
                title="Mis Reportes"
              >
                <List size={18} />
                <span className="hidden md:inline ml-2">Mis Reportes</span>
              </Link>
              {user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="btn btn-outline text-sm flex items-center justify-center p-2 md:px-4 md:py-2" 
                  title="Panel de Administración"
                >
                  <Settings size={18} />
                  <span className="hidden md:inline ml-2">Admin</span>
                </Link>
              )}
              <div className="hidden sm:block h-8 w-px bg-border mx-1 md:mx-2"></div>
              <div className="flex items-center gap-2 bg-background p-1 md:py-1 md:px-3 rounded-full border border-border">
                <div className="w-7 h-7 md:w-6 md:h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden md:block font-semibold text-sm text-secondary truncate max-w-[100px]">{user.name || 'Usuario'}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="p-2 text-muted hover:text-danger hover:bg-red-50 rounded-full transition-colors flex-shrink-0 ml-1" 
                title="Cerrar sesión"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline text-xs md:text-sm px-3 py-2 md:px-4">Ingresar</Link>
              <Link to="/register" className="btn btn-primary text-xs md:text-sm shadow-md px-3 py-2 md:px-4">Registro</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
