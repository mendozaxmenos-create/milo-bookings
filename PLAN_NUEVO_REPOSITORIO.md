# 🚀 Plan Completo: Nuevo Repositorio Limpio

**Objetivo:** Crear un repositorio nuevo y limpio, manteniendo solo lo esencial.

---

## 📋 Paso 1: Crear Nuevo Repositorio en GitHub

1. Ve a: https://github.com/new
2. **Repository name:** `milo-bookings` (o el que prefieras)
3. **Description:** Sistema de gestión de reservas white label - WhatsApp booking system
4. **Visibility:** Private (recomendado)
5. **NO marques** ninguna opción de inicialización
6. Haz clic en **"Create repository"**
7. **Copia la URL** del nuevo repositorio

---

## 📋 Paso 2: Preparar Código Local

### 2.1 Ejecutar Script de Limpieza

Ejecuta:
```powershell
.\CREAR_NUEVO_REPOSITORIO_COMPLETO.bat
```

Este script:
- ✅ Crea backup automático
- ✅ Elimina scripts temporales
- ✅ Elimina git actual
- ✅ Inicializa nuevo repositorio
- ✅ Prepara todo para commit

### 2.2 Conectar al Nuevo Repositorio

Después del script, ejecuta:
```powershell
git remote add origin https://github.com/TU-USUARIO/milo-bookings.git
git add .
git commit -m "Initial commit: Milo Bookings - Sistema completo"
git push -u origin main
```

---

## 📋 Paso 3: Reconfigurar Vercel

### 3.1 Conectar Nuevo Repositorio

1. Vercel Dashboard → Tu proyecto → **Settings** → **Git**
2. Haz clic en **"Disconnect"** o **"Change Repository"**
3. Selecciona **"Connect Git Repository"**
4. Selecciona tu nuevo repositorio
5. Configura:
   - **Root Directory:** `frontend/admin-panel`
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 3.2 Verificar Variables

**Settings** → **Environment Variables:**
- `VITE_API_URL` = `https://milo-bookings.onrender.com`
- Otras variables necesarias

### 3.3 Deploy

Vercel hará deploy automático o hazlo manualmente.

---

## 📋 Paso 4: Reconfigurar Render

### 4.1 Conectar Nuevo Repositorio

1. Render Dashboard → Tu servicio → **Settings** → **Build & Deploy**
2. Haz clic en **"Change Repository"**
3. Selecciona tu nuevo repositorio
4. Configura:
   - **Branch:** `main`
   - **Root Directory:** (vacío o `backend` si necesario)

### 4.2 Verificar Variables

**Environment:**
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV=production`
- `SHORTLINK_BASE_URL` (si la usas)
- Otras variables necesarias

### 4.3 Deploy Manual

**Manual Deploy** → **Deploy latest commit**

---

## 📋 Paso 5: Verificar

### 5.1 Backend

1. `https://milo-bookings.onrender.com/`
2. Verifica que aparezcan todos los endpoints

### 5.2 Frontend

1. Tu URL de Vercel
2. Verifica que cargue correctamente
3. Prueba login y funcionalidades

---

## 🧹 Archivos que se Eliminarán

El script eliminará:
- ✅ Scripts `.bat` y `.ps1` temporales
- ✅ Archivos `.txt` de comandos
- ✅ Git actual (para empezar limpio)

**Se mantendrán:**
- ✅ Todo el código fuente
- ✅ `README.md`
- ✅ `BACKLOG.md`
- ✅ Documentación importante
- ✅ Archivos de configuración

---

## ✅ Checklist

- [ ] Nuevo repositorio creado en GitHub
- [ ] Script de limpieza ejecutado
- [ ] Código subido al nuevo repo
- [ ] Vercel reconectado
- [ ] Render reconectado
- [ ] Variables de entorno verificadas
- [ ] Deploy completado
- [ ] Todo funciona

---

**¿Listo para empezar?** Ejecuta el script y sigue los pasos. 🚀

