# Script para forzar deployment completo en Vercel
# Ejecuta este script en una TERMINAL NUEVA

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Forzando Deployment Completo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "C:\Users\gusta\Desktop\milo-bookings"

# 1. Verificar que estamos en main
Write-Host "1. Cambiando a rama main..." -ForegroundColor Yellow
git checkout main
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo cambiar a main" -ForegroundColor Red
    exit 1
}

# 2. Actualizar desde GitHub
Write-Host "2. Actualizando desde GitHub..." -ForegroundColor Yellow
git pull origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "ADVERTENCIA: Hubo problemas al hacer pull" -ForegroundColor Yellow
}

# 3. Verificar archivos importantes
Write-Host "3. Verificando archivos importantes..." -ForegroundColor Yellow
$archivos = @(
    "frontend\admin-panel\src\pages\Shortlinks.tsx",
    "frontend\admin-panel\vercel.json",
    "frontend\admin-panel\src\App.tsx",
    "frontend\admin-panel\src\components\Layout.tsx"
)

$todosExisten = $true
foreach ($archivo in $archivos) {
    if (Test-Path $archivo) {
        Write-Host "  ✓ $archivo existe" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $archivo NO existe" -ForegroundColor Red
        $todosExisten = $false
    }
}

if (-not $todosExisten) {
    Write-Host "ERROR: Faltan archivos importantes" -ForegroundColor Red
    exit 1
}

# 4. Agregar todos los cambios
Write-Host "4. Agregando todos los cambios..." -ForegroundColor Yellow
git add -A
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudieron agregar los cambios" -ForegroundColor Red
    exit 1
}

# 5. Verificar qué se va a commitear
Write-Host "5. Cambios a commitear:" -ForegroundColor Yellow
git status --short

# 6. Hacer commit
Write-Host "6. Haciendo commit..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "chore: Forzar deployment completo - Shortlinks y configuración [$timestamp]"
git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "INFO: No hay cambios nuevos para commitear" -ForegroundColor Green
} else {
    Write-Host "✓ Commit realizado exitosamente" -ForegroundColor Green
}

# 7. Crear rama para PR (porque main está protegida)
Write-Host "7. Creando rama para PR..." -ForegroundColor Yellow
$branchName = "fix/deployment-completo-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git checkout -b $branchName
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo crear la rama" -ForegroundColor Red
    exit 1
}

# 8. Push a la nueva rama
Write-Host "8. Subiendo a GitHub..." -ForegroundColor Yellow
git push -u origin $branchName
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo hacer push a GitHub" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ TODO SUBIDO A GITHUB EXITOSAMENTE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Rama creada: $branchName" -ForegroundColor Cyan
Write-Host ""
Write-Host "PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "1. Ve a GitHub y crea un PR desde '$branchName' a 'main'" -ForegroundColor White
Write-Host "2. Haz merge del PR" -ForegroundColor White
Write-Host "3. Vercel debería detectar el cambio automáticamente" -ForegroundColor White
Write-Host "4. O fuerza un deployment manual en Vercel desde la rama 'main'" -ForegroundColor White
Write-Host ""
Write-Host "URL del PR:" -ForegroundColor Cyan
Write-Host "https://github.com/mendozaxmenos-create/milo-bookings/compare/main...$branchName" -ForegroundColor Cyan
Write-Host ""

