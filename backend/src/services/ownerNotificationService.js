import { Booking } from '../../database/models/Booking.js';
import { BusinessSettings } from '../../database/models/BusinessSettings.js';
import { Business } from '../../database/models/Business.js';
import { activeBots } from '../index.js';

/**
 * Envía notificación al dueño cuando hay una nueva reserva
 */
export async function notifyOwnerNewBooking(booking) {
  try {
    // Obtener configuración del negocio
    const settings = await BusinessSettings.findByBusiness(booking.business_id);
    
    // Verificar si las notificaciones están habilitadas
    if (!settings || !settings.owner_notifications_enabled) {
      console.log(`[OwnerNotification] Notificaciones deshabilitadas para negocio ${booking.business_id}`);
      return;
    }

    // Obtener información del negocio
    const business = await Business.findById(booking.business_id);
    if (!business) {
      console.error(`[OwnerNotification] Negocio no encontrado: ${booking.business_id}`);
      return;
    }

    // Obtener bot activo
    const bot = activeBots.get(booking.business_id);
    if (!bot) {
      console.warn(`[OwnerNotification] Bot no disponible para negocio ${booking.business_id}`);
      return;
    }

    // Asegurar que booking tenga service_name (puede venir del join)
    const bookingWithService = await Booking.findById(booking.id);
    if (!bookingWithService) {
      console.error(`[OwnerNotification] No se pudo obtener booking con servicio: ${booking.id}`);
      return;
    }

    // Formatear mensaje de notificación
    let notificationMessage = settings.owner_notification_message || 
      `🔔 *Nueva Reserva*

Tienes una nueva reserva:

👤 *Cliente:* {nombre}
📞 *Teléfono:* {telefono}
📋 *Servicio:* {servicio}
📅 *Fecha:* {fecha}
🕐 *Hora:* {hora}
💰 *Monto:* ${bookingWithService.amount ? `$${Number(bookingWithService.amount).toFixed(2)}` : 'Sin pago'}
📊 *Estado:* {estado}

{detalles_pago}`;

    // Formatear fecha
    const formattedDate = new Date(bookingWithService.booking_date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Formatear estado
    const statusLabels = {
      'pending': 'Pendiente',
      'pending_payment': 'Pago Pendiente',
      'confirmed': 'Confirmada',
      'cancelled': 'Cancelada',
      'completed': 'Completada'
    };
    const statusLabel = statusLabels[bookingWithService.status] || bookingWithService.status;

    // Detalles de pago
    let paymentDetails = '';
    if (bookingWithService.payment_status === 'paid') {
      paymentDetails = '✅ *Pago:* Pagado';
    } else if (bookingWithService.payment_status === 'pending') {
      paymentDetails = '⏳ *Pago:* Pendiente';
    } else {
      paymentDetails = '💳 *Pago:* No requerido';
    }

    // Si hay obra social
    if (bookingWithService.insurance_provider_name) {
      paymentDetails += `\n🏥 *Obra Social:* ${bookingWithService.insurance_provider_name}`;
      if (bookingWithService.copay_amount) {
        paymentDetails += `\n💰 *Coseguro:* $${Number(bookingWithService.copay_amount).toFixed(2)}`;
      }
    }

    // Reemplazar variables en el mensaje
    notificationMessage = notificationMessage
      .replace(/{nombre}/g, bookingWithService.customer_name || 'Sin nombre')
      .replace(/{telefono}/g, bookingWithService.customer_phone)
      .replace(/{servicio}/g, bookingWithService.service_name || 'Servicio')
      .replace(/{fecha}/g, formattedDate)
      .replace(/{hora}/g, bookingWithService.booking_time.substring(0, 5))
      .replace(/{estado}/g, statusLabel)
      .replace(/{detalles_pago}/g, paymentDetails);

    // Formatear número de teléfono del dueño para WhatsApp
    let ownerPhone = business.owner_phone.replace(/[\s\+]/g, '');
    if (!ownerPhone.includes('@')) {
      ownerPhone = `${ownerPhone}@c.us`;
    }

    // Enviar mensaje al dueño
    await bot.sendMessage(ownerPhone, notificationMessage);

    console.log(`[OwnerNotification] ✅ Notificación enviada al dueño ${business.owner_phone} para reserva ${bookingWithService.id}`);
  } catch (error) {
    console.error(`[OwnerNotification] Error enviando notificación al dueño para reserva ${booking.id}:`, error);
    // No lanzar error para no interrumpir el flujo de creación de reserva
  }
}

