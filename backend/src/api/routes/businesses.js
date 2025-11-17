import express from 'express';
import { Business } from '../../../database/models/Business.js';
import { authenticateToken } from '../../utils/auth.js';
import { validateBusiness } from '../../utils/validators.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Listar negocios (solo para admins del sistema)
router.get('/', async (req, res) => {
  try {
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const businesses = await Business.list();
    res.json({ data: businesses });
  } catch (error) {
    console.error('Error listing businesses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Obtener negocio por ID
router.get('/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Verificar que el usuario pertenece a este negocio
    if (req.user.business_id !== business.id && req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ data: business });
  } catch (error) {
    console.error('Error getting business:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Crear negocio
router.post('/', async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { error, value } = validateBusiness(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const business = await Business.create(value);
    res.status(201).json({ data: business });
  } catch (error) {
    console.error('Error creating business:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Actualizar negocio
router.put('/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Verificar permisos
    if (req.user.business_id !== business.id && req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { error, value } = validateBusiness(req.body, true);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updated = await Business.update(req.params.id, value);
    res.json({ data: updated });
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Eliminar negocio (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    await Business.update(req.params.id, { is_active: false });
    res.json({ message: 'Business deactivated' });
  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

