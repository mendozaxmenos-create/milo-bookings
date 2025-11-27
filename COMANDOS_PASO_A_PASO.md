# 📝 Comandos Paso a Paso - Subir Correcciones de API

## 🚀 Ejecuta estos comandos UNO POR UNO

Copia y pega cada comando en tu terminal, espera a que termine, luego ejecuta el siguiente.

---

### Paso 1: Ir al directorio
```bash
cd C:\Users\gusta\Desktop\milo-bookings
```

### Paso 2: Cambiar a rama main
```bash
git checkout main
```

### Paso 3: Actualizar desde GitHub
```bash
git pull origin main
```

### Paso 4: Agregar todos los cambios
```bash
git add -A
```

### Paso 5: Ver qué se va a commitear (opcional)
```bash
git status
```
Esto te mostrará qué archivos se van a subir. Deberías ver:
- `frontend/admin-panel/src/services/api.ts`
- `frontend/admin-panel/src/pages/Settings.tsx`
- `frontend/admin-panel/src/pages/Services.tsx`
- `frontend/admin-panel/src/pages/Dashboard.tsx`
- `frontend/admin-panel/src/pages/Bookings.tsx`
- `frontend/admin-panel/src/pages/Availability.tsx`

### Paso 6: Hacer commit
```bash
git commit -m "fix: Corregir todas las rutas de API - agregar prefijo /api a todas las rutas"
```

### Paso 7: Crear rama nueva
```bash
git checkout -b fix/corregir-rutas-api
```

### Paso 8: Subir la rama a GitHub
```bash
git push -u origin fix/corregir-rutas-api
```

---

## ✅ Después del Push

1. **Ve a GitHub:**
   - https://github.com/mendozaxmenos-create/milo-bookings

2. **Verás un banner** que dice: "fix/corregir-rutas-api had recent pushes"
   - Clic en **"Compare & pull request"**

3. **O manualmente:**
   - Ve a **Pull Requests** → **New Pull Request**
   - **Base**: `main`
   - **Compare**: `fix/corregir-rutas-api`
   - Clic en **"Create Pull Request"**

4. **Haz merge del PR:**
   - Clic en **"Merge Pull Request"**
   - Confirma el merge

5. **Vercel debería detectar el cambio** automáticamente y hacer deployment

---

## 🔍 Si Aparece Algún Error

### Error: "branch already exists"
```bash
git checkout -b fix/corregir-rutas-api-2
git push -u origin fix/corregir-rutas-api-2
```

### Error: "nothing to commit"
Los cambios ya están commiteados. Continúa con el paso 7.

### Error: "editor blocking"
Cierra la terminal y abre una nueva, luego continúa desde donde quedaste.

---

**¿Listo?** Ejecuta los comandos uno por uno y avísame si aparece algún error.

