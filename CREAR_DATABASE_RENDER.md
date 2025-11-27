# 🗄️ Crear Base de Datos PostgreSQL en Render

## 📋 Paso a Paso para Crear la Base de Datos

### Paso 1: Ir a Render Dashboard

1. Abre tu navegador
2. Ve a: **https://dashboard.render.com**
3. Inicia sesión si es necesario

### Paso 2: Crear Nueva Base de Datos

1. En el dashboard principal de Render, busca el botón **"New +"** (arriba a la derecha)
2. Haz clic en **"New +"**
3. En el menú desplegable, selecciona **"PostgreSQL"**

### Paso 3: Configurar la Base de Datos

Completa el formulario con estos valores:

**Name:**
```
milo-bookings-db
```

**Database:**
```
milo_bookings
```

**User:**
```
milo_user
```

**Region:**
- Selecciona la misma región que tu servicio web (probablemente **"Oregon (US West)"**)
- Esto es importante para que la conexión sea más rápida

**PostgreSQL Version:**
- Deja la versión por defecto (generalmente la más reciente está bien)

**Plan:**
- Si estás en el plan gratuito, selecciona **"Free"**
- Si tienes un plan de pago, puedes seleccionar el que prefieras

### Paso 4: Crear la Base de Datos

1. Revisa que todos los campos estén correctos
2. Haz clic en el botón **"Create Database"** o **"Crear Base de Datos"**
3. Espera 1-2 minutos mientras Render crea la base de datos

### Paso 5: Copiar la Internal Database URL

Una vez que la base de datos esté creada:

1. Render te mostrará la página de la base de datos
2. Busca la sección **"Connection"** o **"Info"**
3. Busca **"Internal Database URL"** (NO uses "External Database URL")
4. Deberías ver algo como:
   ```
   postgresql://milo_user:una_contraseña_larga@dpg-XXXXXXXXX-a/milo_bookings
   ```
5. **Copia TODA esa URL completa**

### Paso 6: Actualizar DATABASE_URL en tu Servicio Web

1. Ve a tu servicio web `milo-bookings` en Render
2. Haz clic en **"Environment"** en el menú lateral
3. Busca la variable `DATABASE_URL`
4. Haz clic en **"Edit"** o el ícono de lápiz
5. **Pega la URL completa** que copiaste en el Paso 5
6. Haz clic en **"Save Changes"**

### Paso 7: Hacer Redeploy

1. Ve a la pestaña **"Manual Deploy"** en tu servicio web
2. Haz clic en **"Redeploy"** o **"Deploy latest commit"**
3. Espera 2-5 minutos a que termine el deploy

### Paso 8: Verificar que Funcionó

1. Ve a la pestaña **"Logs"** de tu servicio web
2. Busca estos mensajes:

**✅ Deberías ver:**
```
[KnexConfig] DATABASE_URL definida: true
[KnexConfig] DATABASE_URL: postgresql://milo_user:****@dpg-XXXXXXXXX-a/milo_bookings
✅ Migraciones ejecutadas correctamente
[SeedCheck] ✅ Conexión establecida
```

**❌ NO deberías ver:**
```
getaddrinfo ENOTFOUND
Error: getaddrinfo ENOTFOUND
```

---

## ⚠️ Importante

1. **Usa la Internal Database URL**, NO la External
   - ✅ Internal: `postgresql://...@dpg-XXXXX-a/milo_bookings`
   - ❌ External: `postgresql://...@dpg-XXXXX-a.oregon-postgres.render.com/milo_bookings`

2. **La contraseña se genera automáticamente**
   - Render genera una contraseña segura automáticamente
   - NO necesitas cambiarla
   - Solo copia la URL completa que te da Render

3. **La base de datos puede tardar 1-2 minutos en crearse**
   - Espera a que el estado sea "Available" (verde) antes de copiar la URL

---

## 🆘 Si Algo No Funciona

### Si no ves el botón "New +"
- Asegúrate de estar en el dashboard principal de Render
- Verifica que tengas permisos para crear servicios

### Si la base de datos no se crea
- Verifica que no hayas alcanzado el límite de servicios gratuitos
- Intenta crear una base de datos con otro nombre

### Si no encuentras la Internal Database URL
- Busca en la pestaña "Info" o "Connection"
- O en la página principal del servicio PostgreSQL
- Debería aparecer claramente como "Internal Database URL"

---

## ✅ Checklist

Antes de continuar, verifica:

- [ ] Base de datos PostgreSQL creada en Render
- [ ] Estado de la base de datos: "Available" (verde)
- [ ] Internal Database URL copiada
- [ ] DATABASE_URL actualizada en el servicio web
- [ ] Redeploy realizado
- [ ] Logs muestran conexión exitosa

---

**Una vez completados estos pasos, tu base de datos debería estar funcionando correctamente!** 🎉

