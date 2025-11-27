import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getShortlinks,
  createShortlink,
  type Shortlink,
  type CreateShortlinkRequest,
} from '../services/api';

export function Shortlinks() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateShortlinkRequest>({
    name: '',
    slug: '',
    businessId: '',
  });
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['shortlinks'],
    queryFn: getShortlinks,
  });

  const createMutation = useMutation({
    mutationFn: createShortlink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shortlinks'] });
      setShowCreateModal(false);
      setFormData({ name: '', slug: '', businessId: '' });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Error al crear shortlink');
    },
  });

  const handleCreate = () => {
    setError(null);
    if (!formData.name || !formData.slug) {
      setError('Nombre y slug son obligatorios');
      return;
    }

    // Validar formato del slug
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      setError('El slug solo puede contener letras minúsculas, números y guiones');
      return;
    }

    createMutation.mutate({
      name: formData.name,
      slug: formData.slug.toLowerCase(),
      businessId: formData.businessId || undefined,
    });
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    // Podrías agregar una notificación aquí
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Shortlinks</h1>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>🔗 Shortlinks</h1>
          <p style={{ color: '#6c757d', margin: 0 }}>
            Gestiona los shortlinks de tus comercios. Cada shortlink redirige a WhatsApp con identificación automática.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          + Crear Shortlink
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {data?.shortlinks && data.shortlinks.length === 0 ? (
        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #dee2e6',
          }}
        >
          <p style={{ fontSize: '1.2rem', color: '#6c757d', marginBottom: '1rem' }}>
            No hay shortlinks creados aún
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Crear Primer Shortlink
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {data?.shortlinks.map((shortlink) => (
            <div
              key={shortlink.slug}
              style={{
                padding: '1.5rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{shortlink.name}</h3>
                  <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Slug: <code style={{ backgroundColor: '#f8f9fa', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>{shortlink.slug}</code>
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                    <input
                      type="text"
                      value={shortlink.url}
                      readOnly
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        fontFamily: 'monospace',
                      }}
                    />
                    <button
                      onClick={() => copyToClipboard(shortlink.url)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                      }}
                    >
                      📋 Copiar
                    </button>
                    <a
                      href={shortlink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#28a745',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                      }}
                    >
                      🔗 Probar
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Crear Shortlink */}
      {showCreateModal && (
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
          onClick={() => {
            setShowCreateModal(false);
            setError(null);
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Crear Nuevo Shortlink</h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Nombre del Comercio *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Mon Patisserie"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Slug (URL) *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="Ej: monpatisserie"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontFamily: 'monospace',
                }}
              />
              <p style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.25rem', marginBottom: 0 }}>
                Solo letras minúsculas, números y guiones. Se usará en: go.soymilo.com/<strong>{formData.slug || 'slug'}</strong>
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Business ID (Opcional)
              </label>
              <input
                type="text"
                value={formData.businessId || ''}
                onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                placeholder="Ej: demo-business-001"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              />
              <p style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.25rem', marginBottom: 0 }}>
                Si dejas vacío, se creará un comercio independiente
              </p>
            </div>

            {error && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError(null);
                  setFormData({ name: '', slug: '', businessId: '' });
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending || !formData.name || !formData.slug}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: createMutation.isPending || !formData.name || !formData.slug ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: createMutation.isPending || !formData.name || !formData.slug ? 'not-allowed' : 'pointer',
                }}
              >
                {createMutation.isPending ? 'Creando...' : 'Crear Shortlink'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

