import { Business } from '../../../database/models/Business.js';
import { BusinessSettings } from '../../../database/models/BusinessSettings.js';
import { Service } from '../../../database/models/Service.js';
import { Booking } from '../../../database/models/Booking.js';
import { AvailabilityService } from '../../services/availabilityService.js';

export class MessageHandler {
  constructor(bot, businessId) {
    this.bot = bot;
    this.businessId = businessId;
    this.business = null;
    this.settings = null;
    this.userState = new Map(); // Para manejar estados de conversación
  }

  async initialize() {
    await this.reloadSettings();
  }

  // Recargar configuración desde la base de datos
  async reloadSettings() {
    this.business = await Business.findById(this.businessId);
    this.settings = await BusinessSettings.findByBusiness(this.businessId);
  }

  async handleMessage(msg) {
    try {
      const from = msg.from;
      const body = msg.body.toLowerCase().trim();
      const userId = from.split('@')[0];

      // Obtener estado del usuario
      const userState = this.userState.get(userId) || { step: 'menu' };

      // Comandos rápidos
      if (body === 'menu' || body === 'inicio' || body === 'start') {
        await this.showMainMenu(msg);
        this.userState.set(userId, { step: 'menu' });
        return;
      }

      // Navegación según estado
      switch (userState.step) {
        case 'menu':
          await this.handleMenuSelection(msg, body, userId);
          break;
        case 'viewing_services':
          await this.handleMenuSelection(msg, body, userId);
          break;
        case 'booking_service':
          await this.handleServiceSelection(msg, body, userId);
          break;
        case 'booking_date':
          await this.handleDateSelection(msg, body, userId);
          break;
        case 'booking_time':
          await this.handleTimeSelection(msg, body, userId);
          break;
        case 'booking_name':
          await this.handleNameInput(msg, body, userId);
          break;
        case 'booking_confirm':
          await this.handleBookingConfirmation(msg, body, userId);
          break;
        default:
          await this.showMainMenu(msg);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      await msg.reply('Lo siento, ocurrió un error. Por favor intenta de nuevo.');
    }
  }

  async showMainMenu(msg) {
    // Recargar settings para obtener los más recientes
    await this.reloadSettings();
    
    const welcomeMessage = this.settings?.welcome_message || 
      `¡Hola! Bienvenido a ${this.business?.name || 'nuestro negocio'}. ¿En qué puedo ayudarte?`;

    const menu = `
${welcomeMessage}

*Menú Principal:*
1️⃣ *Servicios* - Ver servicios disponibles
2️⃣ *Disponibilidad* - Consultar horarios disponibles
3️⃣ *Reservar* - Hacer una reserva
4️⃣ *Mis Reservas* - Ver mis reservas

Escribe el número o el nombre de la opción que deseas.
    `.trim();

    await msg.reply(menu);
  }

  async handleMenuSelection(msg, body, userId) {
    if (body.includes('servicio') || body === '1' || body === '1️⃣') {
      await this.showServices(msg);
      this.userState.set(userId, { step: 'viewing_services' });
    } else if (body.includes('disponibilidad') || body === '2' || body === '2️⃣') {
      await this.showAvailability(msg);
      this.userState.set(userId, { step: 'menu' });
    } else if (body.includes('reservar') || body === '3' || body === '3️⃣') {
      await this.startBookingFlow(msg, userId);
    } else if (body.includes('reserva') || body === '4' || body === '4️⃣') {
      await this.showUserBookings(msg);
      this.userState.set(userId, { step: 'menu' });
    } else {
      await this.showMainMenu(msg);
    }
  }

  async showServices(msg) {
    try {
      const services = await Service.findByBusiness(this.businessId);
      
      if (services.length === 0) {
        await msg.reply('No hay servicios disponibles en este momento.');
        return;
      }

      let message = '*Servicios Disponibles:*\n\n';
      services.forEach((service, index) => {
        message += `${index + 1}. *${service.name}*\n`;
        if (service.description) {
          message += `   ${service.description}\n`;
        }
        message += `   ⏱️ Duración: ${service.duration_minutes} min\n`;
        message += `   💰 Precio: $${service.price}\n\n`;
      });

      message += 'Escribe "menu" para volver al menú principal.';
      await msg.reply(message);
    } catch (error) {
      console.error('Error showing services:', error);
      await msg.reply('Error al obtener servicios. Por favor intenta más tarde.');
    }
  }

  async startBookingFlow(msg, userId) {
    try {
      const services = await Service.findByBusiness(this.businessId);
      
      if (services.length === 0) {
        await msg.reply('No hay servicios disponibles para reservar.');
        this.userState.set(userId, { step: 'menu' });
        return;
      }

      let message = '*Selecciona un servicio:*\n\n';
      services.forEach((service, index) => {
        message += `${index + 1}. ${service.name} - $${service.price}\n`;
      });

      message += '\nEscribe el número del servicio que deseas.';
      await msg.reply(message);
      this.userState.set(userId, { step: 'booking_service' });
    } catch (error) {
      console.error('Error starting booking flow:', error);
      await msg.reply('Error al iniciar la reserva. Por favor intenta más tarde.');
    }
  }

  async handleServiceSelection(msg, body, userId) {
    try {
      const serviceIndex = parseInt(body) - 1;
      const services = await Service.findByBusiness(this.businessId);
      
      if (isNaN(serviceIndex) || serviceIndex < 0 || serviceIndex >= services.length) {
        await msg.reply('Por favor selecciona un número válido.');
        return;
      }

      const selectedService = services[serviceIndex];
      this.userState.set(userId, {
        step: 'booking_date',
        selectedService: selectedService,
      });

      await msg.reply(
        `Servicio seleccionado: *${selectedService.name}*\n\n` +
        `Por favor escribe la fecha deseada en formato DD/MM/YYYY\n` +
        `Ejemplo: 25/12/2024`
      );
    } catch (error) {
      console.error('Error handling service selection:', error);
      await msg.reply('Error al procesar la selección. Por favor intenta de nuevo.');
    }
  }

  async handleDateSelection(msg, body, userId) {
    try {
      // Parsear fecha (formato DD/MM/YYYY)
      const dateMatch = body.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (!dateMatch) {
        await msg.reply('Formato de fecha inválido. Por favor usa DD/MM/YYYY (ej: 25/12/2024)');
        return;
      }

      const [, day, month, year] = dateMatch;
      const bookingDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      const dateObj = new Date(bookingDate);
      
      if (isNaN(dateObj.getTime()) || dateObj < new Date()) {
        await msg.reply('Por favor selecciona una fecha válida en el futuro.');
        return;
      }

      const userState = this.userState.get(userId);
      const { selectedService } = userState;

      // Obtener horarios disponibles para esta fecha
      const availableTimes = await AvailabilityService.getAvailableTimes(
        this.businessId,
        bookingDate,
        selectedService.duration_minutes
      );

      if (availableTimes.length === 0) {
        await msg.reply(
          `Lo siento, no hay horarios disponibles para el ${day}/${month}/${year}.\n\n` +
          `Por favor selecciona otra fecha en formato DD/MM/YYYY.`
        );
        return;
      }

      this.userState.set(userId, {
        ...userState,
        step: 'booking_time',
        bookingDate: bookingDate,
      });

      // Formatear horarios disponibles
      let timeMessage = `📅 *Fecha seleccionada: ${day}/${month}/${year}*\n\n`;
      timeMessage += `*Horarios disponibles:*\n`;
      
      // Mostrar horarios en grupos de 4
      const timeGroups = [];
      for (let i = 0; i < availableTimes.length; i += 4) {
        timeGroups.push(availableTimes.slice(i, i + 4));
      }
      
      timeGroups.forEach(group => {
        timeMessage += `   ${group.join(' | ')}\n`;
      });
      
      timeMessage += `\nEscribe la hora deseada en formato HH:MM (ej: 14:30)`;

      await msg.reply(timeMessage);
    } catch (error) {
      console.error('Error handling date selection:', error);
      await msg.reply('Error al procesar la fecha. Por favor intenta de nuevo.');
    }
  }

  async handleTimeSelection(msg, body, userId) {
    try {
      const timeMatch = body.match(/(\d{1,2}):(\d{2})/);
      if (!timeMatch) {
        await msg.reply('Formato de hora inválido. Por favor usa HH:MM (ej: 14:30)');
        return;
      }

      const [, hours, minutes] = timeMatch;
      const bookingTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;

      const userState = this.userState.get(userId);
      const { selectedService, bookingDate } = userState;

      // Validar que el horario esté disponible
      const isAvailable = await AvailabilityService.isTimeAvailable(
        this.businessId,
        bookingDate,
        bookingTime,
        selectedService.duration_minutes
      );

      if (!isAvailable) {
        await msg.reply(
          `❌ El horario ${bookingTime} no está disponible para esa fecha.\n\n` +
          `Por favor selecciona otro horario o escribe "menu" para volver al inicio.`
        );
        return;
      }

      // Guardar el horario y solicitar nombre
      this.userState.set(userId, {
        ...userState,
        step: 'booking_name',
        bookingTime: bookingTime,
      });

      await msg.reply(
        `✅ Horario ${bookingTime} disponible\n\n` +
        `Por favor escribe tu nombre completo para la reserva:`
      );
    } catch (error) {
      console.error('Error handling time selection:', error);
      await msg.reply('Error al procesar la hora. Por favor intenta de nuevo.');
    }
  }

  async handleNameInput(msg, body, userId) {
    try {
      const customerName = body.trim();
      
      if (customerName.length < 2) {
        await msg.reply('Por favor ingresa un nombre válido (mínimo 2 caracteres).');
        return;
      }

      const userState = this.userState.get(userId);
      this.userState.set(userId, {
        ...userState,
        step: 'booking_confirm',
        customerName: customerName,
      });

      const { selectedService, bookingDate, bookingTime } = userState;
      const dateObj = new Date(bookingDate);
      const formattedDate = dateObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Mostrar resumen y solicitar confirmación
      await msg.reply(
        `📋 *Resumen de tu Reserva:*\n\n` +
        `👤 Nombre: ${customerName}\n` +
        `💼 Servicio: ${selectedService.name}\n` +
        `📅 Fecha: ${formattedDate}\n` +
        `🕐 Hora: ${bookingTime}\n` +
        `⏱️ Duración: ${selectedService.duration_minutes} minutos\n` +
        `💰 Precio: $${selectedService.price.toFixed(2)}\n\n` +
        `¿Confirmas esta reserva? Responde:\n` +
        `✅ *Sí* o *Confirmar* para confirmar\n` +
        `❌ *No* o *Cancelar* para cancelar`
      );
    } catch (error) {
      console.error('Error handling name input:', error);
      await msg.reply('Error al procesar el nombre. Por favor intenta de nuevo.');
    }
  }

  async handleBookingConfirmation(msg, body, userId) {
    try {
      const confirmation = body.toLowerCase().trim();
      const isConfirmed = confirmation === 'sí' || 
                         confirmation === 'si' || 
                         confirmation === 'confirmar' || 
                         confirmation === 'confirmo' ||
                         confirmation === 'yes';

      if (!isConfirmed) {
        await msg.reply('Reserva cancelada. Escribe "menu" para volver al inicio.');
        this.userState.set(userId, { step: 'menu' });
        return;
      }

      const userState = this.userState.get(userId);
      const { selectedService, bookingDate, bookingTime, customerName } = userState;

      // Validar nuevamente disponibilidad antes de crear
      const isAvailable = await AvailabilityService.isTimeAvailable(
        this.businessId,
        bookingDate,
        bookingTime,
        selectedService.duration_minutes
      );

      if (!isAvailable) {
        await msg.reply(
          `❌ Lo siento, el horario ${bookingTime} ya no está disponible.\n\n` +
          `Por favor inicia una nueva reserva escribiendo "reservar" o "menu".`
        );
        this.userState.set(userId, { step: 'menu' });
        return;
      }

      // Crear la reserva
      const customerPhone = `+${msg.from.split('@')[0]}`;
      
      const booking = await Booking.create({
        business_id: this.businessId,
        service_id: selectedService.id,
        customer_phone: customerPhone,
        customer_name: customerName,
        booking_date: bookingDate,
        booking_time: bookingTime,
        amount: selectedService.price,
        status: 'pending',
        payment_status: 'pending',
      });

      const dateObj = new Date(bookingDate);
      const formattedDate = dateObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Recargar settings para obtener mensaje más reciente
      await this.reloadSettings();
      
      const confirmationMessage = this.settings?.booking_confirmation_message || 
        'Tu reserva ha sido registrada exitosamente.';

      await msg.reply(
        `✅ *¡Reserva Confirmada!*\n\n` +
        `📋 *Detalles:*\n` +
        `👤 Nombre: ${customerName}\n` +
        `💼 Servicio: ${selectedService.name}\n` +
        `📅 Fecha: ${formattedDate}\n` +
        `🕐 Hora: ${bookingTime}\n` +
        `💰 Monto: $${selectedService.price.toFixed(2)}\n\n` +
        `${confirmationMessage}\n\n` +
        `🆔 ID de reserva: ${booking.id}\n\n` +
        `Escribe "menu" para ver más opciones.`
      );

      // Resetear estado
      this.userState.set(userId, { step: 'menu' });
    } catch (error) {
      console.error('Error handling booking confirmation:', error);
      await msg.reply('Error al crear la reserva. Por favor intenta más tarde.');
      this.userState.set(userId, { step: 'menu' });
    }
  }

  async showAvailability(msg) {
    try {
      await msg.reply('Consultando disponibilidad... ⏳');
      
      const availability = await AvailabilityService.getAvailabilityForNextDays(
        this.businessId,
        7 // Próximos 7 días
      );

      if (Object.keys(availability).length === 0) {
        await msg.reply('No hay horarios disponibles en los próximos 7 días.');
        return;
      }

      const message = AvailabilityService.formatAvailabilityMessage(availability, 7);
      await msg.reply(message);
    } catch (error) {
      console.error('Error showing availability:', error);
      await msg.reply('Error al consultar disponibilidad. Por favor intenta más tarde.');
    }
  }

  async showUserBookings(msg) {
    try {
      const customerPhone = `+${msg.from.split('@')[0]}`;
      const bookings = await Booking.findByCustomer(customerPhone);

      if (bookings.length === 0) {
        await msg.reply('No tienes reservas registradas.');
        return;
      }

      let message = '*📋 Tus Reservas:*\n\n';
      bookings.slice(0, 10).forEach((booking, index) => {
        const dateObj = new Date(booking.booking_date);
        const formattedDate = dateObj.toLocaleDateString('es-ES', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        const statusEmoji = {
          'pending': '⏳',
          'confirmed': '✅',
          'cancelled': '❌',
          'completed': '✔️'
        };

        message += `${index + 1}. ${statusEmoji[booking.status] || '📌'} *${booking.service_name}*\n`;
        message += `   📅 ${formattedDate} a las ${booking.booking_time}\n`;
        message += `   💰 $${booking.amount.toFixed(2)}\n`;
        message += `   Estado: ${booking.status === 'pending' ? 'Pendiente' : 
                              booking.status === 'confirmed' ? 'Confirmada' :
                              booking.status === 'cancelled' ? 'Cancelada' :
                              booking.status === 'completed' ? 'Completada' : booking.status}\n\n`;
      });

      message += 'Escribe "menu" para volver al menú principal.';
      await msg.reply(message);
    } catch (error) {
      console.error('Error showing user bookings:', error);
      await msg.reply('Error al obtener tus reservas. Por favor intenta más tarde.');
    }
  }
}

