import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getShortlinkAnalyticsDashboard,
  getShortlinkDetails,
  type ShortlinkAnalyticsDashboard,
  type ShortlinkDetails,
} from '../services/api';

const DAYS_OF_WEEK = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function ShortlinkAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedShortlink, setSelectedShortlink] = useState<string | null>(null);

  // Calcular fechas según el período seleccionado
  const dateRange = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();

    switch (selectedPeriod) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setMonth(start.getMonth() - 1);
        break;
      case '90d':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'custom':
        if (startDate && endDate) {
          return {
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
          };
        }
        break;
    }

    start.setHours(0, 0, 0, 0);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [selectedPeriod, startDate, endDate]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['shortlink-analytics', dateRange.startDate, dateRange.endDate],
    queryFn: () => getShortlinkAnalyticsDashboard({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }),
  });

  const dashboard = data?.data;

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Cargando estadísticas...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '4px',
        }}>
          Error al cargar estadísticas: {error instanceof Error ? error.message : 'Error desconocido'}
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return <div style={{ padding: '2rem' }}>No hay datos disponibles</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Analytics de Shortlinks</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="custom">Personalizado</option>
          </select>
          {selectedPeriod === 'custom' && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </>
          )}
        </div>
      </div>

      {/* Métricas Principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <MetricCard
          title="Total de Clics"
          value={dashboard.summary.total.toLocaleString()}
          change={dashboard.summary.totalChange}
          previousValue={dashboard.summary.previousTotal}
          color="#007bff"
        />
        <MetricCard
          title="Shortlinks Activos"
          value={dashboard.summary.activeCount.toString()}
          subtitle={`de ${dashboard.summary.totalShortlinks} totales`}
          color="#28a745"
        />
        <MetricCard
          title="Promedio de Clics"
          value={dashboard.summary.avgClicks}
          subtitle="por shortlink"
          color="#17a2b8"
        />
      </div>

      {/* Gráfico de Tendencias */}
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Tendencias de Clics</h2>
        <TrendsChart data={dashboard.trends.byDate} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Top Shortlinks */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Top Shortlinks</h2>
          <TopShortlinksList
            shortlinks={dashboard.topShortlinks}
            onSelect={(slug) => setSelectedShortlink(slug)}
          />
        </div>

        {/* Distribución por Hora */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Distribución por Hora</h2>
          <HourDistributionChart data={dashboard.distribution.byHour} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Distribución por Día de la Semana */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Distribución por Día</h2>
          <DayOfWeekChart data={dashboard.distribution.byDayOfWeek} />
        </div>

        {/* Dispositivos */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Dispositivos</h2>
          <DeviceChart data={dashboard.devices.devices} />
        </div>
      </div>

      {/* Tabla Detallada de Shortlinks */}
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Todos los Shortlinks</h2>
        <ShortlinksTable
          shortlinks={dashboard.shortlinks}
          onSelect={(slug) => setSelectedShortlink(slug)}
        />
      </div>

      {/* Análisis Avanzado */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Navegadores */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Navegadores</h2>
          <BrowserChart data={dashboard.devices.browsers} />
        </div>

        {/* Fuentes de Tráfico */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Fuentes de Tráfico</h2>
          <ReferersList referers={dashboard.referers} />
        </div>
      </div>

      {/* Accesos Recientes */}
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Accesos Recientes</h2>
        <RecentAccessesTable accesses={dashboard.recentAccesses} />
      </div>

      {/* Modal de Detalle de Shortlink */}
      {selectedShortlink && (
        <ShortlinkDetailsModal
          slug={selectedShortlink}
          onClose={() => setSelectedShortlink(null)}
        />
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  previousValue,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  change?: string;
  previousValue?: number;
  subtitle?: string;
  color: string;
}) {
  const changeNum = change ? parseFloat(change) : 0;
  const isPositive = changeNum >= 0;

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color, marginBottom: '0.25rem' }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.75rem', color: '#999' }}>{subtitle}</div>
      )}
      {change && previousValue !== undefined && (
        <div style={{
          fontSize: '0.875rem',
          color: isPositive ? '#28a745' : '#dc3545',
          marginTop: '0.5rem',
        }}>
          {isPositive ? '↑' : '↓'} {Math.abs(changeNum).toFixed(1)}% vs período anterior
          {previousValue > 0 && (
            <span style={{ color: '#666', marginLeft: '0.5rem' }}>
              ({previousValue.toLocaleString()} clics)
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function TrendsChart({ data }: { data: Array<{ date: string; count: number }> }) {
  if (data.length === 0) {
    return <div style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No hay datos para mostrar</div>;
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const chartHeight = 200;

  return (
    <div style={{ position: 'relative', height: `${chartHeight + 40}px` }}>
      <svg width="100%" height={chartHeight + 40} style={{ overflow: 'visible' }}>
        {/* Eje Y */}
        <line x1="40" y1="20" x2="40" y2={chartHeight + 20} stroke="#ddd" strokeWidth="2" />
        
        {/* Eje X */}
        <line x1="40" y1={chartHeight + 20} x2="100%" y2={chartHeight + 20} stroke="#ddd" strokeWidth="2" />
        
        {/* Línea de datos */}
        {data.length > 1 && data.map((point, index) => {
          if (index === 0) return null;
          const prevPoint = data[index - 1];
          const x1 = 40 + ((index - 1) / (data.length - 1)) * (100 - 10);
          const y1 = chartHeight + 20 - (prevPoint.count / maxCount) * chartHeight;
          const x2 = 40 + (index / (data.length - 1)) * (100 - 10);
          const y2 = chartHeight + 20 - (point.count / maxCount) * chartHeight;
          
          return (
            <line
              key={`line-${index}`}
              x1={`${x1}%`}
              y1={y1}
              x2={`${x2}%`}
              y2={y2}
              stroke="#007bff"
              strokeWidth="2"
            />
          );
        })}
        
        {/* Puntos */}
        {data.map((point, index) => {
          const x = 40 + (index / (data.length - 1 || 1)) * (100 - 10);
          const y = chartHeight + 20 - (point.count / maxCount) * chartHeight;
          
          return (
            <circle
              key={`point-${index}`}
              cx={`${x}%`}
              cy={y}
              r="4"
              fill="#007bff"
            />
          );
        })}
      </svg>
      
      {/* Etiquetas de fechas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#666' }}>
        {data.length > 0 && (
          <>
            <span>{new Date(data[0].date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</span>
            <span>{new Date(data[data.length - 1].date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</span>
          </>
        )}
      </div>
    </div>
  );
}

function TopShortlinksList({
  shortlinks,
  onSelect,
}: {
  shortlinks: Array<{ slug: string; name: string; count: number; percentage: string }>;
  onSelect: (slug: string) => void;
}) {
  if (shortlinks.length === 0) {
    return <div style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No hay datos</div>;
  }

  const maxCount = Math.max(...shortlinks.map(s => s.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {shortlinks.map((shortlink, index) => (
        <div
          key={shortlink.slug}
          onClick={() => onSelect(shortlink.slug)}
          style={{
            cursor: 'pointer',
            padding: '0.75rem',
            borderRadius: '4px',
            backgroundColor: '#f8f9fa',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>#{index + 1} {shortlink.name}</div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>/{shortlink.slug}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>{shortlink.count}</div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>{shortlink.percentage}%</div>
            </div>
          </div>
          <div style={{
            height: '8px',
            backgroundColor: '#e9ecef',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div
              style={{
                height: '100%',
                width: `${(shortlink.count / maxCount) * 100}%`,
                backgroundColor: '#007bff',
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function HourDistributionChart({ data }: { data: Array<{ hour: number; count: number }> }) {
  if (data.length === 0) {
    return <div style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No hay datos</div>;
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const chartHeight = 150;

  // Crear array completo de 24 horas
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hourData = data.find(d => d.hour === i);
    return { hour: i, count: hourData?.count || 0 };
  });

  return (
    <div style={{ position: 'relative', height: `${chartHeight + 40}px` }}>
      <svg width="100%" height={chartHeight + 40} style={{ overflow: 'visible' }}>
        {hours.map((hour, index) => {
          const barHeight = (hour.count / maxCount) * chartHeight;
          const x = (index / 24) * 100;
          const width = (1 / 24) * 100;
          
          return (
            <rect
              key={hour.hour}
              x={`${x}%`}
              y={chartHeight + 20 - barHeight}
              width={`${width}%`}
              height={barHeight}
              fill="#17a2b8"
              opacity={hour.count > 0 ? 0.8 : 0.2}
            />
          );
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#666' }}>
        <span>0h</span>
        <span>12h</span>
        <span>23h</span>
      </div>
    </div>
  );
}

function DayOfWeekChart({ data }: { data: Array<{ day: number; count: number }> }) {
  if (data.length === 0) {
    return <div style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No hay datos</div>;
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const chartHeight = 150;

  // Crear array completo de 7 días
  const days = Array.from({ length: 7 }, (_, i) => {
    const dayData = data.find(d => d.day === i);
    return { day: i, count: dayData?.count || 0 };
  });

  return (
    <div style={{ position: 'relative', height: `${chartHeight + 60}px` }}>
      <svg width="100%" height={chartHeight + 60} style={{ overflow: 'visible' }}>
        {days.map((day, index) => {
          const barHeight = (day.count / maxCount) * chartHeight;
          const x = (index / 7) * 100;
          const width = (1 / 7) * 100;
          
          return (
            <g key={day.day}>
              <rect
                x={`${x}%`}
                y={chartHeight + 40 - barHeight}
                width={`${width}%`}
                height={barHeight}
                fill="#28a745"
                opacity={day.count > 0 ? 0.8 : 0.2}
              />
              <text
                x={`${x + width / 2}%`}
                y={chartHeight + 55}
                textAnchor="middle"
                fontSize="10"
                fill="#666"
              >
                {DAYS_OF_WEEK[day.day].substring(0, 3)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function DeviceChart({ data }: { data: Array<{ type: string; count: number }> }) {
  if (data.length === 0) {
    return <div style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No hay datos</div>;
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const typeLabels: Record<string, string> = {
    mobile: '📱 Móvil',
    desktop: '💻 Desktop',
    tablet: '📱 Tablet',
    bot: '🤖 Bot',
    unknown: '❓ Desconocido',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {data.map((item) => {
        const percentage = total > 0 ? (item.count / total) * 100 : 0;
        return (
          <div key={item.type}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.875rem' }}>{typeLabels[item.type] || item.type}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                {item.count} ({percentage.toFixed(1)}%)
              </span>
            </div>
            <div style={{
              height: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div
                style={{
                  height: '100%',
                  width: `${percentage}%`,
                  backgroundColor: '#6f42c1',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BrowserChart({ data }: { data: Array<{ name: string; count: number }> }) {
  if (data.length === 0) {
    return <div style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No hay datos</div>;
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {data.map((item) => {
        const percentage = total > 0 ? (item.count / total) * 100 : 0;
        return (
          <div key={item.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.875rem' }}>{item.name}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                {item.count} ({percentage.toFixed(1)}%)
              </span>
            </div>
            <div style={{
              height: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div
                style={{
                  height: '100%',
                  width: `${percentage}%`,
                  backgroundColor: '#dc3545',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReferersList({ referers }: { referers: Array<{ referer: string; count: number }> }) {
  if (referers.length === 0) {
    return <div style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No hay datos</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {referers.slice(0, 10).map((item) => (
        <div key={item.referer} style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
        }}>
          <span style={{ fontSize: '0.875rem', wordBreak: 'break-all' }}>
            {item.referer === 'Directo' || !item.referer ? '🔗 Directo' : item.referer}
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{item.count}</span>
        </div>
      ))}
    </div>
  );
}

function ShortlinksTable({
  shortlinks,
  onSelect,
}: {
  shortlinks: Array<{
    slug: string;
    name: string;
    total: number;
    firstAccess: string | null;
    lastAccess: string | null;
    today: number;
    thisWeek: number;
    thisMonth: number;
  }>;
  onSelect: (slug: string) => void;
}) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Shortlink</th>
            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Hoy</th>
            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Esta Semana</th>
            <th style={{ padding: '0.75rem', textAlign: 'right' }}>Este Mes</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Último Acceso</th>
            <th style={{ padding: '0.75rem', textAlign: 'center' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {shortlinks.map((shortlink) => (
            <tr
              key={shortlink.slug}
              style={{ borderBottom: '1px solid #dee2e6' }}
            >
              <td style={{ padding: '0.75rem' }}>
                <div style={{ fontWeight: 'bold' }}>{shortlink.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>/{shortlink.slug}</div>
              </td>
              <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>
                {shortlink.total.toLocaleString()}
              </td>
              <td style={{ padding: '0.75rem', textAlign: 'right' }}>{shortlink.today}</td>
              <td style={{ padding: '0.75rem', textAlign: 'right' }}>{shortlink.thisWeek}</td>
              <td style={{ padding: '0.75rem', textAlign: 'right' }}>{shortlink.thisMonth}</td>
              <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#666' }}>
                {shortlink.lastAccess
                  ? new Date(shortlink.lastAccess).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Nunca'}
              </td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                <button
                  onClick={() => onSelect(shortlink.slug)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Ver Detalles
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecentAccessesTable({
  accesses,
}: {
  accesses: Array<{
    slug: string;
    ipAddress: string | null;
    userAgent: string | null;
    referer: string | null;
    accessedAt: string;
  }>;
}) {
  const getDeviceFromUA = (ua: string | null) => {
    if (!ua) return 'Desconocido';
    const uaLower = ua.toLowerCase();
    if (uaLower.includes('mobile') || uaLower.includes('android') || uaLower.includes('iphone')) {
      return '📱 Móvil';
    }
    if (uaLower.includes('tablet') || uaLower.includes('ipad')) {
      return '📱 Tablet';
    }
    return '💻 Desktop';
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Fecha/Hora</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Shortlink</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Dispositivo</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>IP</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Origen</th>
          </tr>
        </thead>
        <tbody>
          {accesses.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                No hay accesos recientes
              </td>
            </tr>
          ) : (
            accesses.map((access, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                  {new Date(access.accessedAt).toLocaleString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td style={{ padding: '0.75rem' }}>/{access.slug}</td>
                <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                  {getDeviceFromUA(access.userAgent)}
                </td>
                <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                  {access.ipAddress || 'N/A'}
                </td>
                <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#666' }}>
                  {access.referer || 'Directo'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ShortlinkDetailsModal({
  slug,
  onClose,
}: {
  slug: string;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['shortlink-details', slug],
    queryFn: () => getShortlinkDetails(slug),
  });

  const details = data?.data;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Detalles de /{slug}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</div>
        ) : details ? (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {details.total.toLocaleString()} clics totales
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Tendencia</h3>
              <TrendsChart data={details.byDate} />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Distribución por Hora</h3>
              <HourDistributionChart data={details.byHour} />
            </div>

            <div>
              <h3 style={{ marginBottom: '1rem' }}>Accesos Recientes</h3>
              <RecentAccessesTable accesses={details.recent} />
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            No hay datos disponibles para este shortlink
          </div>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

