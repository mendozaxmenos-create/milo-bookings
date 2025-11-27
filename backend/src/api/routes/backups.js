import express from 'express';
import { authenticateToken, requireSuperAdmin } from '../../utils/auth.js';
import { 
  createBackup, 
  listBackups, 
  getBackupFilePath, 
  deleteBackup, 
  restoreBackup 
} from '../../services/backupService.js';
import { apiLogger } from '../../utils/logger.js';
import fs from 'fs/promises';

const router = express.Router();

// Todas las rutas requieren autenticación de super admin
router.use(authenticateToken);
router.use(requireSuperAdmin);

// Listar todos los backups disponibles
router.get('/', async (req, res) => {
  try {
    apiLogger.debug('GET /backups - Listing backups');
    const backups = await listBackups();
    res.json({ data: backups });
  } catch (error) {
    apiLogger.error('Error listing backups', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Crear un backup manual
router.post('/', async (req, res) => {
  try {
    apiLogger.info('POST /backups - Creating manual backup');
    const backup = await createBackup();
    res.status(201).json({ 
      data: backup,
      message: 'Backup creado exitosamente'
    });
  } catch (error) {
    apiLogger.error('Error creating backup', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Error creando backup: ' + error.message });
  }
});

// Descargar un backup específico
router.get('/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    apiLogger.debug('GET /backups/:fileName', { fileName });

    const filePath = await getBackupFilePath(fileName);
    
    // Verificar que el archivo existe
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'Backup no encontrado' });
    }

    // Enviar archivo
    res.download(filePath, fileName, (err) => {
      if (err) {
        apiLogger.error('Error downloading backup', { fileName, error: err.message });
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error descargando backup' });
        }
      } else {
        apiLogger.info('Backup downloaded', { fileName });
      }
    });
  } catch (error) {
    apiLogger.error('Error getting backup file', { 
      fileName: req.params.fileName, 
      error: error.message 
    });
    res.status(400).json({ error: error.message });
  }
});

// Eliminar un backup
router.delete('/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    apiLogger.info('DELETE /backups/:fileName', { fileName });

    await deleteBackup(fileName);
    res.json({ message: 'Backup eliminado exitosamente' });
  } catch (error) {
    apiLogger.error('Error deleting backup', { 
      fileName: req.params.fileName, 
      error: error.message 
    });
    res.status(400).json({ error: error.message });
  }
});

// Restaurar un backup (⚠️ OPERACIÓN PELIGROSA)
router.post('/:fileName/restore', async (req, res) => {
  try {
    const { fileName } = req.params;
    const { confirm } = req.body;

    // Requerir confirmación explícita
    if (confirm !== 'yes-i-want-to-restore-this-backup') {
      return res.status(400).json({ 
        error: 'Se requiere confirmación explícita. Envía { confirm: "yes-i-want-to-restore-this-backup" }' 
      });
    }

    apiLogger.warn('POST /backups/:fileName/restore - Restoring backup', { fileName });

    await restoreBackup(fileName);
    res.json({ 
      message: 'Backup restaurado exitosamente. La base de datos ha sido sobrescrita.',
      warning: 'Esta operación sobrescribió toda la base de datos actual.'
    });
  } catch (error) {
    apiLogger.error('Error restoring backup', { 
      fileName: req.params.fileName, 
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Error restaurando backup: ' + error.message });
  }
});

export default router;

