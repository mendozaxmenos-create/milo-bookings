# ⚡ Inicio Rápido - Configurar Meta WhatsApp Business API

## 🎯 Resumen en 5 Pasos

### 1. Obtener credenciales de Meta (15 minutos)

Sigue la guía completa: **[GUIA_CONFIGURACION_META_API.md](./GUIA_CONFIGURACION_META_API.md)**

**Necesitas:**
- ✅ Phone Number ID
- ✅ Access Token (temporal por ahora)
- ✅ Verify Token (lo creas tú)

### 2. Configurar variables de entorno

En tu servidor (Render, Railway, etc.), agrega:

```env
USE_META_WHATSAPP_API=true
WHATSAPP_PHONE_NUMBER_ID=tu-phone-number-id
WHATSAPP_ACCESS_TOKEN=tu-access-token
WHATSAPP_VERIFY_TOKEN=tu-verify-token-secreto
WHATSAPP_NUMBER=5491123456789
```

### 3. Configurar webhook en Meta

1. Ve a: **Meta for Developers** → Tu App → **WhatsApp** → **Configuración**
2. URL del webhook: `https://tu-dominio.com/api/whatsapp/webhook`
3. Token de verificación: El mismo que `WHATSAPP_VERIFY_TOKEN`
4. Haz clic en **"Verificar y guardar"**

### 4. Agregar número de prueba (modo desarrollo)

En **Meta for Developers** → Tu App → **WhatsApp** → **Configuración de API**:
- Agrega tu número en **"Números de teléfono de destinatarios"**
- Verifica el código que recibas por WhatsApp

### 5. Probar

Envía un mensaje de WhatsApp a tu número de WhatsApp Business. El bot debería responder.

---

## ✅ Checklist Rápido

- [ ] Credenciales de Meta obtenidas
- [ ] Variables de entorno configuradas
- [ ] `USE_META_WHATSAPP_API=true` configurado
- [ ] Webhook configurado en Meta
- [ ] Webhook verificado (✅ verde)
- [ ] Número de prueba agregado
- [ ] Mensaje de prueba enviado
- [ ] Bot responde correctamente

---

## 🆘 Problemas Comunes

### Webhook no se verifica
→ Verifica que `WHATSAPP_VERIFY_TOKEN` coincida exactamente en Meta y en tu servidor

### Bot no responde
→ Verifica que `WHATSAPP_ACCESS_TOKEN` no esté expirado (renueva cada 24 horas)

### Error "Recipient phone number not in allowed list"
→ Agrega tu número en la lista de destinatarios permitidos en Meta

---

## 📖 Guía Completa

Para más detalles, ve a: **[GUIA_CONFIGURACION_META_API.md](./GUIA_CONFIGURACION_META_API.md)**

---

## 🎉 ¡Listo!

Si completaste todos los pasos, tu sistema Milo Bookings ya está funcionando con Meta WhatsApp Business API.

**Archivos importantes:**
- Webhook: `/api/whatsapp/webhook`
- Servicio: `backend/src/services/metaWhatsAppService.js`
- Rutas: `backend/src/api/routes/whatsapp.js`

