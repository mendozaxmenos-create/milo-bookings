# 💾 Servicio de Backup Automático

## Descripción

Sistema de backup automático para la base de datos PostgreSQL que ejecuta backups diarios y permite gestión manual desde la API.

## Características

- ✅ **Backup automático diario** a hora configurable (default: 2 AM)
- ✅ **Backup manual** desde API (Super Admin)
- ✅ **Listar backups** disponibles
- ✅ **Descargar backups** individuales
- ✅ **Restaurar backups** (con confirmación explícita)
- ✅ **Limpieza automática** (mantiene últimos 7 backups)
- ✅ **Solo en producción** (requiere PostgreSQL y DATABASE_URL)

## Configuración

### Variables de Entorno

```bash
# Hora del día para ejecutar backups automáticos (0-23)
BACKUP_HOUR=2  # Default: 2 AM

# Base de datos PostgreSQL (requerida)
DATABASE_URL=postgresql://user:password@host:port/database
```

### Requisitos

1. **PostgreSQL client tools** instalados:
   - `pg_dump` - Para crear backups
   - `psql` - Para restaurar backups

2. **En Docker**: El Dockerfile ya incluye `postgresql-client`

3. **En Render/Heroku**: Los tools deben estar disponibles en el PATH

## Uso

### Backups Automáticos

El servicio se inicia automáticamente cuando el servidor arranca (solo en producción con `DATABASE_URL` configurada).

Los backups se ejecutan diariamente a la hora configurada en `BACKUP_HOUR`.

### API Endpoints (Super Admin Only)

#### Listar Backups
```http
GET /api/backups
Authorization: Bearer <super_admin_token>
```

**Response:**
```json
{
  "data": [
    {
      "fileName": "milo-bookings-backup-2025-01-15-02-00-00.sql",
      "size": 1048576,
      "sizeMB": 1.0,
      "createdAt": "2025-01-15T02:00:00.000Z",
      "modifiedAt": "2025-01-15T02:00:00.000Z"
    }
  ]
}
```

#### Crear Backup Manual
```http
POST /api/backups
Authorization: Bearer <super_admin_token>
```

**Response:**
```json
{
  "data": {
    "filePath": "/path/to/backup.sql",
    "fileName": "milo-bookings-backup-2025-01-15-14-30-00.sql",
    "size": 1048576,
    "sizeMB": 1.0,
    "createdAt": "2025-01-15T14:30:00.000Z"
  },
  "message": "Backup creado exitosamente"
}
```

#### Descargar Backup
```http
GET /api/backups/{fileName}
Authorization: Bearer <super_admin_token>
```

**Response:** Archivo SQL para descargar

#### Eliminar Backup
```http
DELETE /api/backups/{fileName}
Authorization: Bearer <super_admin_token>
```

#### Restaurar Backup
```http
POST /api/backups/{fileName}/restore
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "confirm": "yes-i-want-to-restore-this-backup"
}
```

**⚠️ ADVERTENCIA**: Esta operación sobrescribirá toda la base de datos actual. Se requiere confirmación explícita.

**Response:**
```json
{
  "message": "Backup restaurado exitosamente. La base de datos ha sido sobrescrita.",
  "warning": "Esta operación sobrescribió toda la base de datos actual."
}
```

## Ubicación de Backups

Los backups se almacenan en:
```
backend/backups/
```

Este directorio se crea automáticamente si no existe.

## Limpieza Automática

El servicio mantiene automáticamente los últimos **7 backups** más recientes. Los backups más antiguos se eliminan automáticamente cuando se crea un nuevo backup.

## Seguridad

- ✅ Solo Super Admins pueden acceder a los endpoints
- ✅ Validación de nombres de archivo (previene path traversal)
- ✅ Contraseñas de base de datos pasadas por variables de entorno (no en comandos)
- ✅ Confirmación explícita requerida para restaurar backups

## Logging

El servicio registra todas las operaciones:

```
[BackupService] Iniciando backup: milo-bookings-backup-2025-01-15-02-00-00.sql
[BackupService] Host: db.example.com, Database: milo_bookings
[BackupService] ✅ Backup creado exitosamente: milo-bookings-backup-2025-01-15-02-00-00.sql (1.5 MB)
[BackupService] 🗑️ Backup antiguo eliminado: milo-bookings-backup-2025-01-08-02-00-00.sql
```

## Troubleshooting

### Error: "pg_dump: command not found"
**Solución**: Instalar PostgreSQL client tools:
```bash
# Ubuntu/Debian
apt-get install postgresql-client

# Alpine (Docker)
apk add postgresql-client

# macOS
brew install postgresql
```

### Error: "DATABASE_URL no está configurada"
**Solución**: Configurar la variable de entorno `DATABASE_URL` en formato PostgreSQL:
```
postgresql://user:password@host:port/database
```

### Error: "Backup automático deshabilitado"
**Causa**: El servicio solo se inicia en producción (`NODE_ENV=production`) y requiere `DATABASE_URL`.

**Solución**: 
1. Configurar `NODE_ENV=production`
2. Configurar `DATABASE_URL`
3. Reiniciar el servidor

### Los backups no se están creando
**Verificar**:
1. El servicio se inició correctamente (ver logs al arrancar)
2. `BACKUP_HOUR` está configurado correctamente
3. La hora programada ya pasó
4. Los permisos del directorio `backend/backups/` son correctos

## Notas de Producción

- Los backups se almacenan localmente en el servidor
- Para backups remotos (S3, Google Cloud Storage, etc.), considera agregar un script que suba los backups después de crearlos
- Monitorea el espacio en disco: los backups pueden ocupar bastante espacio
- Configura alertas si el backup diario falla

