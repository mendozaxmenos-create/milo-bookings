# 🔍 Cómo Verificar que el Webhook Funciona

## Paso 1: Probar el endpoint manualmente

Abre esta URL en tu navegador (reemplaza con tu token):

```
https://milo-bookings.onrender.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=milo-bookings-verify-2024-secreto&hub.challenge=test123
```

### ¿Qué deberías ver?

**✅ Si funciona correctamente:**
- Deberías ver solo: `test123`
- Sin páginas de error, sin JSON, solo el texto `test123`

**❌ Si no funciona:**
- Verás un error 403 (Forbidden)
- O un error 500 (Internal Server Error)
- O una página de error de Render

---

## Paso 2: Verificar variables de entorno en Render

1. Ve a Render Dashboard → tu servicio → Environment
2. Verifica que estas variables existan:
   - `USE_META_WHATSAPP_API=true`
   - `WHATSAPP_VERIFY_TOKEN=milo-bookings-verify-2024-secreto` (debe coincidir EXACTAMENTE)

---

## Paso 3: Verificar logs del servidor

1. En Render Dashboard → tu servicio → Logs
2. Intenta verificar el webhook nuevamente en Meta
3. Deberías ver en los logs algo como:
   ```
   [Webhook] Verificación recibida: ...
   [Webhook] ✅ Webhook verificado correctamente
   ```

---

## Paso 4: Problemas comunes y soluciones

### Problema: Error 403 (Forbidden)

**Causa:** El token no coincide

**Solución:**
- Verifica que `WHATSAPP_VERIFY_TOKEN` en Render sea EXACTAMENTE igual al que pusiste en Meta
- Verifica que no haya espacios extra o diferencias de mayúsculas/minúsculas
- Asegúrate de que el servidor se haya reiniciado después de agregar la variable

### Problema: Error 500 (Internal Server Error)

**Causa:** Hay un error en el código del webhook

**Solución:**
- Revisa los logs de Render para ver el error específico
- Verifica que el código del webhook esté correctamente desplegado

### Problema: No responde / Timeout

**Causa:** El servidor no está corriendo o el endpoint no existe

**Solución:**
- Verifica que el servicio esté activo en Render
- Verifica que la URL del webhook sea correcta: `/api/whatsapp/webhook`
- Verifica que el código esté desplegado correctamente

---

## Paso 5: Verificar que el código esté desplegado

Asegúrate de que el código del webhook esté en el repositorio:

- `backend/src/api/routes/whatsapp.js` - Debe existir
- `backend/src/api/server.js` - Debe tener la ruta registrada

Si acabas de agregar el código, haz un commit y push para que Render lo despliegue.




