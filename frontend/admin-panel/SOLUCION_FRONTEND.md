# 🔧 Solución de Problemas del Frontend

## ❌ Error: PostCSS config

Si ves un error sobre PostCSS, ya está solucionado con el archivo `postcss.config.js`.

## ❌ Frontend no inicia

### Verificar:
1. ✅ Dependencias instaladas: `npm install --legacy-peer-deps`
2. ✅ Backend corriendo en puerto 3000
3. ✅ No hay otros procesos usando el puerto 3001

### Reiniciar:
```powershell
# Cerrar procesos Node
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Esperar 2 segundos
Start-Sleep -Seconds 2

# Iniciar frontend
cd frontend\admin-panel
npm run dev
```

## ❌ ERR_CONNECTION_REFUSED

### Causas comunes:
1. El frontend no está corriendo
2. Puerto incorrecto
3. Firewall bloqueando

### Solución:
1. Verificar que el proceso esté corriendo:
   ```powershell
   Get-Process -Name node
   ```

2. Verificar el puerto:
   ```powershell
   Get-NetTCPConnection -LocalPort 3001
   ```

3. Si no hay nada, reiniciar el frontend

## ✅ Verificar que Funciona

El frontend debería mostrar en la consola:
```
VITE v5.x.x  ready in XXXX ms

➜  Local:   http://localhost:3001/
```

Si ves esto, el frontend está funcionando. Abre http://localhost:3001 en tu navegador.

