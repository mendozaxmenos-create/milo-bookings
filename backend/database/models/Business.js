import db from '../index.js';
import { v4 as uuidv4 } from 'uuid';

export class Business {
  static async create(data) {
    const id = data.id || uuidv4();
    const business = {
      id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      whatsapp_number: data.whatsapp_number,
      owner_phone: data.owner_phone,
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db('businesses').insert(business);
    return this.findById(id);
  }

  static async findById(id) {
    return db('businesses').where({ id }).first();
  }

  static async findByPhone(phone) {
    return db('businesses').where({ phone }).first();
  }

  static async findByWhatsAppNumber(whatsappNumber) {
    return db('businesses').where({ whatsapp_number: whatsappNumber }).first();
  }

  static async update(id, data) {
    await db('businesses')
      .where({ id })
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      });
    return this.findById(id);
  }

  static async delete(id) {
    return db('businesses').where({ id }).delete();
  }

  static async list(limit = 100, offset = 0) {
    return db('businesses')
      .where({ is_active: true })
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');
  }
}

