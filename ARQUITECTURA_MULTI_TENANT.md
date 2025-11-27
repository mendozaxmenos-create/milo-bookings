# 🏗️ Arquitectura Multi-Tenant - Milo Bookings

## 📋 Concepto Central

**Milo Bookings utiliza un único número de WhatsApp (WABA) para múltiples comercios.**

Cada comercio tiene un **shortlink único** que no expone el número ni parámetros visibles.

### Ejemplo de Shortlink

```
https://go.soymilo.com/monpatisserie
```

Este shortlink redirige internamente a:

```
https://wa.me/<NUMERO_MILO>?text=monpatisserie
```

El parámetro `monpatisserie` identifica automáticamente al comercio.

**El usuario final nunca ve:**
- ❌ El número real de WhatsApp
- ❌ El slug del comercio
- ❌ Ningún parámetro visible

---

## 🔄 Flujo Completo

### 1. Usuario Toca el Shortlink

El usuario puede acceder desde:
- 📱 Celular (QR code, link directo)
- 🌐 Web (Instagram, Google Maps, sitio web)
- 📧 Email, SMS, etc.

### 2. Redirect Invisible

El shortlink hace un **redirect 301** invisible a `wa.me` con el slug:

```
https://go.soymilo.com/monpatisserie
  ↓ (redirect 301)
https://wa.me/5491123456789?text=monpatisserie
```

### 3. WhatsApp Abre Automáticamente

WhatsApp abre la conversación con el bot y envía automáticamente el mensaje `monpatisserie`.

### 4. Backend Recibe el Mensaje

El webhook de Meta (`/api/whatsapp/webhook`) recibe:
- **Número del usuario**: `5492615176403`
- **Mensaje**: `monpatisserie`
- **Metadata**: Información del mensaje

### 5. Identificación del Comercio

El backend:
1. Detecta que el mensaje contiene un slug (`monpatisserie`)
2. Busca el cliente en la tabla `clients` por slug
3. Verifica que el cliente esté activo

### 6. Creación/Continuación de Sesión

Se crea o continúa una sesión asociada:
- **user_phone**: `5492615176403`
- **client_slug**: `monpatisserie`
- **state**: `inicio` (o el estado actual)
- **data**: JSON con datos de la sesión

### 7. Conversación Continúa

La conversación continúa dentro del contexto del comercio correcto.

---

## 🗄️ Base de Datos

### Tabla: `clients`

Almacena los comercios/clientes que usan el bot.

```sql
clients
├── id (string, PK)
├── name (string) - Nombre del comercio
├── slug (string, unique) - Slug único para shortlink (ej: "monpatisserie")
├── business_id (string, FK) - Relación opcional con businesses existente
├── settings (json) - Configuración del comercio (horarios, mensajes, plantillas)
├── status (string) - active, inactive, suspended
├── created_at (timestamp)
└── updated_at (timestamp)
```

### Tabla: `sessions`

Almacena las sesiones de conversación entre usuarios y comercios.

```sql
sessions
├── id (string, PK)
├── user_phone (string) - Número de teléfono del usuario (sin +)
├── client_slug (string) - Slug del comercio
├── state (string) - Estado: inicio, eligiendo_fecha, eligiendo_horario, confirmando, finalizado
├── data (json) - Datos adicionales (servicio seleccionado, fecha, etc.)
├── created_at (timestamp)
└── updated_at (timestamp)
```

### Tabla: `bookings`

Almacena las reservas creadas.

```sql
bookings
├── id (string, PK)
├── client_id (string, FK) - ID del cliente/comercio
├── business_id (string, FK) - ID del negocio (opcional)
├── user_phone (string) - Número del usuario
├── datetime (timestamp) - Fecha y hora de la reserva
├── status (string) - pending, confirmed, completed, cancelled
├── notes (text) - Notas adicionales
└── ...
```

---

## 🔀 Manejo de Sesiones Multi-Tenant

### Caso 1: Usuario con Shortlink

1. Usuario toca `https://go.soymilo.com/monpatisserie`
2. WhatsApp envía mensaje: `monpatisserie`
3. Backend detecta slug → crea sesión para `monpatisserie`
4. Bot procesa mensaje en contexto de `monpatisserie`

### Caso 2: Usuario Sin Shortlink (Sesión Activa)

1. Usuario escribe mensaje sin slug
2. Backend busca sesión activa más reciente
3. Si encuentra sesión → continúa en ese contexto
4. Bot procesa mensaje en contexto del comercio de la sesión

### Caso 3: Usuario Sin Shortlink (Sin Sesión)

1. Usuario escribe mensaje sin slug
2. Backend busca sesión activa → no encuentra
3. Bot pregunta: "¿Con qué comercio querés continuar?"
4. Usuario responde con slug o nombre → se crea nueva sesión

### Ejemplo de Múltiples Sesiones

Un usuario puede tener múltiples sesiones activas:

```
Usuario: 5492615176403

Sesión A:
  - client_slug: monpatisserie
  - state: eligiendo_fecha
  - data: { service: "Consulta", ... }

Sesión B:
  - client_slug: peluqueria-carla
  - state: confirmando
  - data: { service: "Corte", date: "2025-11-28", ... }
```

Cada sesión es independiente y mantiene su propio estado.

---

## 🔌 Endpoints

### Backend (Render)

#### `/api/whatsapp/webhook`
- **GET**: Verificación del webhook por Meta
- **POST**: Recibe mensajes entrantes de Meta
- **Funcionalidad**:
  - Detecta slug en mensajes
  - Crea/actualiza sesiones
  - Procesa mensajes con el bot

### Frontend (Vercel Serverless Functions)

#### `/api/shortlink?slug=monpatisserie`
- **GET**: Redirige a `wa.me` con el slug
- **Funcionalidad**:
  - Verifica que el cliente existe
  - Crea URL de WhatsApp con slug
  - Hace redirect 301

#### `/api/clients/[slug]`
- **GET**: Obtiene configuración del comercio por slug
- **Funcionalidad**:
  - Devuelve información pública del comercio
  - No expone información sensible

#### `/api/shortlinks`
- **GET**: Lista todos los shortlinks activos
- **POST**: Crea nuevo shortlink (cliente)
- **Funcionalidad**:
  - Gestión de shortlinks desde el frontend

---

## 🤖 Lógica del Bot

### Máquina de Estados

El bot maneja estados simples:

1. **inicio**: Usuario acaba de iniciar o volvió al menú
2. **eligiendo_servicio**: Usuario está eligiendo un servicio
3. **eligiendo_fecha**: Usuario está eligiendo fecha
4. **eligiendo_horario**: Usuario está eligiendo horario
5. **confirmando**: Usuario está confirmando la reserva
6. **finalizado**: Reserva completada o cancelada

### Flujo de Reserva

```
inicio
  ↓ (usuario elige "Reservar")
eligiendo_servicio
  ↓ (usuario elige servicio)
eligiendo_fecha
  ↓ (usuario elige fecha)
eligiendo_horario
  ↓ (usuario elige horario)
confirmando
  ↓ (usuario confirma)
finalizado
```

### Detección de Slug

Cuando el bot recibe un mensaje:

1. **Si el mensaje es solo un slug** (ej: `monpatisserie`):
   - Establece el contexto del comercio
   - Crea/actualiza sesión con ese comercio
   - Envía mensaje de bienvenida

2. **Si el mensaje NO es un slug**:
   - Busca sesión activa
   - Si encuentra → procesa en ese contexto
   - Si no encuentra → pregunta qué comercio

---

## 📝 Implementación Actual

### ✅ Ya Implementado

- [x] Tabla `clients` (migración 022)
- [x] Tabla `sessions` (migración 023)
- [x] Servicio `ClientService`
- [x] Servicio `SessionService`
- [x] Webhook que detecta slugs
- [x] Bot que procesa mensajes con contexto
- [x] Shortlinks en Vercel (`/api/shortlink.js`)
- [x] Endpoint para listar/crear shortlinks (`/api/shortlinks.js`)
- [x] Endpoint para obtener cliente por slug (`/api/clients/[slug].js`)

### ⏳ Pendiente de Documentar

- [ ] Actualizar README con arquitectura multi-tenant
- [ ] Documentar flujo completo de shortlinks
- [ ] Explicar diferencia entre `businesses` y `clients`
- [ ] Guía de uso de shortlinks para comercios

---

## 🔗 Relación Businesses ↔️ Clients

### Businesses (Negocios)
- Sistema original de Milo Bookings
- Cada negocio tiene su propio número de WhatsApp (whatsapp-web.js)
- Panel de administración completo
- Configuración completa (servicios, horarios, etc.)

### Clients (Comercios)
- Sistema multi-tenant nuevo
- Múltiples comercios comparten un número de WhatsApp (Meta API)
- Relación opcional con `businesses` (un business puede tener múltiples clients)
- Configuración simplificada (settings JSON)

### Casos de Uso

**Caso 1: Business con múltiples Clients**
```
Business: "Milo Bookings SRL"
  ├── Client: "Mon Patisserie" (slug: monpatisserie)
  ├── Client: "Café Central" (slug: cafe-central)
  └── Client: "Restaurante XYZ" (slug: restaurante-xyz)
```

**Caso 2: Client independiente**
```
Client: "Peluquería Carla" (slug: peluqueria-carla)
  └── Sin business_id (independiente)
```

---

## 🎯 Objetivo

Esta arquitectura permite:

1. **Escalabilidad**: Un solo número de WhatsApp para múltiples comercios
2. **Simplicidad**: Los comercios solo necesitan un shortlink
3. **Privacidad**: El número real nunca se expone
4. **Flexibilidad**: Cada comercio mantiene su propia configuración
5. **Multi-tenant**: Un usuario puede interactuar con múltiples comercios

---

## 📚 Referencias

- **Migraciones**: `backend/database/migrations/022_create_clients.js`, `023_create_sessions.js`
- **Servicios**: `backend/src/services/clientService.js`, `sessionService.js`
- **Webhook**: `backend/src/api/routes/whatsapp.js`
- **Shortlinks**: `frontend/admin-panel/api/shortlink.js`, `shortlinks.js`
- **Bot**: `backend/src/services/botService.js`

---

**Esta arquitectura está completamente implementada y funcionando.** ✅

