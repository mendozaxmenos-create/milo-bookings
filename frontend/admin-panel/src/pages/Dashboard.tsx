import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getDashboardStats, type DashboardStats } from '../services/api';
import api from '../services/api';

type BookingSummary = {
  id: string;
  service_name: string;
  customer_name?: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  status: string;
};

// Función auxiliar para formatear moneda
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function Dashboard() {
  // Obtener estadísticas del dashboard
  const { data: dashboardData, isLoading: statsLoading, error: statsError } = useQuery<{ data: DashboardStats }>({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    retry: false,
  });

  // Obtener reservas recientes (para la lista)
  const { data: bookings } = useQuery<{ data: BookingSummary[] }>({
    queryKey: ['bookings'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/bookings?limit=5');
        return response.data;
      } catch (error) {
        console.error('[Dashboard] Error fetching bookings:', error);
        return { data: [] };
      }
    },
    retry: false,
  });

  const stats = dashboardData?.data;
  const financial = stats?.financial;
  const advanced = stats?.advanced;

  if (statsLoading) {
    return <div style={{ padding: '2rem' }}>Cargando estadísticas...</div>;
  }

  if (statsError) {
    console.warn('[Dashboard] Error loading stats, showing defaults:', statsError);
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>
      
      {/* Stats Cards - Básicas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
            {stats?.services?.total || 0}
          </div>
          <div style={{ color: '#666', marginTop: '0.5rem' }}>Total Servicios</div>
          <div style={{ fontSize: '0.875rem', color: '#28a745', marginTop: '0.5rem' }}>
            {stats?.services?.active || 0} activos
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
            {stats?.bookings?.total || 0}
          </div>
          <div style={{ color: '#666', marginTop: '0.5rem' }}>Total Reservas</div>
          <div style={{ fontSize: '0.875rem', color: '#ffc107', marginTop: '0.5rem' }}>
            {(stats?.bookings?.pending || 0) + (stats?.bookings?.pending_payment || 0)} pendientes
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#17a2b8' }}>
            {stats?.bookings?.confirmed || 0}
          </div>
          <div style={{ color: '#666', marginTop: '0.5rem' }}>Reservas Confirmadas</div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6c757d' }}>
            {stats?.bookings?.today || 0}
          </div>
          <div style={{ color: '#666', marginTop: '0.5rem' }}>Reservas Hoy</div>
        </div>
      </div>

      {/* Métricas Financieras (Plan Intermedio/Premium) */}
      {financial && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #28a745',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
              {formatCurrency(financial.totalRevenue)}
            </div>
            <div style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.875rem' }}>Ingresos Totales</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #007bff',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>
              {formatCurrency(financial.monthRevenue)}
            </div>
            <div style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.875rem' }}>Ingresos del Mes</div>
            {financial.monthVariation !== 0 && (
              <div style={{
                fontSize: '0.75rem',
                color: financial.monthVariation > 0 ? '#28a745' : '#dc3545',
                marginTop: '0.5rem',
              }}>
                {financial.monthVariation > 0 ? '↑' : '↓'} {Math.abs(financial.monthVariation).toFixed(1)}% vs mes anterior
              </div>
            )}
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #ffc107',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc107' }}>
              {formatCurrency(financial.todayRevenue)}
            </div>
            <div style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.875rem' }}>Ingresos de Hoy</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #17a2b8',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#17a2b8' }}>
              {formatCurrency(financial.avgTicket)}
            </div>
            <div style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.875rem' }}>Ticket Promedio</div>
          </div>
        </div>
      )}

      {/* Métricas Avanzadas (Solo Plan Premium) */}
      {advanced && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
        }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Análisis Avanzado</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
          }}>
            {advanced.mostPopularService && (
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#007bff' }}>
                  {advanced.mostPopularService.name}
                </div>
                <div style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Servicio Más Popular
                </div>
                <div style={{ color: '#28a745', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {advanced.mostPopularService.bookingsCount} reservas
                </div>
              </div>
            )}
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#007bff' }}>
                {advanced.uniqueCustomers}
              </div>
              <div style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Clientes Únicos
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#28a745' }}>
                {advanced.recurringCustomers}
              </div>
              <div style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Clientes Recurrentes
              </div>
              <div style={{ color: '#17a2b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {advanced.retentionRate.toFixed(1)}% retención
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: advanced.noShowRate > 20 ? '#dc3545' : advanced.noShowRate > 10 ? '#ffc107' : '#28a745' }}>
                {advanced.noShowRate.toFixed(1)}%
              </div>
              <div style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Tasa de No-Show
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Acciones Rápidas</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            to="/services"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            + Nuevo Servicio
          </Link>
          <Link
            to="/bookings"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            Ver Reservas
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Reservas Recientes</h2>
          <Link
            to="/bookings"
            style={{
              color: '#007bff',
              textDecoration: 'none',
            }}
          >
            Ver todas →
          </Link>
        </div>
        {bookings?.data?.slice(0, 5).map((booking) => (
          <div
            key={booking.id}
            style={{
              padding: '1rem',
              borderBottom: '1px solid #dee2e6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold' }}>{booking.service_name}</div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                {booking.customer_name || booking.customer_phone} - {new Date(booking.booking_date).toLocaleDateString('es-ES')} {booking.booking_time}
              </div>
            </div>
            <div>
              <span style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: booking.status === 'confirmed' ? '#d4edda' : '#fff3cd',
                color: booking.status === 'confirmed' ? '#155724' : '#856404',
                fontSize: '0.875rem',
              }}>
                {booking.status === 'pending' && 'Pendiente'}
                {booking.status === 'pending_payment' && 'Pago Pendiente'}
                {booking.status === 'confirmed' && 'Confirmada'}
                {booking.status === 'cancelled' && 'Cancelada'}
                {booking.status === 'completed' && 'Completada'}
              </span>
            </div>
          </div>
        ))}
        {bookings?.data?.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            No hay reservas recientes.
          </div>
        )}
      </div>
    </div>
  );
}

