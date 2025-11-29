import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getAvailableFeatures,
  type SubscriptionPlan,
  type Feature,
} from '../services/api';

export function AdminPlans() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const queryClient = useQueryClient();

  const { data: plansData, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
  });

  const { data: featuresData } = useQuery({
    queryKey: ['available-features'],
    queryFn: getAvailableFeatures,
  });

  const plans = plansData?.data || [];
  const allFeatures = featuresData?.data || [];
  const featuresByCategory = featuresData?.byCategory || {};

  const createMutation = useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setShowCreateModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setShowEditModal(false);
      setSelectedPlan(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });

  const handleCreate = (formData: any) => {
    createMutation.mutate(formData);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowEditModal(true);
  };

  const handleUpdate = (formData: any) => {
    if (!selectedPlan) return;
    updateMutation.mutate({ id: selectedPlan.id, data: formData });
  };

  const handleDelete = (plan: SubscriptionPlan) => {
    if (!confirm(`¿Estás seguro de eliminar el plan "${plan.name}"?`)) return;
    deleteMutation.mutate(plan.id);
  };

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Cargando planes...</div>;
  }

  // Calcular estadísticas de features
  const totalFeatures = allFeatures.length;
  const activeFeatures = allFeatures.filter(f => f.is_active).length;
  const featuresInPlans = new Set(
    plans.flatMap(plan => plan.features?.map(f => f.id) || [])
  ).size;
  const featuresNotInPlans = totalFeatures - featuresInPlans;
  const categoriesCount = Object.keys(featuresByCategory).length;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Gestión de Planes de Suscripción</h1>
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
          + Nuevo Plan
        </button>
      </div>

      {/* Estadísticas de Features */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #007bff',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff', marginBottom: '0.5rem' }}>
            {totalFeatures}
          </div>
          <div style={{ color: '#666', fontSize: '0.875rem' }}>
            Features Totales
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #28a745',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745', marginBottom: '0.5rem' }}>
            {activeFeatures}
          </div>
          <div style={{ color: '#666', fontSize: '0.875rem' }}>
            Features Activas
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #17a2b8',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#17a2b8', marginBottom: '0.5rem' }}>
            {featuresInPlans}
          </div>
          <div style={{ color: '#666', fontSize: '0.875rem' }}>
            Features en Planes
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderLeft: '4px solid',
          borderLeftColor: featuresNotInPlans > 0 ? '#ffc107' : '#6c757d',
        }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: featuresNotInPlans > 0 ? '#ffc107' : '#6c757d',
            marginBottom: '0.5rem',
          }}>
            {featuresNotInPlans}
          </div>
          <div style={{ color: '#666', fontSize: '0.875rem' }}>
            Features Sin Asignar
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #6f42c1',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6f42c1', marginBottom: '0.5rem' }}>
            {categoriesCount}
          </div>
          <div style={{ color: '#666', fontSize: '0.875rem' }}>
            Categorías
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #dc3545',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545', marginBottom: '0.5rem' }}>
            {plans.length}
          </div>
          <div style={{ color: '#666', fontSize: '0.875rem' }}>
            Planes Configurados
          </div>
        </div>
      </div>

      {/* Lista de Planes */}
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Modal Crear Plan */}
      {showCreateModal && (
        <PlanModal
          mode="create"
          allFeatures={allFeatures}
          featuresByCategory={featuresByCategory}
          onSubmit={handleCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Modal Editar Plan */}
      {showEditModal && selectedPlan && (
        <PlanModal
          mode="edit"
          plan={selectedPlan}
          allFeatures={allFeatures}
          featuresByCategory={featuresByCategory}
          onSubmit={handleUpdate}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPlan(null);
          }}
        />
      )}
    </div>
  );
}

function PlanCard({
  plan,
  onEdit,
  onDelete,
}: {
  plan: SubscriptionPlan;
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (plan: SubscriptionPlan) => void;
}) {
  const planFeatureIds = plan.features?.map(f => f.id) || [];
  const missingFeatures = plan.missingFeatures || [];

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>
            {plan.name}
            {plan.is_default && (
              <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#28a745' }}>(Por Defecto)</span>
            )}
          </h2>
          <p style={{ color: '#666', margin: 0 }}>{plan.description || 'Sin descripción'}</p>
          <div style={{ marginTop: '0.5rem' }}>
            <strong style={{ fontSize: '1.25rem', color: '#007bff' }}>
              {new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: plan.currency || 'ARS',
              }).format(plan.price)}
            </strong>
            <span style={{ color: '#666', marginLeft: '0.5rem' }}>/mes</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onEdit(plan)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Editar
          </button>
          {!plan.is_default && (
            <button
              onClick={() => onDelete(plan)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      {/* Features del Plan */}
      <div style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Features Incluidas ({planFeatureIds.length})</h3>
        {plan.features && plan.features.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {plan.features.map((feature) => (
              <span
                key={feature.id}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
              >
                {feature.name}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ color: '#666', fontSize: '0.875rem' }}>No hay features asignadas</p>
        )}
      </div>

      {/* Features Faltantes */}
      {missingFeatures.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
          <h4 style={{ fontSize: '0.875rem', margin: 0, marginBottom: '0.5rem', color: '#856404' }}>
            ⚠️ Features Disponibles No Incluidas ({missingFeatures.length})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {missingFeatures.map((feature) => (
              <span
                key={feature.id}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#ffeaa7',
                  color: '#856404',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
              >
                {feature.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlanModal({
  mode,
  plan,
  allFeatures,
  featuresByCategory,
  onSubmit,
  onClose,
}: {
  mode: 'create' | 'edit';
  plan?: SubscriptionPlan;
  allFeatures: Feature[];
  featuresByCategory: Record<string, Feature[]>;
  onSubmit: (data: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    key: plan?.key || '',
    description: plan?.description || '',
    price: plan?.price || 0,
    currency: plan?.currency || 'ARS',
    display_order: plan?.display_order || 0,
    is_active: plan?.is_active !== undefined ? plan.is_active : true,
    is_default: plan?.is_default || false,
    featureIds: plan?.features?.map(f => f.id) || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleFeature = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      featureIds: prev.featureIds.includes(featureId)
        ? prev.featureIds.filter(id => id !== featureId)
        : [...prev.featureIds, featureId],
    }));
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
          maxHeight: '90vh',
          overflow: 'auto',
          width: '90%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>{mode === 'create' ? 'Crear Plan' : 'Editar Plan'}</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Nombre del Plan *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Clave (Key) *
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
              required
              pattern="[a-z0-9_]+"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <small style={{ color: '#666' }}>Solo letras minúsculas, números y guiones bajos</small>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Precio
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Moneda
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Orden
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              />
              Activo
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
              />
              Plan por Defecto
            </label>
          </div>

          {/* Features */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Features del Plan</h3>
            <div style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
              {Object.entries(featuresByCategory).map(([category, features]) => (
                <div key={category} style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: '#007bff' }}>
                    {category || 'Sin Categoría'}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {features.map((feature) => (
                      <label
                        key={feature.id}
                        style={{
                          display: 'flex',
                          alignItems: 'start',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          backgroundColor: formData.featureIds.includes(feature.id) ? '#e7f3ff' : 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.featureIds.includes(feature.id)}
                          onChange={() => toggleFeature(feature.id)}
                          style={{ marginTop: '0.25rem' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold' }}>{feature.name}</div>
                          {feature.description && (
                            <div style={{ fontSize: '0.875rem', color: '#666' }}>{feature.description}</div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
              {formData.featureIds.length} de {allFeatures.length} features seleccionadas
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
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
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {mode === 'create' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

