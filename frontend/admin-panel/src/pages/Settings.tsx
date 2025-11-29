import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getPaymentConfig, updatePaymentConfig, getPlans, updateBusinessPlan, getBusiness, type SubscriptionPlan } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface BusinessSettings {
  welcome_message: string;
  booking_confirmation_message: string;
  payment_instructions_message: string;
  reminder_message: string;
}

const DEFAULT_SETTINGS: BusinessSettings = {
  welcome_message: '',
  booking_confirmation_message: '',
  payment_instructions_message: '',
  reminder_message: '',
};

const FORM_FIELDS: Array<{
  key: keyof BusinessSettings;
  label: string;
  helper: string;
}> = [
  {
    key: 'welcome_message',
    label: 'Mensaje de bienvenida',
    helper: 'Se envía cuando el cliente inicia una conversación con el bot.',
  },
  {
    key: 'booking_confirmation_message',
    label: 'Mensaje de confirmación',
    helper: 'Se envía luego de crear la reserva desde WhatsApp.',
  },
  {
    key: 'payment_instructions_message',
    label: 'Instrucciones de pago',
    helper: 'Puedes detallar métodos de pago o enlaces a MercadoPago.',
  },
  {
    key: 'reminder_message',
    label: 'Mensaje de recordatorio',
    helper: 'Recordatorio automático previo a la cita (cuando esté habilitado).',
  },
];

export function Settings() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const businessId = user?.business_id;
  const [formData, setFormData] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    publicKey: '',
    accessToken: '',
    refreshToken: '',
    userId: '',
  });
  const [paymentSource, setPaymentSource] = useState<'business' | 'env' | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const { data, isLoading, isFetching } = useQuery<{ data: BusinessSettings }>({
    queryKey: ['business-settings'],
    queryFn: async () => {
      const response = await api.get('/api/settings');
      return response.data;
    },
  });

  const { data: paymentConfig, isLoading: paymentLoading } = useQuery({
    queryKey: ['payment-config'],
    queryFn: getPaymentConfig,
  });

  const { data: businessData } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => {
      if (!businessId) throw new Error('Business ID is required');
      return getBusiness(businessId);
    },
    enabled: !!businessId,
  });

  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
  });

  const updatePlanMutation = useMutation({
    mutationFn: (planId: string) => {
      if (!businessId) throw new Error('Business ID is required');
      return updateBusinessPlan(businessId, planId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', businessId] });
      setShowPlanModal(false);
    },
  });

  useEffect(() => {
    if (data?.data) {
      setFormData({
        welcome_message: data.data.welcome_message || '',
        booking_confirmation_message: data.data.booking_confirmation_message || '',
        payment_instructions_message: data.data.payment_instructions_message || '',
        reminder_message: data.data.reminder_message || '',
      });
    }
  }, [data]);

  useEffect(() => {
    if (paymentConfig?.data) {
      setPaymentSource(paymentConfig.data.source);
      setPaymentForm((prev) => ({
        ...prev,
        publicKey: paymentConfig.data?.publicKey || '',
      }));
    } else {
      setPaymentSource(null);
    }
  }, [paymentConfig]);

  const updateMutation = useMutation({
    mutationFn: async (payload: BusinessSettings) => {
      const response = await api.put('/api/settings', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-settings'] });
      setLastUpdated(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
    },
  });

  const isSaving = updateMutation.isPending;
  const isBusy = isSaving || isFetching;
  const paymentMutation = useMutation({
    mutationFn: updatePaymentConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-config'] });
    },
  });

  const previewMessages = useMemo(() => {
    return [
      {
        title: '👋 Bienvenida',
        content: formData.welcome_message || 'Configura un mensaje para tus clientes.',
      },
      {
        title: '✅ Confirmación',
        content: formData.booking_confirmation_message || 'Confirma la reserva y da las gracias.',
      },
      {
        title: '💳 Pago',
        content: formData.payment_instructions_message || 'Explica cómo se completa el pago.',
      },
      {
        title: '⏰ Recordatorio',
        content: formData.reminder_message || 'Recordatorio previo a la cita.',
      },
    ];
  }, [formData]);

  const handleChange = (field: keyof BusinessSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateMutation.mutate(formData);
  };

  if ((isLoading && !data) || paymentLoading) {
    return <div style={{ padding: '2rem' }}>Cargando configuración...</div>;
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h1>Mensajes y Configuración del Bot</h1>
        <p style={{ color: '#666', maxWidth: '720px' }}>
          Personaliza los textos que ve el cliente durante el flujo de WhatsApp. Puedes actualizarlos cuando quieras; el bot
          recargará la configuración en los próximos mensajes.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {FORM_FIELDS.map((field) => (
            <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor={field.key} style={{ fontWeight: 600 }}>
                  {field.label}
                </label>
                <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>WhatsApp soporta emojis ✅</span>
              </div>
              <textarea
                id={field.key}
                value={formData[field.key]}
                onChange={(event) => handleChange(field.key, event.target.value)}
                rows={4}
                placeholder="Escribe tu mensaje..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
                required
              />
              <small style={{ color: '#6c757d' }}>{field.helper}</small>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
              {lastUpdated ? `Última actualización ${lastUpdated}` : 'Sin cambios recientes'}
            </div>
            <button
              type="submit"
              disabled={isBusy}
              style={{
                padding: '0.85rem 1.75rem',
                backgroundColor: isBusy ? '#6c757d' : '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: isBusy ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                minWidth: '180px',
              }}
            >
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>

        <div
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <h2 style={{ margin: 0 }}>Vista previa</h2>
          <p style={{ color: '#6c757d', fontSize: '0.95rem' }}>
            Así verían los mensajes tus clientes. Úsalo para revisar tono y consistencia.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {previewMessages.map((message) => (
              <div
                key={message.title}
                style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '10px',
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>{message.title}</div>
                <div style={{ whiteSpace: 'pre-line', color: '#495057' }}>{message.content}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 'auto',
              padding: '1rem',
              backgroundColor: '#e7f3ff',
              borderRadius: '10px',
              fontSize: '0.9rem',
              color: '#084298',
            }}
          >
            Tip: Usa variables como el nombre del negocio en tus mensajes para dar más contexto. En la próxima iteración
            agregaremos plantillas con variables dinámicas.
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        <div>
          <h2 style={{ marginBottom: '0.5rem' }}>💳 Pagos con MercadoPago</h2>
          <p style={{ color: '#666', margin: '0 0 1rem 0' }}>
            <strong>¿Cómo funciona?</strong> Si no configurás tus credenciales, los pagos se recibirán en la cuenta centralizada de Milo Bookings. 
            Si querés recibir los pagos directamente en tu cuenta de MercadoPago, seguí el instructivo a continuación.
          </p>
          <div style={{ 
            backgroundColor: '#e7f3ff', 
            border: '1px solid #b3d9ff', 
            borderRadius: '8px', 
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>📖</span>
              <strong style={{ color: '#084298' }}>Instructivo paso a paso</strong>
            </div>
            <p style={{ color: '#084298', margin: 0, fontSize: '0.95rem' }}>
              Te guiamos para configurar tu cuenta de MercadoPago en menos de 5 minutos. 
              <a 
                href="/instructivo-mercadopago" 
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  color: '#0056b3', 
                  textDecoration: 'underline',
                  fontWeight: 600,
                  marginLeft: '0.5rem'
                }}
              >
                Ver instructivo completo →
              </a>
              {' '}
              <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>(se abre en nueva pestaña)</span>
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '1.5rem', border: '1px dashed #ced4da' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Estado actual</h3>
            {paymentSource ? (
              <>
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: paymentSource === 'business' ? '#d4edda' : '#fff3cd',
                  color: paymentSource === 'business' ? '#155724' : '#856404',
                  marginBottom: '1rem',
                  fontWeight: 600
                }}>
                  {paymentSource === 'business' ? '✅' : '⚠️'}
                  <span>
                    {paymentSource === 'business' 
                      ? 'Usando tu cuenta de MercadoPago' 
                      : 'Usando cuenta centralizada de Milo'}
                  </span>
                </div>
                {paymentSource === 'business' ? (
                  <p style={{ color: '#28a745', margin: 0, fontSize: '0.9rem' }}>
                    Los pagos se recibirán directamente en tu cuenta de MercadoPago.
                  </p>
                ) : (
                  <div>
                    <p style={{ color: '#856404', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                      Los pagos se recibirán en la cuenta centralizada. Si querés recibir directamente, configurá tus credenciales.
                    </p>
                    <a 
                      href="/instructivo-mercadopago" 
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        color: '#0056b3', 
                        textDecoration: 'underline',
                        fontSize: '0.9rem'
                      }}
                    >
                      Ver instructivo →
                    </a>
                  </div>
                )}
              </>
            ) : (
              <div>
                <p style={{ color: '#dc3545', marginBottom: '0.5rem', fontWeight: 600 }}>
                  ⚠️ Pagos deshabilitados
                </p>
                <p style={{ color: '#666', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                  No hay credenciales configuradas. Los pagos no funcionarán hasta que configures las credenciales globales o las tuyas.
                </p>
                <a 
                  href="/instructivo-mercadopago" 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#0056b3', 
                    textDecoration: 'underline',
                    fontSize: '0.9rem'
                  }}
                >
                  Ver instructivo para configurar →
                </a>
              </div>
            )}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              paymentMutation.mutate({
                publicKey: paymentForm.publicKey,
                accessToken: paymentForm.accessToken,
                refreshToken: paymentForm.refreshToken || undefined,
                userId: paymentForm.userId || undefined,
                isActive: true,
              });
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Public Key *</label>
              <input
                type="text"
                value={paymentForm.publicKey}
                onChange={(event) => setPaymentForm({ ...paymentForm, publicKey: event.target.value })}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ced4da' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Access Token *</label>
              <input
                type="password"
                value={paymentForm.accessToken}
                onChange={(event) => setPaymentForm({ ...paymentForm, accessToken: event.target.value })}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ced4da' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Refresh Token</label>
                <input
                  type="text"
                  value={paymentForm.refreshToken}
                  onChange={(event) => setPaymentForm({ ...paymentForm, refreshToken: event.target.value })}
                  placeholder="Opcional"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ced4da' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>User ID</label>
                <input
                  type="text"
                  value={paymentForm.userId}
                  onChange={(event) => setPaymentForm({ ...paymentForm, userId: event.target.value })}
                  placeholder="Opcional"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ced4da' }}
                />
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffc107', 
              borderRadius: '6px', 
              padding: '0.75rem',
              display: 'flex', 
              gap: '0.5rem', 
              fontSize: '0.9rem', 
              color: '#856404'
            }}>
              <span>💡</span>
              <div>
                <strong>¿Dónde encuentro mis credenciales?</strong>
                <br />
                <a 
                  href="/instructivo-mercadopago" 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0056b3', textDecoration: 'underline' }}
                >
                  Seguí nuestro instructivo paso a paso
                </a>
                {' '}para obtener tu Public Key y Access Token desde tu cuenta de MercadoPago.
              </div>
            </div>

            <button
              type="submit"
              disabled={paymentMutation.isPending}
              style={{
                padding: '0.85rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: paymentMutation.isPending ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              {paymentMutation.isPending ? 'Guardando...' : 'Guardar credenciales'}
            </button>
          </form>
        </div>
      </div>

      {/* Plan de Suscripción */}
      {businessData?.data && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          <div>
            <h2 style={{ marginBottom: '0.5rem' }}>💎 Plan de Suscripción</h2>
            <p style={{ color: '#666', margin: 0 }}>
              Tu plan actual determina qué funcionalidades tienes disponibles.
            </p>
          </div>

          {(() => {
            const currentPlanId = businessData.data.plan_id;
            const currentPlan = plansData?.data?.find(p => p.id === currentPlanId);
            const planType = businessData.data.plan_type || 'basic';

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '8px', 
                  padding: '1.5rem', 
                  border: '2px solid #dee2e6' 
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Plan Actual</h3>
                  {currentPlan ? (
                    <>
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        marginBottom: '1rem',
                        fontWeight: 600
                      }}>
                        <span>✅</span>
                        <span>{currentPlan.name}</span>
                      </div>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                        {currentPlan.description || 'Sin descripción'}
                      </p>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong style={{ fontSize: '1.25rem', color: '#007bff' }}>
                          {new Intl.NumberFormat('es-AR', {
                            style: 'currency',
                            currency: currentPlan.currency || 'ARS',
                          }).format(currentPlan.price)}
                        </strong>
                        <span style={{ color: '#666', marginLeft: '0.5rem' }}>/mes</span>
                      </div>
                      {currentPlan.features && currentPlan.features.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                            <strong>{currentPlan.features.length} features incluidas:</strong>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {currentPlan.features.map((feature) => (
                              <span
                                key={feature.id}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: '#e7f3ff',
                                  color: '#0066cc',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                }}
                              >
                                {feature.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        backgroundColor: '#fff3cd',
                        color: '#856404',
                        marginBottom: '1rem',
                        fontWeight: 600
                      }}>
                        <span>⚠️</span>
                        <span>Plan: {planType}</span>
                      </div>
                      <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        Tu negocio está usando el plan antiguo. Contacta al administrador para actualizar a un plan nuevo.
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button
                    onClick={() => setShowPlanModal(true)}
                    style={{
                      padding: '0.85rem 1.5rem',
                      backgroundColor: '#6f42c1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Cambiar Plan
                  </button>
                  <div style={{ 
                    backgroundColor: '#e7f3ff', 
                    border: '1px solid #b3d9ff', 
                    borderRadius: '8px', 
                    padding: '1rem',
                    fontSize: '0.9rem',
                    color: '#084298'
                  }}>
                    <strong>💡 ¿Necesitas más funcionalidades?</strong>
                    <p style={{ margin: '0.5rem 0 0 0' }}>
                      Actualiza tu plan para acceder a métricas avanzadas, CRM completo y más.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Modal de Selección de Plan */}
      {showPlanModal && businessData?.data && (
        <PlanSelectionModal
          business={businessData.data}
          plans={plansData?.data || []}
          onClose={() => setShowPlanModal(false)}
          onSelect={(planId) => {
            updatePlanMutation.mutate(planId);
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
  business: any;
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


