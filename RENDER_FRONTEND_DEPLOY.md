# 🎨 Desplegar Frontend en Render

El backend está funcionando correctamente en:
```
https://milo-bookings.onrender.com
```

Ahora necesitas desplegar el frontend (panel de administración) por separado.

## 🎯 Opción 1: Render (Recomendado - Mismo lugar que el backend)

### Paso 1: Crear nuevo servicio en Render

1. En tu Dashboard de Render, haz clic en **"+ New"**
2. Selecciona **"Static Site"** (para aplicaciones React/Vite)

### Paso 2: Conectar repositorio

1. Selecciona tu repositorio: `mendozaxmenos-create/milo-bookings`
2. Configura:
   - **Name**: `milo-bookings-frontend`
   - **Branch**: `main` o `feat/logs-and-improvements`
   - **Root Directory**: `frontend/admin-panel`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: **Free**

### Paso 3: Variables de Entorno

Agrega esta variable:

```
VITE_API_URL=https://milo-bookings.onrender.com
```

### Paso 4: Deploy

1. Haz clic en **"Create Static Site"**
2. Render construirá y desplegará automáticamente
3. Tu frontend estará disponible en: `https://milo-bookings-frontend.onrender.com`

---

## 🎯 Opción 2: Vercel (Muy fácil y rápido)

### Paso 1: Crear cuenta

1. Ve a https://vercel.com
2. Conecta tu cuenta de GitHub

### Paso 2: Importar proyecto

1. Haz clic en **"Add New Project"**
2. Selecciona: `mendozaxmenos-create/milo-bookings`
3. Configura:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend/admin-panel`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Paso 3: Variables de Entorno

Agrega:
```
VITE_API_URL=https://milo-bookings.onrender.com
```

### Paso 4: Deploy

1. Haz clic en **"Deploy"**
2. Vercel desplegará automáticamente
3. Tu frontend estará disponible en: `https://milo-bookings-frontend.vercel.app`

---

## 🎯 Opción 3: Netlify (Similar a Vercel)

### Paso 1: Crear cuenta

1. Ve a https://netlify.com
2. Conecta tu cuenta de GitHub

### Paso 2: Importar proyecto

1. Haz clic en **"Add new site"** → **"Import an existing project"**
2. Selecciona tu repositorio
3. Configura:
   - **Base directory**: `frontend/admin-panel`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### Paso 3: Variables de Entorno

En **"Site settings"** → **"Environment variables"**, agrega:
```
VITE_API_URL=https://milo-bookings.onrender.com
```

### Paso 4: Deploy

1. Netlify desplegará automáticamente
2. Tu frontend estará disponible en: `https://milo-bookings-frontend.netlify.app`

---

## 🔗 Conectar Frontend con Backend

Una vez desplegado, el frontend usará automáticamente la API del backend gracias a la variable `VITE_API_URL`.

### Verificar conexión:

1. Abre tu frontend desplegado
2. Intenta hacer login
3. Si funciona, ¡todo está conectado! ✅

---

## 📝 Resumen

- **Backend**: ✅ Desplegado en `https://milo-bookings.onrender.com`
- **Frontend**: ⏳ Necesita ser desplegado (elige una de las opciones arriba)
- **Conexión**: Configura `VITE_API_URL` apuntando al backend

---

## 💡 Recomendación

**Vercel** es la opción más rápida y fácil para React/Vite:
- ✅ Deploy automático desde GitHub
- ✅ SSL/HTTPS automático
- ✅ Muy rápido
- ✅ Plan gratuito generoso

**Render** es buena si quieres todo en un solo lugar:
- ✅ Mismo dashboard que el backend
- ✅ Fácil de gestionar
- ⚠️ Puede ser un poco más lento que Vercel

---

**¿Listo para desplegar el frontend?** Elige una opción y sigue los pasos. 🚀

