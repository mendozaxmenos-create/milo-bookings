# 🔀 Crear PR Manualmente en GitHub

## Si no aparece el banner automático

### Opción 1: Crear PR desde GitHub Web

1. **Ve a GitHub:**
   - https://github.com/mendozaxmenos-create/milo-bookings

2. **Haz clic en "Pull requests"** (arriba del repositorio)

3. **Haz clic en "New pull request"** (botón verde)

4. **Configura el PR:**
   - **Base branch**: `main` (selecciona desde el dropdown)
   - **Compare branch**: `fix/corregir-rutas-api` (selecciona desde el dropdown)
   
   Si no ves `fix/corregir-rutas-api` en el dropdown:
   - Verifica que hayas hecho push de la rama
   - O usa la URL directa (ver Opción 2)

5. **Revisa los cambios:**
   - Deberías ver los archivos modificados
   - Verifica que incluyan las correcciones de rutas de API

6. **Completa el PR:**
   - **Título**: `fix: Corregir todas las rutas de API - agregar prefijo /api`
   - **Descripción**: (opcional) "Corrige todas las rutas de API para incluir el prefijo /api necesario para conectar con el backend"
   - **Clic en "Create pull request"**

7. **Haz merge del PR:**
   - Una vez creado, haz clic en "Merge pull request"
   - Confirma el merge

---

### Opción 2: URL Directa del PR

Si la rama existe, puedes usar esta URL directamente:

```
https://github.com/mendozaxmenos-create/milo-bookings/compare/main...fix/corregir-rutas-api
```

Copia y pega esta URL en tu navegador.

---

### Opción 3: Verificar que la Rama Existe

1. **Ve a GitHub:**
   - https://github.com/mendozaxmenos-create/milo-bookings

2. **Haz clic en el dropdown de ramas** (arriba, donde dice "main" o el nombre de la rama actual)

3. **Busca `fix/corregir-rutas-api`** en la lista

4. **Si NO aparece:**
   - La rama no se subió correctamente
   - Vuelve a ejecutar: `git push -u origin fix/corregir-rutas-api`

5. **Si SÍ aparece:**
   - Selecciónala
   - Luego ve a "Pull requests" → "New pull request"
   - Debería aparecer automáticamente

---

## 🔍 Verificar Estado Actual

Ejecuta estos comandos para verificar:

```bash
git branch -a
```

Esto te mostrará todas las ramas (locales y remotas). Deberías ver:
- `fix/corregir-rutas-api` (local)
- `remotes/origin/fix/corregir-rutas-api` (remota)

Si no ves la remota, la rama no se subió correctamente.

---

## 🚀 Si la Rama No Existe en GitHub

Ejecuta estos comandos de nuevo:

```bash
cd C:\Users\gusta\Desktop\milo-bookings
git checkout fix/corregir-rutas-api
git push -u origin fix/corregir-rutas-api
```

Luego intenta crear el PR de nuevo.

---

**¿Qué ves cuando vas a GitHub?** ¿Aparece la rama `fix/corregir-rutas-api` en el dropdown de ramas?




