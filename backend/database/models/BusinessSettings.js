import db from '../index.js';

export class BusinessSettings {
  static async createOrUpdate(businessId, data) {
    const existing = await this.findByBusiness(businessId);
    
    const settings = {
      business_id: businessId,
      welcome_message: data.welcome_message,
      booking_confirmation_message: data.booking_confirmation_message,
      payment_instructions_message: data.payment_instructions_message,
      reminder_message: data.reminder_message,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      await db('business_settings')
        .where({ business_id: businessId })
        .update(settings);
    } else {
      settings.created_at = new Date().toISOString();
      await db('business_settings').insert(settings);
    }

    return this.findByBusiness(businessId);
  }

  static async findByBusiness(businessId) {
    return db('business_settings')
      .where({ business_id: businessId })
      .first();
  }

  static async getWelcomeMessage(businessId) {
    const settings = await this.findByBusiness(businessId);
    return settings?.welcome_message || '¡Hola! Bienvenido. ¿En qué puedo ayudarte?';
  }

  static async getBookingConfirmationMessage(businessId) {
    const settings = await this.findByBusiness(businessId);
    return settings?.booking_confirmation_message || 'Tu reserva ha sido confirmada.';
  }
}

