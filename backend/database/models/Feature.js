import db from '../index.js';
import { v4 as uuidv4 } from 'uuid';

export class Feature {
  static async create(data) {
    const id = data.id || uuidv4();
    const now = new Date().toISOString();

    const feature = {
      id,
      name: data.name,
      key: data.key.toLowerCase().replace(/\s+/g, '_'),
      description: data.description || null,
      category: data.category || null,
      display_order: data.display_order || 0,
      is_active: data.is_active !== undefined ? data.is_active : true,
      created_at: now,
      updated_at: now,
    };

    await db('features').insert(feature);
    return this.findById(id);
  }

  static async findById(id) {
    return db('features').where({ id }).first();
  }

  static async findByKey(key) {
    return db('features').where({ key }).first();
  }

  static async getAll(options = {}) {
    let query = db('features');

    if (options.activeOnly) {
      query = query.where({ is_active: true });
    }

    if (options.category) {
      query = query.where({ category: options.category });
    }

    return query.orderBy('display_order', 'asc').orderBy('name', 'asc');
  }

  static async update(id, data) {
    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (data.name) updateData.name = data.name;
    if (data.key) updateData.key = data.key.toLowerCase().replace(/\s+/g, '_');
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.display_order !== undefined) updateData.display_order = data.display_order;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    await db('features').where({ id }).update(updateData);
    return this.findById(id);
  }

  static async delete(id) {
    return db('features').where({ id }).delete();
  }

  /**
   * Obtiene todas las features disponibles (activas)
   * Útil para detectar features nuevas que no están en ningún plan
   */
  static async getAvailableFeatures() {
    return db('features')
      .where({ is_active: true })
      .orderBy('category', 'asc')
      .orderBy('display_order', 'asc')
      .orderBy('name', 'asc');
  }
}

