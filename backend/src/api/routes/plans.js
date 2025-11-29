import express from 'express';
import { SubscriptionPlan } from '../../../database/models/SubscriptionPlan.js';
import { Feature } from '../../../database/models/Feature.js';
import { authenticateToken } from '../../utils/auth.js';
import { apiLogger } from '../../utils/logger.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * GET /api/plans
 * Listar todos los planes (con sus features)
 * - Super admin: ve todos los planes
 * - Business owner: ve solo planes activos
 */
router.get('/', async (req, res) => {
  try {
    const isSuperAdmin = req.user.is_system_user && req.user.role === 'super_admin';
    
    const options = {
      activeOnly: !isSuperAdmin, // Business owners solo ven planes activos
    };

    const plans = await SubscriptionPlan.getAllWithFeatures(options);

    // Para super admin, también mostrar features disponibles que no están en ningún plan
    if (isSuperAdmin) {
      const allFeatures = await Feature.getAvailableFeatures();
      const plansWithMissingFeatures = plans.map(plan => {
        const planFeatureIds = plan.features.map(f => f.id);
        const missingFeatures = allFeatures.filter(f => !planFeatureIds.includes(f.id));
        return {
          ...plan,
          missingFeatures, // Features disponibles que no están en este plan
        };
      });

      return res.json({ data: plansWithMissingFeatures });
    }

    res.json({ data: plans });
  } catch (error) {
    apiLogger.error('Error listing plans', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * GET /api/plans/:id
 * Obtener un plan específico con sus features
 */
router.get('/:id', async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdWithFeatures(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Para super admin, mostrar features disponibles que no están en el plan
    const isSuperAdmin = req.user.is_system_user && req.user.role === 'super_admin';
    if (isSuperAdmin) {
      const allFeatures = await Feature.getAvailableFeatures();
      const planFeatureIds = plan.features.map(f => f.id);
      const missingFeatures = allFeatures.filter(f => !planFeatureIds.includes(f.id));
      plan.missingFeatures = missingFeatures;
    }

    res.json({ data: plan });
  } catch (error) {
    apiLogger.error('Error getting plan', {
      planId: req.params.id,
      error: error.message,
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * POST /api/plans
 * Crear un nuevo plan (solo super admin)
 */
router.post('/', async (req, res) => {
  try {
    const isSuperAdmin = req.user.is_system_user && req.user.role === 'super_admin';
    
    if (!isSuperAdmin) {
      return res.status(403).json({ error: 'Forbidden: Only super admins can create plans' });
    }

    const { name, key, description, price, currency, display_order, is_active, is_default, featureIds } = req.body;

    if (!name || !key) {
      return res.status(400).json({ error: 'Missing required fields: name, key' });
    }

    // Verificar que el key no exista
    const existingPlan = await SubscriptionPlan.findByKey(key);
    if (existingPlan) {
      return res.status(409).json({ error: 'Plan with this key already exists' });
    }

    const plan = await SubscriptionPlan.create({
      name,
      key,
      description,
      price,
      currency,
      display_order,
      is_active: is_active !== undefined ? is_active : true,
      is_default: is_default || false,
    });

    // Agregar features si se proporcionaron
    if (featureIds && Array.isArray(featureIds) && featureIds.length > 0) {
      await SubscriptionPlan.updateFeatures(plan.id, featureIds);
    }

    const planWithFeatures = await SubscriptionPlan.findByIdWithFeatures(plan.id);

    res.status(201).json({ data: planWithFeatures });
  } catch (error) {
    apiLogger.error('Error creating plan', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * PUT /api/plans/:id
 * Actualizar un plan (solo super admin)
 */
router.put('/:id', async (req, res) => {
  try {
    const isSuperAdmin = req.user.is_system_user && req.user.role === 'super_admin';
    
    if (!isSuperAdmin) {
      return res.status(403).json({ error: 'Forbidden: Only super admins can update plans' });
    }

    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const { name, key, description, price, currency, display_order, is_active, is_default, featureIds } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (key) {
      // Verificar que el nuevo key no exista en otro plan
      const existingPlan = await SubscriptionPlan.findByKey(key);
      if (existingPlan && existingPlan.id !== req.params.id) {
        return res.status(409).json({ error: 'Plan with this key already exists' });
      }
      updateData.key = key;
    }
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (currency !== undefined) updateData.currency = currency;
    if (display_order !== undefined) updateData.display_order = display_order;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (is_default !== undefined) updateData.is_default = is_default;

    await SubscriptionPlan.update(req.params.id, updateData);

    // Actualizar features si se proporcionaron
    if (featureIds !== undefined && Array.isArray(featureIds)) {
      await SubscriptionPlan.updateFeatures(req.params.id, featureIds);
    }

    const planWithFeatures = await SubscriptionPlan.findByIdWithFeatures(req.params.id);

    res.json({ data: planWithFeatures });
  } catch (error) {
    apiLogger.error('Error updating plan', {
      planId: req.params.id,
      error: error.message,
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * DELETE /api/plans/:id
 * Eliminar un plan (solo super admin)
 */
router.delete('/:id', async (req, res) => {
  try {
    const isSuperAdmin = req.user.is_system_user && req.user.role === 'super_admin';
    
    if (!isSuperAdmin) {
      return res.status(403).json({ error: 'Forbidden: Only super admins can delete plans' });
    }

    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    await SubscriptionPlan.delete(req.params.id);

    res.status(204).send();
  } catch (error) {
    apiLogger.error('Error deleting plan', {
      planId: req.params.id,
      error: error.message,
    });
    
    if (error.message.includes('businesses using this plan')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * GET /api/plans/features/available
 * Obtener todas las features disponibles (para super admin)
 */
router.get('/features/available', async (req, res) => {
  try {
    const isSuperAdmin = req.user.is_system_user && req.user.role === 'super_admin';
    
    if (!isSuperAdmin) {
      return res.status(403).json({ error: 'Forbidden: Only super admins can view all features' });
    }

    const features = await Feature.getAvailableFeatures();
    
    // Agrupar por categoría
    const featuresByCategory = {};
    features.forEach(feature => {
      const category = feature.category || 'other';
      if (!featuresByCategory[category]) {
        featuresByCategory[category] = [];
      }
      featuresByCategory[category].push(feature);
    });

    res.json({ 
      data: features,
      byCategory: featuresByCategory,
    });
  } catch (error) {
    apiLogger.error('Error getting available features', {
      error: error.message,
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;

