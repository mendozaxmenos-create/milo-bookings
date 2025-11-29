/**
 * Servicio para manejar analytics de shortlinks
 */

import db from '../../database/index.js';
import { v4 as uuidv4 } from 'uuid';

export class ShortlinkAnalyticsService {
  /**
   * Registra un acceso a un shortlink
   */
  static async trackAccess(clientId, slug, businessId, metadata = {}) {
    const id = uuidv4();
    
    const analytics = {
      id,
      client_id: clientId,
      slug: slug.toLowerCase(),
      business_id: businessId || null,
      ip_address: metadata.ipAddress || null,
      user_agent: metadata.userAgent || null,
      referer: metadata.referer || null,
      accessed_at: new Date().toISOString(),
    };

    await db('shortlink_analytics').insert(analytics);
    
    return analytics;
  }

  /**
   * Cuenta cuántas veces se ha accedido a un shortlink
   */
  static async getUsageCount(clientId) {
    const result = await db('shortlink_analytics')
      .where({ client_id: clientId })
      .count('* as count')
      .first();
    
    return parseInt(result?.count || 0, 10);
  }

  /**
   * Cuenta accesos por slug (útil para búsquedas rápidas)
   */
  static async getUsageCountBySlug(slug) {
    const result = await db('shortlink_analytics')
      .where({ slug: slug.toLowerCase() })
      .count('* as count')
      .first();
    
    return parseInt(result?.count || 0, 10);
  }

  /**
   * Obtiene estadísticas de un shortlink
   */
  static async getStats(clientId, options = {}) {
    const { startDate, endDate } = options;
    
    let query = db('shortlink_analytics').where({ client_id: clientId });
    
    if (startDate) {
      query = query.where('accessed_at', '>=', startDate);
    }
    
    if (endDate) {
      query = query.where('accessed_at', '<=', endDate);
    }
    
    const total = await query.clone().count('* as count').first();
    const byDate = await query.clone()
      .select(db.raw('DATE(accessed_at) as date'))
      .count('* as count')
      .groupBy('date')
      .orderBy('date', 'desc')
      .limit(30); // Últimos 30 días
    
    return {
      total: parseInt(total?.count || 0, 10),
      byDate: byDate.map(row => ({
        date: row.date,
        count: parseInt(row.count, 10),
      })),
    };
  }

  /**
   * Obtiene estadísticas por business_id (para ver todos los shortlinks de un negocio)
   */
  static async getStatsByBusiness(businessId, options = {}) {
    const { startDate, endDate } = options;
    
    let query = db('shortlink_analytics').where({ business_id: businessId });
    
    if (startDate) {
      query = query.where('accessed_at', '>=', startDate);
    }
    
    if (endDate) {
      query = query.where('accessed_at', '<=', endDate);
    }
    
    const total = await query.clone().count('* as count').first();
    
    // Agrupar por slug para ver cuál shortlink es más usado
    const bySlug = await query.clone()
      .select('slug')
      .count('* as count')
      .groupBy('slug')
      .orderBy('count', 'desc');
    
    return {
      total: parseInt(total?.count || 0, 10),
      bySlug: bySlug.map(row => ({
        slug: row.slug,
        count: parseInt(row.count, 10),
      })),
    };
  }
}

