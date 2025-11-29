# Script de PowerShell para hacer commit y push automático
# Uso: .\auto-push.ps1 "mensaje del commit"

param(
    [Parameter(Mandatory=$true)]
    [string]$Mensaje
)

Write-Host "🔄 Iniciando proceso automático de git..." -ForegroundColor Cyan

# Obtener la rama actual
$branch = git branch --show-current
Write-Host "📍 Rama actual: $branch" -ForegroundColor Yellow

# Agregar todos los cambios
Write-Host "📦 Agregando cambios..." -ForegroundColor Cyan
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al agregar cambios" -ForegroundColor Red
    exit 1
}

# Hacer commit
Write-Host "💾 Haciendo commit..." -ForegroundColor Cyan
git commit -m "$Mensaje"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al hacer commit" -ForegroundColor Red
    exit 1
}

# Hacer push
Write-Host "🚀 Haciendo push a $branch..." -ForegroundColor Cyan
git push origin "$branch"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ¡Todo subido exitosamente a $branch!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Error al hacer push. Verifica tu conexión o permisos." -ForegroundColor Yellow
    exit 1
}



