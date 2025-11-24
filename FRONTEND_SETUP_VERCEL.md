# 🎨 Configuración del Frontend en Vercel - Guía Rápida

## ✅ **Situación Actual**

Tu frontend ya está desplegado en Vercel y funciona perfectamente. Con la nueva arquitectura multi-bot, **NO necesitas cambiar nada en el frontend**.

## 🔧 **Configuración Actual**

### Variables de Entorno en Vercel

El frontend usa esta variable para conectarse al backend:

```
VITE_API_URL=https://milo-bookings.onrender.com
```

**Esta configuración sigue siendo correcta.** El backend Express en Render maneja todo el panel de administración.

## 📊 **Arquitectura Final**

```
┌─────────────────────────────────┐
│        Vercel (Un Solo Proyecto) │
├─────────────────────────────────┤
│                                 │
│  ┌──────────────┐              │
│  │   Frontend   │              │
│  │  (Static)    │              │
│  └──────┬───────┘              │
│         │                       │
│         │ VITE_API_URL          │
│         ▼                       │
│  ┌──────────────┐              │
│  │ Backend      │              │
│  │ Express      │              │
│  │ (Render)     │              │
│  └──────────────┘              │
│                                 │
│  ┌──────────────┐              │
│  │ Bot Multi    │              │
│  │ (Serverless) │              │
│  │ api/webhook  │              │
│  │ api/shortlink│              │
│  └──────────────┘              │
└─────────────────────────────────┘
```

## 🎯 **Cómo Funciona**

### 1. Frontend (Panel de Admin)
- **URL**: `https://tu-dominio.vercel.app`
- **Se conecta a**: `https://milo-bookings.onrender.com` (Backend Express)
- **Rutas**: `/`, `/login`, `/dashboard`, `/services`, etc.

### 2. Bot Multi-Negocio
- **Webhook**: `https://tu-dominio.vercel.app/api/webhook`
- **Shortlinks**: `https://tu-dominio.vercel.app/monpatisserie`
- **Rutas API**: `/api/webhook`, `/api/shortlink`, `/api/sendMessage`, etc.

### 3. Backend Express (Panel Admin)
- **URL**: `https://milo-bookings.onrender.com`
- **Rutas**: `/api/auth`, `/api/services`, `/api/bookings`, etc.

## ✅ **Checklist de Configuración**

### En Vercel Dashboard:

1. **Variables de Entorno del Frontend**:
   ```
   VITE_API_URL=https://milo-bookings.onrender.com
   ```

2. **Variables de Entorno de las Serverless Functions** (Bot):
   ```
   WHATSAPP_VERIFY_TOKEN=tu-token-aqui
   WHATSAPP_PHONE_NUMBER_ID=tu-phone-number-id
   WHATSAPP_ACCESS_TOKEN=tu-access-token
   WHATSAPP_NUMBER=5491123456789
   DATABASE_URL=postgresql://...
   SHORTLINK_BASE_URL=https://tu-dominio.vercel.app
   ```

3. **Configuración del Proyecto**:
   - **Root Directory**: (vacío, raíz del proyecto)
   - **Build Command**: `cd frontend/admin-panel && npm install && npm run build`
   - **Output Directory**: `frontend/admin-panel/dist`
   - **Framework**: Vite

## 🧪 **Cómo Probar**

### 1. Probar Frontend (Panel Admin)
```
https://tu-dominio.vercel.app
```
- Debería cargar el login
- Al hacer login, debería conectarse a Render backend

### 2. Probar Bot (Shortlink)
```
https://tu-dominio.vercel.app/monpatisserie
```
- Debería redirigir a WhatsApp
- El bot debería responder

### 3. Probar API del Bot
```bash
curl https://tu-dominio.vercel.app/api/clients/monpatisserie
```
- Debería devolver la configuración del comercio

## 🔍 **Troubleshooting**

### El frontend no carga
- Verifica que `outputDirectory` esté configurado como `frontend/admin-panel/dist`
- Revisa los logs de build en Vercel

### El frontend no se conecta al backend
- Verifica que `VITE_API_URL` esté configurada en Vercel
- Verifica que el backend en Render esté funcionando
- Revisa la consola del navegador para ver errores de CORS

### Los shortlinks no funcionan
- Verifica que `WHATSAPP_NUMBER` esté configurado
- Verifica que el cliente exista en la base de datos
- Revisa los logs de las Serverless Functions en Vercel

### El webhook no recibe mensajes
- Verifica que el webhook esté configurado en Meta
- Verifica que `WHATSAPP_VERIFY_TOKEN` coincida
- Revisa los logs de las Serverless Functions

## 📝 **Notas Importantes**

1. **El frontend NO necesita cambios**: Sigue funcionando igual que antes
2. **El backend Express sigue en Render**: No lo movimos, sigue funcionando
3. **El bot multi-negocio es nuevo**: Está en Vercel Serverless Functions
4. **Ambos comparten la misma base de datos**: PostgreSQL

## 🚀 **Siguiente Paso**

Si quieres gestionar los `clients` desde el panel de admin, puedo agregar las rutas necesarias en el backend Express. ¿Quieres que lo haga?

