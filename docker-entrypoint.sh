#!/bin/bash
set -e

echo "🚀 Iniciando Milo Bookings..."

# Ejecutar migraciones de base de datos
echo "📊 Ejecutando migraciones de base de datos..."
cd backend
npm run db:migrate || {
  echo "⚠️  Advertencia: Error al ejecutar migraciones. Continuando..."
}

# EJECUTAR SEEDS SIEMPRE (solo si no hay datos)
# Esto es más confiable que usar un endpoint HTTP
echo "🌱 Verificando y ejecutando seeds si es necesario..."
node scripts/check-and-seed.js || {
  echo "⚠️  Advertencia: Error al ejecutar seeds. Continuando..."
}

# Volver al directorio raíz
cd ..

# Ejecutar el comando principal
exec "$@"

