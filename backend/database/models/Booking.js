import db from '../index.js';
import { v4 as uuidv4 } from 'uuid';

export class Booking {
  static async create(data) {
    const id = data.id || uuidv4();
    const booking = {
      id,
      business_id: data.business_id,
      service_id: data.service_id,
      customer_phone: data.customer_phone,
      customer_name: data.customer_name,
      booking_date: data.booking_date,
      booking_time: data.booking_time,
      status: data.status || 'pending',
      payment_status: data.payment_status || 'pending',
      payment_id: data.payment_id,
      amount: data.amount,
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db('bookings').insert(booking);
    return this.findById(id);
  }

  static async findById(id) {
    return db('bookings')
      .join('services', 'bookings.service_id', 'services.id')
      .select(
        'bookings.*',
        'services.name as service_name',
        'services.duration_minutes as service_duration'
      )
      .where({ 'bookings.id': id })
      .first();
  }

  static async findByBusiness(businessId, filters = {}) {
    const query = db('bookings')
      .join('services', 'bookings.service_id', 'services.id')
      .select(
        'bookings.*',
        'services.name as service_name',
        'services.duration_minutes as service_duration'
      )
      .where({ 'bookings.business_id': businessId });

    if (filters.status) {
      query.where({ 'bookings.status': filters.status });
    }

    if (filters.date) {
      query.where({ 'bookings.booking_date': filters.date });
    }

    if (filters.customer_phone) {
      query.where({ 'bookings.customer_phone': filters.customer_phone });
    }

    return query
      .orderBy('bookings.booking_date', 'desc')
      .orderBy('bookings.booking_time', 'desc')
      .limit(filters.limit || 100)
      .offset(filters.offset || 0);
  }

  static async findByCustomer(customerPhone) {
    return db('bookings')
      .join('services', 'bookings.service_id', 'services.id')
      .select(
        'bookings.*',
        'services.name as service_name',
        'services.duration_minutes as service_duration'
      )
      .where({ 'bookings.customer_phone': customerPhone })
      .orderBy('bookings.booking_date', 'desc')
      .orderBy('bookings.booking_time', 'desc');
  }

  static async update(id, data) {
    await db('bookings')
      .where({ id })
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      });
    return this.findById(id);
  }

  static async delete(id) {
    return db('bookings').where({ id }).delete();
  }

  static async findByDateRange(businessId, startDate, endDate) {
    return db('bookings')
      .where({ business_id: businessId })
      .whereBetween('booking_date', [startDate, endDate])
      .orderBy('booking_date', 'asc')
      .orderBy('booking_time', 'asc');
  }
}

