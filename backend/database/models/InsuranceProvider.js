import db from '../index.js';
import { v4 as uuidv4 } from 'uuid';

export class InsuranceProvider {
  static async create(data) {
    const id = data.id || uuidv4();
    const provider = {
      id,
      business_id: data.business_id,
      name: data.name,
      copay_amount: parseFloat(data.copay_amount) || 0,
      display_order: data.display_order || 0,
      is_active: data.is_active !== undefined ? data.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db('insurance_providers').insert(provider);
    return this.findById(id);
  }

  static async findById(id) {
    return db('insurance_providers').where({ id }).first();
  }

  static async findByBusiness(businessId, includeInactive = false) {
    let query = db('insurance_providers')
      .where({ business_id: businessId });
    
    if (!includeInactive) {
      query = query.where({ is_active: true });
    }
    
    return query.orderBy('display_order', 'asc').orderBy('name', 'asc');
  }

  static async update(id, data) {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };
    
    // Asegurar que copay_amount sea un número
    if (updateData.copay_amount !== undefined) {
      updateData.copay_amount = parseFloat(updateData.copay_amount) || 0;
    }

    await db('insurance_providers')
      .where({ id })
      .update(updateData);
    
    return this.findById(id);
  }

  static async delete(id) {
    return db('insurance_providers').where({ id }).delete();
  }

  static async toggleActive(id) {
    const provider = await this.findById(id);
    if (!provider) {
      throw new Error('Insurance provider not found');
    }
    
    return this.update(id, { is_active: !provider.is_active });
  }
}

