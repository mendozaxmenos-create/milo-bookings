# 🚀 Deploy Manual en Render

## Problema
Render no está haciendo auto-deploy porque estás trabajando en la rama `feat/logs-and-improvements` y Render probablemente está configurado para `main`.

## Soluciones

### Opción 1: Cambiar la rama en Render (Recomendado)

1. **Ve al Dashboard de Render**
   - https://dashboard.render.com
   - Inicia sesión

2. **Selecciona tu servicio**
   - Busca el servicio `milo-bookings` (o el nombre que le diste)
   - Haz clic en él

3. **Ve a Settings**
   - En el menú lateral, haz clic en **"Settings"**

4. **Busca "Build & Deploy"**
   - En la sección **"Build & Deploy"**
   - Busca el campo **"Branch"** o **"Git Branch"**

5. **Cambia la rama**
   - Cambia de `main` a `feat/logs-and-improvements`
   - Haz clic en **"Save Changes"**

6. **Render hará deploy automáticamente**
   - Ve a la pestaña **"Events"** o **"Logs"**
   - Deberías ver un nuevo deploy en progreso

---

### Opción 2: Hacer Deploy Manual

1. **Ve al Dashboard de Render**
   - https://dashboard.render.com
   - Inicia sesión

2. **Selecciona tu servicio**
   - Busca el servicio `milo-bookings`
   - Haz clic en él

3. **Haz clic en "Manual Deploy"**
   - En la parte superior, busca el botón **"Manual Deploy"**
   - O ve a **"Events"** y haz clic en **"Deploy latest commit"**

4. **Selecciona la rama**
   - Si te pregunta, selecciona `feat/logs-and-improvements`
   - Haz clic en **"Deploy"**

5. **Espera a que termine**
   - Ve a **"Logs"** para ver el progreso
   - El deploy puede tardar 5-10 minutos

---

### Opción 3: Hacer Merge a Main (Para producción)

Si quieres que Render siempre use `main`:

1. **Haz merge de la rama a main:**
   ```bash
   git checkout main
   git merge feat/logs-and-improvements
   git push origin main
   ```

2. **Render hará deploy automáticamente** desde `main`

---

## Verificar el Deploy

Después del deploy, verifica:

1. **Ve a "Logs" en Render**
   - Deberías ver los nuevos logs con emojis: 🚀, 📱, ✅, etc.

2. **Prueba escanear el QR nuevamente**
   - Deberías ver logs detallados cuando escaneas el QR

3. **Revisa los logs en tiempo real**
   - Los logs deberían mostrar:
     - `🚀 [Bot <ID>] Starting initialization...`
     - `📱 [Bot <ID>] QR Code generated:`
     - `🔐 [Bot <ID>] Bot authenticated successfully!` (cuando escaneas)
     - `✅ [Bot <ID>] Bot ready and authenticated!`

---

## Si Render sigue sin hacer deploy

1. **Verifica la conexión de GitHub**
   - Ve a Settings → Git
   - Verifica que el repositorio esté conectado correctamente

2. **Verifica los webhooks**
   - Render debería tener webhooks configurados en GitHub
   - Si no funcionan, puedes hacer deploy manual

3. **Contacta soporte de Render**
   - Si nada funciona, Render tiene buen soporte

---

**Recomendación**: Usa la Opción 1 (cambiar la rama en Render) - Es la más rápida y Render hará auto-deploy en el futuro.

