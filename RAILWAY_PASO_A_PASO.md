# 🚂 Guía Paso a Paso: Deploy en Railway

## 📋 Pre-requisitos

✅ **Verificar que tienes:**
- [ ] Cuenta en Railway (https://railway.app)
- [ ] Railway CLI instalado (opcional, pero recomendado)
- [ ] Todos los archivos en git (verificado ✅)

## 🎯 Opción 1: Deploy desde GitHub (Recomendado)

### Paso 1: Mergear el PR a main

1. Ve a tu repositorio en GitHub: `https://github.com/mendozaxmenos-create/milo-bookings`
2. Abre el Pull Request `feat/logs-and-improvements`
3. Si el CI pasó, haz clic en **"Merge pull request"**
4. Confirma el merge

### Paso 2: Conectar Railway con GitHub

1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway para acceder a tus repositorios de GitHub
5. Selecciona el repositorio: `mendozaxmenos-create/milo-bookings`
6. Railway detectará automáticamente:
   - ✅ `Dockerfile` (para construir la imagen)
   - ✅ `railway.json` (configuración de Railway)

### Paso 3: Agregar Base de Datos PostgreSQL

1. En tu proyecto de Railway, haz clic en **"+ New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway creará automáticamente la variable `DATABASE_URL`
4. **IMPORTANTE**: Copia el valor de `DATABASE_URL` (lo necesitarás después)

### Paso 4: Configurar Variables de Entorno

1. En tu servicio principal (el que tiene el código), ve a **"Variables"**
2. Agrega estas variables **OBLIGATORIAS**:

```env
# Seguridad (OBLIGATORIO)
JWT_SECRET=tu-clave-super-secreta-minimo-32-caracteres-aleatorios-2024

# Entorno
NODE_ENV=production

# Base de datos (Railway la crea automáticamente, pero verifica que esté)
DATABASE_URL=postgresql://... (ya está configurada por Railway)
```

3. **Opcional - Si usas MercadoPago:**
```env
MERCADOPAGO_ACCESS_TOKEN=tu_access_token
MERCADOPAGO_PUBLIC_KEY=tu_public_key
MERCADOPAGO_PRODUCTION=true
WEBHOOK_BASE_URL=https://tu-app.railway.app
MP_SUCCESS_URL=https://tu-app.railway.app/payments/success
MP_FAILURE_URL=https://tu-app.railway.app/payments/failure
MP_PENDING_URL=https://tu-app.railway.app/payments/pending
```

4. **Opcional - Si tienes frontend separado:**
```env
ALLOWED_ORIGINS=https://tu-frontend.com
```

### Paso 5: Configurar Dominio Público

1. En la configuración del servicio, ve a **"Settings"** → **"Networking"**
2. Haz clic en **"Generate Domain"**
3. Railway te dará una URL como: `https://tu-app.up.railway.app`
4. **Copia esta URL** (la necesitarás para webhooks de MercadoPago)

### Paso 6: Esperar el Deploy

1. Railway comenzará a construir automáticamente
2. Puedes ver el progreso en la pestaña **"Deployments"**
3. El primer deploy puede tardar 5-10 minutos
4. Revisa los logs en tiempo real para ver:
   - ✅ Migraciones ejecutadas
   - ✅ Bot inicializado
   - ✅ Servidor corriendo en puerto 3000

### Paso 7: Verificar que Funciona

1. Prueba el health check:
   ```
   https://tu-app.railway.app/health
   ```
   Debería responder: `{"status":"ok","timestamp":"..."}`

2. Verifica los logs en Railway para asegurarte de que no hay errores

---

## 🎯 Opción 2: Deploy con Railway CLI (Sin GitHub)

### Paso 1: Instalar Railway CLI

```bash
# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex

# O con npm
npm install -g @railway/cli
```

### Paso 2: Login en Railway

```bash
railway login
```

### Paso 3: Inicializar Proyecto

```bash
# Navega a tu proyecto
cd C:\Users\gusta\Desktop\milo-bookings

# Inicializa Railway
railway init

# Selecciona "Create a new project" o "Link to existing project"
```

### Paso 4: Agregar Base de Datos

```bash
railway add postgresql
```

Esto creará automáticamente la variable `DATABASE_URL`

### Paso 5: Configurar Variables de Entorno

```bash
# Variables obligatorias
railway variables set JWT_SECRET=tu-clave-super-secreta-minimo-32-caracteres
railway variables set NODE_ENV=production

# Si usas MercadoPago
railway variables set MERCADOPAGO_ACCESS_TOKEN=tu_token
railway variables set MERCADOPAGO_PUBLIC_KEY=tu_public_key
railway variables set MERCADOPAGO_PRODUCTION=true
```

### Paso 6: Hacer Deploy

```bash
railway up
```

Esto subirá tu código y Railway construirá la imagen Docker automáticamente.

### Paso 7: Ver Logs

```bash
railway logs
```

### Paso 8: Generar Dominio Público

```bash
railway domain
```

O desde el dashboard de Railway, ve a Settings → Networking → Generate Domain

---

## 🔍 Verificación Post-Deploy

### 1. Verificar Health Check

```bash
curl https://tu-app.railway.app/health
```

### 2. Verificar Logs

En Railway Dashboard → Deployments → Click en el último deploy → Ver logs

Busca:
- ✅ `🚀 Milo Bookings Backend running on port 3000`
- ✅ `📊 Ejecutando migraciones de base de datos...`
- ✅ `✅ Bot inicializado para: ...`

### 3. Verificar Base de Datos

Los logs deberían mostrar que las migraciones se ejecutaron correctamente.

### 4. Verificar Bot de WhatsApp

- La primera vez, el bot necesitará escanear el QR code
- Revisa los logs para ver el QR o usa el endpoint: `GET /api/bot/:business_id/qr`

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Verifica que la base de datos PostgreSQL esté corriendo
- Verifica que `DATABASE_URL` esté configurada correctamente
- Revisa los logs del servicio de base de datos

### Error: "Puppeteer failed to launch"
- Ya está configurado en el Dockerfile
- Verifica que `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` esté en las variables

### El bot no inicia
- Revisa los logs del servicio
- La primera vez necesitarás escanear el QR code
- Verifica que `MILO_BOT_SESSION_PATH` esté configurado si reutilizas sesión

### Migraciones no se ejecutan
- Verifica los logs al iniciar el contenedor
- El `docker-entrypoint.sh` debería ejecutarse automáticamente
- Revisa que el script tenga permisos de ejecución (ya está en Dockerfile)

### Build falla
- Verifica que todos los archivos estén en git
- Revisa los logs de build en Railway
- Asegúrate de que `package.json` y `Dockerfile` estén en la raíz

---

## 📝 Checklist Final

Antes de considerar el deploy completo:

- [ ] Proyecto creado en Railway
- [ ] Repositorio conectado (o código subido vía CLI)
- [ ] Base de datos PostgreSQL agregada
- [ ] Variables de entorno configuradas:
  - [ ] `JWT_SECRET` (mínimo 32 caracteres)
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL` (automático)
- [ ] Dominio público generado
- [ ] Deploy completado exitosamente
- [ ] Health check responde correctamente
- [ ] Logs muestran que el servidor está corriendo
- [ ] Migraciones ejecutadas (verificar en logs)
- [ ] Bot inicializado (si aplica)

---

## 🚀 Siguiente Paso Después del Deploy

Una vez que Railway esté funcionando:

1. **Acceder al panel de admin:**
   - URL: `https://tu-app.railway.app`
   - Login con credenciales del seed: `demo-business-001` / `+5491123456789` / `demo123`

2. **Configurar webhooks de MercadoPago:**
   - En MercadoPago, configura el webhook: `https://tu-app.railway.app/api/payments/webhook`

3. **Configurar el bot de WhatsApp:**
   - La primera vez, escanea el QR code desde el panel de admin
   - O revisa los logs para ver el QR

4. **Crear tu primer negocio desde el super admin panel**

---

## 💡 Tips

- Railway tiene un plan gratuito generoso para empezar
- Los logs se actualizan en tiempo real
- Puedes hacer rollback a deployments anteriores si algo falla
- Railway expone automáticamente HTTPS (no necesitas configurar SSL)
- El dominio público es gratuito pero puedes usar un dominio personalizado

---

**¿Listo para desplegar?** Sigue los pasos de la opción que prefieras (GitHub o CLI) y verifica cada paso antes de continuar al siguiente.


