# 🧪 Instrucciones para Probar la Aplicación

## ⚠️ IMPORTANTE: Antes de empezar

1. **Asegúrate de tener Node.js instalado** (versión 18 o superior)
2. **Instala las dependencias** si no lo has hecho:
   ```bash
   npm install --legacy-peer-deps
   ```

## 🚀 Iniciar la Aplicación

### Opción 1: Usando los Scripts PowerShell (Recomendado)

#### Terminal 1 - Backend:
```powershell
cd backend
.\start.ps1
```

#### Terminal 2 - Frontend:
```powershell
cd frontend\admin-panel
.\start.ps1
```

### Opción 2: Manual

#### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend:
```bash
cd frontend/admin-panel
npm run dev
```

## 📝 Datos de Prueba

### Usuario para Login:
- **Business ID**: `demo-business-001`
- **Teléfono**: `+5491123456789`
- **Contraseña**: `demo123`

### Servicios de Prueba (ya creados):
1. Corte de Cabello - $2,500.00
2. Peinado - $3,500.00
3. Tintura - $5,000.00

## ✅ Verificar que Todo Funciona

### 1. Backend (http://localhost:3000)
- Abre: http://localhost:3000/health
- Deberías ver: `{"status":"ok","timestamp":"..."}`

### 2. Frontend (http://localhost:3001)
- Abre: http://localhost:3001
- Deberías ver la página de login
- Inicia sesión con los datos de arriba

## 🔧 Solución de Problemas Comunes

### Error: "Cannot find module"
```bash
# Ejecutar desde la raíz del proyecto
npm install --legacy-peer-deps
```

### Error: "Port 3000 already in use"
```bash
# Encontrar y cerrar el proceso
Get-Process -Name node | Stop-Process -Force
```

### Error: "Database locked"
- Cierra todas las conexiones a la base de datos
- Reinicia el backend

### El frontend no se conecta al backend
1. Verifica que el backend esté corriendo en el puerto 3000
2. Verifica el archivo `.env` en la raíz tiene `FRONTEND_URL=http://localhost:3001`
3. Verifica que `vite.config.ts` tenga el proxy configurado

### Error al hacer login
1. Verifica que las migraciones se hayan ejecutado: `npm run db:migrate`
2. Verifica que los seeds se hayan ejecutado: `npm run db:seed`
3. Verifica que el Business ID sea exactamente: `demo-business-001`

## 📊 Comandos Útiles

### Resetear Base de Datos:
```bash
cd backend
npm run db:rollback
npm run db:migrate
npm run db:seed
```

### Ver Logs del Backend:
Los logs aparecen en la consola donde ejecutaste `npm run dev`

### Verificar que el Backend está Corriendo:
```powershell
Invoke-WebRequest -Uri http://localhost:3000/health -UseBasicParsing
```

## 🎯 Pruebas a Realizar

1. ✅ Login en el frontend
2. ✅ Ver Dashboard con estadísticas
3. ✅ Crear un nuevo servicio
4. ✅ Editar un servicio existente
5. ✅ Activar/Desactivar un servicio
6. ✅ Ver lista de reservas
7. ✅ Cambiar estado de una reserva
8. ✅ Probar endpoints del API con Postman/curl

## 📞 Si Necesitas Ayuda

Si encuentras algún error, copia el mensaje completo y la ubicación donde ocurre (backend/frontend).

