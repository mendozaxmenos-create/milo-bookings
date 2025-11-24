# 🎨 Plan de Integración del Frontend con la Nueva Arquitectura

## 📊 Situación Actual

- **Frontend**: Desplegado en Vercel (`frontend/admin-panel`)
- **Backend Express**: Desplegado en Render (`https://milo-bookings.onrender.com`)
- **Nuevo Bot Multi-Negocio**: Serverless Functions en Vercel (`api/`)

## 🎯 Opciones de Integración

### ✅ **Opción A: Arquitectura Híbrida (RECOMENDADA)**

Mantener el backend Express para el panel de admin y usar Vercel solo para el bot multi-negocio.

#### Ventajas:
- ✅ **Menos cambios**: El frontend sigue funcionando igual
- ✅ **Separación de responsabilidades**: Panel admin vs Bot
- ✅ **Menos riesgo**: No tocas código que ya funciona
- ✅ **Escalabilidad**: Cada parte escala independientemente

#### Estructura:
```
┌─────────────────┐
│   Frontend      │
│   (Vercel)      │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────────┐
│ Backend │ │ Bot Multi-   │
│ Express │ │ Negocio      │
│ (Render)│ │ (Vercel API) │
└────────┘ └──────────────┘
```

#### Configuración:

1. **Frontend sigue apuntando a Render**:
   ```env
   VITE_API_URL=https://milo-bookings.onrender.com
   ```

2. **El bot multi-negocio está en Vercel**:
   - Webhook: `https://tu-dominio.vercel.app/api/webhook`
   - Shortlinks: `https://tu-dominio.vercel.app/monpatisserie`

3. **Ambos comparten la misma base de datos**:
   - Render backend: Usa `DATABASE_URL` para panel admin
   - Vercel functions: Usa `DATABASE_URL` para bot

#### Implementación:

**No necesitas cambiar nada en el frontend.** Solo asegúrate de que:

1. La variable `VITE_API_URL` en Vercel apunte a Render:
   ```
   VITE_API_URL=https://milo-bookings.onrender.com
   ```

2. El backend Express en Render tenga acceso a la misma base de datos que Vercel

3. (Opcional) Agregar endpoints en el backend Express para gestionar `clients`:
   - `GET /api/admin/clients` - Listar comercios
   - `POST /api/admin/clients` - Crear comercio
   - `PUT /api/admin/clients/:id` - Actualizar comercio

---

### 🔄 **Opción B: Todo en Vercel (Migración Completa)**

Migrar todo el backend Express a Vercel Serverless Functions.

#### Ventajas:
- ✅ **Todo en un solo lugar**: Más fácil de gestionar
- ✅ **Mejor performance**: Serverless es más rápido
- ✅ **Un solo dominio**: Todo bajo el mismo dominio

#### Desventajas:
- ⚠️ **Mucho trabajo**: Migrar todas las rutas a Serverless Functions
- ⚠️ **Cambios en el frontend**: Actualizar `VITE_API_URL`
- ⚠️ **Riesgo**: Más cambios = más posibilidad de errores

#### Estructura:
```
┌─────────────────┐
│   Frontend      │
│   (Vercel)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vercel API     │
│  (Serverless)   │
│  - Panel Admin  │
│  - Bot Multi    │
└─────────────────┘
```

#### Implementación:

1. **Migrar rutas del backend Express a Serverless Functions**:
   ```
   api/
   ├── webhook.js              # ✅ Ya existe (bot)
   ├── shortlink.js            # ✅ Ya existe (bot)
   ├── auth/
   │   ├── login.js
   │   ├── register.js
   │   └── forgot-password.js
   ├── businesses/
   │   ├── index.js
   │   └── [id].js
   ├── services/
   │   ├── index.js
   │   └── [id].js
   ├── bookings/
   │   ├── index.js
   │   └── [id].js
   └── ... (todas las demás rutas)
   ```

2. **Actualizar frontend**:
   ```env
   VITE_API_URL=https://tu-dominio.vercel.app
   ```

3. **Actualizar vercel.json** para manejar todas las rutas

---

## 🎯 **Recomendación: Opción A (Híbrida)**

### ¿Por qué?

1. **El panel de admin funciona bien en Express**: Tiene muchas rutas complejas (auth, bookings, services, etc.) que son más fáciles de mantener en Express
2. **El bot multi-negocio es independiente**: Solo necesita webhook y shortlinks, perfecto para Serverless
3. **Menos riesgo**: No tocas código que ya funciona
4. **Separación clara**: Panel admin vs Bot

### Plan de Implementación (Opción A)

#### Paso 1: Mantener Frontend como está ✅
- El frontend ya está configurado para usar `VITE_API_URL`
- Solo asegúrate de que la variable apunte a Render

#### Paso 2: Agregar gestión de Clients en Backend Express (Opcional)

Si quieres gestionar los `clients` desde el panel de admin, agrega estas rutas:

```javascript
// backend/src/api/routes/clients.js
import express from 'express';
import { ClientService } from '../../services/clientService.js';
import { authenticateToken } from '../../utils/auth.js';

const router = express.Router();

// Solo super admin puede gestionar clients
router.get('/', authenticateToken, async (req, res) => {
  // Verificar que sea super admin
  if (!req.user?.is_system_user || req.user?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const clients = await ClientService.getAllActive();
  res.json({ data: clients });
});

router.post('/', authenticateToken, async (req, res) => {
  if (!req.user?.is_system_user || req.user?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const client = await ClientService.create(req.body);
  res.status(201).json({ data: client });
});

// ... más rutas

export default router;
```

Luego agregar en `server.js`:
```javascript
import clientsRoutes from './routes/clients.js';
app.use('/api/admin/clients', clientsRoutes);
```

#### Paso 3: Actualizar Frontend para gestionar Clients (Opcional)

Agregar en `frontend/admin-panel/src/services/api.ts`:
```typescript
// Clients API
export interface Client {
  id: string;
  name: string;
  slug: string;
  business_id: string | null;
  settings: any;
  status: 'active' | 'inactive' | 'suspended';
}

export const getClients = async (): Promise<{ data: Client[] }> => {
  const response = await api.get<{ data: Client[] }>('/api/admin/clients');
  return response.data;
};

export const createClient = async (data: Partial<Client>): Promise<{ data: Client }> => {
  const response = await api.post<{ data: Client }>('/api/admin/clients', data);
  return response.data;
};
```

#### Paso 4: Configurar Variables de Entorno

**En Vercel (Frontend)**:
```
VITE_API_URL=https://milo-bookings.onrender.com
```

**En Vercel (Serverless Functions - Bot)**:
```
WHATSAPP_VERIFY_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_NUMBER=...
DATABASE_URL=... (misma que Render)
```

**En Render (Backend Express)**:
```
DATABASE_URL=... (misma que Vercel)
JWT_SECRET=...
... (resto de variables)
```

---

## 📝 Resumen

### ✅ **Lo que NO cambia:**
- Frontend sigue funcionando igual
- Backend Express sigue en Render
- Panel de admin sigue funcionando
- Autenticación, bookings, services, etc. siguen igual

### 🆕 **Lo que es nuevo:**
- Bot multi-negocio en Vercel Serverless Functions
- Shortlinks enmascarados
- Sistema de sesiones multi-negocio
- Tablas `clients` y `sessions`

### 🔗 **Cómo se conectan:**
- **Frontend** → **Render Backend** (panel admin)
- **Meta WhatsApp** → **Vercel Functions** (bot)
- **Ambos** → **Misma Base de Datos** (PostgreSQL)

---

## 🚀 Siguiente Paso

**Recomendación**: Implementar **Opción A (Híbrida)** porque:
1. Es la más simple
2. Menos riesgo
3. Separación clara de responsabilidades
4. El frontend no necesita cambios

¿Quieres que implemente la gestión de `clients` en el backend Express para que puedas gestionarlos desde el panel de admin?

