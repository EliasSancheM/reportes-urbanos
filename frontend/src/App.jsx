import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import NewReport from './pages/NewReport';
import AdminDashboard from './pages/AdminDashboard';
import MyReports from './pages/MyReports';
import { AuthProvider } from './context/AuthContext';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  return (
    <main className={isHome ? "full-width-main" : "container mt-8 mb-8"}>
      {children}
    </main>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify/:token" element={<Verify />} />
              <Route path="/nuevo-reporte" element={<NewReport />} />
              <Route path="/mis-reportes" element={<MyReports />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </MainLayout>
        </div>
      </Router>
    </AuthProvider>
  );
}
export default App;
