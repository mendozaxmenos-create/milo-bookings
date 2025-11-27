import express from 'express';
import { authenticateToken } from '../../utils/auth.js';
import { PaymentConfigService } from '../../services/paymentConfigService.js';
import { validatePaymentConfig } from '../../utils/validators.js';
import { PaymentService } from '../../services/paymentService.js';
import { Booking } from '../../../database/models/Booking.js';

const router = express.Router();

// Webhook (no auth)
router.post('/mercadopago/webhook', async (req, res) => {
  try {
    console.log('[Webhook] MercadoPago webhook received:', {
      query: req.query,
      body: req.body,
      headers: req.headers,
    });

    // MercadoPago puede enviar el ID del pago de varias formas:
    // 1. En query params: ?id=xxx
    // 2. En body.data.id (notificación v2)
    // 3. En body.id (notificación directa)
    const businessId = req.query.businessId;
    const paymentId = req.query.id || req.body?.data?.id || req.body?.id;

    if (!businessId) {
      console.error('[Webhook] Missing businessId');
      return res.status(400).json({ error: 'Missing businessId' });
    }

    if (!paymentId) {
      console.error('[Webhook] Missing paymentId');
      return res.status(400).json({ error: 'Missing paymentId' });
    }

    console.log('[Webhook] Processing payment:', { businessId, paymentId });

    // Obtener información del pago desde MercadoPago
    let paymentInfo;
    try {
      paymentInfo = await PaymentService.getPaymentInfo(businessId, paymentId);
    } catch (error) {
      console.error('[Webhook] Error fetching payment info from MercadoPago:', error);
      // Si no podemos obtener el pago, retornar 200 para que MercadoPago no reintente
      return res.status(200).json({ message: 'Payment info fetch failed, will retry later' });
    }

    // En v2, la respuesta puede estar en paymentInfo directamente o en paymentInfo.data
    const payment = paymentInfo.data || paymentInfo;
    
    if (!payment) {
      console.error('[Webhook] Payment not found in response');
      return res.status(404).json({ error: 'Payment not found' });
    }

    const bookingId = payment.metadata?.booking_id;

    if (!bookingId) {
      console.warn('[Webhook] Payment received without booking metadata:', {
        paymentId,
        metadata: payment.metadata,
      });
      return res.json({ message: 'Payment received without booking metadata' });
    }

    console.log('[Webhook] Updating booking:', {
      bookingId,
      paymentId,
      status: payment.status,
    });

    // Verificar que la reserva existe y pertenece al negocio correcto
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error('[Webhook] Booking not found:', bookingId);
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.business_id !== businessId) {
      console.error('[Webhook] Booking business mismatch:', {
        bookingBusinessId: booking.business_id,
        webhookBusinessId: businessId,
      });
      return res.status(403).json({ error: 'Business mismatch' });
    }

    const mpStatus = payment.status;
    const updatePayload = {
      payment_id: paymentId,
      payment_status: mpStatus === 'approved' ? 'paid' : mpStatus === 'refunded' ? 'refunded' : 'pending',
    };

    // Mapear estados de MercadoPago a estados de reserva
    if (mpStatus === 'approved') {
      updatePayload.status = 'confirmed';
    } else if (mpStatus === 'in_process' || mpStatus === 'pending') {
      updatePayload.status = 'pending_payment';
    } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
      updatePayload.status = 'pending_payment';
      // Mantener el estado actual si ya está confirmada (no retroceder)
      if (booking.status === 'confirmed') {
        updatePayload.status = 'confirmed';
      }
    }

    await Booking.update(bookingId, updatePayload);

    console.log('[Webhook] Booking updated successfully:', {
      bookingId,
      newStatus: updatePayload.status,
      newPaymentStatus: updatePayload.payment_status,
    });

    return res.json({ success: true, bookingId, status: updatePayload.status });
  } catch (error) {
    console.error('[Webhook] MercadoPago webhook error:', error);
    // Retornar 200 para que MercadoPago no reintente en caso de error del servidor
    // El error se registrará y se puede procesar manualmente si es necesario
    return res.status(200).json({ error: 'Webhook processing error', message: error.message });
  }
});

// Protected routes
router.use(authenticateToken);

router.get('/config', async (req, res) => {
  try {
    const credentials = await PaymentConfigService.getCredentials(req.user.business_id);
    if (!credentials) {
      return res.json({ data: null });
    }
    res.json({
      data: {
        publicKey: credentials.publicKey,
        source: credentials.source,
      },
    });
  } catch (error) {
    console.error('Error getting payment config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/config', async (req, res) => {
  try {
    const { error, value } = validatePaymentConfig(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    await PaymentConfigService.saveCredentials(req.user.business_id, value);

    res.json({
      message: 'MercadoPago configuration updated',
      data: {
        publicKey: value.publicKey,
      },
    });
  } catch (err) {
    console.error('Error saving payment config:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


