import db from '../index.js';
import { v4 as uuidv4 } from 'uuid';

export class Client {
  static async create(data) {
    const id = data.id || uuidv4();
    const now = new Date().toISOString();

    const client = {
      id,
      name: data.name,
      slug: data.slug.toLowerCase(),
      business_id: data.business_id || null,
      settings: JSON.stringify(data.settings || {}),
      status: data.status || 'active',
      created_at: now,
      updated_at: now,
    };

    await db('clients').insert(client);
    return this.findById(id);
  }

  static async findById(id) {
    const client = await db('clients').where({ id }).first();
    if (client) {
      return {
        ...client,
        settings: typeof client.settings === 'string' ? JSON.parse(client.settings) : client.settings,
      };
    }
    return null;
  }

  static async findBySlug(slug) {
    const client = await db('clients')
      .where({ slug: slug.toLowerCase() })
      .first();

    if (client) {
      return {
        ...client,
        settings: typeof client.settings === 'string' ? JSON.parse(client.settings) : client.settings,
      };
    }
    return null;
  }

  static async update(id, data) {
    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (data.name) updateData.name = data.name;
    if (data.slug) updateData.slug = data.slug.toLowerCase();
    if (data.settings) updateData.settings = JSON.stringify(data.settings);
    if (data.status) updateData.status = data.status;
    if (data.business_id !== undefined) updateData.business_id = data.business_id;

    await db('clients').where({ id }).update(updateData);
    return this.findById(id);
  }

  static async delete(id) {
    return this.update(id, { status: 'inactive' });
  }

  static async list(limit = 100, offset = 0) {
    const clients = await db('clients')
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');

    return clients.map(client => ({
      ...client,
      settings: typeof client.settings === 'string' ? JSON.parse(client.settings) : client.settings,
    }));
  }
}

