import db from '../index.js';
import { v4 as uuidv4 } from 'uuid';

export class Session {
  static async create(data) {
    const id = data.id || uuidv4();
    const normalizedPhone = data.user_phone.replace(/[+\s]/g, '');

    const session = {
      id,
      user_phone: normalizedPhone,
      client_slug: data.client_slug,
      state: data.state || 'inicio',
      data: JSON.stringify(data.data || {}),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db('sessions').insert(session);
    return this.findById(id);
  }

  static async findById(id) {
    const session = await db('sessions').where({ id }).first();
    if (session) {
      return {
        ...session,
        data: typeof session.data === 'string' ? JSON.parse(session.data) : session.data,
      };
    }
    return null;
  }

  static async findByUserAndClient(userPhone, clientSlug) {
    const normalizedPhone = userPhone.replace(/[+\s]/g, '');
    const session = await db('sessions')
      .where({ user_phone: normalizedPhone, client_slug: clientSlug })
      .first();

    if (session) {
      return {
        ...session,
        data: typeof session.data === 'string' ? JSON.parse(session.data) : session.data,
      };
    }
    return null;
  }

  static async getActiveSession(userPhone) {
    const normalizedPhone = userPhone.replace(/[+\s]/g, '');
    const session = await db('sessions')
      .where({ user_phone: normalizedPhone })
      .where('state', '!=', 'finalizado')
      .orderBy('updated_at', 'desc')
      .first();

    if (session) {
      return {
        ...session,
        data: typeof session.data === 'string' ? JSON.parse(session.data) : session.data,
      };
    }
    return null;
  }

  static async update(id, data) {
    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (data.state) updateData.state = data.state;
    if (data.data) updateData.data = JSON.stringify(data.data);

    await db('sessions').where({ id }).update(updateData);
    return this.findById(id);
  }

  static async delete(id) {
    return db('sessions').where({ id }).delete();
  }
}

