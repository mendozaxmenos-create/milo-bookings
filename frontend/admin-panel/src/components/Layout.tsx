import { Outlet, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getBusiness } from '../services/api';

export function Layout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const isSuperAdmin = user?.is_system_user && user?.role === 'super_admin';
  
  // Detectar si estamos viendo un negocio específico como super admin
  const isViewingBusiness = isSuperAdmin && params.businessId;
  const businessId = params.businessId;

  // Obtener información del negocio si estamos viéndolo
  const { data: businessData } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => getBusiness(businessId!),
    enabled: !!isViewingBusiness && !!businessId,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (isViewingBusiness) {
      // Para rutas de vista de negocio, comparar con la ruta relativa
      const currentPath = location.pathname.replace(`/admin/businesses/${businessId}/view`, '');
      return currentPath === path || (path === '/dashboard' && currentPath === '');
    }
    return location.pathname === path;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px',
        backgroundColor: '#343a40',
        color: 'white',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>Milo Bookings</h2>
          {isViewingBusiness && businessData?.data && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '6px',
              fontSize: '0.85rem',
            }}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                👁️ Viendo:
              </div>
              <div style={{ color: '#fff', wordBreak: 'break-word' }}>
                {businessData.data.name}
              </div>
              <Link
                to="/admin/businesses"
                style={{
                  display: 'inline-block',
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#80bdff',
                  textDecoration: 'none',
                }}
              >
                ← Volver a Negocios
              </Link>
            </div>
          )}
        </div>
        
        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {isSuperAdmin && !isViewingBusiness ? (
              <>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link
                    to="/admin/businesses"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      color: isActive('/admin/businesses') ? '#fff' : '#adb5bd',
                      backgroundColor: isActive('/admin/businesses') ? '#495057' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive('/admin/businesses')) {
                        e.currentTarget.style.backgroundColor = '#3d4248';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('/admin/businesses')) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>🏢</span>
                    <span>Negocios</span>
                  </Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link
                    to="/admin/shortlinks"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      color: isActive('/admin/shortlinks') ? '#fff' : '#adb5bd',
                      backgroundColor: isActive('/admin/shortlinks') ? '#495057' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive('/admin/shortlinks')) {
                        e.currentTarget.style.backgroundColor = '#3d4248';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('/admin/shortlinks')) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>🔗</span>
                    <span>Shortlinks</span>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link
                    to={isViewingBusiness ? `/admin/businesses/${businessId}/view/dashboard` : '/dashboard'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      color: isActive('/dashboard') ? '#fff' : '#adb5bd',
                      backgroundColor: isActive('/dashboard') ? '#495057' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive('/dashboard')) {
                        e.currentTarget.style.backgroundColor = '#3d4248';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('/dashboard')) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>📊</span>
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link
                    to={isViewingBusiness ? `/admin/businesses/${businessId}/view/services` : '/services'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      color: isActive('/services') ? '#fff' : '#adb5bd',
                      backgroundColor: isActive('/services') ? '#495057' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive('/services')) {
                        e.currentTarget.style.backgroundColor = '#3d4248';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('/services')) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>🛎️</span>
                    <span>Servicios</span>
                  </Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link
                    to={isViewingBusiness ? `/admin/businesses/${businessId}/view/bookings` : '/bookings'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      color: isActive('/bookings') ? '#fff' : '#adb5bd',
                      backgroundColor: isActive('/bookings') ? '#495057' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive('/bookings')) {
                        e.currentTarget.style.backgroundColor = '#3d4248';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('/bookings')) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>📅</span>
                    <span>Reservas</span>
                  </Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link
                    to={isViewingBusiness ? `/admin/businesses/${businessId}/view/availability` : '/availability'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      color: isActive('/availability') ? '#fff' : '#adb5bd',
                      backgroundColor: isActive('/availability') ? '#495057' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive('/availability')) {
                        e.currentTarget.style.backgroundColor = '#3d4248';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('/availability')) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>⏰</span>
                    <span>Horarios</span>
                  </Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link
                    to={isViewingBusiness ? `/admin/businesses/${businessId}/view/settings` : '/settings'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      color: isActive('/settings') ? '#fff' : '#adb5bd',
                      backgroundColor: isActive('/settings') ? '#495057' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive('/settings')) {
                        e.currentTarget.style.backgroundColor = '#3d4248';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('/settings')) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>⚙️</span>
                    <span>Configuración</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #495057' }}>
          <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#adb5bd' }}>
            <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
              {user?.email || user?.phone}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
              {isSuperAdmin && '👑 Super Administrador'}
              {!isSuperAdmin && user?.role === 'owner' && '👑 Propietario'}
              {!isSuperAdmin && user?.role === 'admin' && '⚙️ Administrador'}
              {!isSuperAdmin && user?.role === 'staff' && '👤 Staff'}
            </div>
          </div>
          {isViewingBusiness && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: 'rgba(255,193,7,0.15)',
              borderRadius: '6px',
              border: '1px solid rgba(255,193,7,0.3)',
              fontSize: '0.75rem',
              color: '#ffc107',
            }}>
              ⚠️ Modo Vista: Estás viendo este negocio como super admin
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <Outlet />
      </main>
    </div>
  );
}

