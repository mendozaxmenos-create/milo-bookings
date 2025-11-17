# 🚀 Inicio Rápido - Milo Bookings

## ✅ Backend Funcionando

Si el backend ya está corriendo, ahora necesitas iniciar el frontend.

## 📱 Iniciar el Frontend

Abre una **nueva terminal** y ejecuta:

```powershell
cd C:\Users\gusta\Desktop\milo-bookings\frontend\admin-panel
npm run dev
```

O usa el script:
```powershell
cd C:\Users\gusta\Desktop\milo-bookings\frontend\admin-panel
.\start.ps1
```

## 🌐 Acceder a la Aplicación

Una vez que ambos estén corriendo:

1. **Frontend**: http://localhost:3001
2. **Backend API**: http://localhost:3000

## 🔐 Datos de Login

- **Business ID**: `demo-business-001`
- **Teléfono**: `+5491123456789`
- **Contraseña**: `demo123`

## ✅ Verificar que Todo Funciona

### Backend:
```powershell
Invoke-WebRequest -Uri http://localhost:3000/health -UseBasicParsing
```
Debería responder: `{"status":"ok","timestamp":"..."}`

### Frontend:
Abre tu navegador en: http://localhost:3001

Deberías ver la página de login.

## 🎯 Pruebas Rápidas

1. ✅ **Login**: Usa los datos de arriba
2. ✅ **Dashboard**: Deberías ver estadísticas y reservas recientes
3. ✅ **Servicios**: Ve a "Servicios" y prueba crear/editar uno
4. ✅ **Reservas**: Ve a "Reservas" y explora la lista

## 📝 Notas

- El backend debe estar corriendo antes que el frontend
- Si el frontend no se conecta, verifica que el backend esté en el puerto 3000
- Los datos de prueba ya están creados (negocio, usuario, servicios)

## 🆘 Si Algo No Funciona

Consulta `SOLUCION_ERRORES.md` para soluciones comunes.

