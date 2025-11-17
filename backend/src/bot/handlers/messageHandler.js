import { Business } from '../../database/models/Business.js';
import { BusinessSettings } from '../../database/models/BusinessSettings.js';
import { Service } from '../../database/models/Service.js';
import { Booking } from '../../database/models/Booking.js';

export class MessageHandler {
  constructor(bot, businessId) {
    this.bot = bot;
    this.businessId = businessId;
    this.business = null;
    this.settings = null;
    this.userState = new Map(); // Para manejar estados de conversación
  }

  async initialize() {
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
        case 'booking_date':
          await this.handleDateSelection(msg, body, userId);
          break;
        case 'booking_time':
          await this.handleTimeSelection(msg, body, userId);
          break;
        case 'booking_service':
          await this.handleServiceSelection(msg, body, userId);
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
    const welcomeMessage = this.settings?.welcome_message || 
      `¡Hola! Bienvenido a ${this.business.name}. ¿En qué puedo ayudarte?`;

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
      await msg.reply('Funcionalidad de disponibilidad próximamente disponible.');
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
      this.userState.set(userId, {
        ...userState,
        step: 'booking_time',
        bookingDate: bookingDate,
      });

      await msg.reply(
        `Fecha seleccionada: ${day}/${month}/${year}\n\n` +
        `Por favor escribe la hora deseada en formato HH:MM (24 horas)\n` +
        `Ejemplo: 14:30`
      );
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

      // Crear la reserva
      const customerPhone = `+${msg.from.split('@')[0]}`;
      
      const booking = await Booking.create({
        business_id: this.businessId,
        service_id: selectedService.id,
        customer_phone: customerPhone,
        booking_date: bookingDate,
        booking_time: bookingTime,
        amount: selectedService.price,
        status: 'pending',
        payment_status: 'pending',
      });

      const confirmationMessage = this.settings?.booking_confirmation_message || 
        'Tu reserva ha sido registrada.';

      await msg.reply(
        `✅ *Reserva Confirmada*\n\n` +
        `Servicio: ${selectedService.name}\n` +
        `Fecha: ${bookingDate}\n` +
        `Hora: ${bookingTime}\n` +
        `Monto: $${selectedService.price}\n\n` +
        `${confirmationMessage}\n\n` +
        `ID de reserva: ${booking.id}`
      );

      // Resetear estado
      this.userState.set(userId, { step: 'menu' });
    } catch (error) {
      console.error('Error handling time selection:', error);
      await msg.reply('Error al crear la reserva. Por favor intenta más tarde.');
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

      let message = '*Tus Reservas:*\n\n';
      bookings.slice(0, 10).forEach((booking, index) => {
        message += `${index + 1}. ${booking.service_name}\n`;
        message += `   📅 ${booking.booking_date} a las ${booking.booking_time}\n`;
        message += `   💰 $${booking.amount}\n`;
        message += `   Estado: ${booking.status}\n\n`;
      });

      await msg.reply(message);
    } catch (error) {
      console.error('Error showing user bookings:', error);
      await msg.reply('Error al obtener tus reservas. Por favor intenta más tarde.');
    }
  }
}

