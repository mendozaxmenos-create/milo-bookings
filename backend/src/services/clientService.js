/**
 * Servicio para manejar clientes/comercios
 */

import db from '../../database/index.js';
import { v4 as uuidv4 } from 'uuid';

export class ClientService {
  /**
   * Crea un nuevo cliente
   */
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

    return this.getById(id);
  }

  /**
   * Obtiene un cliente por ID
   */
  static async getById(id) {
    const client = await db('clients').where({ id }).first();
    
    if (client) {
      return {
        ...client,
        settings: typeof client.settings === 'string' ? JSON.parse(client.settings) : client.settings,
      };
    }

    return null;
  }

  /**
   * Obtiene un cliente por slug
   */
  static async getBySlug(slug) {
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

  /**
   * Obtiene todos los clientes activos
   */
  static async getAllActive() {
    const clients = await db('clients')
      .where({ status: 'active' })
      .orderBy('created_at', 'desc');

    return clients.map(client => ({
      ...client,
      settings: typeof client.settings === 'string' ? JSON.parse(client.settings) : client.settings,
    }));
  }

  /**
   * Actualiza un cliente
   */
  static async update(id, data) {
    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (data.name) updateData.name = data.name;
    if (data.slug) updateData.slug = data.slug.toLowerCase();
    if (data.settings) updateData.settings = JSON.stringify(data.settings);
    if (data.status) updateData.status = data.status;
    if (data.business_id !== undefined) updateData.business_id = data.business_id;

    await db('clients')
      .where({ id })
      .update(updateData);

    return this.getById(id);
  }

  /**
   * Elimina un cliente (soft delete cambiando status)
   */
  static async delete(id) {
    return this.update(id, { status: 'inactive' });
  }
}

