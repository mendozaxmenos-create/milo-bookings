# 🧪 Guía de Pruebas - Milo Bookings

## 📋 Datos de Prueba Creados

### Usuario de Prueba
- **Business ID**: `demo-business-001`
- **Teléfono**: `+5491123456789`
- **Contraseña**: `demo123`
- **Rol**: `owner`

### Servicios de Prueba
1. **Corte de Cabello** - $2,500.00 - 30 min
2. **Peinado** - $3,500.00 - 60 min
3. **Tintura** - $5,000.00 - 90 min

## 🚀 Iniciar la Aplicación

### 1. Iniciar el Backend

```bash
cd backend
npm run dev
```

El backend estará disponible en: `http://localhost:3000`

### 2. Iniciar el Frontend (en otra terminal)

```bash
cd frontend/admin-panel
npm run dev
```

El frontend estará disponible en: `http://localhost:3001`

## ✅ Pruebas a Realizar

### 1. Probar el Backend API

#### Health Check
```bash
curl http://localhost:3000/health
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "demo-business-001",
    "phone": "+5491123456789",
    "password": "demo123"
  }'
```

#### Obtener Servicios (requiere token)
```bash
# Primero obtener el token del login anterior
curl http://localhost:3000/api/services \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### 2. Probar el Frontend

1. **Abrir**: `http://localhost:3001`
2. **Login** con:
   - Business ID: `demo-business-001`
   - Teléfono: `+5491123456789`
   - Contraseña: `demo123`

3. **Probar funcionalidades**:
   - Ver Dashboard con estadísticas
   - Gestionar Servicios (crear, editar, activar/desactivar)
   - Ver Reservas
   - Cambiar estados de reservas

### 3. Probar el Bot de WhatsApp

El bot de WhatsApp requiere configuración adicional:
- Escanear QR code cuando se inicie
- Enviar mensajes de prueba al número configurado

## 🔍 Endpoints Disponibles

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario (solo desarrollo)

### Negocios
- `GET /api/businesses` - Listar negocios
- `GET /api/businesses/:id` - Obtener negocio
- `POST /api/businesses` - Crear negocio
- `PUT /api/businesses/:id` - Actualizar negocio
- `DELETE /api/businesses/:id` - Eliminar negocio

### Servicios
- `GET /api/services` - Listar servicios
- `GET /api/services/:id` - Obtener servicio
- `POST /api/services` - Crear servicio
- `PUT /api/services/:id` - Actualizar servicio
- `DELETE /api/services/:id` - Eliminar servicio
- `PATCH /api/services/:id/toggle` - Activar/Desactivar servicio

### Reservas
- `GET /api/bookings` - Listar reservas (con filtros: ?status=pending&date=2024-12-25)
- `GET /api/bookings/:id` - Obtener reserva
- `POST /api/bookings` - Crear reserva
- `PUT /api/bookings/:id` - Actualizar reserva
- `DELETE /api/bookings/:id` - Eliminar reserva
- `PATCH /api/bookings/:id/status` - Cambiar estado de reserva

## 🐛 Troubleshooting

### Error: "Cannot find module"
- Ejecutar `npm install` en la raíz del proyecto

### Error: "Database locked"
- Cerrar otras conexiones a la base de datos
- Verificar que no haya otro proceso usando `bookings.db`

### Error: "Port already in use"
- Cambiar el puerto en `.env` o cerrar el proceso que usa el puerto

### Frontend no se conecta al backend
- Verificar que el backend esté corriendo
- Verificar `ALLOWED_ORIGINS` en `.env`
- Verificar la configuración del proxy en `vite.config.ts`

## 📝 Notas

- La base de datos SQLite se crea automáticamente en `backend/data/bookings.db`
- Los datos de prueba se crean con el seed `001_demo_data.js`
- Para resetear la base de datos: `npm run db:rollback` y luego `npm run db:migrate` y `npm run db:seed`

