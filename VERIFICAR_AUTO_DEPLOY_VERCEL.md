# ✅ Verificar Auto-Deploy en Vercel

## 🎯 Objetivo

Asegurar que Vercel despliegue automáticamente cada vez que hagas push a `main`, sin necesidad de forzar nada.

---

## 📋 Checklist de Verificación

### 1. Verificar Conexión con GitHub

1. **Ve a Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Selecciona tu proyecto: **"Milo bookings' projects"**

2. **Ve a Settings → Git:**
   - ✅ **Repository**: Debe estar conectado a `mendozaxmenos-create/milo-bookings`
   - ✅ **Production Branch**: Debe ser `main`
   - ✅ **Auto Deploy**: Debe estar **activado** (ON)

   **Si Auto Deploy está desactivado:**
   - Actívalo
   - Guarda los cambios

### 2. Verificar Root Directory (MUY IMPORTANTE)

1. **Ve a Settings → General:**
   - ✅ **Root Directory**: Debe ser `frontend/admin-panel`
   
   **⚠️ Si está vacío o es incorrecto:**
   - Cámbialo a: `frontend/admin-panel`
   - Guarda los cambios
   - Esto es **crítico** - sin esto, Vercel no encontrará el proyecto

2. **Verificar Build Settings:**
   - **Build Command**: `npm run build` (o déjalo en Auto)
   - **Output Directory**: `dist` (o déjalo en Auto)
   - **Install Command**: `npm install` (o déjalo en Auto)

### 3. Verificar Webhook de GitHub

1. **En GitHub:**
   - Ve a tu repositorio: https://github.com/mendozaxmenos-create/milo-bookings
   - Ve a **Settings** → **Webhooks**
   - Debe haber un webhook de Vercel activo

2. **Si no hay webhook:**
   - Ve a Vercel Dashboard → Settings → Git
   - Haz clic en **"Disconnect"** y luego **"Connect Git Repository"** de nuevo
   - Esto recreará el webhook automáticamente

### 4. Verificar Variables de Entorno

1. **Ve a Settings → Environment Variables:**
   - ✅ Debe existir: `VITE_API_URL` = `https://milo-bookings.onrender.com`
   - ✅ Debe estar marcado para: Production, Preview, Development

---

## 🔧 Si Auto-Deploy No Funciona

### Solución 1: Reconectar el Repositorio

1. **Vercel Dashboard → Settings → Git**
2. Haz clic en **"Disconnect"** (desconectar)
3. Haz clic en **"Connect Git Repository"**
4. Selecciona: `mendozaxmenos-create/milo-bookings`
5. Configura:
   - **Production Branch**: `main`
   - **Root Directory**: `frontend/admin-panel`
   - **Auto Deploy**: ✅ Activado
6. Guarda

Esto recreará el webhook y debería funcionar automáticamente.

### Solución 2: Verificar que el Último Commit Esté en Main

1. **En GitHub:**
   - Ve a tu repositorio
   - Verifica que el último commit en `main` sea el merge del PR

2. **Si el merge no está en main:**
   - El PR fue mergeado, pero puede que necesites hacer pull localmente
   - O puede que el webhook no se haya activado

### Solución 3: Probar con un Commit Nuevo

Una vez que verifiques todo lo anterior, haz un pequeño cambio y push:

```bash
# En una terminal nueva (no la que tiene el editor abierto)
cd C:\Users\gusta\Desktop\milo-bookings
git checkout main
git pull origin main
# Hacer un pequeño cambio (ej: agregar un comentario en README.md)
git add .
git commit -m "test: Verificar auto-deploy en Vercel"
git push origin main
```

Vercel debería detectar el push automáticamente y desplegar.

---

## ✅ Verificación Final

Después de verificar todo:

1. **Ve a Vercel Dashboard → Deployments**
2. **Deberías ver:**
   - Un deployment reciente (del merge del PR)
   - O un nuevo deployment iniciándose cuando hagas push

3. **Si ves un deployment:**
   - Haz clic en él para ver los logs
   - Verifica que el build se complete correctamente
   - Verifica que el Root Directory sea correcto en los logs

---

## 🐛 Problemas Comunes

### Problema: "No deployments found"

**Causa:** El Root Directory no está configurado o es incorrecto.

**Solución:**
- Ve a Settings → General
- Configura Root Directory: `frontend/admin-panel`
- Guarda y haz un nuevo push

### Problema: "Build failed" o "Cannot find package.json"

**Causa:** El Root Directory está mal configurado.

**Solución:**
- Verifica que Root Directory sea exactamente: `frontend/admin-panel`
- No debe tener espacios ni barras al final
- Debe ser relativo a la raíz del repositorio

### Problema: Auto-deploy no se activa

**Causa:** El webhook de GitHub no está funcionando.

**Solución:**
- Reconecta el repositorio en Vercel (Settings → Git → Disconnect → Connect)
- O verifica en GitHub que el webhook esté activo

---

## 📝 Resumen

**Para que funcione automáticamente:**

1. ✅ **Root Directory**: `frontend/admin-panel` (en Settings → General)
2. ✅ **Production Branch**: `main` (en Settings → Git)
3. ✅ **Auto Deploy**: Activado (en Settings → Git)
4. ✅ **Webhook**: Activo en GitHub (Settings → Webhooks)
5. ✅ **Variables de entorno**: `VITE_API_URL` configurada

**Una vez configurado correctamente:**
- Cada push a `main` → Vercel despliega automáticamente
- No necesitas hacer nada manual
- Todo funciona como antes

---

**¿Necesitas ayuda verificando algún paso?** Avísame qué ves en tu dashboard de Vercel.

