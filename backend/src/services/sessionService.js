/**
 * Servicio para manejar sesiones de conversación
 * 
 * Permite que un usuario pueda interactuar con múltiples comercios
 * desde el mismo número de WhatsApp
 */

import db from '../../database/index.js';
import { v4 as uuidv4 } from 'uuid';

export class SessionService {
  /**
   * Obtiene o crea una sesión para un usuario y comercio
   */
  static async getOrCreateSession(userPhone, clientSlug) {
    // Normalizar número de teléfono (remover + y espacios)
    const normalizedPhone = userPhone.replace(/[+\s]/g, '');

    // Buscar sesión existente
    let session = await db('sessions')
      .where({ user_phone: normalizedPhone, client_slug: clientSlug })
      .first();

    if (session) {
      // Actualizar timestamp
      await db('sessions')
        .where({ id: session.id })
        .update({ updated_at: new Date().toISOString() });
      
      return session;
    }

    // Crear nueva sesión
    const newSession = {
      id: uuidv4(),
      user_phone: normalizedPhone,
      client_slug: clientSlug,
      state: 'inicio',
      data: JSON.stringify({}),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db('sessions').insert(newSession);

    return {
      ...newSession,
      data: JSON.parse(newSession.data),
    };
  }

  /**
   * Obtiene la sesión activa más reciente de un usuario
   */
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

  /**
   * Actualiza el estado de una sesión
   */
  static async updateSession(sessionId, updates) {
    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (updates.state) {
      updateData.state = updates.state;
    }

    if (updates.data) {
      updateData.data = JSON.stringify(updates.data);
    }

    await db('sessions')
      .where({ id: sessionId })
      .update(updateData);

    return this.getSessionById(sessionId);
  }

  /**
   * Obtiene una sesión por ID
   */
  static async getSessionById(sessionId) {
    const session = await db('sessions')
      .where({ id: sessionId })
      .first();

    if (session) {
      return {
        ...session,
        data: typeof session.data === 'string' ? JSON.parse(session.data) : session.data,
      };
    }

    return null;
  }

  /**
   * Finaliza una sesión
   */
  static async endSession(sessionId) {
    return this.updateSession(sessionId, { state: 'finalizado' });
  }

  /**
   * Limpia sesiones antiguas (más de 30 días sin actividad)
   */
  static async cleanOldSessions() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deleted = await db('sessions')
      .where('updated_at', '<', thirtyDaysAgo.toISOString())
      .where('state', 'finalizado')
      .delete();

    return deleted;
  }
}

