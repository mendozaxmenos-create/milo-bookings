# 📋 Resumen de Credenciales de Meta - Milo Bookings

Guarda esta información en un lugar seguro. Las necesitarás para configurar tu servidor.

---

## 🔑 Credenciales Necesarias

### 1. Phone Number ID
```
WHATSAPP_PHONE_NUMBER_ID=_________________________
```
**Dónde encontrarlo:**
- Meta for Developers → Tu App → WhatsApp → Configuración de API
- Sección "De:" → Debajo del número de teléfono

**Ejemplo:** `123456789012345`

---

### 2. Access Token (Temporal)
```
WHATSAPP_ACCESS_TOKEN=_________________________
```
**Dónde encontrarlo:**
- Meta for Developers → Tu App → WhatsApp → Configuración de API
- Sección "Token de acceso temporal"

**Ejemplo:** `EAABwzLixZBzFIBACZBLX...`

⚠️ **IMPORTANTE:** Este token expira después de 24 horas. Deberás renovarlo periódicamente.

---

### 3. Verify Token (Lo creas tú)
```
WHATSAPP_VERIFY_TOKEN=_________________________
```
**Cómo crearlo:**
```bash
# Generar uno seguro:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# O crear uno manualmente (ejemplo):
milo-bookings-verify-token-2024-secreto-super-seguro
```

⚠️ **IMPORTANTE:** Este mismo token lo usarás en Meta cuando configures el webhook.

---

### 4. Número de WhatsApp (Opcional)
```
WHATSAPP_NUMBER=_________________________
```
**Dónde encontrarlo:**
- Meta for Developers → Tu App → WhatsApp → Configuración de API
- Sección "De:" → El número de teléfono

**Formato:** Sin `+` y sin espacios
**Ejemplo:** `5491123456789`

---

## 📝 Variables de Entorno Completas

Copia estas variables y completa con tus valores:

```env
# Activar Meta WhatsApp API
USE_META_WHATSAPP_API=true

# Credenciales de Meta
WHATSAPP_PHONE_NUMBER_ID=_________________________
WHATSAPP_ACCESS_TOKEN=_________________________
WHATSAPP_VERIFY_TOKEN=_________________________
WHATSAPP_NUMBER=_________________________
```

---

## 🎯 URLs Importantes

### Panel de Meta for Developers
- **URL:** https://developers.facebook.com/apps/
- **Tu App:** https://developers.facebook.com/apps/TU_APP_ID/

### Configuración de WhatsApp
- **URL:** https://developers.facebook.com/apps/TU_APP_ID/whatsapp-business/wa-settings/

### Configuración de API
- **URL:** https://developers.facebook.com/apps/TU_APP_ID/whatsapp-business/wa-settings/api-setup/

---

## ⚠️ Recordatorios Importantes

### Access Token
- ⏰ **Expira:** Cada 24 horas (temporal)
- 🔄 **Renovar:** Ve a Configuración de API y copia el nuevo token
- 📝 **Actualizar:** Actualiza `WHATSAPP_ACCESS_TOKEN` en tu servidor

### Verify Token
- 🔒 **Secreto:** No lo compartas públicamente
- 🔄 **Mismo valor:** Debe ser el mismo en Meta y en tu servidor
- ✅ **Verificación:** Lo usarás para verificar el webhook

### Phone Number ID
- 🆔 **Único:** Cada número tiene su propio ID
- 📱 **Cambia:** Si cambias de número, cambia el ID
- ✅ **Estable:** Normalmente no cambia

---

## 🔄 Renovar Access Token

Cuando el token expire (después de 24 horas):

1. Ve a: Meta for Developers → Tu App → WhatsApp → Configuración de API
2. Busca: "Token de acceso temporal"
3. Haz clic en: "Copiar" o "Copy"
4. Actualiza la variable `WHATSAPP_ACCESS_TOKEN` en tu servidor
5. Reinicia tu servidor o espera a que se recargue

---

## 📞 Próximos Pasos

Una vez que tengas estas credenciales:

1. ✅ **Configurar variables en tu servidor** (Render, Railway, etc.)
2. ✅ **Configurar el webhook** en Meta
3. ✅ **Agregar números de prueba** (modo desarrollo)
4. ✅ **Probar** enviando un mensaje

**Ver guía completa:** `GUIA_CONFIGURACION_META_API.md`

---

## 🆘 Si Pierdes las Credenciales

### Phone Number ID
- Ve a: Configuración de API → Sección "De:" → Ver el ID

### Access Token
- Ve a: Configuración de API → Sección "Token de acceso temporal" → Copiar

### Verify Token
- Si lo perdiste, crea uno nuevo (pero deberás actualizarlo en Meta también)

---

**Guarda este archivo en un lugar seguro.** 🔒




