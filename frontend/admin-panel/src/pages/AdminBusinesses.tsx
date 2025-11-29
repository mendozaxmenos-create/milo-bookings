import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBusinesses,
  createBusiness,
  deleteBusiness,
  activateBusiness,
  permanentlyDeleteBusiness,
  getSubscriptionPrice,
  updateSubscriptionPrice,
  migrateShortlinksToBusinesses,
  getShortlinks,
  getPlans,
  updateBusinessPlan,
  type Business,
  type CreateBusinessRequest,
  type SubscriptionPlan,
} from '../services/api';
import QRCode from 'qrcode.react';

export function AdminBusinesses() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-businesses'],
    queryFn: getBusinesses,
  });

  const createMutation = useMutation({
    mutationFn: createBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
      setShowCreateModal(false);
    },
  });

  // const updateMutation = useMutation({
  //   mutationFn: ({ id, data }: { id: string; data: Partial<CreateBusinessRequest> }) =>
  //     updateBusiness(id, data),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
  //   },
  // });

  const deleteMutation = useMutation({
    mutationFn: deleteBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: activateBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
    },
  });

  const permanentlyDeleteMutation = useMutation({
    mutationFn: permanentlyDeleteBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
    },
  });


  const { data: priceData } = useQuery({
    queryKey: ['subscription-price'],
    queryFn: getSubscriptionPrice,
  });

  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ businessId, planId }: { businessId: string; planId: string }) =>
      updateBusinessPlan(businessId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
      setShowPlanModal(false);
      setSelectedBusiness(null);
    },
  });

  const updatePriceMutation = useMutation({
    mutationFn: updateSubscriptionPrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-price'] });
      setShowPriceModal(false);
    },
  });

  const migrateMutation = useMutation({
    mutationFn: migrateShortlinksToBusinesses,
    onSuccess: (data) => {
      const successCount = data.results.filter(r => r.status === 'success').length;
      const errorCount = data.results.filter(r => r.status === 'error').length;
      alert(`✅ Migración completada:\n${successCount} exitosos\n${errorCount} errores\n\n${data.message}`);
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
    },
    onError: (error: any) => {
      alert(`❌ Error en migración: ${error.response?.data?.error || error.message}`);
    },
  });

  const [shortlinkUrl, setShortlinkUrl] = useState<string | null>(null);
  const [shortlinkName, setShortlinkName] = useState<string | null>(null);

  const loadShortlinkQR = async (businessId: string) => {
    try {
      // Buscar el shortlink asociado al negocio
      const shortlinksResponse = await getShortlinks();
      const shortlink = shortlinksResponse.shortlinks.find(s => s.business_id === businessId);
      
      if (shortlink) {
        setShortlinkUrl(shortlink.url);
        setShortlinkName(shortlink.name);
        setQrCode(shortlink.url);
        console.log('[Admin] Shortlink encontrado:', { businessId, url: shortlink.url, name: shortlink.name });
      } else {
        setQrCode(null);
        setShortlinkUrl(null);
        setShortlinkName(null);
        console.log('[Admin] No hay shortlink para negocio:', businessId);
      }
    } catch (error) {
      console.error('Error loading shortlink:', error);
      setQrCode(null);
      setShortlinkUrl(null);
      setShortlinkName(null);
    }
  };

  const handleShowQR = async (business: Business) => {
    setSelectedBusiness(business);
    setShowQRModal(true);
    setShortlinkUrl(null);
    setShortlinkName(null);
    await loadShortlinkQR(business.id);
  };


  const handleCreate = (data: CreateBusinessRequest) => {
    createMutation.mutate(data);
  };

  const handleToggleActive = (business: Business) => {
    if (business.is_active) {
      if (confirm(`¿Desactivar el negocio "${business.name}"?\n\nEsto dejará el negocio inactivo (no se borrará) y desconectará el bot. Se puede reactivar después si el cliente regulariza el pago.`)) {
        deleteMutation.mutate(business.id);
      }
    } else {
      if (confirm(`¿Reactivar el negocio "${business.name}"?`)) {
        activateMutation.mutate(business.id);
      }
    }
  };

  const handlePermanentlyDelete = (business: Business) => {
    const confirmMessage = `⚠️ ADVERTENCIA: ELIMINACIÓN PERMANENTE ⚠️\n\n` +
      `Estás a punto de eliminar PERMANENTEMENTE el negocio "${business.name}".\n\n` +
      `Esta acción:\n` +
      `- Eliminará TODOS los datos del negocio (reservas, servicios, configuraciones, etc.)\n` +
      `- NO se puede deshacer\n` +
      `- Es IRREVERSIBLE\n\n` +
      `Si solo quieres desactivar el negocio, usa el botón "Desactivar" en su lugar.\n\n` +
      `¿Estás SEGURO de que quieres eliminar permanentemente este negocio?\n\n` +
      `Escribe "ELIMINAR" para confirmar:`;

    const userInput = prompt(confirmMessage);
    
    if (userInput === 'ELIMINAR') {
      if (confirm(`Última confirmación: ¿Eliminar PERMANENTEMENTE "${business.name}"?\n\nEsta acción NO se puede deshacer.`)) {
        permanentlyDeleteMutation.mutate(business.id);
      }
    } else if (userInput !== null) {
      alert('Eliminación cancelada. No se escribió "ELIMINAR" correctamente.');
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      authenticated: { label: 'Conectado', color: '#28a745' },
      waiting_qr: { label: 'Esperando QR', color: '#ffc107' },
      initializing: { label: 'Inicializando', color: '#17a2b8' },
      not_initialized: { label: 'No inicializado', color: '#6c757d' },
      error: { label: 'Error', color: '#dc3545' },
    };

    const statusInfo = statusMap[status || 'not_initialized'] || statusMap.not_initialized;
    return (
      <span
        style={{
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          backgroundColor: statusInfo.color,
          color: 'white',
          fontSize: '0.875rem',
        }}
      >
        {statusInfo.label}
      </span>
    );
  };

  if (isLoading) {
    return <div>Cargando negocios...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1>Gestión de Negocios</h1>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              if (confirm('¿Migrar shortlinks sin business a negocios? Esto creará un negocio para cada shortlink que no tenga business_id asociado.')) {
                migrateMutation.mutate();
              }
            }}
            disabled={migrateMutation.isPending}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: migrateMutation.isPending ? '#6c757d' : '#ffc107',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: migrateMutation.isPending ? 'not-allowed' : 'pointer',
            }}
          >
            {migrateMutation.isPending ? '⏳ Migrando...' : '🔄 Migrar Shortlinks a Negocios'}
          </button>
          <button
            onClick={() => setShowPriceModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            💰 Configurar Precio Suscripción
          </button>
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
            + Nuevo Negocio
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {data?.data.map((business) => (
          <div
            key={business.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: business.is_active ? 'white' : '#f8f9fa',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {business.name}
                  {business.is_trial && (
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: '#ffc107',
                      color: '#000',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}>
                      🎁 PRUEBA
                    </span>
                  )}
                  {!business.is_active && (
                    <span style={{ marginLeft: '0.5rem', color: '#6c757d', fontSize: '0.875rem' }}>
                      (Inactivo)
                    </span>
                  )}
                </h2>
                {business.is_trial && business.trial_end_date && (
                  <div style={{
                    marginBottom: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: '#fff3cd',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                  }}>
                    <strong>Prueba hasta:</strong> {new Date(business.trial_end_date).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {new Date(business.trial_end_date) < new Date() && (
                      <span style={{ marginLeft: '0.5rem', color: '#dc3545', fontWeight: 'bold' }}>
                        (Expirado)
                      </span>
                    )}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
                  <div>
                    <strong>ID:</strong> {business.id}
                  </div>
                  <div>
                    <strong>Teléfono:</strong> {business.phone}
                  </div>
                  <div>
                    <strong>WhatsApp:</strong> {business.whatsapp_number}
                  </div>
                  <div>
                    <strong>Estado Bot:</strong> {getStatusBadge(business.bot_status)}
                  </div>
                  <div>
                    <strong>Plan:</strong> {business.plan_type || 'basic'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                <button
                  onClick={() => {
                    window.open(`/admin/businesses/${business.id}/view/dashboard`, '_blank');
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Abrir Panel
                </button>
                <button
                  onClick={() => handleShowQR(business)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Ver QR
                </button>
                <button
                  onClick={() => {
                    setSelectedBusiness(business);
                    setShowPlanModal(true);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#6f42c1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  💎 Cambiar Plan
                </button>
                <button
                  onClick={() => handleToggleActive(business)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: business.is_active ? '#dc3545' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  {business.is_active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <CreateBusinessModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
        />
      )}

      {showQRModal && selectedBusiness && (
        <QRModal
          business={selectedBusiness}
          qrCode={qrCode}
          shortlinkUrl={shortlinkUrl}
          shortlinkName={shortlinkName}
          onClose={() => {
            setShowQRModal(false);
            setSelectedBusiness(null);
            setQrCode(null);
            setShortlinkUrl(null);
            setShortlinkName(null);
          }}
        />
      )}

      {showPriceModal && (
        <SubscriptionPriceModal
          currentPrice={priceData?.data.price || '5000.00'}
          onClose={() => setShowPriceModal(false)}
          onSave={(price) => updatePriceMutation.mutate(price)}
          isLoading={updatePriceMutation.isPending}
        />
      )}

      {showPlanModal && selectedBusiness && (
        <PlanSelectionModal
          business={selectedBusiness}
          plans={plansData?.data || []}
          onClose={() => {
            setShowPlanModal(false);
            setSelectedBusiness(null);
          }}
          onSelect={(planId) => {
            updatePlanMutation.mutate({ businessId: selectedBusiness.id, planId });
          }}
          isLoading={updatePlanMutation.isPending}
        />
      )}
    </div>
  );
}

function PlanSelectionModal({
  business,
  plans,
  onClose,
  onSelect,
  isLoading,
}: {
  business: Business;
  plans: SubscriptionPlan[];
  onClose: () => void;
  onSelect: (planId: string) => void;
  isLoading: boolean;
}) {
  const activePlans = plans.filter(p => p.is_active);

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
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>Cambiar Plan de Suscripción</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Negocio: <strong>{business.name}</strong>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activePlans.map((plan) => (
            <div
              key={plan.id}
              style={{
                border: '2px solid #ddd',
                borderRadius: '8px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#007bff';
                e.currentTarget.style.backgroundColor = '#f0f8ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
                e.currentTarget.style.backgroundColor = 'white';
              }}
              onClick={() => onSelect(plan.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>
                    {plan.name}
                    {plan.is_default && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#28a745' }}>
                        (Por Defecto)
                      </span>
                    )}
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>
                    {plan.description || 'Sin descripción'}
                  </p>
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong style={{ fontSize: '1.25rem', color: '#007bff' }}>
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: plan.currency || 'ARS',
                      }).format(plan.price)}
                    </strong>
                    <span style={{ color: '#666', marginLeft: '0.5rem' }}>/mes</span>
                  </div>
                  {plan.features && plan.features.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                        {plan.features.length} features incluidas
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {plan.features.slice(0, 5).map((feature) => (
                          <span
                            key={feature.id}
                            style={{
                              padding: '0.125rem 0.375rem',
                              backgroundColor: '#e7f3ff',
                              color: '#0066cc',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                            }}
                          >
                            {feature.name}
                          </span>
                        ))}
                        {plan.features.length > 5 && (
                          <span style={{ fontSize: '0.75rem', color: '#666' }}>
                            +{plan.features.length - 5} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(plan.id);
                  }}
                  disabled={isLoading}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: isLoading ? '#6c757d' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  {isLoading ? 'Cambiando...' : 'Seleccionar'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateBusinessModal({
  onClose,
  onSubmit,
  isLoading,
}: {
  onClose: () => void;
  onSubmit: (data: CreateBusinessRequest) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<CreateBusinessRequest>({
    name: '',
    phone: '',
    email: '',
    whatsapp_number: '',
    owner_phone: '',
    is_active: true,
    is_trial: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

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
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '500px',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Nuevo Negocio</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Teléfono</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email (opcional)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Número WhatsApp</label>
            <input
              type="text"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Teléfono del Dueño</label>
            <input
              type="text"
              value={formData.owner_phone}
              onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.is_trial}
                onChange={(e) => setFormData({ ...formData, is_trial: e.target.checked })}
                style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  🎁 Período de Prueba (7 días)
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  El negocio tendrá acceso completo durante 7 días sin costo
                </div>
              </div>
            </label>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {isLoading ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QRModal({
  business,
  qrCode,
  shortlinkUrl,
  shortlinkName,
  onClose,
}: {
  business: Business;
  qrCode: string | null;
  shortlinkUrl: string | null;
  shortlinkName: string | null;
  onClose: () => void;
}) {
  const copyToClipboard = () => {
    if (shortlinkUrl) {
      navigator.clipboard.writeText(shortlinkUrl);
      alert('URL copiada al portapapeles');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2.5rem',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '450px',
          width: '100%',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#212529' }}>
            📱 QR Code Shortlink
          </h2>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '0.95rem' }}>
            {business.name}
          </p>
        </div>

        {qrCode && shortlinkUrl ? (
          <>
            <div 
              style={{ 
                margin: '1.5rem 0',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                display: 'inline-block',
              }}
            >
              <QRCode value={qrCode} size={280} level="H" />
            </div>
            
            {shortlinkName && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.25rem 0', color: '#495057', fontSize: '0.9rem', fontWeight: '500' }}>
                  Shortlink: {shortlinkName}
                </p>
              </div>
            )}

            <div 
              style={{
                marginBottom: '1.5rem',
                padding: '0.75rem',
                backgroundColor: '#e7f3ff',
                borderRadius: '6px',
                border: '1px solid #b3d9ff',
              }}
            >
              <p style={{ margin: '0 0 0.5rem 0', color: '#495057', fontSize: '0.85rem', fontWeight: '500' }}>
                URL del Shortlink:
              </p>
              <p 
                style={{ 
                  margin: 0, 
                  color: '#007bff', 
                  fontSize: '0.9rem', 
                  fontWeight: '600',
                  wordBreak: 'break-all',
                  cursor: 'pointer',
                }}
                onClick={copyToClipboard}
                title="Click para copiar"
              >
                {shortlinkUrl}
              </p>
            </div>

            <p style={{ color: '#6c757d', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Escanea este código QR para abrir el shortlink y redirigir a WhatsApp
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={copyToClipboard}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
              >
                📋 Copiar URL
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
              >
                Cerrar
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding: '2rem 1rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔗</div>
            <h3 style={{ margin: '0 0 0.75rem 0', color: '#495057', fontSize: '1.1rem' }}>
              No hay shortlink asociado
            </h3>
            <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Este negocio no tiene un shortlink creado. Ve a la sección de <strong>Shortlinks</strong> para crear uno.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
              }}
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SubscriptionPriceModal({
  currentPrice,
  onClose,
  onSave,
  isLoading,
}: {
  currentPrice: string;
  onClose: () => void;
  onSave: (price: string) => void;
  isLoading: boolean;
}) {
  const [price, setPrice] = useState(currentPrice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (price && !isNaN(parseFloat(price)) && parseFloat(price) >= 0) {
      onSave(price);
    }
  };

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
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '500px',
        }}
      >
        <h2 style={{ marginTop: 0 }}>💰 Configurar Precio de Suscripción</h2>
        <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
          Este precio se utilizará en los mensajes de notificación cuando expire el período de prueba de los negocios.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Precio Mensual (ARS)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1.1rem',
              }}
            />
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6c757d' }}>
              Precio actual: ${parseFloat(currentPrice).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: 'white',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !price || isNaN(parseFloat(price)) || parseFloat(price) < 0}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

