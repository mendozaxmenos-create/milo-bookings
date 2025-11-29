/**
 * Servicio para calcular métricas del dashboard
 */

import db from '../../database/index.js';

export class DashboardStatsService {
  /**
   * Obtiene todas las métricas del dashboard para un negocio
   */
  static async getDashboardStats(businessId, planType = 'basic') {
    const stats = {
      // Métricas básicas (todos los planes)
      bookings: await this.getBookingStats(businessId),
      services: await this.getServiceStats(businessId),
      
      // Métricas financieras (plan intermedio y premium)
      ...(planType !== 'basic' && {
        financial: await this.getFinancialStats(businessId),
      }),
      
      // Métricas avanzadas (solo plan premium)
      ...(planType === 'premium' && {
        advanced: await this.getAdvancedStats(businessId),
      }),
    };

    return stats;
  }

  /**
   * Métricas de reservas (básicas)
   */
  static async getBookingStats(businessId) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    
    // Total de reservas
    const totalBookings = await db('bookings')
      .where({ business_id: businessId })
      .count('* as count')
      .first();

    // Reservas del día
    const todayBookings = await db('bookings')
      .where({ business_id: businessId, booking_date: today })
      .count('* as count')
      .first();

    // Reservas del mes
    const monthBookings = await db('bookings')
      .where({ business_id: businessId })
      .where('booking_date', '>=', startOfMonth)
      .count('* as count')
      .first();

    // Por estado
    const byStatus = await db('bookings')
      .where({ business_id: businessId })
      .select('status')
      .count('* as count')
      .groupBy('status');

    const statusMap = {};
    byStatus.forEach(row => {
      statusMap[row.status] = parseInt(row.count, 10);
    });

    return {
      total: parseInt(totalBookings?.count || 0, 10),
      today: parseInt(todayBookings?.count || 0, 10),
      thisMonth: parseInt(monthBookings?.count || 0, 10),
      pending: statusMap.pending || 0,
      pending_payment: statusMap.pending_payment || 0,
      confirmed: statusMap.confirmed || 0,
      cancelled: statusMap.cancelled || 0,
      completed: statusMap.completed || 0,
    };
  }

  /**
   * Métricas de servicios (básicas)
   */
  static async getServiceStats(businessId) {
    const totalServices = await db('services')
      .where({ business_id: businessId })
      .count('* as count')
      .first();

    const activeServices = await db('services')
      .where({ business_id: businessId, is_active: true })
      .count('* as count')
      .first();

    return {
      total: parseInt(totalServices?.count || 0, 10),
      active: parseInt(activeServices?.count || 0, 10),
    };
  }

  /**
   * Métricas financieras (plan intermedio y premium)
   */
  static async getFinancialStats(businessId) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

    // Ingresos totales (solo pagos confirmados)
    const totalRevenue = await db('bookings')
      .where({ business_id: businessId, payment_status: 'paid' })
      .sum('amount as total')
      .first();

    // Ingresos del mes actual
    const monthRevenue = await db('bookings')
      .where({ business_id: businessId, payment_status: 'paid' })
      .where('booking_date', '>=', startOfMonth)
      .sum('amount as total')
      .first();

    // Ingresos del día
    const todayRevenue = await db('bookings')
      .where({ business_id: businessId, payment_status: 'paid' })
      .where({ booking_date: today })
      .sum('amount as total')
      .first();

    // Ingresos del mes anterior (para comparación)
    const lastMonthRevenue = await db('bookings')
      .where({ business_id: businessId, payment_status: 'paid' })
      .whereBetween('booking_date', [startOfLastMonth, endOfLastMonth])
      .sum('amount as total')
      .first();

    // Ingresos pendientes
    const pendingRevenue = await db('bookings')
      .where({ business_id: businessId, payment_status: 'pending' })
      .sum('amount as total')
      .first();

    // Ticket promedio (promedio de monto por reserva pagada)
    const avgTicket = await db('bookings')
      .where({ business_id: businessId, payment_status: 'paid' })
      .avg('amount as avg')
      .first();

    // Contar reservas pagadas para calcular ticket promedio
    const paidBookingsCount = await db('bookings')
      .where({ business_id: businessId, payment_status: 'paid' })
      .count('* as count')
      .first();

    const totalRevenueValue = parseFloat(totalRevenue?.total || 0);
    const monthRevenueValue = parseFloat(monthRevenue?.total || 0);
    const todayRevenueValue = parseFloat(todayRevenue?.total || 0);
    const lastMonthRevenueValue = parseFloat(lastMonthRevenue?.total || 0);
    const pendingRevenueValue = parseFloat(pendingRevenue?.total || 0);
    const avgTicketValue = parseFloat(avgTicket?.avg || 0);
    const paidCount = parseInt(paidBookingsCount?.count || 0, 10);

    // Calcular variación porcentual mes actual vs anterior
    let monthVariation = 0;
    if (lastMonthRevenueValue > 0) {
      monthVariation = ((monthRevenueValue - lastMonthRevenueValue) / lastMonthRevenueValue) * 100;
    } else if (monthRevenueValue > 0) {
      monthVariation = 100; // Crecimiento infinito (de 0 a algo)
    }

    return {
      totalRevenue: totalRevenueValue,
      monthRevenue: monthRevenueValue,
      todayRevenue: todayRevenueValue,
      lastMonthRevenue: lastMonthRevenueValue,
      monthVariation: Math.round(monthVariation * 100) / 100, // Redondear a 2 decimales
      pendingRevenue: pendingRevenueValue,
      avgTicket: Math.round(avgTicketValue * 100) / 100,
      paidBookingsCount: paidCount,
    };
  }

  /**
   * Métricas avanzadas (solo plan premium)
   */
  static async getAdvancedStats(businessId) {
    // Servicio más popular (por número de reservas)
    const mostPopularService = await db('bookings')
      .join('services', 'bookings.service_id', 'services.id')
      .where({ 'bookings.business_id': businessId, 'bookings.status': 'confirmed' })
      .select('services.id', 'services.name')
      .count('bookings.id as count')
      .groupBy('services.id', 'services.name')
      .orderBy('count', 'desc')
      .first();

    // Top 3 servicios por ingresos
    const topServicesByRevenue = await db('bookings')
      .join('services', 'bookings.service_id', 'services.id')
      .where({ 'bookings.business_id': businessId, 'bookings.payment_status': 'paid' })
      .select('services.id', 'services.name')
      .sum('bookings.amount as revenue')
      .groupBy('services.id', 'services.name')
      .orderBy('revenue', 'desc')
      .limit(3);

    // Total de clientes únicos
    const uniqueCustomers = await db('bookings')
      .where({ business_id: businessId })
      .countDistinct('customer_phone as count')
      .first();

    // Clientes recurrentes (2+ reservas)
    const recurringCustomers = await db('bookings')
      .where({ business_id: businessId })
      .select('customer_phone')
      .count('* as count')
      .groupBy('customer_phone')
      .having('count', '>=', 2);

    // Tasa de retención
    const totalCustomers = parseInt(uniqueCustomers?.count || 0, 10);
    const recurringCount = recurringCustomers.length;
    const retentionRate = totalCustomers > 0 
      ? Math.round((recurringCount / totalCustomers) * 100 * 100) / 100 
      : 0;

    // Tasa de no-show (reservas confirmadas que no se completaron)
    const confirmedBookings = await db('bookings')
      .where({ business_id: businessId, status: 'confirmed' })
      .count('* as count')
      .first();

    const completedBookings = await db('bookings')
      .where({ business_id: businessId, status: 'completed' })
      .count('* as count')
      .first();

    const confirmedCount = parseInt(confirmedBookings?.count || 0, 10);
    const completedCount = parseInt(completedBookings?.count || 0, 10);
    const noShowRate = confirmedCount > 0 
      ? Math.round(((confirmedCount - completedCount) / confirmedCount) * 100 * 100) / 100 
      : 0;

    return {
      mostPopularService: mostPopularService ? {
        id: mostPopularService.id,
        name: mostPopularService.name,
        bookingsCount: parseInt(mostPopularService.count, 10),
      } : null,
      topServicesByRevenue: topServicesByRevenue.map(service => ({
        id: service.id,
        name: service.name,
        revenue: parseFloat(service.revenue || 0),
      })),
      uniqueCustomers: totalCustomers,
      recurringCustomers: recurringCount,
      retentionRate,
      noShowRate,
    };
  }
}

