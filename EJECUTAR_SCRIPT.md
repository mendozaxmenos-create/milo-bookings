# 🚀 Ejecutar Script Automático

## ✅ Opción 1: Ejecutar Script .bat (Más Fácil)

1. **Busca el archivo:** `subir-cambios-api.bat` en la carpeta del proyecto
2. **Haz doble clic** en el archivo
3. **Espera** a que termine (verás los mensajes en la ventana)
4. **Cuando termine**, te mostrará la URL del PR

## ✅ Opción 2: Desde PowerShell (Si el .bat no funciona)

1. **Abre PowerShell** (Win + X → Windows PowerShell)
2. **Ejecuta:**
   ```powershell
   cd C:\Users\gusta\Desktop\milo-bookings
   .\subir-cambios-api.bat
   ```

## ✅ Opción 3: Comandos Manuales (Si nada funciona)

Copia y pega estos comandos **uno por uno** en una terminal nueva:

```bash
cd C:\Users\gusta\Desktop\milo-bookings
git checkout main
git pull origin main
git add -A
git commit -m "fix: Corregir todas las rutas de API - agregar prefijo /api"
git checkout -b fix/corregir-rutas-api
git push -u origin fix/corregir-rutas-api
```

---

## 📋 Después del Push

1. **Ve a GitHub:**
   - https://github.com/mendozaxmenos-create/milo-bookings
   - Verás un banner para crear PR
   - O ve a: Pull Requests → New Pull Request

2. **Crea el PR:**
   - Base: `main`
   - Compare: `fix/corregir-rutas-api`
   - Clic en "Create Pull Request"

3. **Haz merge del PR**

4. **Vercel debería detectar el cambio** y hacer deployment automáticamente

---

**¿Qué opción prefieres?** El script .bat es la más fácil - solo haz doble clic.

