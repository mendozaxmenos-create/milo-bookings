import db from '../index.js';
import { v4 as uuidv4 } from 'uuid';

export class Service {
  static async create(data) {
    const id = data.id || uuidv4();
    const service = {
      id,
      business_id: data.business_id,
      name: data.name,
      description: data.description,
      duration_minutes: data.duration_minutes,
      price: data.price,
      display_order: data.display_order || 0,
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db('services').insert(service);
    return this.findById(id);
  }

  static async findById(id) {
    return db('services').where({ id }).first();
  }

  static async findByBusiness(businessId, includeInactive = false) {
    const query = db('services').where({ business_id: businessId });
    if (!includeInactive) {
      query.where({ is_active: true });
    }
    return query.orderBy('display_order', 'asc').orderBy('name', 'asc');
  }

  static async update(id, data) {
    await db('services')
      .where({ id })
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      });
    return this.findById(id);
  }

  static async delete(id) {
    return db('services').where({ id }).delete();
  }

  static async toggleActive(id) {
    const service = await this.findById(id);
    if (!service) return null;
    
    await db('services')
      .where({ id })
      .update({
        is_active: !service.is_active,
        updated_at: new Date().toISOString(),
      });
    return this.findById(id);
  }
}

