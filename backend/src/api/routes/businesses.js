import express from 'express';
import { Business } from '../../../database/models/Business.js';
import { authenticateToken } from '../../utils/auth.js';
import { validateBusiness } from '../../utils/validators.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Listar negocios (solo para admins del sistema)
router.get('/', async (req, res) => {
  try {
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const businesses = await Business.list();
    res.json({ data: businesses });
  } catch (error) {
    console.error('Error listing businesses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Obtener negocio por ID
router.get('/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Verificar que el usuario pertenece a este negocio
    if (req.user.business_id !== business.id && req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ data: business });
  } catch (error) {
    console.error('Error getting business:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Crear negocio
router.post('/', async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { error, value } = validateBusiness(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const business = await Business.create(value);
    res.status(201).json({ data: business });
  } catch (error) {
    console.error('Error creating business:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Actualizar negocio
router.put('/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Verificar permisos
    if (req.user.business_id !== business.id && req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { error, value } = validateBusiness(req.body, true);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updated = await Business.update(req.params.id, value);
    res.json({ data: updated });
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Eliminar negocio (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    await Business.update(req.params.id, { is_active: false });
    res.json({ message: 'Business deactivated' });
  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/businesses/:id/plan
 * Cambiar el plan de suscripción del negocio
 */
router.patch('/:id/plan', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Verificar permisos: solo el dueño del negocio o super admin
    const isSuperAdmin = req.user.is_system_user && req.user.role === 'super_admin';
    if (req.user.business_id !== business.id && !isSuperAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { plan_id } = req.body;

    if (!plan_id) {
      return res.status(400).json({ error: 'Missing required field: plan_id' });
    }

    // Verificar que el plan existe y está activo
    const { SubscriptionPlan } = await import('../../../database/models/SubscriptionPlan.js');
    const plan = await SubscriptionPlan.findById(plan_id);
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    if (!plan.is_active) {
      return res.status(400).json({ error: 'Cannot assign inactive plan' });
    }

    // Actualizar el plan del negocio
    await Business.update(req.params.id, { plan_id });

    // Obtener el negocio actualizado con el plan
    const updatedBusiness = await Business.findById(req.params.id);
    const planWithFeatures = await SubscriptionPlan.findByIdWithFeatures(plan_id);

    res.json({ 
      data: {
        business: updatedBusiness,
        plan: planWithFeatures,
      },
    });
  } catch (error) {
    console.error('Error updating business plan:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;

