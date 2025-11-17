import db from '../index.js';
import { v4 as uuidv4 } from 'uuid';

export class BusinessHours {
  static async create(data) {
    const id = data.id || uuidv4();
    const businessHour = {
      id,
      business_id: data.business_id,
      day_of_week: data.day_of_week,
      open_time: data.open_time,
      close_time: data.close_time,
      is_open: data.is_open ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db('business_hours').insert(businessHour);
    return this.findById(id);
  }

  static async findById(id) {
    return db('business_hours').where({ id }).first();
  }

  static async findByBusiness(businessId) {
    return db('business_hours')
      .where({ business_id: businessId })
      .orderBy('day_of_week', 'asc');
  }

  static async findByBusinessAndDay(businessId, dayOfWeek) {
    return db('business_hours')
      .where({ business_id: businessId, day_of_week: dayOfWeek })
      .first();
  }

  static async update(id, data) {
    await db('business_hours')
      .where({ id })
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      });
    return this.findById(id);
  }

  static async upsert(businessId, dayOfWeek, data) {
    const existing = await this.findByBusinessAndDay(businessId, dayOfWeek);
    
    if (existing) {
      return this.update(existing.id, data);
    } else {
      return this.create({
        ...data,
        business_id: businessId,
        day_of_week: dayOfWeek,
      });
    }
  }

  static async delete(id) {
    return db('business_hours').where({ id }).delete();
  }

  static async deleteByBusiness(businessId) {
    return db('business_hours').where({ business_id: businessId }).delete();
  }
}

