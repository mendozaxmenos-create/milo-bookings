# 📁 Verificar Root Directory en Vercel

## 🎯 Ubicación del Root Directory

El **Root Directory** está en una sección diferente a "General". Sigue estos pasos:

### Paso 1: Ir a Build and Deployment

1. En Vercel Dashboard → Tu proyecto → **Settings**
2. En el menú lateral izquierdo, busca **"Build and Deployment"**
3. Haz clic en **"Build and Deployment"**

### Paso 2: Verificar Root Directory

En la sección **"Build and Deployment"**, busca:

- **Root Directory**: Debe decir `frontend/admin-panel`
  - Si está vacío o dice algo diferente, cámbialo
  - Haz clic en **"Edit"** o el campo para editarlo
  - Escribe: `frontend/admin-panel`
  - Guarda los cambios

### Paso 3: Verificar Otras Configuraciones

Mientras estás en "Build and Deployment", verifica también:

- **Build Command**: Debe ser `npm run build` (o Auto)
- **Output Directory**: Debe ser `dist` (o Auto)
- **Install Command**: Debe ser `npm install` (o Auto)
- **Framework Preset**: Debe ser `Vite` (o Auto)

---

## ✅ Configuración Correcta

**Root Directory**: `frontend/admin-panel`

**Sin espacios, sin barras al final, exactamente así.**

---

## 🔍 Si No Ves "Build and Deployment"

Algunos proyectos de Vercel tienen la configuración en diferentes lugares:

1. **En "General"**: A veces hay una sección "Build Settings" o "Project Settings"
2. **Al crear el proyecto**: Si acabas de crear el proyecto, puede estar en la pantalla de configuración inicial
3. **En el deployment**: A veces puedes configurarlo al hacer un deployment manual

---

## 🚨 Si Root Directory Está Vacío o Incorrecto

**Esto es el problema principal.** Sin el Root Directory correcto:

- Vercel busca el proyecto en la raíz del repositorio
- No encuentra `package.json` en la raíz (está en `frontend/admin-panel/`)
- El build falla o no se activa el auto-deploy

**Solución:**
1. Configura Root Directory: `frontend/admin-panel`
2. Guarda
3. Haz un push a `main` para probar

---

**¿Puedes verificar en "Build and Deployment" y decirme qué dice en "Root Directory"?**

