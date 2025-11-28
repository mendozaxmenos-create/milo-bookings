import express from 'express';
import { Booking } from '../../../database/models/Booking.js';
import { authenticateToken } from '../../utils/auth.js';
import { validateBooking } from '../../utils/validators.js';
import { apiLogger } from '../../utils/logger.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Listar reservas del negocio
router.get('/', async (req, res) => {
  try {
    apiLogger.debug('GET /bookings', {
      userId: req.user.user_id,
      businessId: req.user.business_id,
      role: req.user.role,
    });
    
    const filters = {
      status: req.query.status,
      date: req.query.date,
      customer_phone: req.query.customer_phone,
      search: req.query.search, // Búsqueda general
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };

    const result = await Booking.findByBusiness(req.user.business_id, filters);
    
    // Si el resultado tiene paginación (estructura nueva)
    if (result && result.pagination) {
      apiLogger.info('Bookings retrieved', {
        businessId: req.user.business_id,
        count: result.data?.length || 0,
        total: result.pagination.total,
        page: result.pagination.page,
        totalPages: result.pagination.totalPages,
      });
      
      return res.json(result);
    }
    
    // Compatibilidad con formato anterior (sin paginación)
    apiLogger.info('Bookings retrieved (legacy format)', {
      businessId: req.user.business_id,
      count: result?.length || 0,
    });
    
    res.json({ data: result });
  } catch (error) {
    apiLogger.error('Error listing bookings', {
      businessId: req.user.business_id,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Obtener reserva por ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verificar que la reserva pertenece al negocio del usuario
    if (booking.business_id !== req.user.business_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ data: booking });
  } catch (error) {
    console.error('Error getting booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Crear reserva
router.post('/', async (req, res) => {
  try {
    const { error, value } = validateBooking(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const booking = await Booking.create({
      ...value,
      business_id: req.user.business_id,
    });

    // Enviar notificación al dueño (en segundo plano, no bloquea la respuesta)
    try {
      const { notifyOwnerNewBooking } = await import('../../services/ownerNotificationService.js');
      notifyOwnerNewBooking(booking).catch(err => {
        console.error('[Bookings API] Error enviando notificación al dueño:', err);
      });
    } catch (error) {
      console.error('[Bookings API] Error importando servicio de notificaciones:', error);
    }

    res.status(201).json({ data: booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Actualizar reserva
router.put('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verificar que la reserva pertenece al negocio del usuario
    if (booking.business_id !== req.user.business_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { error, value } = validateBooking(req.body, true);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updated = await Booking.update(req.params.id, value);
    res.json({ data: updated });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Eliminar reserva
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verificar que la reserva pertenece al negocio del usuario
    if (booking.business_id !== req.user.business_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Booking.delete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cambiar estado de reserva
router.patch('/:id/status', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verificar que la reserva pertenece al negocio del usuario
    if (booking.business_id !== req.user.business_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { status } = req.body;
    if (!['pending', 'pending_payment', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updated = await Booking.update(req.params.id, { status });
    res.json({ data: updated });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

