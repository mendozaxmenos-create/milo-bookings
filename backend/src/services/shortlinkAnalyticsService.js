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

  /**
   * Obtiene dashboard completo de estadísticas para un negocio
   */
  static async getDashboardStats(businessId, options = {}) {
    const { startDate, endDate, compareStartDate, compareEndDate } = options;
    
    // Query base - si businessId es null, no filtrar por business_id
    let baseQuery = db('shortlink_analytics');
    if (businessId) {
      baseQuery = baseQuery.where({ business_id: businessId });
    }
    if (startDate) baseQuery = baseQuery.where('accessed_at', '>=', startDate);
    if (endDate) baseQuery = baseQuery.where('accessed_at', '<=', endDate);

    // Query de comparación (período anterior)
    let compareQuery = null;
    if (compareStartDate && compareEndDate) {
      compareQuery = db('shortlink_analytics');
      if (businessId) {
        compareQuery = compareQuery.where({ business_id: businessId });
      }
      compareQuery = compareQuery.where('accessed_at', '>=', compareStartDate);
      compareQuery = compareQuery.where('accessed_at', '<=', compareEndDate);
    }

    // 1. Total de clics
    const totalResult = await baseQuery.clone().count('* as count').first();
    const total = parseInt(totalResult?.count || 0, 10);
    
    // Total del período anterior (para comparación)
    let previousTotal = 0;
    if (compareQuery) {
      const prevResult = await compareQuery.clone().count('* as count').first();
      previousTotal = parseInt(prevResult?.count || 0, 10);
    }
    const totalChange = previousTotal > 0 ? ((total - previousTotal) / previousTotal * 100) : 0;

    // 2. Shortlinks activos (con al menos 1 clic)
    const activeSlugs = await baseQuery.clone()
      .select('slug')
      .count('* as count')
      .groupBy('slug')
      .having('count', '>', 0);
    const activeCount = activeSlugs.length;

    // 3. Promedio de clics por shortlink
    let allSlugsQuery = db('clients').where({ status: 'active' });
    if (businessId) {
      allSlugsQuery = allSlugsQuery.where({ business_id: businessId });
    }
    const allSlugs = await allSlugsQuery.select('slug');
    const totalShortlinks = allSlugs.length;
    const avgClicks = totalShortlinks > 0 ? (total / totalShortlinks) : 0;

    // 4. Gráfico de tendencias (por día)
    const byDate = await baseQuery.clone()
      .select(db.raw('DATE(accessed_at) as date'))
      .count('* as count')
      .groupBy('date')
      .orderBy('date', 'asc');

    // 5. Top shortlinks
    const topShortlinks = await baseQuery.clone()
      .select('slug', 'client_id')
      .count('* as count')
      .groupBy('slug', 'client_id')
      .orderBy('count', 'desc')
      .limit(10);

    // Obtener nombres de los shortlinks
    const topShortlinksWithNames = await Promise.all(
      topShortlinks.map(async (item) => {
        const client = await db('clients').where({ id: item.client_id }).first();
        return {
          slug: item.slug,
          name: client?.name || item.slug,
          count: parseInt(item.count, 10),
          percentage: total > 0 ? ((parseInt(item.count, 10) / total) * 100).toFixed(1) : 0,
        };
      })
    );

    // 6. Distribución por hora del día
    const byHour = await baseQuery.clone()
      .select(db.raw('EXTRACT(HOUR FROM accessed_at) as hour'))
      .count('* as count')
      .groupBy('hour')
      .orderBy('hour', 'asc');

    // 7. Distribución por día de la semana (0=Domingo, 6=Sábado)
    const byDayOfWeek = await baseQuery.clone()
      .select(db.raw('EXTRACT(DOW FROM accessed_at) as day_of_week'))
      .count('* as count')
      .groupBy('day_of_week')
      .orderBy('day_of_week', 'asc');

    // 8. Dispositivos y navegadores (análisis de user_agent)
    const userAgents = await baseQuery.clone()
      .select('user_agent')
      .whereNotNull('user_agent')
      .limit(1000); // Limitar para performance

    const deviceStats = this.analyzeUserAgents(userAgents.map(u => u.user_agent));

    // 9. Referers (fuentes de tráfico)
    const referers = await baseQuery.clone()
      .select('referer')
      .whereNotNull('referer')
      .count('* as count')
      .groupBy('referer')
      .orderBy('count', 'desc')
      .limit(20);

    // 10. Accesos recientes
    const recentAccesses = await baseQuery.clone()
      .select('slug', 'ip_address', 'user_agent', 'referer', 'accessed_at')
      .orderBy('accessed_at', 'desc')
      .limit(50);

    // 11. Estadísticas por shortlink individual
    const shortlinksStats = await Promise.all(
      allSlugs.map(async (clientRow) => {
        const slug = clientRow.slug;
        const slugQuery = baseQuery.clone().where({ slug });
        const slugTotal = await slugQuery.clone().count('* as count').first();
        const slugCount = parseInt(slugTotal?.count || 0, 10);
        
        const firstAccess = await slugQuery.clone()
          .orderBy('accessed_at', 'asc')
          .first();
        const lastAccess = await slugQuery.clone()
          .orderBy('accessed_at', 'desc')
          .first();

        // Clics hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = await slugQuery.clone()
          .where('accessed_at', '>=', today.toISOString())
          .count('* as count')
          .first();

        // Clics esta semana
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekCount = await slugQuery.clone()
          .where('accessed_at', '>=', weekAgo.toISOString())
          .count('* as count')
          .first();

        // Clics este mes
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const monthCount = await slugQuery.clone()
          .where('accessed_at', '>=', monthAgo.toISOString())
          .count('* as count')
          .first();

        return {
          slug: slug,
          name: clientRow.name || slug,
          total: slugCount,
          firstAccess: firstAccess?.accessed_at || null,
          lastAccess: lastAccess?.accessed_at || null,
          today: parseInt(todayCount?.count || 0, 10),
          thisWeek: parseInt(weekCount?.count || 0, 10),
          thisMonth: parseInt(monthCount?.count || 0, 10),
        };
      })
    );

    return {
      summary: {
        total,
        previousTotal,
        totalChange: totalChange.toFixed(1),
        activeCount,
        totalShortlinks,
        avgClicks: avgClicks.toFixed(1),
      },
      trends: {
        byDate: byDate.map(row => ({
          date: row.date,
          count: parseInt(row.count, 10),
        })),
      },
      topShortlinks: topShortlinksWithNames,
      distribution: {
        byHour: byHour.map(row => ({
          hour: parseInt(row.hour, 10),
          count: parseInt(row.count, 10),
        })),
        byDayOfWeek: byDayOfWeek.map(row => ({
          day: parseInt(row.day_of_week, 10),
          count: parseInt(row.count, 10),
        })),
      },
      devices: deviceStats,
      referers: referers.map(row => ({
        referer: row.referer || 'Directo',
        count: parseInt(row.count, 10),
      })),
      recentAccesses: recentAccesses.map(row => ({
        slug: row.slug,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        referer: row.referer,
        accessedAt: row.accessed_at,
      })),
      shortlinks: shortlinksStats.sort((a, b) => b.total - a.total),
    };
  }

  /**
   * Analiza user agents para determinar dispositivos y navegadores
   */
  static analyzeUserAgents(userAgents) {
    const devices = { mobile: 0, desktop: 0, tablet: 0, bot: 0, unknown: 0 };
    const browsers = {};

    userAgents.forEach(ua => {
      if (!ua) return;

      const uaLower = ua.toLowerCase();

      // Detectar dispositivo
      if (uaLower.includes('mobile') || uaLower.includes('android') || uaLower.includes('iphone')) {
        devices.mobile++;
      } else if (uaLower.includes('tablet') || uaLower.includes('ipad')) {
        devices.tablet++;
      } else if (uaLower.includes('bot') || uaLower.includes('crawler') || uaLower.includes('spider')) {
        devices.bot++;
      } else if (uaLower.includes('windows') || uaLower.includes('mac') || uaLower.includes('linux')) {
        devices.desktop++;
      } else {
        devices.unknown++;
      }

      // Detectar navegador
      if (uaLower.includes('chrome') && !uaLower.includes('edg')) {
        browsers['Chrome'] = (browsers['Chrome'] || 0) + 1;
      } else if (uaLower.includes('safari') && !uaLower.includes('chrome')) {
        browsers['Safari'] = (browsers['Safari'] || 0) + 1;
      } else if (uaLower.includes('firefox')) {
        browsers['Firefox'] = (browsers['Firefox'] || 0) + 1;
      } else if (uaLower.includes('edg')) {
        browsers['Edge'] = (browsers['Edge'] || 0) + 1;
      } else if (uaLower.includes('opera') || uaLower.includes('opr')) {
        browsers['Opera'] = (browsers['Opera'] || 0) + 1;
      } else {
        browsers['Otro'] = (browsers['Otro'] || 0) + 1;
      }
    });

    return {
      devices: Object.entries(devices).map(([type, count]) => ({ type, count })),
      browsers: Object.entries(browsers)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    };
  }

  /**
   * Obtiene estadísticas detalladas de un shortlink específico
   */
  static async getShortlinkDetails(clientId, slug, options = {}) {
    const { startDate, endDate } = options;
    
    let query = db('shortlink_analytics')
      .where({ client_id: clientId, slug: slug.toLowerCase() });
    
    if (startDate) query = query.where('accessed_at', '>=', startDate);
    if (endDate) query = query.where('accessed_at', '<=', endDate);

    const total = await query.clone().count('* as count').first();
    
    // Tendencia por día
    const byDate = await query.clone()
      .select(db.raw('DATE(accessed_at) as date'))
      .count('* as count')
      .groupBy('date')
      .orderBy('date', 'asc');

    // Accesos recientes
    const recent = await query.clone()
      .select('ip_address', 'user_agent', 'referer', 'accessed_at')
      .orderBy('accessed_at', 'desc')
      .limit(100);

    // Distribución por hora
    const byHour = await query.clone()
      .select(db.raw('EXTRACT(HOUR FROM accessed_at) as hour'))
      .count('* as count')
      .groupBy('hour')
      .orderBy('hour', 'asc');

    return {
      total: parseInt(total?.count || 0, 10),
      byDate: byDate.map(row => ({
        date: row.date,
        count: parseInt(row.count, 10),
      })),
      byHour: byHour.map(row => ({
        hour: parseInt(row.hour, 10),
        count: parseInt(row.count, 10),
      })),
      recent: recent.map(row => ({
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        referer: row.referer,
        accessedAt: row.accessed_at,
      })),
    };
  }
}

