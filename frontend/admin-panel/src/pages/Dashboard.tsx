import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1>Milo Bookings - Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Bienvenido, {user?.phone}</span>
          <button onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
      
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2>Panel de Administración</h2>
        <p style={{ marginTop: '1rem', color: '#666' }}>
          El panel de administración está en desarrollo. Aquí podrás gestionar:
        </p>
        <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
          <li>Servicios</li>
          <li>Reservas</li>
          <li>Disponibilidad</li>
          <li>Configuración del negocio</li>
        </ul>
      </div>
    </div>
  );
}

