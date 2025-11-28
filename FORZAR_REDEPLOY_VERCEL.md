# 🚀 Forzar Redeploy en Vercel - Paso a Paso

## ✅ Opción 1: Redeploy desde Vercel Dashboard (Más Rápido)

### Paso 1: Ir a Deployments

1. En Vercel Dashboard, ve a tu proyecto: **"Milo bookings' projects"**
2. Haz clic en la pestaña **"Deployments"** (arriba)

### Paso 2: Encontrar el Último Deployment

1. Busca el deployment más reciente (el que está arriba de la lista)
2. Debería tener un estado: **"Ready"** (✅ verde) o **"Building"** o **"Error"**

### Paso 3: Hacer Redeploy

**Opción A: Desde el menú del deployment**
1. Haz clic en los **tres puntos (⋯)** a la derecha del deployment
2. Selecciona **"Redeploy"**
3. Confirma el redeploy

**Opción B: Desde el botón superior**
1. En la parte superior de la página de Deployments
2. Busca el botón **"Create Deployment"** o **"Deploy"**
3. Haz clic en él
4. Selecciona:
   - **Branch**: `main`
   - **Root Directory**: `frontend/admin-panel` (debería estar pre-configurado)
5. Haz clic en **"Deploy"**

### Paso 4: Verificar

1. Deberías ver un nuevo deployment iniciándose
2. Espera a que termine (puede tardar 1-3 minutos)
3. Una vez que esté **"Ready"**, haz clic en él para ver la URL

---

## ✅ Opción 2: Hacer Push a Main (Desde Git)

Si prefieres hacerlo desde Git (para probar que el auto-deploy funciona):

### Paso 1: Abrir una Terminal Nueva

**Importante:** Abre una terminal nueva (no la que tiene el editor abierto).

- **PowerShell**: Win + X → Windows PowerShell
- **Git Bash**: Si tienes Git instalado
- **CMD**: Win + R → `cmd`

### Paso 2: Ir al Directorio del Proyecto

```bash
cd C:\Users\gusta\Desktop\milo-bookings
```

### Paso 3: Verificar que Estás en Main

```bash
git checkout main
git pull origin main
```

### Paso 4: Hacer un Cambio Pequeño y Push

**Opción A: Cambio en README (más simple)**
```bash
# Agregar una línea al final del README
echo "" >> README.md
echo "<!-- Última actualización: $(Get-Date) -->" >> README.md
git add README.md
git commit -m "chore: Actualizar README para probar auto-deploy"
git push origin main
```

**Opción B: Commit vacío (sin cambios)**
```bash
git commit --allow-empty -m "trigger: Probar auto-deploy en Vercel"
git push origin main
```

### Paso 5: Verificar en Vercel

1. Ve a Vercel Dashboard → Deployments
2. Deberías ver un nuevo deployment iniciándose automáticamente
3. Esto confirma que el auto-deploy está funcionando

---

## 🎯 Recomendación

**Usa la Opción 1** (Redeploy desde Vercel) - Es más rápido y no requiere Git.

**Usa la Opción 2** (Push a main) - Si quieres verificar que el auto-deploy funciona correctamente para el futuro.

---

## ✅ Después del Redeploy

1. Espera a que el deployment termine (estado: **"Ready"**)
2. Haz clic en el deployment para ver la URL
3. Abre la URL en tu navegador
4. Verifica que el frontend funcione correctamente

---

**¿Necesitas ayuda con algún paso?** Avísame y te guío.

