# 🚀 Guía Completa Paso a Paso - Migración a Bot Multi-Negocio

Esta guía te llevará de principio a fin para migrar de los bots en Render (que consumen memoria) a la nueva arquitectura en Vercel con Meta WhatsApp Business API.

---

## 📋 **Índice**

1. [Paso 1: Obtener Credenciales de Meta WhatsApp Business API](#paso-1-obtener-credenciales-de-meta)
2. [Paso 2: Configurar Variables de Entorno en Vercel](#paso-2-configurar-variables-en-vercel)
3. [Paso 3: Configurar Webhook en Meta](#paso-3-configurar-webhook-en-meta)
4. [Paso 4: Ejecutar Migraciones de Base de Datos](#paso-4-ejecutar-migraciones)
5. [Paso 5: Migrar Businesses Existentes a Clients](#paso-5-migrar-businesses-a-clients)
6. [Paso 6: Probar el Sistema](#paso-6-probar-el-sistema)
7. [Paso 7: Desactivar Bots en Render](#paso-7-desactivar-bots-en-render)
8. [Paso 8: Verificar y Monitorear](#paso-8-verificar-y-monitorear)

---

## 📱 **Paso 1: Obtener Credenciales de Meta WhatsApp Business API**

### 1.1 Crear Cuenta en Meta for Developers

1. Ve a: https://developers.facebook.com/
2. Inicia sesión con tu cuenta de Facebook (o crea una)
3. Haz clic en **"My Apps"** (arriba a la derecha)
4. Haz clic en **"Create App"**

### 1.2 Crear Aplicación

1. Selecciona **"Business"** como tipo de app
2. Haz clic en **"Next"**
3. Completa:
   - **App Name**: `Milo Bookings` (o el nombre que prefieras)
   - **App Contact Email**: Tu email
4. Haz clic en **"Create App"**

### 1.3 Agregar Producto WhatsApp

1. En el dashboard de tu app, busca **"WhatsApp"** en la lista de productos
2. Haz clic en **"Set up"** o **"Add Product"**
3. Selecciona **"WhatsApp Business API"**

### 1.4 Obtener Credenciales

Necesitas obtener estos valores:

#### A. Phone Number ID

1. En el menú lateral, ve a **"WhatsApp"** → **"API Setup"**
2. Busca **"Phone number ID"**
3. **Copia este número** (ej: `123456789012345`)

#### B. Access Token

1. En la misma página, busca **"Temporary access token"**
2. Haz clic en **"Generate token"** o **"Copy"**
3. **Copia el token** (ej: `EAABwzLix...` muy largo)
4. ⚠️ **IMPORTANTE**: Este token es temporal (24 horas). Más adelante necesitarás un token permanente.

#### C. Verify Token (Tú lo creas)

1. **Crea un token aleatorio** (puede ser cualquier string)
2. Ejemplo: `milo-bookings-verify-token-2025`
3. **Guárdalo** - lo usarás en el webhook

#### D. WhatsApp Number

1. En **"API Setup"**, busca **"From"** o **"Phone number"**
2. **Copia el número** sin el `+` (ej: `5491123456789`)

### 1.5 Guardar Credenciales

Guarda estas credenciales en un lugar seguro:

```
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAABwzLix...
WHATSAPP_VERIFY_TOKEN=milo-bookings-verify-token-2025
WHATSAPP_NUMBER=5491123456789
```

---

## ⚙️ **Paso 2: Configurar Variables de Entorno en Vercel**

### 2.1 Ir a Vercel Dashboard

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto: `milo-bookings` (o el nombre que tenga)

### 2.2 Agregar Variables de Entorno

1. Ve a **"Settings"** (arriba)
2. Haz clic en **"Environment Variables"** (menú lateral)
3. Agrega cada variable una por una:

#### Variable 1: WHATSAPP_VERIFY_TOKEN
- **Name**: `WHATSAPP_VERIFY_TOKEN`
- **Value**: El token que creaste (ej: `milo-bookings-verify-token-2025`)
- **Environment**: Marca todas (Production, Preview, Development)
- Haz clic en **"Save"**

#### Variable 2: WHATSAPP_PHONE_NUMBER_ID
- **Name**: `WHATSAPP_PHONE_NUMBER_ID`
- **Value**: El Phone Number ID de Meta (ej: `123456789012345`)
- **Environment**: Marca todas
- Haz clic en **"Save"**

#### Variable 3: WHATSAPP_ACCESS_TOKEN
- **Name**: `WHATSAPP_ACCESS_TOKEN`
- **Value**: El Access Token de Meta (el token largo)
- **Environment**: Marca todas
- Haz clic en **"Save"**

#### Variable 4: WHATSAPP_NUMBER
- **Name**: `WHATSAPP_NUMBER`
- **Value**: El número sin `+` (ej: `5491123456789`)
- **Environment**: Marca todas
- Haz clic en **"Save"**

#### Variable 5: DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: La misma URL de PostgreSQL que usas en Render
  - Puedes copiarla de Render Dashboard → Environment
  - Formato: `postgresql://user:password@host:port/database`
- **Environment**: Marca todas
- Haz clic en **"Save"**

#### Variable 6: SHORTLINK_BASE_URL (Opcional)
- **Name**: `SHORTLINK_BASE_URL`
- **Value**: Tu dominio de Vercel (ej: `https://milo-bookings.vercel.app`)
- **Environment**: Marca todas
- Haz clic en **"Save"**

### 2.3 Verificar Variables

Deberías tener estas variables configuradas:
- ✅ `WHATSAPP_VERIFY_TOKEN`
- ✅ `WHATSAPP_PHONE_NUMBER_ID`
- ✅ `WHATSAPP_ACCESS_TOKEN`
- ✅ `WHATSAPP_NUMBER`
- ✅ `DATABASE_URL`
- ✅ `SHORTLINK_BASE_URL` (opcional)

---

## 🔗 **Paso 3: Configurar Webhook en Meta**

### 3.1 Obtener URL del Webhook

Tu webhook estará en:
```
https://tu-dominio.vercel.app/api/webhook
```

Reemplaza `tu-dominio.vercel.app` con tu dominio real de Vercel.

### 3.2 Configurar en Meta

1. Ve a Meta for Developers → Tu App → **"WhatsApp"** → **"Configuration"**
2. Busca la sección **"Webhook"**
3. Haz clic en **"Edit"** o **"Add Callback URL"**
4. Completa:
   - **Callback URL**: `https://tu-dominio.vercel.app/api/webhook`
   - **Verify Token**: El mismo que `WHATSAPP_VERIFY_TOKEN` (ej: `milo-bookings-verify-token-2025`)
5. Haz clic en **"Verify and Save"**

### 3.3 Suscribirse a Eventos

1. En la misma página, busca **"Webhook fields"** o **"Subscription fields"**
2. Marca estos campos:
   - ✅ `messages`
   - ✅ `message_status` (opcional, para estados de entrega)
3. Haz clic en **"Save"**

### 3.4 Verificar que Funciona

1. Meta intentará verificar el webhook automáticamente
2. Si ves un ✅ verde, está funcionando
3. Si ves un ❌ rojo, verifica:
   - Que el webhook esté desplegado en Vercel
   - Que el `WHATSAPP_VERIFY_TOKEN` coincida exactamente

---

## 🗄️ **Paso 4: Ejecutar Migraciones de Base de Datos**

### 4.1 Conectarte a la Base de Datos

Tienes dos opciones:

#### Opción A: Desde Render (Recomendado)

1. Ve a Render Dashboard → Tu Base de Datos PostgreSQL
2. Haz clic en **"Connect"** o **"Info"**
3. Copia la **"Internal Database URL"** o **"External Database URL"**

#### Opción B: Desde tu Computadora Local

1. Instala PostgreSQL client o usa `psql`
2. Conéctate usando la URL de Render

### 4.2 Ejecutar Migraciones

#### Desde Render (Backend)

1. Ve a Render Dashboard → Tu Servicio Backend
2. Ve a **"Shell"** o abre una terminal
3. Ejecuta:
   ```bash
   cd backend
   npm run db:migrate
   ```

#### Desde tu Computadora Local

1. Abre terminal en la carpeta del proyecto
2. Configura `DATABASE_URL`:
   ```bash
   export DATABASE_URL="postgresql://user:password@host:port/database"
   ```
3. Ejecuta:
   ```bash
   cd backend
   npm run db:migrate
   ```

### 4.3 Verificar que se Crearon las Tablas

Ejecuta en la base de datos:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('clients', 'sessions');
```

Deberías ver:
- ✅ `clients`
- ✅ `sessions`

---

## 🔄 **Paso 5: Migrar Businesses Existentes a Clients**

Voy a crear un script para hacer esto automáticamente.

### 5.1 Crear Script de Migración

El script estará en: `backend/scripts/migrate-businesses-to-clients.js`

### 5.2 Ejecutar el Script

#### Desde Render (Backend)

1. Ve a Render Dashboard → Tu Servicio Backend
2. Ve a **"Shell"**
3. Ejecuta:
   ```bash
   cd backend
   node scripts/migrate-businesses-to-clients.js
   ```

#### Desde tu Computadora Local

1. Configura `DATABASE_URL`
2. Ejecuta:
   ```bash
   cd backend
   node scripts/migrate-businesses-to-clients.js
   ```

### 5.3 Verificar Resultados

El script mostrará:
- Cuántos businesses se migraron
- Los slugs generados
- Cualquier error

---

## 🧪 **Paso 6: Probar el Sistema**

### 6.1 Verificar que el Webhook Funciona

1. Ve a Meta for Developers → Tu App → **"WhatsApp"** → **"Configuration"**
2. Busca **"Webhook"**
3. Debería mostrar ✅ **"Verified"**

### 6.2 Probar Shortlink

1. Obtén el slug de un cliente (ej: `monpatisserie`)
2. Abre en el navegador:
   ```
   https://tu-dominio.vercel.app/monpatisserie
   ```
3. Debería redirigir a WhatsApp
4. El mensaje inicial debería ser el slug (ej: `monpatisserie`)

### 6.3 Probar Bot

1. Desde WhatsApp, envía un mensaje al número configurado
2. El bot debería responder con el menú del comercio
3. Verifica en los logs de Vercel que recibió el mensaje

### 6.4 Verificar en Base de Datos

Ejecuta:
```sql
SELECT * FROM sessions ORDER BY created_at DESC LIMIT 5;
```

Deberías ver sesiones creadas cuando los usuarios envían mensajes.

---

## 🛑 **Paso 7: Desactivar Bots en Render**

### 7.1 Agregar Variable en Render

1. Ve a Render Dashboard → Tu Servicio Backend
2. Ve a **"Environment"** (menú lateral)
3. Haz clic en **"Add Environment Variable"**
4. Completa:
   - **Key**: `USE_META_WHATSAPP_API`
   - **Value**: `true`
5. Haz clic en **"Save Changes"**

### 7.2 Reiniciar Servicio

1. Render reiniciará automáticamente
2. O haz clic en **"Manual Deploy"** → **"Deploy latest commit"**

### 7.3 Verificar en Logs

En los logs de Render, deberías ver:
```
📱 [Init] ⚠️  Meta WhatsApp Business API está habilitada
📱 [Init] ⚠️  Los bots de whatsapp-web.js están DESACTIVADOS
📱 [Init] ✅ Los bots ahora se manejan en Vercel Serverless Functions
📱 [Init] 💾 Esto libera memoria en Render (no más Puppeteer)
```

### 7.4 Verificar Memoria

1. Ve a Render Dashboard → Tu Servicio
2. Ve a **"Metrics"**
3. La memoria debería haber bajado de ~2-4GB a ~200-500MB

---

## ✅ **Paso 8: Verificar y Monitorear**

### 8.1 Checklist Final

- [ ] Webhook verificado en Meta (✅ verde)
- [ ] Shortlinks redirigen correctamente
- [ ] Bot responde mensajes
- [ ] Sesiones se crean en la BD
- [ ] Bots desactivados en Render
- [ ] Memoria bajó en Render
- [ ] Panel de admin funciona normalmente

### 8.2 Monitoreo Continuo

#### Logs de Vercel
- Ve a Vercel Dashboard → Tu Proyecto → **"Functions"**
- Revisa logs de `/api/webhook` para ver mensajes recibidos

#### Logs de Render
- Verifica que no haya errores
- Verifica que la memoria se mantenga baja

#### Base de Datos
- Monitorea la tabla `sessions` para ver actividad
- Monitorea la tabla `bookings` para ver reservas creadas

---

## 🆘 **Troubleshooting**

### El webhook no se verifica

**Problema**: Meta muestra ❌ en la verificación del webhook

**Solución**:
1. Verifica que el webhook esté desplegado en Vercel
2. Verifica que `WHATSAPP_VERIFY_TOKEN` coincida exactamente
3. Revisa los logs de Vercel para ver errores

### Los shortlinks no redirigen

**Problema**: Al abrir un shortlink, no pasa nada o da error

**Solución**:
1. Verifica que `WHATSAPP_NUMBER` esté configurado
2. Verifica que el cliente exista en la BD:
   ```sql
   SELECT * FROM clients WHERE slug = 'monpatisserie';
   ```
3. Revisa los logs de Vercel

### El bot no responde

**Problema**: Envío mensaje pero el bot no responde

**Solución**:
1. Verifica que `WHATSAPP_ACCESS_TOKEN` sea válido (no expirado)
2. Verifica que `WHATSAPP_PHONE_NUMBER_ID` sea correcto
3. Revisa los logs de Vercel para ver si recibió el mensaje
4. Verifica que el cliente tenga `business_id` asociado

### Error de memoria en Render

**Problema**: Render sigue usando mucha memoria

**Solución**:
1. Verifica que `USE_META_WHATSAPP_API=true` esté configurado
2. Verifica en los logs que los bots no se inicializan
3. Reinicia el servicio en Render

---

## 📞 **Siguiente Paso**

Una vez completados todos los pasos, tendrás:
- ✅ Bot multi-negocio funcionando en Vercel
- ✅ Memoria liberada en Render
- ✅ Sistema escalable para muchos bots
- ✅ Shortlinks funcionando

¿Necesitas ayuda con algún paso específico? Dime en cuál estás y te ayudo a resolverlo.

