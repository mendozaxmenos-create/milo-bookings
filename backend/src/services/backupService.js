/**
 * Servicio de backup automático de base de datos
 * Soporta PostgreSQL
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio para almacenar backups
const BACKUP_DIR = path.join(__dirname, '../../../backups');
const MAX_BACKUPS = 7; // Mantener últimos 7 backups

/**
 * Verifica que el directorio de backups existe, si no, lo crea
 */
async function ensureBackupDirectory() {
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    console.log(`[BackupService] Directorio de backups creado: ${BACKUP_DIR}`);
  }
}

/**
 * Genera un nombre de archivo para el backup
 */
function generateBackupFileName() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  return `milo-bookings-backup-${dateStr}-${timeStr}.sql`;
}

/**
 * Obtiene la URL de la base de datos desde las variables de entorno
 */
function getDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL no está configurada');
  }
  return dbUrl;
}

/**
 * Parsea la URL de PostgreSQL y extrae información de conexión
 */
function parsePostgresUrl(url) {
  try {
    const urlObj = new URL(url);
    return {
      host: urlObj.hostname,
      port: urlObj.port || '5432',
      database: urlObj.pathname.slice(1), // Remover el '/' inicial
      user: urlObj.username,
      password: urlObj.password,
    };
  } catch (error) {
    throw new Error(`Error parseando DATABASE_URL: ${error.message}`);
  }
}

/**
 * Crea un backup de la base de datos PostgreSQL
 * @returns {Promise<{filePath: string, fileName: string, size: number}>}
 */
export async function createBackup() {
  try {
    await ensureBackupDirectory();

    const dbUrl = getDatabaseUrl();
    const dbConfig = parsePostgresUrl(dbUrl);
    const fileName = generateBackupFileName();
    const filePath = path.join(BACKUP_DIR, fileName);

    // Comando pg_dump con formato SQL plano
    const pgDumpCommand = `PGPASSWORD="${dbConfig.password}" pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -F p -f "${filePath}"`;

    console.log(`[BackupService] Iniciando backup: ${fileName}`);
    
    await execAsync(pgDumpCommand);

    // Verificar que el archivo fue creado
    const stats = await fs.stat(filePath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`[BackupService] ✅ Backup creado exitosamente: ${fileName} (${fileSizeMB} MB)`);

    // Limpiar backups antiguos
    await cleanupOldBackups();

    return {
      filePath,
      fileName,
      size: stats.size,
      sizeMB: parseFloat(fileSizeMB),
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[BackupService] ❌ Error creando backup:', error);
    throw error;
  }
}

/**
 * Limpia backups antiguos, manteniendo solo los últimos MAX_BACKUPS
 */
async function cleanupOldBackups() {
  try {
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files
      .filter(file => file.startsWith('milo-bookings-backup-') && file.endsWith('.sql'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
      }));

    if (backupFiles.length <= MAX_BACKUPS) {
      return; // No hay backups antiguos para limpiar
    }

    // Ordenar por fecha de modificación (más antiguos primero)
    const filesWithStats = await Promise.all(
      backupFiles.map(async (file) => {
        const stats = await fs.stat(file.path);
        return {
          ...file,
          mtime: stats.mtime,
        };
      })
    );

    filesWithStats.sort((a, b) => a.mtime - b.mtime);

    // Eliminar los backups más antiguos
    const filesToDelete = filesWithStats.slice(0, filesWithStats.length - MAX_BACKUPS);
    
    for (const file of filesToDelete) {
      await fs.unlink(file.path);
      console.log(`[BackupService] 🗑️ Backup antiguo eliminado: ${file.name}`);
    }

    console.log(`[BackupService] Limpieza completada. Manteniendo ${MAX_BACKUPS} backups más recientes.`);
  } catch (error) {
    console.error('[BackupService] Error limpiando backups antiguos:', error);
    // No lanzar error para no interrumpir el proceso de backup
  }
}

/**
 * Lista todos los backups disponibles
 * @returns {Promise<Array<{fileName: string, size: number, sizeMB: number, createdAt: string}>>}
 */
export async function listBackups() {
  try {
    await ensureBackupDirectory();
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files.filter(file => 
      file.startsWith('milo-bookings-backup-') && file.endsWith('.sql')
    );

    const backups = await Promise.all(
      backupFiles.map(async (fileName) => {
        const filePath = path.join(BACKUP_DIR, fileName);
        const stats = await fs.stat(filePath);
        return {
          fileName,
          size: stats.size,
          sizeMB: parseFloat((stats.size / (1024 * 1024)).toFixed(2)),
          createdAt: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString(),
        };
      })
    );

    // Ordenar por fecha de creación (más recientes primero)
    backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return backups;
  } catch (error) {
    console.error('[BackupService] Error listando backups:', error);
    throw error;
  }
}

/**
 * Obtiene la ruta completa de un archivo de backup
 * @param {string} fileName - Nombre del archivo de backup
 * @returns {Promise<string>}
 */
export async function getBackupFilePath(fileName) {
  // Validar que el nombre del archivo es seguro (no contiene path traversal)
  if (fileName.includes('..') || !fileName.startsWith('milo-bookings-backup-') || !fileName.endsWith('.sql')) {
    throw new Error('Nombre de archivo inválido');
  }

  const filePath = path.join(BACKUP_DIR, fileName);
  
  try {
    await fs.access(filePath);
    return filePath;
  } catch {
    throw new Error('Backup no encontrado');
  }
}

/**
 * Elimina un backup específico
 * @param {string} fileName - Nombre del archivo de backup
 */
export async function deleteBackup(fileName) {
  const filePath = await getBackupFilePath(fileName);
  await fs.unlink(filePath);
  console.log(`[BackupService] Backup eliminado: ${fileName}`);
}

/**
 * Restaura un backup en la base de datos
 * ⚠️ ADVERTENCIA: Esto sobrescribirá la base de datos actual
 * @param {string} fileName - Nombre del archivo de backup
 */
export async function restoreBackup(fileName) {
  try {
    const filePath = await getBackupFilePath(fileName);
    const dbUrl = getDatabaseUrl();
    const dbConfig = parsePostgresUrl(dbUrl);

    // Comando psql para restaurar
    const env = {
      ...process.env,
      PGPASSWORD: dbConfig.password,
    };

    const restoreCommand = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -f "${filePath}"`;

    console.log(`[BackupService] ⚠️ Restaurando backup: ${fileName}`);
    console.log(`[BackupService] ⚠️ ADVERTENCIA: Esto sobrescribirá la base de datos actual`);
    console.log(`[BackupService] Host: ${dbConfig.host}, Database: ${dbConfig.database}`);

    await execAsync(restoreCommand, { env });

    console.log(`[BackupService] ✅ Backup restaurado exitosamente: ${fileName}`);
  } catch (error) {
    console.error('[BackupService] ❌ Error restaurando backup:', error);
    throw error;
  }
}

/**
 * Inicia el servicio de backup automático
 * Ejecuta backups diarios a la hora configurada
 * @param {number} hour - Hora del día para ejecutar backups (0-23, default: 2 AM)
 */
export function startBackupService(hour = 2) {
  console.log(`[BackupService] Iniciando servicio de backup automático (ejecución diaria a las ${hour}:00)`);

  // Calcular tiempo hasta la próxima ejecución
  const scheduleNextBackup = () => {
    const now = new Date();
    const nextBackup = new Date();
    nextBackup.setHours(hour, 0, 0, 0);

    // Si la hora ya pasó hoy, programar para mañana
    if (nextBackup <= now) {
      nextBackup.setDate(nextBackup.getDate() + 1);
    }

    const msUntilNext = nextBackup - now;
    const hoursUntilNext = (msUntilNext / (1000 * 60 * 60)).toFixed(2);

    console.log(`[BackupService] Próximo backup programado para: ${nextBackup.toISOString()} (en ${hoursUntilNext} horas)`);

    setTimeout(async () => {
      try {
        await createBackup();
      } catch (error) {
        console.error('[BackupService] Error en backup automático:', error);
      }

      // Programar próximo backup (24 horas después)
      scheduleNextBackup();
    }, msUntilNext);
  };

  // Ejecutar backup inmediatamente si es la primera vez (opcional)
  // O programar para la próxima hora configurada
  scheduleNextBackup();
}

