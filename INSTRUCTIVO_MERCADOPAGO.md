# 📖 Instructivo: Configurar MercadoPago en Milo Bookings

## 🎯 Objetivo

Este instructivo te guiará paso a paso para configurar tu cuenta de MercadoPago en Milo Bookings, permitiendo que los pagos de tus clientes se reciban directamente en tu cuenta.

**Tiempo estimado:** 5 minutos

---

## ⚠️ Importante

- Si **NO configurás** tus credenciales, los pagos se recibirán en la cuenta centralizada de Milo Bookings
- Si **SÍ configurás** tus credenciales, los pagos irán directamente a tu cuenta de MercadoPago
- Esta configuración es **opcional** pero recomendada si querés recibir los pagos directamente

---

## 📋 Paso 1: Crear cuenta en MercadoPago (si no tenés)

1. Ve a [mercadopago.com.ar](https://www.mercadopago.com.ar)
2. Haz clic en **"Crear cuenta"**
3. Completa tus datos personales o de tu negocio
4. Verifica tu email y teléfono
5. Completa la verificación de identidad (si es necesario)

> **Nota:** Si ya tenés cuenta, podés saltar este paso.

---

## 📋 Paso 2: Acceder a tus credenciales

1. Iniciá sesión en tu cuenta de MercadoPago
2. En el menú superior, hacé clic en **"Tu negocio"** o **"Desarrolladores"**
3. Buscá la sección **"Tus integraciones"** o **"Credenciales"**
4. Seleccioná **"Credenciales de Producción"** (o "Credenciales de Prueba" si estás en desarrollo)

> **💡 Tip:** Si no encontrás esta sección, buscá "API" o "Integraciones" en el menú.

---

## 📋 Paso 3: Obtener tus credenciales

En la página de credenciales verás dos valores importantes:

### 3.1 Public Key (Clave Pública)
- Es un código que empieza con `APP_USR-` o `TEST-`
- Es **público** y seguro compartirlo
- Lo necesitás para generar los links de pago

### 3.2 Access Token (Token de Acceso)
- Es un código largo que empieza con `APP_USR-` o `TEST-`
- Es **privado** y no debés compartirlo con nadie
- Lo necesitás para procesar los pagos

> **⚠️ Importante:** 
> - Usá **Credenciales de Producción** cuando tu negocio esté funcionando
> - Usá **Credenciales de Prueba** solo para probar el sistema

---

## 📋 Paso 4: Configurar en Milo Bookings

1. Iniciá sesión en tu panel de Milo Bookings
2. Ve a la sección **"Configuración"** (⚙️ en el menú lateral)
3. Desplázate hasta la sección **"Pagos con MercadoPago"**
4. Copiá tu **Public Key** desde MercadoPago y pegala en el campo correspondiente
5. Copiá tu **Access Token** desde MercadoPago y pegala en el campo correspondiente
6. (Opcional) Si tenés **Refresh Token** y **User ID**, también podés agregarlos
7. Hacé clic en **"Guardar credenciales"**

---

## 📋 Paso 5: Verificar que funciona

1. Después de guardar, el estado debería cambiar a:
   - **✅ "Usando tu cuenta de MercadoPago"** (verde)
2. Creá una reserva de prueba con pago
3. Verificá que el link de pago se genera correctamente
4. (Opcional) Hacé un pago de prueba para confirmar que llega a tu cuenta

---

## ❓ Preguntas Frecuentes

### ¿Qué pasa si no configuro mis credenciales?

Los pagos se recibirán en la cuenta centralizada de Milo Bookings. Podrás ver los pagos en el panel, pero no llegarán directamente a tu cuenta de MercadoPago.

### ¿Puedo cambiar mis credenciales después?

Sí, podés actualizar tus credenciales en cualquier momento desde la sección de Configuración.

### ¿Qué diferencia hay entre credenciales de prueba y producción?

- **Prueba (TEST):** Para probar el sistema sin hacer pagos reales
- **Producción (APP_USR):** Para recibir pagos reales de tus clientes

### ¿Es seguro compartir mi Access Token?

El Access Token es **privado** y solo debés ingresarlo en el panel de Milo Bookings. No lo compartas con nadie más.

### ¿Puedo usar la misma cuenta de MercadoPago para varios negocios?

Sí, pero cada negocio en Milo Bookings puede tener sus propias credenciales. Si querés usar la misma cuenta, podés usar las mismas credenciales en todos tus negocios.

### ¿Qué hago si tengo problemas?

1. Verificá que copiaste correctamente las credenciales (sin espacios extra)
2. Asegurate de estar usando las credenciales correctas (producción vs prueba)
3. Contactá a soporte de Milo Bookings si el problema persiste

---

## 🎉 ¡Listo!

Una vez configurado, todos los pagos de tus clientes se recibirán directamente en tu cuenta de MercadoPago. No necesitás hacer nada más.

---

**¿Necesitás ayuda?** Contactanos a través del panel de administración o por email.

---

*Última actualización: Noviembre 2025*



