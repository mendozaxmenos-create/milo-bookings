# 🚀 Forzar Deployment en Vercel

## 📋 Problema

Vercel no está desplegando automáticamente después del merge a `main`.

## ✅ Soluciones

### Solución 1: Verificar Configuración del Proyecto

1. **Ve a Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Selecciona tu proyecto: **"Milo bookings' projects"**

2. **Ve a Settings → Git:**
   - Verifica que el repositorio esté conectado: `mendozaxmenos-create/milo-bookings`
   - Verifica que **"Production Branch"** sea `main`
   - Verifica que **"Auto Deploy"** esté activado (debería estar por defecto)

3. **Ve a Settings → General:**
   - Verifica **"Root Directory"**: Debería ser `frontend/admin-panel` o vacío
   - Verifica **"Build Command"**: Debería ser `npm run build` o detectado automáticamente
   - Verifica **"Output Directory"**: Debería ser `dist` o detectado automáticamente

### Solución 2: Forzar Deployment Manual

1. **Ve a la pestaña "Deployments"** en Vercel

2. **Haz clic en "Create Deployment"** o **"Deploy"** (botón en la parte superior)

3. **Configura el deployment:**
   - **Branch:** `main`
   - **Framework Preset:** Vite (o déjalo en Auto)
   - **Root Directory:** `frontend/admin-panel`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Haz clic en "Deploy"**

### Solución 3: Verificar Webhook de GitHub

1. **En Vercel Dashboard → Settings → Git:**
   - Verifica que el webhook de GitHub esté configurado
   - Si no está, haz clic en **"Connect Git Repository"** y reconecta

2. **En GitHub:**
   - Ve a tu repositorio → **Settings** → **Webhooks**
   - Verifica que haya un webhook de Vercel activo
   - Si no está, Vercel debería crearlo automáticamente al reconectar

### Solución 4: Hacer Commit Vacío para Forzar Deploy

Si nada funciona, puedes hacer un commit vacío para forzar el deployment:

```bash
git checkout main
git pull origin main
git commit --allow-empty -m "trigger: Forzar deployment en Vercel"
git push origin main
```

Esto debería triggerear el webhook de Vercel.

### Solución 5: Verificar Logs de Vercel

1. **Ve a Vercel Dashboard → Deployments**
2. **Busca el último deployment** (aunque sea antiguo)
3. **Haz clic en él** para ver los logs
4. **Revisa si hay errores** en el build o deployment

---

## 🔍 Diagnóstico Rápido

### Checklist:

- [ ] ¿El proyecto está conectado a GitHub en Vercel?
- [ ] ¿La rama de producción es `main`?
- [ ] ¿Auto Deploy está activado?
- [ ] ¿El Root Directory está configurado correctamente?
- [ ] ¿Hay un webhook de Vercel en GitHub?
- [ ] ¿El último commit en `main` es el merge del PR?

---

## 🎯 Pasos Inmediatos (Recomendado)

1. **Ve a Vercel Dashboard → Tu proyecto → Deployments**
2. **Haz clic en "Create Deployment"**
3. **Selecciona:**
   - Branch: `main`
   - Root Directory: `frontend/admin-panel`
4. **Haz clic en "Deploy"**

Esto debería iniciar el deployment inmediatamente.

---

## 🐛 Si el Deployment Falla

### Verificar Build Localmente

```bash
cd frontend/admin-panel
npm install
npm run build
```

Si el build falla localmente, hay un problema con el código que necesita resolverse antes de desplegar.

### Verificar Variables de Entorno

1. **Ve a Vercel Dashboard → Settings → Environment Variables**
2. **Verifica que exista:**
   - `VITE_API_URL` = `https://milo-bookings.onrender.com`
3. **Si falta, agrégalo y haz redeploy**

---

**¿Necesitas ayuda con algún paso específico?** Avísame y te guío.

