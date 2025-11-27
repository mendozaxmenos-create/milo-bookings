# 🔧 Solución: Error de Conexión a PostgreSQL en Render

## ❌ Problema

El error muestra:
```
connect ECONNREFUSED ::1:5432
```

Esto significa que la aplicación está intentando conectarse a `localhost` en lugar de usar la `DATABASE_URL` de Render.

## ✅ Solución

### Paso 1: Verificar Variables de Entorno en Render

1. Ve a tu servicio en Render Dashboard
2. Haz clic en **"Environment"** (o **"Variables"**)
3. **VERIFICA** que tengas estas variables configuradas:

```
DATABASE_URL=postgresql://milo_user:g4u8iqVOZ3tmGlhZDIAUkZNQ1rLhGUY0@dpg-d4eeljmr433s738lqq4g-a/milo_bookings
JWT_SECRET=688371856d4366c3c1a8086f751bd13fd34b8567f671b4edb02068a3484a5eb2
NODE_ENV=production
PORT=3000
SESSION_STORAGE_TYPE=local
SESSION_STORAGE_PATH=/app/backend/data/whatsapp-sessions
```

### Paso 2: Usar Internal Database URL

**IMPORTANTE**: Usa la **Internal Database URL** (sin el dominio `.oregon-postgres.render.com`):

✅ **CORRECTO** (Internal):
```
DATABASE_URL=postgresql://milo_user:g4u8iqVOZ3tmGlhZDIAUkZNQ1rLhGUY0@dpg-d4eeljmr433s738lqq4g-a/milo_bookings
```

❌ **INCORRECTO** (External):
```
DATABASE_URL=postgresql://milo_user:g4u8iqVOZ3tmGlhZDIAUkZNQ1rLhGUY0@dpg-d4eeljmr433s738lqq4g-a.oregon-postgres.render.com/milo_bookings
```

### Paso 3: Verificar que la Variable Esté Guardada

1. En Render, ve a tu servicio
2. Haz clic en **"Environment"**
3. Busca `DATABASE_URL`
4. Verifica que el valor sea correcto
5. Si no está, agrégalo y haz clic en **"Save Changes"**

### Paso 4: Hacer Redeploy

Después de agregar/corregir las variables:

1. Ve a la pestaña **"Manual Deploy"**
2. Haz clic en **"Deploy latest commit"**
3. O simplemente haz un push a GitHub (si tienes auto-deploy activado)

### Paso 5: Verificar Logs

Después del redeploy, revisa los logs. Deberías ver:

```
[KnexConfig] NODE_ENV: production
[KnexConfig] DATABASE_URL definida: true
[KnexConfig] DATABASE_URL: postgresql://milo_user:****@dpg-d4eeljmr433s738lqq4g-a/milo_bookings
```

Si ves:
```
[KnexConfig] ⚠️  DATABASE_URL no está definida!
```

Significa que la variable no está configurada correctamente en Render.

## 🐛 Troubleshooting

### Si DATABASE_URL no aparece en los logs:

1. **Verifica el nombre de la variable**: Debe ser exactamente `DATABASE_URL` (mayúsculas)
2. **Verifica que esté guardada**: A veces Render requiere hacer clic en "Save Changes"
3. **Verifica el servicio correcto**: Asegúrate de estar editando las variables del servicio web, no de la base de datos

### Si sigue fallando:

1. **Elimina y vuelve a agregar la variable**:
   - Elimina `DATABASE_URL`
   - Guarda cambios
   - Agrega `DATABASE_URL` de nuevo con el valor correcto
   - Guarda cambios
   - Haz redeploy

2. **Verifica que estés usando Internal URL**:
   - La Internal URL no tiene el dominio completo
   - Formato: `postgresql://user:pass@host/db`
   - NO: `postgresql://user:pass@host.oregon-postgres.render.com/db`

3. **Verifica que la base de datos esté corriendo**:
   - En Render Dashboard, verifica que tu PostgreSQL esté en estado "Available"

## ✅ Verificación Final

Una vez corregido, los logs deberían mostrar:

```
📊 Ejecutando migraciones de base de datos...
Using environment: production
[KnexConfig] NODE_ENV: production
[KnexConfig] DATABASE_URL definida: true
Batch 1 run: 1 migrations
✅ Migraciones ejecutadas correctamente
```

Y NO deberías ver:
```
connect ECONNREFUSED ::1:5432
```

---

**¿Necesitas ayuda?** Revisa los logs en Render y busca los mensajes `[KnexConfig]` para ver qué está pasando.

