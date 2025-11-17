import db from '../index.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export class BusinessUser {
  static async create(data) {
    const id = data.id || uuidv4();
    const passwordHash = await bcrypt.hash(data.password, 10);
    
    const user = {
      id,
      business_id: data.business_id,
      phone: data.phone,
      password_hash: passwordHash,
      role: data.role || 'staff',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db('business_users').insert(user);
    return this.findById(id);
  }

  static async findById(id) {
    return db('business_users').where({ id }).first();
  }

  static async findByBusinessAndPhone(businessId, phone) {
    return db('business_users')
      .where({ business_id: businessId, phone })
      .first();
  }

  static async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  }

  static async update(id, data) {
    const updateData = { ...data };
    if (data.password) {
      updateData.password_hash = await bcrypt.hash(data.password, 10);
      delete updateData.password;
    }
    
    await db('business_users')
      .where({ id })
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      });
    return this.findById(id);
  }

  static async delete(id) {
    return db('business_users').where({ id }).delete();
  }

  static async listByBusiness(businessId) {
    return db('business_users')
      .where({ business_id: businessId })
      .orderBy('created_at', 'desc');
  }
}

