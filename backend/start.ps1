# Script para iniciar el backend
Write-Host "🚀 Iniciando Milo Bookings Backend..." -ForegroundColor Cyan
Write-Host ""

# Verificar que existe .env
if (-not (Test-Path "../.env")) {
    Write-Host "⚠️  Archivo .env no encontrado. Copiando desde .env.example..." -ForegroundColor Yellow
    Copy-Item "../.env.example" "../.env"
}

# Verificar que existe la carpeta data
if (-not (Test-Path "data")) {
    Write-Host "📁 Creando carpeta data..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "data" | Out-Null
}

# Verificar que existe la base de datos
if (-not (Test-Path "data/bookings.db")) {
    Write-Host "📊 Base de datos no encontrada. Ejecutando migraciones..." -ForegroundColor Yellow
    npm run db:migrate
    Write-Host "🌱 Ejecutando seeds..." -ForegroundColor Yellow
    npm run db:seed
}

Write-Host "✅ Iniciando servidor en http://localhost:3000" -ForegroundColor Green
Write-Host ""

node src/index.js

