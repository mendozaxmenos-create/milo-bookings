# 🚀 Guía Completa: Configuración de Meta WhatsApp Business API para Milo Bookings

Esta guía te llevará paso a paso para configurar Meta WhatsApp Business API y dejar funcionando Milo Bookings HOY.

---

## 📋 Índice

1. [Paso 1: Crear cuenta en Meta for Developers](#paso-1-crear-cuenta-en-meta-for-developers)
2. [Paso 2: Crear una App de WhatsApp Business](#paso-2-crear-una-app-de-whatsapp-business)
3. [Paso 3: Obtener las credenciales necesarias](#paso-3-obtener-las-credenciales-necesarias)
4. [Paso 4: Configurar variables de entorno](#paso-4-configurar-variables-de-entorno)
5. [Paso 5: Configurar el webhook](#paso-5-configurar-el-webhook)
6. [Paso 6: Probar el sistema](#paso-6-probar-el-sistema)
7. [Solución de problemas](#solución-de-problemas)

---

## 📱 Paso 1: Crear cuenta en Meta for Developers

### 1.1 Acceder a Meta for Developers

1. Ve a: **https://developers.facebook.com/**
2. Haz clic en **"Iniciar sesión"** o **"Log In"**
3. Inicia sesión con tu cuenta de Facebook (o crea una si no tienes)

### 1.2 Activar cuenta de desarrollador

1. Si es tu primera vez, acepta los términos y condiciones
2. Completa tu perfil de desarrollador si es necesario

---

## 🏢 Paso 2: Crear una App de WhatsApp Business

### 2.1 Crear nueva aplicación

1. En el dashboard de Meta for Developers, haz clic en **"Mis aplicaciones"** (arriba a la derecha)
2. Haz clic en **"Crear aplicación"** o **"Create App"**
3. Selecciona el tipo de aplicación: **"Negocio"** o **"Business"**
4. Haz clic en **"Siguiente"** o **"Next"**

### 2.2 Configurar la aplicación

1. **Nombre de la aplicación**: `Milo Bookings` (o el nombre que prefieras)
2. **Email de contacto**: Tu email
3. **Propósito comercial**: Selecciona **"Gestión de clientes"** o **"Customer Management"**
4. Haz clic en **"Crear aplicación"** o **"Create App"**

### 2.3 Agregar producto WhatsApp

1. En el dashboard de tu aplicación, busca **"WhatsApp"** en la lista de productos
2. Haz clic en **"Configurar"** o **"Set up"** junto a WhatsApp
3. Acepta los términos si aparece

---

## 🔑 Paso 3: Obtener las credenciales necesarias

Necesitarás 3 credenciales principales:

### 3.1 Phone Number ID

1. En el menú lateral, ve a **"WhatsApp"** → **"Configuración de API"** o **"API Setup"**
2. Busca la sección **"De:"** o **"From"**
3. Verás un número con un **Phone Number ID** debajo
4. **Copia este Phone Number ID** (ejemplo: `123456789012345`)

**📝 Guárdalo:** `WHATSAPP_PHONE_NUMBER_ID=123456789012345`

### 3.2 Access Token (Temporal - para desarrollo)

1. En la misma página **"Configuración de API"** o **"API Setup"**
2. Busca la sección **"Token de acceso temporal"** o **"Temporary access token"**
3. Haz clic en **"Copiar"** o **"Copy"** junto al token
4. Este token dura **24 horas** - necesitarás renovarlo o crear uno permanente después

**📝 Guárdalo:** `WHATSAPP_ACCESS_TOKEN=EAABwzLix...` (token largo)

### 3.3 Verify Token (Lo creas tú)

Este token lo crearás TÚ para verificar el webhook. Puede ser cualquier string secreto.

**📝 Crea uno:** `WHATSAPP_VERIFY_TOKEN=tu-token-secreto-super-seguro-2024`

💡 **Tip:** Puedes generar uno seguro con:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.4 Número de WhatsApp (Opcional - para display)

Si quieres mostrar el número en mensajes:

1. En **"WhatsApp"** → **"Configuración de API"**
2. Verás tu número de teléfono de WhatsApp Business
3. Copia el número sin el `+` y sin espacios

**📝 Guárdalo:** `WHATSAPP_NUMBER=5491123456789` (sin +)

---

## ⚙️ Paso 4: Configurar variables de entorno

### 4.1 Variables necesarias

Necesitas configurar estas variables en tu entorno (Render, Railway, Vercel, etc.):

```env
# Meta WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=tu-phone-number-id-aqui
WHATSAPP_ACCESS_TOKEN=tu-access-token-aqui
WHATSAPP_VERIFY_TOKEN=tu-verify-token-secreto-aqui
WHATSAPP_NUMBER=5491123456789

# Base de datos (ya deberías tenerla)
DATABASE_URL=postgresql://user:password@host:5432/milo_bookings

# Activar Meta API (desactiva bots de whatsapp-web.js)
USE_META_WHATSAPP_API=true
```

### 4.2 Configurar en Render

1. Ve a tu servicio en **Render Dashboard**
2. Ve a **"Environment"** en el menú lateral
3. Haz clic en **"Add Environment Variable"**
4. Agrega cada variable una por una:

   - **Key**: `WHATSAPP_PHONE_NUMBER_ID`
   - **Value**: El Phone Number ID que copiaste

   - **Key**: `WHATSAPP_ACCESS_TOKEN`
   - **Value**: El Access Token que copiaste

   - **Key**: `WHATSAPP_VERIFY_TOKEN`
   - **Value**: El token secreto que creaste

   - **Key**: `USE_META_WHATSAPP_API`
   - **Value**: `true`

5. Haz clic en **"Save Changes"** después de cada variable

### 4.3 Configurar localmente (para desarrollo)

Crea un archivo `.env` en la raíz del proyecto:

```env
WHATSAPP_PHONE_NUMBER_ID=tu-phone-number-id
WHATSAPP_ACCESS_TOKEN=tu-access-token
WHATSAPP_VERIFY_TOKEN=tu-verify-token
WHATSAPP_NUMBER=5491123456789
USE_META_WHATSAPP_API=true
DATABASE_URL=postgresql://...
```

---

## 🔗 Paso 5: Configurar el webhook

El webhook permite que Meta envíe mensajes entrantes a tu servidor.

### 5.1 Preparar la URL del webhook

Necesitas la URL pública de tu servidor. Ejemplos:

- **Render**: `https://tu-app.onrender.com/api/whatsapp/webhook`
- **Railway**: `https://tu-app.railway.app/api/whatsapp/webhook`
- **Local (usando ngrok)**: `https://tu-dominio.ngrok.io/api/whatsapp/webhook`

### 5.2 Configurar en Meta

1. Ve a **Meta for Developers** → Tu App → **"WhatsApp"** → **"Configuración"** o **"Configuration"**
2. Busca la sección **"Webhook"**
3. Haz clic en **"Editar"** o **"Edit"** o **"Configurar webhook"**

4. Completa los campos:

   - **URL de devolución de llamada** o **Callback URL**: 
     ```
     https://tu-dominio.com/api/whatsapp/webhook
     ```
   
   - **Token de verificación** o **Verify token**:
     ```
     tu-verify-token-secreto-aqui
     ```
     (Debe ser el mismo que `WHATSAPP_VERIFY_TOKEN`)

5. Haz clic en **"Verificar y guardar"** o **"Verify and Save"**

6. Meta intentará verificar tu webhook enviando una petición GET a tu servidor

7. Si todo está bien, verás ✅ **"Webhook verificado"** o **"Webhook verified"**

### 5.3 Suscribirse a eventos

1. En la misma página de configuración del webhook
2. Busca **"Campos de suscripción"** o **"Subscribe to fields"**
3. Selecciona los eventos que quieres recibir:

   - ✅ **messages** (obligatorio)
   - ✅ **message_status** (opcional, para ver estados de entrega)

4. Haz clic en **"Guardar"** o **"Save"**

---

## 🧪 Paso 6: Probar el sistema

### 6.1 Verificar que el webhook está funcionando

1. Ve a los logs de tu servidor (Render, Railway, etc.)
2. Deberías ver un mensaje como:
   ```
   [Webhook] ✅ Verificación recibida y validada
   ```

### 6.2 Agregar número de prueba (modo desarrollo)

En modo de desarrollo, Meta solo permite enviar mensajes a números agregados manualmente:

1. Ve a **Meta for Developers** → Tu App → **"WhatsApp"** → **"Configuración de API"**
2. Busca **"Números de teléfono de destinatarios"** o **"To"**
3. Haz clic en **"Administrar números de teléfono"** o **"Manage phone number list"**
4. Haz clic en **"Agregar número de teléfono"**
5. Ingresa tu número (con código de país, sin +)
6. Haz clic en **"Enviar código"** o **"Send code"**
7. Ingresa el código que recibiste por WhatsApp
8. Haz clic en **"Verificar"** o **"Verify"**

### 6.3 Enviar un mensaje de prueba

1. Desde tu número verificado, envía un mensaje de WhatsApp a tu número de WhatsApp Business
2. Deberías ver en los logs del servidor:
   ```
   [Webhook] Mensaje recibido de 5491123456789: "Hola"
   [BotService] Procesando mensaje...
   ```
3. El bot debería responder automáticamente

### 6.4 Verificar que el bot responde

Si el bot no responde, revisa:
- ✅ Que las variables de entorno estén configuradas correctamente
- ✅ Que el webhook esté verificado (✅ verde)
- ✅ Que tu número esté agregado a la lista de destinatarios
- ✅ Que `USE_META_WHATSAPP_API=true` esté configurado

---

## 🐛 Solución de problemas

### Problema: Webhook no se verifica

**Síntomas:**
- Meta muestra ❌ en la verificación del webhook
- Logs muestran error 403

**Soluciones:**

1. **Verificar que el Verify Token coincida:**
   - En Meta: El token que pusiste en "Token de verificación"
   - En tu servidor: El valor de `WHATSAPP_VERIFY_TOKEN`
   - Deben ser **exactamente iguales** (mayúsculas, minúsculas, espacios)

2. **Verificar que el endpoint esté funcionando:**
   ```bash
   curl https://tu-dominio.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=TU_TOKEN&hub.challenge=test
   ```
   Debería responder con `test`

3. **Verificar que el servidor esté accesible públicamente:**
   - Si estás en desarrollo local, usa **ngrok** o similar
   - El servidor debe ser accesible desde internet

### Problema: Bot no responde mensajes

**Síntomas:**
- Recibes mensajes pero el bot no responde
- Logs muestran errores al enviar

**Soluciones:**

1. **Verificar Access Token:**
   - Los tokens temporales expiran después de 24 horas
   - Genera uno nuevo en Meta for Developers
   - Actualiza `WHATSAPP_ACCESS_TOKEN` en tu servidor

2. **Verificar Phone Number ID:**
   - Asegúrate de que `WHATSAPP_PHONE_NUMBER_ID` sea correcto
   - Debe ser solo números, sin espacios ni caracteres especiales

3. **Verificar que el número esté en la lista:**
   - En modo desarrollo, solo puedes enviar a números agregados
   - Agrega tu número en "Números de teléfono de destinatarios"

### Problema: Error "Recipient phone number not in allowed list"

**Síntomas:**
- Logs muestran: `Recipient phone number not in allowed list`

**Solución:**
- En modo desarrollo, agrega el número manualmente en Meta
- En producción, todos los números funcionan automáticamente

### Problema: Token expirado

**Síntomas:**
- Logs muestran: `Error validating access token` o `Session has expired`

**Solución:**
1. Ve a Meta for Developers → Tu App → WhatsApp → Configuración de API
2. Genera un nuevo token temporal
3. O mejor: Crea un token permanente (requiere app aprobada)

---

## ✅ Checklist final

Antes de considerar todo listo, verifica:

- [ ] Cuenta en Meta for Developers creada
- [ ] App de WhatsApp Business creada
- [ ] Phone Number ID obtenido
- [ ] Access Token obtenido
- [ ] Verify Token creado
- [ ] Variables de entorno configuradas en el servidor
- [ ] `USE_META_WHATSAPP_API=true` configurado
- [ ] Webhook configurado en Meta
- [ ] Webhook verificado (✅ verde)
- [ ] Número de prueba agregado (si estás en desarrollo)
- [ ] Mensaje de prueba enviado y recibido
- [ ] Bot responde correctamente

---

## 🎉 ¡Listo!

Si completaste todos los pasos, tu sistema Milo Bookings ya está funcionando con Meta WhatsApp Business API.

**Próximos pasos:**
- Revisa los logs para asegurarte de que todo funciona
- Prueba el flujo completo de reservas
- Considera crear un token permanente (requiere aprobación de Meta)

**¿Necesitas ayuda?** Revisa la sección de solución de problemas o los logs de tu servidor.




