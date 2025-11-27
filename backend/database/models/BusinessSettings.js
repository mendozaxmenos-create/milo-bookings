import db from '../index.js';

export class BusinessSettings {
  static async createOrUpdate(businessId, data) {
    const existing = await this.findByBusiness(businessId);
    
    const defaults = existing || {};
    const settings = {
      business_id: businessId,
      welcome_message: data.welcome_message,
      booking_confirmation_message: data.booking_confirmation_message,
      payment_instructions_message: data.payment_instructions_message,
      reminder_message: data.reminder_message,
      insurance_enabled: data.insurance_enabled !== undefined ? data.insurance_enabled : (defaults.insurance_enabled ?? false),
      reminders_enabled: data.reminders_enabled !== undefined ? data.reminders_enabled : (defaults.reminders_enabled ?? false),
      reminder_hours_before: data.reminder_hours_before !== undefined ? data.reminder_hours_before : (defaults.reminder_hours_before ?? 24),
      owner_notifications_enabled: data.owner_notifications_enabled !== undefined ? data.owner_notifications_enabled : (defaults.owner_notifications_enabled ?? true),
      owner_notification_message: data.owner_notification_message !== undefined ? data.owner_notification_message : (defaults.owner_notification_message || null),
      notification_phones: data.notification_phones !== undefined
        ? (typeof data.notification_phones === 'string' ? data.notification_phones : JSON.stringify(data.notification_phones))
        : (defaults.notification_phones || null),
      default_notification_phone: data.default_notification_phone !== undefined ? data.default_notification_phone : (defaults.default_notification_phone || null),
      default_service_name: data.default_service_name !== undefined
        ? data.default_service_name
        : (defaults.default_service_name || 'Servicio Básico'),
      default_service_price: data.default_service_price !== undefined
        ? data.default_service_price
        : (defaults.default_service_price !== undefined ? defaults.default_service_price : 0),
      default_service_description: data.default_service_description !== undefined
        ? data.default_service_description
        : defaults.default_service_description || null,
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

