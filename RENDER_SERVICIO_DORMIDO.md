# 😴 Problema: Servicio "Dormido" en Render

## ❌ Síntoma

El error muestra:
```
timeout of 30000ms exceeded
No se pudo conectar con el servidor
```

## 🔍 Causa

En el **plan gratuito de Render**, el servicio se "duerme" después de **15 minutos de inactividad**. La primera petición después de dormir puede tardar **~30 segundos** en "despertar" el servicio.

## ✅ Soluciones

### Solución 1: Esperar y Reintentar (Inmediato)

1. **Espera 30-60 segundos** después del primer intento
2. **Intenta hacer login de nuevo**
3. El servicio debería estar "despierto" y responder más rápido

### Solución 2: Usar UptimeRobot (Recomendado - Gratis)

**UptimeRobot** puede hacer ping a tu servicio cada 5 minutos para mantenerlo despierto:

1. Ve a https://uptimerobot.com
2. Crea una cuenta gratuita
3. Haz clic en **"Add New Monitor"**
4. Configura:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Milo Bookings Backend
   - **URL**: `https://milo-bookings.onrender.com/health`
   - **Monitoring Interval**: 5 minutes
5. Haz clic en **"Create Monitor"**

Esto mantendrá tu servicio despierto automáticamente.

### Solución 3: Aumentar Timeout (Ya implementado)

Ya aumenté el timeout a 60 segundos para dar más tiempo al servicio de "despertar".

### Solución 4: Upgrade a Plan de Pago

Si necesitas que el servicio esté siempre activo, considera actualizar a un plan de pago en Render.

---

## 🔍 Verificar Estado del Servicio

Puedes verificar si el servicio está despierto:

1. Abre en el navegador: `https://milo-bookings.onrender.com/health`
2. Si responde rápidamente: ✅ Está despierto
3. Si tarda 30+ segundos: 😴 Está despertando
4. Si no responde: ❌ Hay un problema

---

## 💡 Recomendación

**Usa UptimeRobot** (Solución 2) - Es gratis y mantendrá tu servicio despierto automáticamente.

---

**Después de configurar UptimeRobot, el servicio debería estar siempre despierto y el login funcionará sin problemas.**

