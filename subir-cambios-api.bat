@echo off
echo ========================================
echo Subiendo correcciones de rutas de API
echo ========================================
echo.

cd /d C:\Users\gusta\Desktop\milo-bookings

echo 1. Cambiando a rama main...
git checkout main
if errorlevel 1 (
    echo ERROR: No se pudo cambiar a main
    pause
    exit /b 1
)

echo.
echo 2. Actualizando desde GitHub...
git pull origin main

echo.
echo 3. Agregando todos los cambios...
git add -A

echo.
echo 4. Haciendo commit...
git commit -m "fix: Corregir todas las rutas de API - agregar prefijo /api a todas las rutas"
if errorlevel 1 (
    echo INFO: No hay cambios nuevos para commitear
) else (
    echo Commit realizado exitosamente
)

echo.
echo 5. Creando rama nueva...
git checkout -b fix/corregir-rutas-api
if errorlevel 1 (
    echo ERROR: No se pudo crear la rama
    pause
    exit /b 1
)

echo.
echo 6. Subiendo a GitHub...
git push -u origin fix/corregir-rutas-api
if errorlevel 1 (
    echo ERROR: No se pudo hacer push a GitHub
    pause
    exit /b 1
)

echo.
echo ========================================
echo TODO SUBIDO A GITHUB EXITOSAMENTE
echo ========================================
echo.
echo PRÓXIMOS PASOS:
echo 1. Ve a GitHub y crea un PR desde 'fix/corregir-rutas-api' a 'main'
echo 2. Haz merge del PR
echo 3. Vercel debería detectar el cambio automáticamente
echo.
echo URL del PR:
echo https://github.com/mendozaxmenos-create/milo-bookings/compare/main...fix/corregir-rutas-api
echo.
pause

