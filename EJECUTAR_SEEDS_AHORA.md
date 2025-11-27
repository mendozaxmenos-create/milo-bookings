# 🚨 URGENTE: Ejecutar Seeds Ahora

## ❌ Problema Actual

El login falla porque **los datos de seed no se ejecutaron** en la base de datos de producción.

## ✅ Solución Inmediata: Render Shell

### Paso 1: Abrir Render Shell

1. Ve a **Render Dashboard**: https://dashboard.render.com
2. Selecciona tu servicio: `milo-bookings`
3. Haz clic en **"Shell"** (terminal en el navegador)
   - Puede estar en el menú lateral o arriba
   - Si no lo ves, busca "Open Shell" o "Terminal"

### Paso 2: Ejecutar Seeds

Una vez en la terminal, ejecuta:

```bash
cd backend
npm run db:seed
```

### Paso 3: Verificar Resultado

Deberías ver algo como:
```
Ran seed: 001_demo_data.js
Ran seed: 003_system_users.js
```

### Paso 4: Probar Login

Después de ejecutar los seeds, prueba el login:

**Negocio Demo:**
- Business ID: `demo-business-001`
- Teléfono: `+5491123456789`
- Contraseña: `demo123`

**Super Admin:**
- Email: `admin@milobookings.com`
- Contraseña: `admin123`

---

## 🔍 Si No Encuentras "Shell" en Render

Algunas alternativas:

1. **Busca "Terminal"** o **"Console"** en el menú
2. **Ve a "Settings"** → Busca opción de terminal
3. **Usa Render CLI** (si lo tienes instalado):
   ```bash
   render shell milo-bookings
   ```

---

## 📋 Credenciales que se Crean

### Negocio Demo:
- **Business ID**: `demo-business-001`
- **Teléfono**: `+5491123456789`
- **Contraseña**: `demo123`

### Super Admin:
- **Email**: `admin@milobookings.com`
- **Contraseña**: `admin123`

---

**Después de ejecutar los seeds, el login debería funcionar correctamente.**

