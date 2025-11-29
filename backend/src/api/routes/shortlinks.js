import express from 'express';
import { ClientService } from '../../services/clientService.js';
import { ShortlinkAnalyticsService } from '../../services/shortlinkAnalyticsService.js';
import { authenticateToken } from '../../utils/auth.js';
import { Business } from '../../../database/models/Business.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * GET /api/shortlinks
 * Listar shortlinks
 * - Super admin: ve todos los shortlinks
 * - Business owner: ve solo los shortlinks de su negocio
 */
router.get('/', async (req, res) => {
  try {
    const isSuperAdmin = req.user.is_system_user && req.user.role === 'super_admin';
    
    let clients;
    if (isSuperAdmin) {
      // Super admin ve todos los shortlinks
      clients = await ClientService.getAllActive();
    } else {
      // Business owner ve solo los de su negocio
      clients = await ClientService.getAllActive();
      clients = clients.filter(client => client.business_id === req.user.business_id);
    }

    // Obtener usage_count para cada shortlink
    const shortlinks = await Promise.all(
      clients.map(async (client) => {
        const usageCount = await ShortlinkAnalyticsService.getUsageCount(client.id);
        return {
          slug: client.slug,
          name: client.name,
          url: `${process.env.SHORTLINK_BASE_URL || 'https://go.soymilo.com'}/${client.slug}`,
          business_id: client.business_id,
          created_at: client.created_at,
          updated_at: client.updated_at,
          usage_count: usageCount,
        };
      })
    );

    res.json({ shortlinks });
  } catch (error) {
    console.error('[Shortlinks API] Error listing shortlinks:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * POST /api/shortlinks
 * Crear un nuevo shortlink
 * - Super admin: puede crear para cualquier negocio
 * - Business owner: solo puede crear para su negocio
 */
router.post('/', async (req, res) => {
  try {
    const { name, slug, businessId } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Missing required fields: name, slug' });
    }

    // Validar formato del slug
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({ 
        error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens' 
      });
    }

    const isSuperAdmin = req.user.is_system_user && req.user.role === 'super_admin';
    
    // Determinar business_id
    let finalBusinessId = null;
    if (businessId) {
      // Si se proporciona businessId, verificar permisos
      if (!isSuperAdmin && businessId !== req.user.business_id) {
        return res.status(403).json({ error: 'Forbidden: Cannot create shortlink for other business' });
      }
      finalBusinessId = businessId;
    } else if (!isSuperAdmin) {
      // Si no es super admin y no se proporciona businessId, usar el del usuario
      finalBusinessId = req.user.business_id;
    } else {
      // Si es super admin y no se proporciona businessId, crear un nuevo business automáticamente
      console.log(`[Shortlinks] Creando business automáticamente para shortlink: ${name}`);
      try {
        const newBusiness = await Business.create({
          name: name,
          phone: null, // Se puede actualizar después
          email: null,
          whatsapp_number: null, // Se puede actualizar después
          owner_phone: null,
          is_active: true,
          plan_type: 'basic', // Plan básico por defecto
          is_trial: false,
        });
        finalBusinessId = newBusiness.id;
        console.log(`[Shortlinks] ✅ Business creado automáticamente: ${newBusiness.id} para ${name}`);
      } catch (error) {
        console.error('[Shortlinks] ❌ Error creando business automáticamente:', error);
        return res.status(500).json({ 
          error: 'Error creating business automatically', 
          message: error.message 
        });
      }
    }

    // Verificar si el slug ya existe
    const existingClient = await ClientService.getBySlug(slug);
    if (existingClient) {
      return res.status(409).json({ error: 'Slug already exists' });
    }

    // Crear el cliente/shortlink
    const client = await ClientService.create({
      name,
      slug: slug.toLowerCase(),
      business_id: finalBusinessId,
      settings: {},
    });

    // Obtener usage_count (será 0 para un shortlink nuevo)
    const usageCount = await ShortlinkAnalyticsService.getUsageCount(client.id);

    res.status(201).json({
      slug: client.slug,
      name: client.name,
      url: `${process.env.SHORTLINK_BASE_URL || 'https://go.soymilo.com'}/${client.slug}`,
      business_id: client.business_id,
      created_at: client.created_at,
      updated_at: client.updated_at,
      usage_count: usageCount,
    });
  } catch (error) {
    console.error('[Shortlinks API] Error creating shortlink:', error);
    if (error.message && error.message.includes('unique')) {
      return res.status(409).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * PUT /api/shortlinks/:slug
 * Actualizar un shortlink
 * - Super admin: puede actualizar cualquier shortlink
 * - Business owner: solo puede actualizar los de su negocio
 */
router.put('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, businessId } = req.body;

    const client = await ClientService.getBySlug(slug);
    if (!client) {
      return res.status(404).json({ error: 'Shortlink not found' });
    }

    const isSuperAdmin = req.user.is_system_user && req.user.role === 'super_admin';
    
    // Verificar permisos
    if (!isSuperAdmin && client.business_id !== req.user.business_id) {
      return res.status(403).json({ error: 'Forbidden: Cannot update shortlink from other business' });
    }

    // Preparar datos de actualización
    const updateData = {};
    if (name) updateData.name = name;
    
    // Solo super admin puede cambiar business_id
    if (isSuperAdmin && businessId !== undefined) {
      updateData.business_id = businessId;
    }

    const updatedClient = await ClientService.update(client.id, updateData);

    // Obtener usage_count actualizado
    const usageCount = await ShortlinkAnalyticsService.getUsageCount(updatedClient.id);

    res.json({
      slug: updatedClient.slug,
      name: updatedClient.name,
      url: `${process.env.SHORTLINK_BASE_URL || 'https://go.soymilo.com'}/${updatedClient.slug}`,
      business_id: updatedClient.business_id,
      created_at: updatedClient.created_at,
      updated_at: updatedClient.updated_at,
      usage_count: usageCount,
    });
  } catch (error) {
    console.error('[Shortlinks API] Error updating shortlink:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * DELETE /api/shortlinks/:slug
 * Eliminar un shortlink (soft delete)
 * - Super admin: puede eliminar cualquier shortlink
 * - Business owner: solo puede eliminar los de su negocio
 */
router.delete('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const client = await ClientService.getBySlug(slug);
    if (!client) {
      return res.status(404).json({ error: 'Shortlink not found' });
    }

    const isSuperAdmin = req.user.is_system_user && req.user.role === 'super_admin';
    
    // Verificar permisos
    if (!isSuperAdmin && client.business_id !== req.user.business_id) {
      return res.status(403).json({ error: 'Forbidden: Cannot delete shortlink from other business' });
    }

    await ClientService.delete(client.id);

    res.status(204).send();
  } catch (error) {
    console.error('[Shortlinks API] Error deleting shortlink:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;

