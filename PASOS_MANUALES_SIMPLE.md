# 📝 Pasos Manuales Simples (Sin Scripts)

## 🚀 Ejecuta estos comandos UNO POR UNO

Abre PowerShell y ejecuta cada comando, esperando a que termine antes del siguiente:

### Paso 1: Preparar
```powershell
cd C:\Users\gusta\Desktop\milo-bookings
```

### Paso 2: Cambiar a main
```powershell
git checkout main
```

### Paso 3: Actualizar
```powershell
git pull origin main
```

### Paso 4: Agregar cambios
```powershell
git add -A
```

### Paso 5: Ver qué se va a subir
```powershell
git status
```

### Paso 6: Hacer commit
```powershell
git commit -m "chore: Forzar deployment completo - Shortlinks"
```

### Paso 7: Crear rama nueva
```powershell
git checkout -b fix/deployment-final
```

### Paso 8: Subir a GitHub
```powershell
git push -u origin fix/deployment-final
```

---

## ✅ Después del Push

1. **Ve a GitHub:**
   - https://github.com/mendozaxmenos-create/milo-bookings

2. **Verás un banner** que dice: "fix/deployment-final had recent pushes"
   - Clic en **"Compare & pull request"**

3. **O manualmente:**
   - Ve a **Pull Requests** → **New Pull Request**
   - **Base**: `main`
   - **Compare**: `fix/deployment-final`
   - Clic en **"Create Pull Request"**

4. **Haz merge del PR:**
   - Clic en **"Merge Pull Request"**
   - Confirma el merge

---

## 🚀 Forzar Deployment en Vercel

Después del merge:

1. **Vercel Dashboard** → **Deployments**
2. **"Create Deployment"** o **"Deploy"**
3. **Branch**: `main`
4. **Root Directory**: `frontend/admin-panel` (verifica que esté así)
5. **Desmarca**: "Use existing Build Cache" (para build limpio)
6. **Clic en "Deploy"**

---

## 🔍 Verificar Configuración

**IMPORTANTE:** Verifica en Vercel:

**Settings → Build and Deployment:**
- Root Directory: `frontend/admin-panel` (exactamente así)
- Build Command: `npm run build` (sin `cd frontend/admin-panel`)
- Output Directory: `dist` (sin `frontend/admin-panel/dist`)

---

**¿Listo?** Ejecuta los comandos uno por uno y avísame si hay algún error.

