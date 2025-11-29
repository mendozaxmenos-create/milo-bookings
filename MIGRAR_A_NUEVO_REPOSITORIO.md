# 🚀 Migrar a Nuevo Repositorio - Plan Completo

**Objetivo:** Crear un nuevo repositorio limpio, manteniendo las configuraciones de Vercel y Render.

---

## 📋 Paso 1: Preparar el Código Actual

### 1.1 Hacer Backup

1. **Copia toda la carpeta del proyecto:**
   - Copia `C:\Users\gusta\Desktop\milo-bookings` a otra ubicación como backup
   - Ejemplo: `C:\Users\gusta\Desktop\milo-bookings-backup`

### 1.2 Limpiar Archivos Temporales

Vamos a eliminar archivos de documentación excesiva y scripts temporales, pero mantener lo esencial.

**Archivos a ELIMINAR:**
- Todos los `.bat` y `.ps1` de scripts temporales
- Archivos de documentación duplicada o temporal
- Archivos `.txt` de comandos

**Archivos a MANTENER:**
- `README.md` (principal)
- `BACKLOG.md`
- `package.json` y dependencias
- Todo el código fuente (`backend/`, `frontend/`, `shared/`)
- Archivos de configuración importantes

---

## 📋 Paso 2: Crear Nuevo Repositorio en GitHub

### 2.1 Crear Repositorio

1. Ve a: https://github.com/new
2. **Repository name:** `milo-bookings` (o el nombre que prefieras)
3. **Description:** Sistema de gestión de reservas white label basado en Milo Bot
4. **Visibility:** Private (o Public, según prefieras)
5. **NO marques** ninguna opción de inicialización
6. Haz clic en **"Create repository"**

### 2.2 Anotar la URL

Anota la URL del nuevo repositorio, por ejemplo:
```
https://github.com/TU-USUARIO/milo-bookings.git
```

---

## 📋 Paso 3: Preparar Código Local

### 3.1 Limpiar Git Actual

En una nueva terminal:

```powershell
cd C:\Users\gusta\Desktop\milo-bookings

# Eliminar el git actual
Remove-Item -Recurse -Force .git

# Inicializar nuevo repositorio
git init

# Agregar remote del nuevo repositorio
git remote add origin https://github.com/TU-USUARIO/milo-bookings.git
```

### 3.2 Limpiar Archivos Temporales

Eliminar archivos que no necesitamos:

```powershell
# Eliminar scripts temporales
Remove-Item *.bat -ErrorAction SilentlyContinue
Remove-Item *.ps1 -ErrorAction SilentlyContinue
Remove-Item *.txt -ErrorAction SilentlyContinue

# Eliminar documentación temporal (mantener solo lo esencial)
# (Haremos esto manualmente para no borrar cosas importantes)
```

### 3.3 Crear .gitignore Limpio

Verificar que `.gitignore` esté correcto y tenga todo lo necesario.

---

## 📋 Paso 4: Commit y Push Inicial

### 4.1 Agregar Todo

```powershell
git add .
git commit -m "Initial commit: Milo Bookings - Sistema completo de reservas"
git branch -M main
git push -u origin main
```

---

## 📋 Paso 5: Reconfigurar Vercel

### 5.1 Conectar Nuevo Repositorio

1. Ve a Vercel Dashboard: https://vercel.com/dashboard
2. Selecciona tu proyecto actual
3. Ve a **Settings** → **Git**
4. Haz clic en **"Disconnect"** o **"Change Repository"**
5. Selecciona **"Connect Git Repository"**
6. Selecciona tu nuevo repositorio
7. Configura:
   - **Root Directory:** `frontend/admin-panel`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 5.2 Reconfigurar Variables de Entorno

1. Ve a **Settings** → **Environment Variables**
2. Verifica que estén configuradas:
   - `VITE_API_URL` = `https://milo-bookings.onrender.com`
   - `DATABASE_URL` (si es necesario)
   - `WHATSAPP_NUMBER` (si es necesario)

### 5.3 Hacer Deploy

Vercel debería hacer deploy automático, o hazlo manualmente.

---

## 📋 Paso 6: Reconfigurar Render

### 6.1 Conectar Nuevo Repositorio

1. Ve a Render Dashboard: https://dashboard.render.com
2. Selecciona tu servicio `milo-bookings`
3. Ve a **Settings** → **Build & Deploy**
4. Haz clic en **"Change Repository"**
5. Selecciona tu nuevo repositorio
6. Configura:
   - **Branch:** `main`
   - **Root Directory:** (dejar vacío o `backend` si es necesario)
   - **Build Command:** (dejar vacío si usas Docker)
   - **Start Command:** (dejar vacío si usas Docker)

### 6.2 Verificar Variables de Entorno

1. Ve a **Environment**
2. Verifica que todas las variables estén configuradas:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV`
   - `SHORTLINK_BASE_URL` (si la agregaste)
   - Etc.

### 6.3 Hacer Deploy Manual

1. Haz clic en **"Manual Deploy"**
2. Selecciona **"Deploy latest commit"**
3. Espera a que termine

---

## 📋 Paso 7: Verificar que Todo Funciona

### 7.1 Backend

1. Abre: `https://milo-bookings.onrender.com/`
2. Verifica que aparezcan todos los endpoints, incluyendo `shortlinks`

### 7.2 Frontend

1. Abre tu frontend en Vercel
2. Verifica que cargue correctamente
3. Prueba iniciar sesión
4. Prueba la página de Shortlinks

---

## 🧹 Archivos a Eliminar (Opcional)

Si quieres un repositorio más limpio, puedes eliminar:

- Scripts `.bat` y `.ps1` temporales
- Archivos de documentación duplicada
- Archivos `.txt` de comandos
- Documentación muy específica que ya no necesitas

**Pero mantén:**
- `README.md`
- `BACKLOG.md`
- Documentación importante de arquitectura
- Archivos de configuración

---

## ✅ Checklist Final

- [ ] Backup creado
- [ ] Nuevo repositorio creado en GitHub
- [ ] Código limpio y subido
- [ ] Vercel reconectado al nuevo repo
- [ ] Render reconectado al nuevo repo
- [ ] Variables de entorno verificadas
- [ ] Deploy completado
- [ ] Todo funciona correctamente

---

**¿Quieres que te ayude a crear un script que automatice parte de este proceso?**



