# 🔄 Plan de Migración: Bot de Render a Vercel

## 🎯 **Problema Actual**

El bot actual en Render está consumiendo **toda la memoria** porque:
- Usa `whatsapp-web.js` con **Puppeteer** (navegador headless)
- Cada bot necesita su propia instancia de Chromium
- Múltiples bots = múltiples instancias = **memoria agotada**

## ✅ **Solución: Meta WhatsApp Business API**

La nueva arquitectura usa **Meta WhatsApp Business API** que:
- ✅ **No usa Puppeteer**: No necesita navegador
- ✅ **Serverless**: Solo se ejecuta cuando recibe mensajes
- ✅ **Sin memoria persistente**: Cada función es independiente
- ✅ **Escalable**: Puede manejar miles de bots sin problemas

## 📊 **Comparación**

| Aspecto | Bot Actual (Render) | Bot Nuevo (Vercel) |
|---------|-------------------|-------------------|
| **Tecnología** | whatsapp-web.js + Puppeteer | Meta WhatsApp Business API |
| **Memoria** | ~500MB-1GB por bot | ~50MB por función |
| **CPU** | Constante (navegador corriendo) | Solo cuando recibe mensajes |
| **Escalabilidad** | Limitada (memoria) | Ilimitada (serverless) |
| **Costo** | Alto (servidor siempre activo) | Bajo (pago por uso) |
| **Mantenimiento** | QR codes, reconexiones | Automático (Meta maneja) |

## 🚀 **Plan de Migración**

### **Fase 1: Preparación (Ahora)**

1. ✅ **Crear estructura en Vercel** (YA HECHO)
   - Serverless Functions para webhook
   - Sistema de sesiones
   - Sistema de clients

2. ✅ **Migraciones de base de datos** (YA HECHO)
   - Tabla `clients`
   - Tabla `sessions`

3. **Configurar Meta WhatsApp Business API**
   - Obtener credenciales de Meta
   - Configurar webhook en Vercel
   - Probar con un comercio de prueba

### **Fase 2: Migración Gradual**

#### Paso 1: Desactivar Bot Viejo en Render

**Opción A: Desactivar completamente**
```javascript
// backend/src/index.js
// Comentar o eliminar la inicialización de bots
// async function initializeBots() {
//   // ... código comentado
// }
```

**Opción B: Agregar flag de control**
```javascript
// backend/src/index.js
async function initializeBots() {
  // Solo inicializar si NO estamos usando Meta API
  if (process.env.USE_META_WHATSAPP_API === 'true') {
    console.log('[Bots] Meta WhatsApp API enabled, skipping whatsapp-web.js bots');
    return;
  }
  
  // ... código existente
}
```

#### Paso 2: Migrar Comercios a la Nueva Arquitectura

Para cada comercio existente:

1. **Crear cliente en tabla `clients`**:
   ```sql
   INSERT INTO clients (id, name, slug, business_id, settings, status, created_at, updated_at)
   VALUES (
     'client-' || business_id,
     (SELECT name FROM businesses WHERE id = business_id),
     LOWER(REPLACE((SELECT name FROM businesses WHERE id = business_id), ' ', '-')),
     business_id,
     '{}',
     'active',
     NOW(),
     NOW()
   );
   ```

2. **Obtener credenciales de Meta** (si no las tienes):
   - Ir a [Meta for Developers](https://developers.facebook.com/)
   - Crear app de WhatsApp Business
   - Obtener `WHATSAPP_PHONE_NUMBER_ID` y `WHATSAPP_ACCESS_TOKEN`

3. **Configurar webhook en Meta**:
   - URL: `https://tu-dominio.vercel.app/api/webhook`
   - Verify Token: El mismo que `WHATSAPP_VERIFY_TOKEN`

#### Paso 3: Probar con un Comercio

1. Crear shortlink: `https://tu-dominio.vercel.app/monpatisserie`
2. Probar que redirige a WhatsApp
3. Enviar mensaje y verificar que el bot responde
4. Verificar que se crea la sesión en la BD

### **Fase 3: Desactivación Completa**

Una vez que todos los comercios estén migrados:

1. **Desactivar bots en Render**:
   ```bash
   # En Render Dashboard → Environment Variables
   USE_META_WHATSAPP_API=true
   ```

2. **Eliminar código del bot viejo** (opcional, para limpiar):
   - `backend/src/bot/` (carpeta completa)
   - `backend/src/services/qrStorage.js`
   - `backend/src/services/sessionStorage.js` (el viejo)
   - Rutas `/api/bot` (opcional, o mantener para compatibilidad)

3. **Limpiar dependencias**:
   ```json
   // backend/package.json
   // Eliminar:
   "whatsapp-web.js": "^1.23.0",
   "qrcode-terminal": "^0.12.0",
   ```

## 🔧 **Configuración en Render**

### Variables de Entorno a Agregar

```bash
# Desactivar bots viejos
USE_META_WHATSAPP_API=true

# (Opcional) Mantener para compatibilidad
DISABLE_WHATSAPP_BOTS=true
```

### Código a Modificar

```javascript
// backend/src/index.js

// Al inicio del archivo
const USE_META_API = process.env.USE_META_WHATSAPP_API === 'true';

async function initializeBots() {
  if (USE_META_API) {
    console.log('[Bots] ⚠️  Meta WhatsApp API enabled - Skipping whatsapp-web.js bots');
    console.log('[Bots] Bots are now handled by Vercel Serverless Functions');
    return;
  }
  
  // ... código existente de inicialización de bots
}
```

## 📝 **Checklist de Migración**

### Antes de Migrar
- [ ] Crear cuenta en Meta for Developers
- [ ] Obtener credenciales de WhatsApp Business API
- [ ] Configurar webhook en Meta
- [ ] Probar webhook con un comercio de prueba
- [ ] Verificar que las migraciones estén ejecutadas

### Durante la Migración
- [ ] Crear `clients` para cada comercio existente
- [ ] Configurar variables de entorno en Vercel
- [ ] Probar shortlinks
- [ ] Probar flujo completo de reserva
- [ ] Verificar que las sesiones se crean correctamente

### Después de Migrar
- [ ] Desactivar bots viejos en Render
- [ ] Monitorear uso de memoria en Render (debería bajar drásticamente)
- [ ] Verificar que no hay errores en logs
- [ ] (Opcional) Eliminar código del bot viejo
- [ ] (Opcional) Limpiar dependencias

## 🎯 **Beneficios Inmediatos**

1. **Memoria en Render**: De ~2-4GB a ~200-500MB (solo API Express)
2. **Costo**: Render free tier será suficiente
3. **Escalabilidad**: Puedes agregar cientos de bots sin problemas
4. **Mantenimiento**: No más QR codes, reconexiones, etc.
5. **Performance**: Respuestas más rápidas (serverless)

## ⚠️ **Consideraciones**

### Lo que CAMBIA:
- ❌ No más QR codes para conectar bots
- ❌ No más reconexiones manuales
- ❌ Necesitas credenciales de Meta (puede tener costo después del trial)

### Lo que SE MANTIENE:
- ✅ Misma base de datos
- ✅ Misma lógica de negocio
- ✅ Mismo frontend
- ✅ Mismas reservas, servicios, etc.

## 🚨 **Importante**

1. **No elimines el código del bot viejo hasta estar 100% seguro** que el nuevo funciona
2. **Migra gradualmente**: Un comercio a la vez
3. **Mantén ambos sistemas corriendo** durante la transición
4. **Monitorea los logs** de ambos sistemas

## 📞 **Siguiente Paso**

¿Quieres que:
1. **Agregue el flag para desactivar bots viejos** en Render?
2. **Cree un script de migración** para convertir `businesses` a `clients`?
3. **Documente cómo obtener credenciales** de Meta WhatsApp Business API?

