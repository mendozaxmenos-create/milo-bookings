# 🔍 Verificar DATABASE_URL en Render

## ❌ Problema

El error `ECONNREFUSED ::1:5432` indica que el backend está intentando conectarse a localhost en lugar de usar `DATABASE_URL` de Render.

## ✅ Solución: Verificar Variables de Entorno

### Paso 1: Ir a Render Dashboard

1. Ve a https://dashboard.render.com
2. Selecciona tu servicio: `milo-bookings`

### Paso 2: Verificar Environment Variables

1. Haz clic en **"Environment"** (o **"Variables"**)
2. Busca la variable `DATABASE_URL`
3. **VERIFICA** que tenga este formato:

```
DATABASE_URL=postgresql://milo_user:g4u8iqVOZ3tmGlhZDIAUkZNQ1rLhGUY0@dpg-d4eeljmr433s738lqq4g-a/milo_bookings
```

**IMPORTANTE**: Debe ser la **Internal Database URL** (sin `.oregon-postgres.render.com`)

### Paso 3: Si No Está Configurada

1. Haz clic en **"Add Environment Variable"**
2. **Name**: `DATABASE_URL`
3. **Value**: `postgresql://milo_user:g4u8iqVOZ3tmGlhZDIAUkZNQ1rLhGUY0@dpg-d4eeljmr433s738lqq4g-a/milo_bookings`
4. Haz clic en **"Save Changes"**

### Paso 4: Verificar Otras Variables

Asegúrate de tener también:
- `JWT_SECRET` (mínimo 32 caracteres)
- `NODE_ENV=production`
- `PORT=3000` (o déjalo vacío, Render lo asigna automáticamente)

### Paso 5: Reiniciar el Servicio

Después de agregar/corregir las variables:

1. Ve a **"Manual Deploy"**
2. Haz clic en **"Redeploy"**
3. Espera a que termine el deploy

### Paso 6: Verificar Logs

Después del redeploy, revisa los logs. Deberías ver:

```
[KnexConfig] NODE_ENV: production
[KnexConfig] DATABASE_URL definida: true
[KnexConfig] DATABASE_URL: postgresql://milo_user:****@dpg-...
```

Si ves:
```
[KnexConfig] ⚠️  DATABASE_URL no está definida!
```

Significa que la variable no está configurada correctamente.

---

## 🔍 Verificar en los Logs

En los logs de Render, busca estos mensajes al inicio:

**✅ CORRECTO:**
```
[KnexConfig] DATABASE_URL definida: true
[KnexConfig] DATABASE_URL: postgresql://milo_user:****@dpg-...
```

**❌ INCORRECTO:**
```
[KnexConfig] ⚠️  DATABASE_URL no está definida!
```

---

## 🐛 Si Sigue Fallando

1. **Elimina y vuelve a agregar la variable:**
   - Elimina `DATABASE_URL`
   - Guarda cambios
   - Agrega `DATABASE_URL` de nuevo
   - Guarda cambios
   - Haz redeploy

2. **Verifica que uses Internal URL:**
   - ✅ CORRECTO: `postgresql://user:pass@host/db`
   - ❌ INCORRECTO: `postgresql://user:pass@host.oregon-postgres.render.com/db`

3. **Verifica que la base de datos esté corriendo:**
   - Ve a tu servicio PostgreSQL en Render
   - Verifica que esté en estado "Available"

---

**Después de verificar y corregir DATABASE_URL, el error debería desaparecer.**

