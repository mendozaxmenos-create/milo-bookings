/**
 * Servicio principal del bot multi-negocio
 * 
 * Maneja la lógica del bot y la máquina de estados
 */

import { SessionService } from './sessionService.js';
import { ClientService } from './clientService.js';
import { AvailabilityService } from './availabilityService.js';
import { Booking } from '../../database/models/Booking.js';
import { Service } from '../../database/models/Service.js';
import db from '../../database/index.js';

export class BotService {
  /**
   * Procesa un mensaje entrante
   */
  static async processMessage({ userPhone, messageText, clientSlug, session, client, messageId }) {
    const normalizedPhone = userPhone.replace(/[+\s]/g, '');
    const text = messageText.trim().toLowerCase();
    const state = session.state;

    console.log(`[BotService] Procesando mensaje - Usuario: ${normalizedPhone}, Comercio: ${clientSlug}, Estado: ${state}`);

    // Comandos rápidos
    if (text === 'menu' || text === 'inicio' || text === 'start') {
      await this.sendMessage(userPhone, this.getWelcomeMessage(client));
      await SessionService.updateSession(session.id, { state: 'inicio' });
      return;
    }

    // Máquina de estados
    switch (state) {
      case 'inicio':
        await this.handleInicio(userPhone, text, session, client);
        break;
      case 'eligiendo_servicio':
        await this.handleEligiendoServicio(userPhone, text, session, client);
        break;
      case 'eligiendo_fecha':
        await this.handleEligiendoFecha(userPhone, text, session, client);
        break;
      case 'eligiendo_horario':
        await this.handleEligiendoHorario(userPhone, text, session, client);
        break;
      case 'confirmando':
        await this.handleConfirmando(userPhone, text, session, client);
        break;
      default:
        await this.sendMessage(userPhone, '❌ Estado desconocido. Reiniciando...');
        await SessionService.updateSession(session.id, { state: 'inicio' });
        await this.sendMessage(userPhone, this.getWelcomeMessage(client));
    }
  }

  /**
   * Maneja el estado inicial
   */
  static async handleInicio(userPhone, text, session, client) {
    // Obtener servicios del comercio
    const businessId = client.business_id;
    if (!businessId) {
      await this.sendMessage(userPhone, '❌ Este comercio no está configurado correctamente.');
      return;
    }

    const services = await Service.findByBusiness(businessId);
    const activeServices = services.filter(s => s.is_active);

    if (activeServices.length === 0) {
      await this.sendMessage(userPhone, '❌ No hay servicios disponibles en este momento.');
      return;
    }

    // Mostrar menú de servicios
    let message = `📋 *Servicios disponibles:*\n\n`;
    activeServices.forEach((service, index) => {
      const price = service.price ? `$${this.formatPrice(service.price)}` : 'Consultar precio';
      message += `${index + 1}️⃣ ${service.name} - ${price}\n`;
    });
    message += `\nResponde con el *número* del servicio que querés reservar.`;

    await this.sendMessage(userPhone, message);
    await SessionService.updateSession(session.id, {
      state: 'eligiendo_servicio',
      data: JSON.stringify({ services: activeServices.map(s => ({ id: s.id, name: s.name })) }),
    });
  }

  /**
   * Maneja la selección de servicio
   */
  static async handleEligiendoServicio(userPhone, text, session, client) {
    const sessionData = typeof session.data === 'string' ? JSON.parse(session.data) : session.data;
    const services = sessionData.services || [];

    // Buscar servicio por número
    const serviceNumber = parseInt(text);
    if (isNaN(serviceNumber) || serviceNumber < 1 || serviceNumber > services.length) {
      await this.sendMessage(userPhone, '❌ Por favor, responde con el número del servicio (ej: 1, 2, 3).');
      return;
    }

    const selectedService = services[serviceNumber - 1];
    
    // Guardar servicio seleccionado
    sessionData.selectedService = selectedService;
    
    // Mostrar fechas disponibles
    await this.showAvailableDates(userPhone, session, client, selectedService);
  }

  /**
   * Muestra fechas disponibles
   */
  static async showAvailableDates(userPhone, session, client, selectedService) {
    const businessId = client.business_id;
    const service = await Service.findById(selectedService.id);
    
    if (!service) {
      await this.sendMessage(userPhone, '❌ Servicio no encontrado.');
      return;
    }

    // Obtener disponibilidad (próximos 7 días)
    const dates = await AvailabilityService.getAvailableDates(businessId, service.id, 7);
    
    if (dates.length === 0) {
      await this.sendMessage(userPhone, '❌ No hay fechas disponibles en los próximos días. Por favor, intenta más tarde.');
      await SessionService.updateSession(session.id, { state: 'inicio' });
      return;
    }

    let message = `📅 *Fechas disponibles para ${service.name}:*\n\n`;
    dates.forEach((date, index) => {
      const dateObj = new Date(date);
      const dayName = dateObj.toLocaleDateString('es-AR', { weekday: 'long' });
      const day = dateObj.getDate();
      const month = dateObj.toLocaleDateString('es-AR', { month: 'long' });
      message += `${index + 1}️⃣ ${dayName} ${day} de ${month}\n`;
    });
    message += `\nResponde con el *número* de la fecha que preferís.`;

    await this.sendMessage(userPhone, message);
    
    const sessionData = typeof session.data === 'string' ? JSON.parse(session.data) : session.data;
    sessionData.availableDates = dates;
    
    await SessionService.updateSession(session.id, {
      state: 'eligiendo_fecha',
      data: JSON.stringify(sessionData),
    });
  }

  /**
   * Maneja la selección de fecha
   */
  static async handleEligiendoFecha(userPhone, text, session, client) {
    const sessionData = typeof session.data === 'string' ? JSON.parse(session.data) : session.data;
    const dates = sessionData.availableDates || [];

    const dateNumber = parseInt(text);
    if (isNaN(dateNumber) || dateNumber < 1 || dateNumber > dates.length) {
      await this.sendMessage(userPhone, '❌ Por favor, responde con el número de la fecha (ej: 1, 2, 3).');
      return;
    }

    const selectedDate = dates[dateNumber - 1];
    sessionData.selectedDate = selectedDate;

    // Mostrar horarios disponibles
    await this.showAvailableTimes(userPhone, session, client, selectedDate);
  }

  /**
   * Muestra horarios disponibles
   */
  static async showAvailableTimes(userPhone, session, client, selectedDate) {
    const sessionData = typeof session.data === 'string' ? JSON.parse(session.data) : session.data;
    const service = await Service.findById(sessionData.selectedService.id);
    const businessId = client.business_id;

    const times = await AvailabilityService.getAvailableTimes(
      businessId,
      service.id,
      selectedDate
    );

    if (times.length === 0) {
      await this.sendMessage(userPhone, '❌ No hay horarios disponibles para esa fecha. Por favor, elige otra fecha.');
      await SessionService.updateSession(session.id, { state: 'eligiendo_fecha' });
      return;
    }

    let message = `🕐 *Horarios disponibles:*\n\n`;
    times.forEach((time, index) => {
      message += `${index + 1}️⃣ ${time}\n`;
    });
    message += `\nResponde con el *número* del horario que preferís.`;

    await this.sendMessage(userPhone, message);
    
    sessionData.availableTimes = times;
    
    await SessionService.updateSession(session.id, {
      state: 'eligiendo_horario',
      data: JSON.stringify(sessionData),
    });
  }

  /**
   * Maneja la selección de horario
   */
  static async handleEligiendoHorario(userPhone, text, session, client) {
    const sessionData = typeof session.data === 'string' ? JSON.parse(session.data) : session.data;
    const times = sessionData.availableTimes || [];

    const timeNumber = parseInt(text);
    if (isNaN(timeNumber) || timeNumber < 1 || timeNumber > times.length) {
      await this.sendMessage(userPhone, '❌ Por favor, responde con el número del horario (ej: 1, 2, 3).');
      return;
    }

    const selectedTime = times[timeNumber - 1];
    sessionData.selectedTime = selectedTime;

    // Mostrar resumen y pedir confirmación
    await this.showConfirmation(userPhone, session, client);
  }

  /**
   * Muestra resumen y pide confirmación
   */
  static async showConfirmation(userPhone, session, client) {
    const sessionData = typeof session.data === 'string' ? JSON.parse(session.data) : session.data;
    const service = await Service.findById(sessionData.selectedService.id);

    const dateObj = new Date(sessionData.selectedDate);
    const dateStr = dateObj.toLocaleDateString('es-AR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let message = `📋 *Resumen de tu reserva:*\n\n`;
    message += `🏢 *Comercio:* ${client.name}\n`;
    message += `📦 *Servicio:* ${service.name}\n`;
    message += `📅 *Fecha:* ${dateStr}\n`;
    message += `🕐 *Horario:* ${sessionData.selectedTime}\n`;
    if (service.price) {
      message += `💰 *Precio:* $${this.formatPrice(service.price)}\n`;
    }
    message += `\n¿Confirmás esta reserva? Responde *SI* para confirmar o *NO* para cancelar.`;

    await this.sendMessage(userPhone, message);
    await SessionService.updateSession(session.id, {
      state: 'confirmando',
      data: JSON.stringify(sessionData),
    });
  }

  /**
   * Maneja la confirmación
   */
  static async handleConfirmando(userPhone, text, session, client) {
    const normalizedPhone = userPhone.replace(/[+\s]/g, '');
    const sessionData = typeof session.data === 'string' ? JSON.parse(session.data) : session.data;

    if (text === 'si' || text === 'sí' || text === 'confirmar') {
      // Crear reserva
      try {
        const service = await Service.findById(sessionData.selectedService.id);
        const dateObj = new Date(sessionData.selectedDate);
        const [hours, minutes] = sessionData.selectedTime.split(':');

        const booking = await Booking.create({
          business_id: client.business_id,
          service_id: service.id,
          customer_phone: `+${normalizedPhone}`,
          booking_date: dateObj.toISOString().split('T')[0],
          booking_time: `${hours}:${minutes}:00`,
          status: 'confirmed',
          amount: service.price || 0,
        });

        await this.sendMessage(userPhone, `✅ ¡Reserva confirmada!\n\nTu número de reserva es: ${booking.id.substring(0, 8).toUpperCase()}\n\nTe esperamos el ${dateObj.toLocaleDateString('es-AR')} a las ${sessionData.selectedTime}.`);

        await SessionService.updateSession(session.id, {
          state: 'finalizado',
          data: JSON.stringify({ ...sessionData, bookingId: booking.id }),
        });
      } catch (error) {
        console.error('[BotService] Error creando reserva:', error);
        await this.sendMessage(userPhone, '❌ Ocurrió un error al confirmar la reserva. Por favor, intenta de nuevo.');
      }
    } else if (text === 'no' || text === 'cancelar') {
      await this.sendMessage(userPhone, '❌ Reserva cancelada. Si querés hacer una nueva reserva, envía *MENU*.');
      await SessionService.updateSession(session.id, { state: 'inicio' });
    } else {
      await this.sendMessage(userPhone, 'Por favor, responde *SI* para confirmar o *NO* para cancelar.');
    }
  }

  /**
   * Obtiene mensaje de bienvenida
   */
  static getWelcomeMessage(client) {
    const settings = client.settings || {};
    const welcomeMessage = settings.welcome_message || `¡Hola! 👋\n\nBienvenido a *${client.name}*.\n\n¿En qué puedo ayudarte hoy?`;
    return welcomeMessage;
  }

  /**
   * Formatea precio
   */
  static formatPrice(value) {
    const parsed = typeof value === 'number' ? value : parseFloat(value || '0');
    if (Number.isNaN(parsed)) return '0.00';
    return parsed.toFixed(2);
  }

  /**
   * Envía un mensaje usando Meta WhatsApp Business API
   */
  static async sendMessage(to, text) {
    // Usar Meta WhatsApp API si está configurado
    if (process.env.USE_META_WHATSAPP_API === 'true') {
      const { MetaWhatsAppService } = await import('./metaWhatsAppService.js');
      return await MetaWhatsAppService.sendMessage(to, text);
    }
    
    // Fallback: intentar usar bot de whatsapp-web.js si está disponible
    console.warn('[BotService] USE_META_WHATSAPP_API no está habilitado. Usando fallback.');
    throw new Error('WhatsApp messaging not configured. Configure Meta WhatsApp API or enable whatsapp-web.js bots.');
  }
}

