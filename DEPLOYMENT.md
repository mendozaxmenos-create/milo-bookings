# 🚀 Guía de Deployment - Milo Bookings

Esta guía te ayudará a desplegar Milo Bookings en la nube.

## 📋 Requisitos Previos

- Cuenta en un servicio de hosting (Railway, Render, Heroku, etc.)
- Base de datos PostgreSQL (proporcionada por el hosting o externa)
- Cuenta de WhatsApp Business o número de teléfono
- Credenciales de MercadoPago

---

## 🌐 Opciones de Deployment

### 1. Railway (Recomendado)

Railway es ideal para este proyecto porque:
- ✅ Soporta PostgreSQL automáticamente
- ✅ Build automático desde GitHub
- ✅ Variables de entorno fáciles de configurar
- ✅ Storage persistente para sesiones

#### Pasos:

1. **Crear cuenta en Railway**
   - Ve a [railway.app](https://railway.app)
   - Conecta tu cuenta de GitHub

2. **Crear nuevo proyecto**
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Elige tu repositorio `milo-bookings`

3. **Agregar Base de Datos PostgreSQL**
   - Click en "New" → "Database" → "PostgreSQL"
   - Railway creará automáticamente la base de datos

4. **Configurar Variables de Entorno**
   En la pestaña "Variables", agrega:

   ```env
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=tu_secreto_jwt_super_seguro_aqui
   SESSION_STORAGE_TYPE=local
   SESSION_STORAGE_PATH=/app/backend/data/whatsapp-sessions
   MERCADOPAGO_ACCESS_TOKEN=tu_token_de_mercadopago
   MERCADOPAGO_PUBLIC_KEY=tu_public_key
   ALLOWED_ORIGINS=https://tu-dominio.com
   QR_WEBHOOK_URL=https://tu-dominio.com/api/webhooks/qr
   ```

5. **Deploy**
   - Railway detectará automáticamente el `railway.json`
   - El build se ejecutará automáticamente
   - Las migraciones se ejecutarán durante el build

---

### 2. Render

Render es otra excelente opción con plan gratuito.

#### Pasos:

1. **Crear cuenta en Render**
   - Ve a [render.com](https://render.com)
   - Conecta tu cuenta de GitHub

2. **Crear Web Service**
   - Click en "New" → "Web Service"
   - Conecta tu repositorio
   - Configura:
     - **Name**: milo-bookings-backend
     - **Environment**: Node
     - **Build Command**: `cd backend && npm install && npm run db:migrate`
     - **Start Command**: `cd backend && npm start`

3. **Agregar Base de Datos PostgreSQL**
   - Click en "New" → "PostgreSQL"
   - Render creará la base de datos automáticamente

4. **Configurar Variables de Entorno**
   Similar a Railway, agrega todas las variables necesarias.

5. **Configurar Storage Persistente**
   - Render no tiene storage persistente por defecto
   - Considera usar S3 para sesiones de WhatsApp
   - O usa un servicio externo de storage

---

### 3. Heroku

#### Pasos:

1. **Instalar Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login y crear app**
   ```bash
   heroku login
   heroku create milo-bookings
   ```

3. **Agregar PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. **Configurar Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=tu_secreto
   # ... más variables
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

---

## 🔧 Configuración de Variables de Entorno

### Backend - Variables Requeridas

```env
# Servidor
NODE_ENV=production
PORT=3000

# Base de Datos
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=tu_secreto_jwt_muy_seguro_minimo_32_caracteres

# WhatsApp
SESSION_STORAGE_TYPE=local
SESSION_STORAGE_PATH=/tmp/whatsapp-sessions
QR_WEBHOOK_URL=https://tu-dominio.com/api/webhooks/qr

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=tu_access_token
MERCADOPAGO_PUBLIC_KEY=tu_public_key

# CORS - IMPORTANTE: Incluir la URL del frontend
ALLOWED_ORIGINS=https://admin.tu-dominio.com,https://tu-dominio.com
FRONTEND_URL=https://admin.tu-dominio.com
```

### Frontend - Variables Requeridas

```env
# URL del API Backend (IMPORTANTE: URL completa del backend)
VITE_API_URL=https://api.tu-dominio.com

# Puerto (solo para desarrollo local)
VITE_PORT=3001
```

### Variables Opcionales

```env
# Para mostrar QR en producción (útil para debugging)
SHOW_QR=true

# Para storage remoto de sesiones (S3)
AWS_S3_BUCKET=tu-bucket
AWS_ACCESS_KEY_ID=tu-key
AWS_SECRET_ACCESS_KEY=tu-secret
AWS_REGION=us-east-1
```

---

## 📱 Configuración de WhatsApp en la Nube

### Opción 1: Sesiones Persistentes (Actual)

El bot guarda las sesiones en el storage del servidor. **Importante**: 
- En Railway/Render, el storage es persistente entre deployments
- En Heroku, el storage es efímero (se pierde en cada restart)
- Para Heroku, considera usar S3 o un servicio externo

### Opción 2: WhatsApp Business API (Recomendado para Producción)

Para producción, considera migrar a WhatsApp Business API oficial:
- Más estable
- No requiere mantener sesiones
- Mejor para escalabilidad

### Opción 3: Webhook para QR

Configura `QR_WEBHOOK_URL` para recibir códigos QR en tu aplicación:
- Útil para mostrar QR en el panel de administración
- Permite escanear QR sin acceso a logs del servidor

---

## 🗄️ Migración de Base de Datos

### Desde SQLite a PostgreSQL

1. **Exportar datos de SQLite**
   ```bash
   sqlite3 backend/data/bookings.db .dump > backup.sql
   ```

2. **Importar a PostgreSQL**
   ```bash
   psql $DATABASE_URL < backup.sql
   ```

### Ejecutar Migraciones en Producción

Las migraciones se ejecutan automáticamente durante el build si están configuradas correctamente.

Para ejecutarlas manualmente:
```bash
cd backend
npm run db:migrate
```

---

## 🎨 Deployment del Frontend

El frontend también necesita desplegarse en la nube. Tienes varias opciones:

### Opción 1: Render (Static Site)

1. **Crear Static Site en Render**
   - Click en "New" → "Static Site"
   - Conecta tu repositorio
   - Configura:
     - **Name**: milo-bookings-frontend
     - **Build Command**: `cd frontend/admin-panel && npm install && npm run build`
     - **Publish Directory**: `frontend/admin-panel/dist`

2. **Configurar Variables de Entorno**
   ```env
   VITE_API_URL=https://tu-backend-url.com
   ```

3. **Deploy**
   - Render construirá y desplegará automáticamente

### Opción 2: Vercel

1. **Conectar repositorio en Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio

2. **Configurar proyecto**
   - **Root Directory**: `frontend/admin-panel`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Variables de Entorno**
   ```env
   VITE_API_URL=https://tu-backend-url.com
   ```

### Opción 3: Netlify

Similar a Vercel, Netlify también soporta deployment de sitios estáticos.

### Opción 4: Mismo Servidor (Backend sirve Frontend)

Puedes configurar el backend para servir el frontend estático:

1. **Agregar middleware en Express**:
   ```javascript
   // En backend/src/api/server.js
   import express from 'express';
   import path from 'path';
   
   // Servir frontend estático
   app.use(express.static(path.join(__dirname, '../../frontend/admin-panel/dist')));
   
   // Fallback para SPA
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, '../../frontend/admin-panel/dist/index.html'));
   });
   ```

2. **Build del frontend antes del deploy**:
   ```bash
   cd frontend/admin-panel
   npm run build
   ```

---

## 🔍 Verificación Post-Deployment

### Backend

1. **Health Check**
   ```bash
   curl https://api.tu-dominio.com/health
   ```
   Debe retornar: `{"status":"ok","timestamp":"..."}`

2. **Verificar Bot de WhatsApp**
   - Revisa los logs del servidor
   - Deberías ver: "Bot ready for business..."
   - Si aparece QR, escanéalo con WhatsApp

3. **Probar API**
   ```bash
   curl https://api.tu-dominio.com/api/services
   ```

### Frontend

1. **Acceder al panel**
   - Abre `https://admin.tu-dominio.com`
   - Deberías ver la página de login

2. **Verificar conexión con backend**
   - Abre las DevTools del navegador (F12)
   - Ve a la pestaña Network
   - Intenta hacer login
   - Verifica que las requests vayan a la URL correcta del backend

3. **Verificar variables de entorno**
   - En la consola del navegador, verifica:
   ```javascript
   console.log(import.meta.env.VITE_API_URL);
   ```
   Debe mostrar la URL de tu backend

---

## 🐛 Troubleshooting

### Bot no se conecta

- Verifica que las sesiones se guarden correctamente
- Revisa los logs para errores de autenticación
- Considera usar WhatsApp Business API

### Base de datos no conecta

- Verifica `DATABASE_URL` en variables de entorno
- Asegúrate de que la base de datos esté activa
- Revisa que las migraciones se ejecutaron

### Sesiones se pierden

- En Heroku, usa storage externo (S3)
- En Railway/Render, verifica que el storage sea persistente
- Considera implementar backup de sesiones

### Frontend no se conecta al backend

- Verifica que `VITE_API_URL` esté configurada correctamente
- Asegúrate de que la URL del backend sea accesible públicamente
- Verifica CORS en el backend (debe incluir la URL del frontend)
- Revisa la consola del navegador para errores de CORS
- Verifica que el backend esté corriendo y accesible

### Errores de CORS

- Asegúrate de que `ALLOWED_ORIGINS` en el backend incluya la URL del frontend
- Verifica que ambas URLs usen HTTPS en producción
- Revisa que no haya trailing slashes en las URLs

---

## 📚 Recursos Adicionales

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Heroku Node.js Guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)

---

## ✅ Checklist de Deployment

### Backend
- [ ] Base de datos PostgreSQL configurada
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas
- [ ] Health check responde correctamente
- [ ] Bot de WhatsApp conectado
- [ ] CORS configurado con URL del frontend
- [ ] SSL/HTTPS habilitado
- [ ] Logs monitoreados

### Frontend
- [ ] Frontend desplegado (Render/Vercel/Netlify)
- [ ] Variable `VITE_API_URL` configurada con URL del backend
- [ ] Build exitoso sin errores
- [ ] Panel de administración accesible
- [ ] Conexión con backend verificada
- [ ] Login funciona correctamente
- [ ] SSL/HTTPS habilitado

### Integración
- [ ] Backend y Frontend comunicándose correctamente
- [ ] CORS permite requests del frontend
- [ ] Variables de entorno sincronizadas

---

**Última actualización**: Enero 2025

