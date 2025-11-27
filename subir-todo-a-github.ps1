# Script para subir todos los cambios a GitHub y verificar

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Subiendo cambios a GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cambiar al directorio del proyecto
Set-Location "C:\Users\gusta\Desktop\milo-bookings"

# Verificar que estamos en el directorio correcto
if (-not (Test-Path ".git")) {
    Write-Host "ERROR: No se encontró el repositorio Git" -ForegroundColor Red
    exit 1
}

Write-Host "1. Verificando estado actual..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "2. Cambiando a rama main..." -ForegroundColor Yellow
git checkout main
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo cambiar a main" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3. Actualizando desde GitHub..." -ForegroundColor Yellow
git pull origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "ADVERTENCIA: Hubo problemas al hacer pull" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "4. Agregando todos los cambios..." -ForegroundColor Yellow
git add -A
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudieron agregar los cambios" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "5. Verificando qué se va a commitear..." -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "6. Haciendo commit..." -ForegroundColor Yellow
$commitMessage = "chore: Asegurar que todos los cambios estén en GitHub - Shortlinks y configuración"
git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "INFO: No hay cambios nuevos para commitear (todo ya está commiteado)" -ForegroundColor Green
} else {
    Write-Host "✓ Commit realizado exitosamente" -ForegroundColor Green
}

Write-Host ""
Write-Host "7. Subiendo a GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo hacer push a GitHub" -ForegroundColor Red
    Write-Host "Verifica que tengas permisos y que la rama main no esté protegida" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ TODO SUBIDO A GITHUB EXITOSAMENTE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Vercel debería detectar el push automáticamente y hacer deployment." -ForegroundColor Cyan
Write-Host "Verifica en: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host ""

# Verificar archivos importantes
Write-Host "Verificando archivos importantes..." -ForegroundColor Yellow
$archivosImportantes = @(
    "frontend\admin-panel\src\pages\Shortlinks.tsx",
    "frontend\admin-panel\vercel.json",
    "frontend\admin-panel\src\App.tsx",
    "frontend\admin-panel\src\components\Layout.tsx"
)

foreach ($archivo in $archivosImportantes) {
    if (Test-Path $archivo) {
        Write-Host "  ✓ $archivo existe" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $archivo NO existe" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Script completado!" -ForegroundColor Green

