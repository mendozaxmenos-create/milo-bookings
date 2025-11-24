# 🚀 Configuración de Milo Bookings - Arquitectura Multi-Bot en Vercel

Este documento explica cómo configurar y desplegar el sistema multi-negocio de Milo Bookings usando Vercel Serverless Functions y WhatsApp Business API de Meta.

## 📋 Arquitectura

### Concepto Central

- **Un solo número de WhatsApp** (WABA - WhatsApp Business API)
- **Múltiples comercios** compartiendo el mismo número
- **Shortlinks enmascarados** que identifican automáticamente el comercio
- **Sesiones independientes** por usuario y comercio

### Flujo

1. Usuario toca shortlink: `https://go.soymilo.com/monpatisserie`
2. Shortlink redirige a: `https://wa.me/<NUMERO_MILO>?text=monpatisserie`
3. WhatsApp abre con el slug como primer mensaje
4. El bot detecta el slug y establece el contexto del comercio
5. La conversación continúa dentro del contexto correcto

## 🗄️ Base de Datos

### Nuevas Tablas

#### `clients`
- `id` (PK)
- `name` - Nombre del comercio
- `slug` - Slug único para shortlink (ej: "monpatisserie")
- `business_id` - Relación opcional con tabla `businesses` existente
- `settings` - JSON con configuración (horarios, mensajes, plantillas)
- `status` - active, inactive, suspended
- `created_at`, `updated_at`

#### `sessions`
- `id` (PK)
- `user_phone` - Número del usuario
- `client_slug` - Slug del comercio
- `state` - Estado de la sesión (inicio, eligiendo_servicio, eligiendo_fecha, etc.)
- `data` - JSON con datos de la sesión
- `created_at`, `updated_at`

### Migraciones

Ejecutar las migraciones:

```bash
cd backend
npm run db:migrate
```

Esto creará las tablas `clients` y `sessions`.

## 🔧 Configuración en Vercel

### Variables de Entorno

Configurar las siguientes variables en Vercel Dashboard → Settings → Environment Variables:

#### WhatsApp Business API (Meta)
```
WHATSAPP_VERIFY_TOKEN=<token-para-verificar-webhook>
WHATSAPP_PHONE_NUMBER_ID=<phone-number-id-de-meta>
WHATSAPP_ACCESS_TOKEN=<access-token-de-meta>
WHATSAPP_NUMBER=<numero-sin-+> (ej: 5491123456789)
```

#### Base de Datos
```
DATABASE_URL=<postgresql-connection-string>
```

#### Otros
```
SHORTLINK_BASE_URL=https://go.soymilo.com (opcional, para mostrar URLs en API)
NODE_ENV=production
```

### Configuración del Webhook en Meta

1. Ve a [Meta for Developers](https://developers.facebook.com/)
2. Selecciona tu app de WhatsApp Business
3. Ve a **Webhooks** → **Configuration**
4. Configura:
   - **Callback URL**: `https://tu-dominio.vercel.app/api/webhook`
   - **Verify Token**: El mismo valor que `WHATSAPP_VERIFY_TOKEN`
   - **Subscription Fields**: Marca `messages`

## 📁 Estructura de Archivos

```
milo-bookings/
├── api/                          # Vercel Serverless Functions
│   ├── webhook.js               # Webhook de Meta
│   ├── sendMessage.js           # Enviar mensajes
│   ├── shortlink.js             # Manejo de shortlinks
│   ├── clients/
│   │   └── [slug].js           # Obtener cliente por slug
│   └── shortlinks.js            # Gestionar shortlinks
├── backend/
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 022_create_clients.js
│   │   │   └── 023_create_sessions.js
│   │   └── models/
│   │       ├── Client.js
│   │       └── Session.js
│   └── src/
│       └── services/
│           ├── sessionService.js
│           ├── clientService.js
│           └── botService.js
├── vercel.json                   # Configuración de Vercel
└── frontend/admin-panel/        # Frontend (ya existente)
```

## 🚀 Despliegue

### 1. Preparar Base de Datos

```bash
cd backend
npm run db:migrate
```

### 2. Crear Comercios

Puedes crear comercios de dos formas:

#### Opción A: Desde la API

```bash
curl -X POST https://tu-dominio.vercel.app/api/shortlinks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mon Patisserie",
    "slug": "monpatisserie",
    "business_id": "business-id-existente",
    "settings": {
      "welcome_message": "¡Hola! Bienvenido a Mon Patisserie"
    }
  }'
```

#### Opción B: Directamente en la base de datos

```sql
INSERT INTO clients (id, name, slug, business_id, settings, status, created_at, updated_at)
VALUES (
  'client-001',
  'Mon Patisserie',
  'monpatisserie',
  'business-demo-business-001',
  '{"welcome_message": "¡Hola! Bienvenido a Mon Patisserie"}',
  'active',
  NOW(),
  NOW()
);
```

### 3. Configurar Shortlinks

Los shortlinks funcionan automáticamente gracias a `vercel.json`:

- `https://tu-dominio.vercel.app/monpatisserie` → Redirige a WhatsApp

### 4. Probar el Sistema

1. Abre el shortlink: `https://tu-dominio.vercel.app/monpatisserie`
2. Debería redirigir a WhatsApp con el número configurado
3. El bot debería recibir el mensaje con el slug
4. El bot debería responder con el menú del comercio

## 🔍 Endpoints Disponibles

### Webhook (Meta)
- `GET /api/webhook` - Verificación del webhook
- `POST /api/webhook` - Recibir mensajes

### Shortlinks
- `GET /monpatisserie` - Redirige a WhatsApp (rewrite automático)
- `GET /api/shortlink?slug=monpatisserie` - Mismo comportamiento

### Clientes
- `GET /api/clients/[slug]` - Obtener configuración de un cliente
- `GET /api/shortlinks` - Listar todos los shortlinks
- `POST /api/shortlinks` - Crear nuevo shortlink

### Mensajes
- `POST /api/sendMessage` - Enviar mensaje (uso interno)

## 🧪 Testing Local

Para probar localmente, puedes usar Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

Esto iniciará un servidor local que simula el entorno de Vercel.

## 📝 Notas Importantes

1. **Número de WhatsApp**: Debe estar verificado en Meta y tener acceso a WhatsApp Business API
2. **Límites de Meta**: Respeta los límites de rate limiting de Meta
3. **Sesiones**: Las sesiones se limpian automáticamente después de 30 días de inactividad
4. **Slugs**: Los slugs deben ser únicos y solo contener letras minúsculas, números y guiones

## 🐛 Troubleshooting

### El webhook no recibe mensajes
- Verifica que el webhook esté configurado correctamente en Meta
- Verifica que `WHATSAPP_VERIFY_TOKEN` coincida
- Revisa los logs de Vercel

### Los shortlinks no redirigen
- Verifica que `WHATSAPP_NUMBER` esté configurado
- Verifica que el cliente exista en la base de datos
- Revisa los logs de Vercel

### El bot no responde
- Verifica que `WHATSAPP_PHONE_NUMBER_ID` y `WHATSAPP_ACCESS_TOKEN` estén configurados
- Verifica que el comercio tenga `business_id` asociado
- Revisa los logs de Vercel

## 🔄 Migración desde Sistema Anterior

Si ya tienes datos en la tabla `businesses`, puedes asociarlos con `clients`:

```sql
INSERT INTO clients (id, name, slug, business_id, settings, status, created_at, updated_at)
SELECT 
  'client-' || id,
  name,
  LOWER(REPLACE(name, ' ', '-')),
  id,
  '{}',
  CASE WHEN is_active THEN 'active' ELSE 'inactive' END,
  created_at,
  updated_at
FROM businesses;
```

Esto creará un cliente por cada negocio existente, usando el nombre como slug (puedes ajustarlo después).

