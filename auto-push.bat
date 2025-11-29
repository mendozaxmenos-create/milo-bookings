@echo off
REM Script batch para hacer commit y push automático
REM Uso: auto-push.bat "mensaje del commit"

if "%~1"=="" (
    echo ❌ Error: Debes proporcionar un mensaje de commit
    echo Uso: auto-push.bat "mensaje del commit"
    exit /b 1
)

echo 🔄 Iniciando proceso automático de git...

REM Obtener la rama actual
for /f "tokens=*" %%i in ('git branch --show-current') do set BRANCH=%%i
echo 📍 Rama actual: %BRANCH%

REM Agregar todos los cambios
echo 📦 Agregando cambios...
git add .
if errorlevel 1 (
    echo ❌ Error al agregar cambios
    exit /b 1
)

REM Hacer commit
echo 💾 Haciendo commit...
git commit -m "%~1"
if errorlevel 1 (
    echo ❌ Error al hacer commit
    exit /b 1
)

REM Hacer push
echo 🚀 Haciendo push a %BRANCH%...
git push origin %BRANCH%
if errorlevel 1 (
    echo ⚠️ Error al hacer push. Verifica tu conexión o permisos.
    exit /b 1
) else (
    echo ✅ ¡Todo subido exitosamente a %BRANCH%!
)



