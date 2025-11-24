# 🛑 Cómo Desactivar los Bots en Render (Liberar Memoria)

## 🎯 **Problema**

Los bots actuales en Render consumen **toda la memoria** porque usan:
- `whatsapp-web.js` con **Puppeteer** (navegador Chromium)
- Cada bot necesita ~500MB-1GB de RAM
- Múltiples bots = memoria agotada

## ✅ **Solución Inmediata**

Agregar esta variable de entorno en **Render Dashboard**:

### En Render → Tu Servicio → Environment

Agregar:
```
USE_META_WHATSAPP_API=true
```

O alternativamente:
```
DISABLE_WHATSAPP_BOTS=true
```

## 🔄 **Qué Pasa Cuando Activas el Flag**

1. ✅ **Los bots NO se inicializan** al arrancar el servidor
2. ✅ **No se carga Puppeteer** (ahorra ~2-4GB de RAM)
3. ✅ **El servidor arranca más rápido**
4. ✅ **El panel de admin sigue funcionando** normalmente
5. ✅ **Los bots ahora funcionan en Vercel** (Serverless Functions)

## 📊 **Antes vs Después**

### Antes (con bots en Render):
```
Memoria usada: ~2-4GB
CPU: Alto (navegadores corriendo)
Tiempo de arranque: ~30-60 segundos
```

### Después (bots desactivados):
```
Memoria usada: ~200-500MB
CPU: Bajo (solo API Express)
Tiempo de arranque: ~5-10 segundos
```

## 🚀 **Pasos para Desactivar**

### 1. Ir a Render Dashboard
- Ve a tu servicio: `milo-bookings`
- Haz clic en **"Environment"** en el menú lateral

### 2. Agregar Variable de Entorno
- Haz clic en **"Add Environment Variable"**
- **Key**: `USE_META_WHATSAPP_API`
- **Value**: `true`
- Haz clic en **"Save Changes"**

### 3. Reiniciar el Servicio
- Render reiniciará automáticamente
- O haz clic en **"Manual Deploy"** → **"Deploy latest commit"**

### 4. Verificar en Logs
Deberías ver en los logs:
```
📱 [Init] ⚠️  Meta WhatsApp Business API está habilitada
📱 [Init] ⚠️  Los bots de whatsapp-web.js están DESACTIVADOS
📱 [Init] ✅ Los bots ahora se manejan en Vercel Serverless Functions
📱 [Init] 💾 Esto libera memoria en Render (no más Puppeteer)
```

## ⚠️ **Importante**

### Antes de Desactivar:
1. ✅ **Asegúrate de que el bot en Vercel esté funcionando**
2. ✅ **Configura el webhook en Meta**
3. ✅ **Prueba con un comercio de prueba**
4. ✅ **Verifica que los shortlinks funcionen**

### Después de Desactivar:
1. ✅ **Monitorea los logs** de Render (debería usar menos memoria)
2. ✅ **Monitorea los logs** de Vercel (debería recibir mensajes)
3. ✅ **Prueba el flujo completo** de reserva

## 🔄 **Revertir (Si Necesitas)**

Si necesitas volver a activar los bots viejos:

1. **Eliminar la variable** `USE_META_WHATSAPP_API` en Render
2. **O cambiar el valor** a `false`
3. **Reiniciar el servicio**

## 📝 **Notas**

- El código del bot viejo **NO se elimina**, solo se desactiva
- Puedes volver a activarlo en cualquier momento
- El panel de admin **NO se ve afectado**
- Todas las rutas de la API **siguen funcionando**

## 🎯 **Siguiente Paso**

Una vez que veas que el bot en Vercel funciona correctamente:

1. ✅ **Desactiva los bots en Render** (agregar variable)
2. ✅ **Monitorea la memoria** (debería bajar drásticamente)
3. ✅ **Prueba todo el flujo** para asegurarte de que funciona
4. ✅ **(Opcional) Eliminar código del bot viejo** más adelante

