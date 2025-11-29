import express from 'express';
import { DashboardStatsService } from '../../services/dashboardStatsService.js';
import { authenticateToken } from '../../utils/auth.js';
import { apiLogger } from '../../utils/logger.js';
import { Business } from '../../../database/models/Business.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * GET /api/dashboard/stats
 * Obtiene todas las métricas del dashboard para el negocio del usuario
 */
router.get('/stats', async (req, res) => {
  try {
    const businessId = req.user.business_id;
    
    if (!businessId) {
      return res.status(403).json({ error: 'Business ID required' });
    }

    apiLogger.debug('GET /dashboard/stats', {
      userId: req.user.user_id,
      businessId,
      role: req.user.role,
    });

    // Obtener plan del negocio para determinar qué métricas mostrar
    const business = await Business.findById(businessId);
    const planType = business?.plan_type || 'basic';

    // Obtener métricas según el plan
    const stats = await DashboardStatsService.getDashboardStats(businessId, planType);

    apiLogger.info('Dashboard stats retrieved', {
      businessId,
      planType,
      hasFinancial: !!stats.financial,
      hasAdvanced: !!stats.advanced,
    });

    res.json({ data: stats });
  } catch (error) {
    apiLogger.error('Error getting dashboard stats', {
      businessId: req.user.business_id,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;

