# 🔧 Solución Paso a Paso - Base de Datos y WhatsApp

Esta guía te llevará paso a paso para solucionar los dos problemas actuales:
1. Error de conexión a la base de datos (`ENOTFOUND dpg-d4eeljmr422s7281aada-a`)
2. Error de WhatsApp (`Recipient phone number not in allowed list`)

---

## 📊 PARTE 1: Actualizar DATABASE_URL en Render

### Paso 1: Abrir Render Dashboard

1. Abre tu navegador
2. Ve a: **https://dashboard.render.com**
3. Inicia sesión con tu cuenta

### Paso 2: Encontrar tu Base de Datos PostgreSQL

1. En el dashboard de Render, busca en la lista de servicios
2. Busca un servicio de tipo **"PostgreSQL"** o **"Database"**
3. Haz clic en ese servicio (NO en el servicio web `milo-bookings`)

### Paso 3: Copiar la Internal Database URL

1. Una vez dentro del servicio de PostgreSQL, busca la sección **"Connection"** o **"Info"**
2. Busca **"Internal Database URL"** (NO uses "External Database URL")
3. Deberías ver algo como:
   ```
   postgresql://milo_user:password@dpg-XXXXX-a/milo_bookings
   ```
4. **Copia TODO ese texto** (desde `postgresql://` hasta el final)

⚠️ **IMPORTANTE**: 
- ✅ Usa la **Internal Database URL** (sin `.oregon-postgres.render.com`)
- ❌ NO uses la External Database URL

### Paso 4: Ir al Servicio Web

1. Vuelve al dashboard principal de Render
2. Busca y haz clic en el servicio **"milo-bookings"** (tu servicio web, NO la base de datos)

### Paso 5: Editar Variables de Entorno

1. En el menú lateral izquierdo, haz clic en **"Environment"** (o **"Variables"**)
2. Busca la variable `DATABASE_URL` en la lista
3. Haz clic en el botón **"Edit"** o en el ícono de lápiz junto a `DATABASE_URL`

### Paso 6: Actualizar el Valor

1. En el campo de valor, **borra todo el contenido actual**
2. **Pega** la Internal Database URL que copiaste en el Paso 3
3. Verifica que el formato sea correcto:
   ```
   postgresql://milo_user:password@dpg-XXXXX-a/milo_bookings
   ```
4. Haz clic en **"Save Changes"** o **"Guardar"**

### Paso 7: Reiniciar el Servicio

1. En el menú lateral, haz clic en **"Manual Deploy"**
2. Haz clic en el botón **"Redeploy"** o **"Deploy latest commit"**
3. Espera a que termine el deploy (puede tardar 2-5 minutos)

### Paso 8: Verificar que Funcionó

1. Ve a la pestaña **"Logs"** en el menú lateral
2. Busca estos mensajes en los logs:
   ```
   [KnexConfig] DATABASE_URL definida: true
   [KnexConfig] DATABASE_URL: postgresql://milo_user:****@dpg-XXXXX-a/milo_bookings
   ```
3. **NO deberías ver** el error:
   ```
   getaddrinfo ENOTFOUND dpg-d4eeljmr422s7281aada-a
   ```

✅ **Si ves el mensaje correcto, la base de datos está funcionando!**

---

## 📱 PARTE 2: Agregar Número a Lista Permitida en Meta

### Paso 1: Abrir Meta for Developers

1. Abre tu navegador
2. Ve a: **https://developers.facebook.com/apps/**
3. Inicia sesión si es necesario

### Paso 2: Seleccionar tu App

1. En la lista de apps, busca y haz clic en **"Milo Bookings"**

### Paso 3: Ir a Configuración de API de WhatsApp

1. En el menú lateral izquierdo, busca **"WhatsApp"**
2. Haz clic en **"WhatsApp"**
3. En el submenú que aparece, haz clic en **"Configuración de API"** o **"API Setup"**

### Paso 4: Encontrar la Sección de Números Permitidos

1. En la página de configuración, busca la sección **"To"** o **"Números de teléfono de destinatarios"**
2. O busca **"Manage phone number list"** o **"Administrar números de teléfono"**
3. Haz clic en ese botón o enlace

### Paso 5: Agregar tu Número

1. Haz clic en el botón **"Add phone number"** o **"Agregar número de teléfono"**
2. Ingresa tu número de teléfono:
   - **Formato**: Sin el `+` y sin espacios
   - **Ejemplo**: Si tu número es `+54 9 26 15 17 64 03`, ingresa: `5492615176403`
3. Haz clic en **"Send code"** o **"Enviar código"**

### Paso 6: Verificar el Código

1. Revisa tu WhatsApp (el número que ingresaste)
2. Meta enviará un código de verificación por WhatsApp
3. Copia el código que recibiste
4. Pega el código en el campo de verificación en Meta
5. Haz clic en **"Verify"** o **"Verificar"**

### Paso 7: Confirmar que Está Agregado

1. Deberías ver tu número en la lista de números permitidos
2. Debería aparecer con un ✅ o estado "Verified"

✅ **Listo! Ahora puedes enviar mensajes a ese número desde tu app**

---

## ✅ Verificación Final

Después de completar ambos pasos:

### Verificar Base de Datos

1. Ve a los logs de Render
2. Busca mensajes como:
   ```
   ✅ Migraciones ejecutadas correctamente
   [SeedCheck] ✅ Conexión establecida
   ```
3. **NO deberías ver** errores de `ENOTFOUND`

### Verificar WhatsApp

1. Envía un mensaje de WhatsApp desde el número que agregaste (`5492615176403`)
2. El bot debería responder correctamente
3. En los logs de Render, deberías ver:
   ```
   [Webhook] 📩 Mensaje recibido de 5492615176403: "tu mensaje"
   [MetaWhatsApp] ✅ Mensaje enviado a 5492615176403
   ```
4. **NO deberías ver** el error `Recipient phone number not in allowed list`

---

## 🆘 Si Algo No Funciona

### Si la Base de Datos Sigue Fallando:

1. **Verifica que copiaste la Internal URL correcta:**
   - Debe empezar con `postgresql://`
   - NO debe tener `.oregon-postgres.render.com` al final
   - Debe terminar con `/milo_bookings`

2. **Verifica que guardaste los cambios:**
   - Asegúrate de hacer clic en "Save Changes"
   - Haz redeploy después de guardar

3. **Verifica que la base de datos esté activa:**
   - En Render, ve a tu servicio PostgreSQL
   - Debe estar en estado "Available" (verde)

### Si WhatsApp Sigue Fallando:

1. **Verifica que agregaste el número correcto:**
   - Sin `+` y sin espacios
   - Con código de país (54 para Argentina)
   - Ejemplo: `5492615176403`

2. **Verifica que verificaste el código:**
   - El número debe aparecer como "Verified" en la lista

3. **Espera unos minutos:**
   - A veces Meta tarda unos minutos en actualizar la lista

---

## 📝 Resumen Rápido

**Para Base de Datos:**
1. Render → PostgreSQL → Copiar Internal Database URL
2. Render → milo-bookings → Environment → Editar DATABASE_URL
3. Pegar URL → Guardar → Redeploy

**Para WhatsApp:**
1. Meta Developers → Milo Bookings → WhatsApp → API Setup
2. Agregar número → Verificar código
3. Listo!

---

**¿Necesitas ayuda?** Revisa los logs en Render y busca los mensajes de error específicos.

