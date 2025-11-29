import express from 'express';
import { ShortlinkAnalyticsService } from '../../services/shortlinkAnalyticsService.js';
import { authenticateToken } from '../../utils/auth.js';
import { apiLogger } from '../../utils/logger.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * GET /api/shortlink-analytics/dashboard
 * Obtiene dashboard completo de estadísticas de shortlinks para el negocio del usuario
 */
router.get('/dashboard', async (req, res) => {
  try {
    const businessId = req.user.business_id;
    
    if (!businessId) {
      return res.status(403).json({ error: 'Business ID required' });
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

