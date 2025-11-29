import express from 'express';
import { ShortlinkAnalyticsService } from '../../services/shortlinkAnalyticsService.js';
import { authenticateToken } from '../../utils/auth.js';
import { apiLogger } from '../../utils/logger.js';
import db from '../../../database/index.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * GET /api/shortlink-analytics/dashboard
 * Obtiene dashboard completo de estadísticas de shortlinks para el negocio del usuario
 */
router.get('/dashboard', async (req, res) => {
  try {
    // Permitir super admins ver analytics de todos los negocios o de uno específico
    const isSuperAdmin = req.user.is_system_user && req.user.role === 'super_admin';
    let businessId = req.user.business_id;
    
    // Si es super admin y hay un business_id en query params, usar ese
    if (isSuperAdmin && req.query.businessId) {
      businessId = req.query.businessId;
    }
    
    if (!businessId && !isSuperAdmin) {
      return res.status(403).json({ error: 'Business ID required' });
    }
    
    // Si es super admin sin businessId, retornar datos vacíos o de todos los negocios
    if (isSuperAdmin && !businessId) {
      // Por ahora, retornar datos vacíos para super admin sin business específico
      // En el futuro se puede agregar lógica para agregar todos los negocios
      businessId = null;
    }

    // Parsear parámetros de fecha
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    const compareStartDate = req.query.compareStartDate || null;
    const compareEndDate = req.query.compareEndDate || null;

    // Si no hay fechas, usar último mes por defecto
    let finalStartDate = startDate;
    let finalEndDate = endDate;
    
    if (!finalStartDate || !finalEndDate) {
      const now = new Date();
      finalEndDate = now.toISOString();
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      finalStartDate = monthAgo.toISOString();
    }

    // Calcular período de comparación (mes anterior)
    let finalCompareStartDate = compareStartDate;
    let finalCompareEndDate = compareEndDate;
    
    if (!finalCompareStartDate || !finalCompareEndDate) {
      const start = new Date(finalStartDate);
      const end = new Date(finalEndDate);
      const duration = end - start;
      
      finalCompareEndDate = new Date(start);
      finalCompareEndDate.setTime(finalCompareEndDate.getTime() - 1);
      finalCompareStartDate = new Date(finalCompareEndDate);
      finalCompareStartDate.setTime(finalCompareStartDate.getTime() - duration);
      
      finalCompareStartDate = finalCompareStartDate.toISOString();
      finalCompareEndDate = finalCompareEndDate.toISOString();
    }

    apiLogger.debug('GET /shortlink-analytics/dashboard', {
      userId: req.user.user_id,
      businessId,
      startDate: finalStartDate,
      endDate: finalEndDate,
    });

    // Si no hay businessId (super admin sin negocio específico), retornar datos vacíos pero con métricas de negocios
    if (!businessId) {
      // Obtener métricas de negocios para super admin
      const now = new Date();
      
      // Clientes activos (tienen plan_id, no están en trial, y están activos)
      const activeClientsQuery = db('businesses')
        .where({ is_active: true })
        .whereNotNull('plan_id')
        .where({ is_trial: false });
      const activeClientsResult = await activeClientsQuery.count('* as count').first();
      const activeClients = parseInt(activeClientsResult?.count || 0, 10);
      
      // Clientes en trial (is_trial = true y trial_end_date > ahora)
      const trialClientsQuery = db('businesses')
        .where({ is_active: true, is_trial: true })
        .whereNotNull('trial_end_date')
        .where('trial_end_date', '>', now.toISOString());
      const trialClientsResult = await trialClientsQuery.count('* as count').first();
      const trialClients = parseInt(trialClientsResult?.count || 0, 10);
      
      // Facturación total (suma de precios de planes de clientes activos)
      const activeBusinessesWithPlans = await db('businesses')
        .join('subscription_plans', 'businesses.plan_id', 'subscription_plans.id')
        .where({ 'businesses.is_active': true, 'businesses.is_trial': false })
        .whereNotNull('businesses.plan_id')
        .select('subscription_plans.price', 'subscription_plans.currency');
      
      let totalRevenue = 0;
      const revenueByCurrency = {};
      activeBusinessesWithPlans.forEach(business => {
        const price = parseFloat(business.price || 0);
        const currency = business.currency || 'ARS';
        totalRevenue += price;
        revenueByCurrency[currency] = (revenueByCurrency[currency] || 0) + price;
      });
      
      // Clientes que migraron de trial a plan pago (trial_end_date < ahora y tienen plan_id)
      const migratedClientsQuery = db('businesses')
        .where({ is_active: true, is_trial: false })
        .whereNotNull('plan_id')
        .whereNotNull('trial_end_date')
        .where('trial_end_date', '<', now.toISOString());
      const migratedClientsResult = await migratedClientsQuery.count('* as count').first();
      const migratedClients = parseInt(migratedClientsResult?.count || 0, 10);
      
      return res.json({ 
        data: {
          summary: {
            total: 0,
            previousTotal: 0,
            totalChange: '0.0',
            activeCount: 0,
            totalShortlinks: 0,
            avgClicks: '0.0',
          },
          business: {
            activeClients,
            trialClients,
            migratedClients,
            totalRevenue,
            revenueByCurrency,
          },
          trends: { byDate: [] },
          topShortlinks: [],
          distribution: { byHour: [], byDayOfWeek: [] },
          devices: { devices: [], browsers: [] },
          referers: [],
          recentAccesses: [],
          shortlinks: [],
        }
      });
    }

    const stats = await ShortlinkAnalyticsService.getDashboardStats(businessId, {
      startDate: finalStartDate,
      endDate: finalEndDate,
      compareStartDate: finalCompareStartDate,
      compareEndDate: finalCompareEndDate,
    });

    apiLogger.info('Shortlink analytics dashboard retrieved', {
      businessId,
      total: stats.summary.total,
    });

    res.json({ data: stats });
  } catch (error) {
    apiLogger.error('Error getting shortlink analytics dashboard', {
      businessId: req.user.business_id,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * GET /api/shortlink-analytics/:slug
 * Obtiene estadísticas detalladas de un shortlink específico
 */
router.get('/:slug', async (req, res) => {
  try {
    const businessId = req.user.business_id;
    const slug = req.params.slug;
    
    if (!businessId) {
      return res.status(403).json({ error: 'Business ID required' });
    }

    // Verificar que el shortlink pertenece al negocio
    const { ClientService } = await import('../../services/clientService.js');
    const client = await ClientService.getBySlug(slug);
    
    if (!client || client.business_id !== businessId) {
      return res.status(404).json({ error: 'Shortlink not found' });
    }

    // Parsear parámetros de fecha
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;

    apiLogger.debug('GET /shortlink-analytics/:slug', {
      userId: req.user.user_id,
      businessId,
      slug,
      startDate,
      endDate,
    });

    const stats = await ShortlinkAnalyticsService.getShortlinkDetails(client.id, slug, {
      startDate,
      endDate,
    });

    res.json({ data: stats });
  } catch (error) {
    apiLogger.error('Error getting shortlink details', {
      slug: req.params.slug,
      error: error.message,
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;

