# 🔍 Cómo Obtener el Hostname de tu Base de Datos en Render

## 📋 Paso a Paso Detallado

### Paso 1: Abrir Render Dashboard

1. Abre tu navegador
2. Ve a: **https://dashboard.render.com**
3. Inicia sesión si es necesario

### Paso 2: Encontrar tu Base de Datos PostgreSQL

1. En el dashboard principal de Render, verás una lista de servicios
2. Busca un servicio que diga:
   - **"PostgreSQL"** o
   - **"Database"** o
   - **"milo-bookings-db"** o
   - Algo similar con "db" o "database" en el nombre
3. **IMPORTANTE**: NO es el servicio web `milo-bookings`, es el servicio de BASE DE DATOS
4. Haz clic en ese servicio PostgreSQL

### Paso 3: Ir a la Pestaña "Info" o "Connection"

Una vez dentro del servicio PostgreSQL, busca en el menú lateral izquierdo o en las pestañas superiores:

- **"Info"** o
- **"Connection"** o
- **"Connections"** o
- **"Overview"**

Haz clic en esa pestaña.

### Paso 4: Buscar "Internal Database URL"

En esa página, busca una sección que diga:

- **"Internal Database URL"** o
- **"Internal Connection String"** o
- **"Connection String"** (pero debe ser la INTERNAL, no External)

### Paso 5: Copiar el Hostname

La URL se verá así:
```
postgresql://milo_user:password@dpg-XXXXXXXXX-a/milo_bookings
```

**El hostname es la parte entre `@` y `/milo_bookings`**

Por ejemplo:
- Si la URL es: `postgresql://milo_user:abc123@dpg-4eeljmr422s7281aada-a/milo_bookings`
- El hostname es: `dpg-4eeljmr422s7281aada-a`

**Copia SOLO esa parte** (el hostname, sin el `@` ni el `/milo_bookings`)

---

## 🎯 Ubicaciones Alternativas

Si no encuentras "Internal Database URL" en la pestaña "Info", busca en:

### Opción A: Pestaña "Settings"
1. Haz clic en "Settings" en el menú lateral
2. Busca "Connection" o "Database URL"
3. Busca la sección "Internal" (NO External)

### Opción B: En la Página Principal
A veces Render muestra la URL directamente en la página principal del servicio:
1. Revisa la página principal del servicio PostgreSQL
2. Busca cualquier texto que diga "postgresql://"
3. Esa es la URL que necesitas

### Opción C: Pestaña "Connections"
1. Busca una pestaña llamada "Connections" o "Connection Info"
2. Ahí debería estar la Internal Database URL

---

## 📝 Formato Esperado

La Internal Database URL debería verse así:
```
postgresql://usuario:contraseña@hostname/base_de_datos
```

**Ejemplo real:**
```
postgresql://milo_user:g4u8iqVOZ3tmGlhZDIAUkZNQ1rLhGUY0@dpg-4eeljmr422s7281aada-a/milo_bookings
```

En este ejemplo:
- **Usuario**: `milo_user`
- **Contraseña**: `g4u8iqVOZ3tmGlhZDIAUkZNQ1rLhGUY0`
- **Hostname**: `dpg-4eeljmr422s7281aada-a` ← **ESTE ES EL QUE NECESITAS**
- **Base de datos**: `milo_bookings`

---

## ⚠️ Importante

1. **Usa la INTERNAL URL**, NO la External
   - ✅ Internal: `postgresql://...@dpg-XXXXX-a/milo_bookings`
   - ❌ External: `postgresql://...@dpg-XXXXX-a.oregon-postgres.render.com/milo_bookings`

2. **El hostname NO tiene el dominio completo**
   - ✅ Correcto: `dpg-4eeljmr422s7281aada-a`
   - ❌ Incorrecto: `dpg-4eeljmr422s7281aada-a.oregon-postgres.render.com`

3. **Verifica que la base de datos esté activa**
   - Debe estar en estado "Available" (verde)
   - Si está pausada, actívala primero

---

## 🆘 Si No Lo Encuentras

Si después de revisar todas las pestañas no encuentras la Internal Database URL:

1. **Toma una captura de pantalla** de la página principal de tu servicio PostgreSQL
2. **O describe** qué opciones/pestañas ves en el menú lateral
3. Te ayudaré a encontrarlo específicamente

---

## ✅ Una Vez que Tengas el Hostname

1. Ve a tu servicio web `milo-bookings`
2. Pestaña "Environment"
3. Edita `DATABASE_URL`
4. Reemplaza el hostname actual por el que copiaste
5. Guarda cambios
6. Haz redeploy

---

**¿Necesitas ayuda?** Si no encuentras la URL, describe qué ves en la página de tu servicio PostgreSQL y te guío específicamente.

