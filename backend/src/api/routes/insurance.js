import express from 'express';
import { InsuranceProvider } from '../../../database/models/InsuranceProvider.js';
import { authenticateToken } from '../../utils/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Listar obras sociales del negocio
router.get('/', async (req, res) => {
  try {
    const includeInactive = req.query.include_inactive === 'true';
    const providers = await InsuranceProvider.findByBusiness(req.user.business_id, includeInactive);
    res.json({ data: providers });
  } catch (error) {
    console.error('Error listing insurance providers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Obtener obra social por ID
router.get('/:id', async (req, res) => {
  try {
    const provider = await InsuranceProvider.findById(req.params.id);
    
    if (!provider) {
      return res.status(404).json({ error: 'Insurance provider not found' });
    }

    // Verificar que pertenece al negocio del usuario
    if (provider.business_id !== req.user.business_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ data: provider });
  } catch (error) {
    console.error('Error getting insurance provider:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Crear obra social
router.post('/', async (req, res) => {
  try {
    const { name, copay_amount, display_order, is_active } = req.body;

    if (!name || copay_amount === undefined) {
      return res.status(400).json({ error: 'name and copay_amount are required' });
    }

    const provider = await InsuranceProvider.create({
      business_id: req.user.business_id,
      name,
      copay_amount: parseFloat(copay_amount) || 0,
      display_order: display_order || 0,
      is_active: is_active !== undefined ? is_active : true,
    });

    res.status(201).json({ data: provider });
  } catch (error) {
    console.error('Error creating insurance provider:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Actualizar obra social
router.put('/:id', async (req, res) => {
  try {
    const provider = await InsuranceProvider.findById(req.params.id);
    
    if (!provider) {
      return res.status(404).json({ error: 'Insurance provider not found' });
    }

    // Verificar que pertenece al negocio del usuario
    if (provider.business_id !== req.user.business_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, copay_amount, display_order, is_active } = req.body;
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (copay_amount !== undefined) updateData.copay_amount = parseFloat(copay_amount) || 0;
    if (display_order !== undefined) updateData.display_order = display_order;
    if (is_active !== undefined) updateData.is_active = is_active;

    const updated = await InsuranceProvider.update(req.params.id, updateData);
    res.json({ data: updated });
  } catch (error) {
    console.error('Error updating insurance provider:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Eliminar obra social
router.delete('/:id', async (req, res) => {
  try {
    const provider = await InsuranceProvider.findById(req.params.id);
    
    if (!provider) {
      return res.status(404).json({ error: 'Insurance provider not found' });
    }

    // Verificar que pertenece al negocio del usuario
    if (provider.business_id !== req.user.business_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await InsuranceProvider.delete(req.params.id);
    res.json({ message: 'Insurance provider deleted successfully' });
  } catch (error) {
    console.error('Error deleting insurance provider:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Activar/Desactivar obra social
router.patch('/:id/toggle', async (req, res) => {
  try {
    const provider = await InsuranceProvider.findById(req.params.id);
    
    if (!provider) {
      return res.status(404).json({ error: 'Insurance provider not found' });
    }

    // Verificar que pertenece al negocio del usuario
    if (provider.business_id !== req.user.business_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await InsuranceProvider.toggleActive(req.params.id);
    res.json({ data: updated });
  } catch (error) {
    console.error('Error toggling insurance provider:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

