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
echo "📂 Directorio actual: $(pwd)"
echo "📂 Listando scripts disponibles:"
ls -la scripts/ || echo "⚠️  No se encontró directorio scripts"
echo "🚀 Ejecutando check-and-seed.js..."
node scripts/check-and-seed.js || {
  echo "⚠️  Advertencia: Error al ejecutar seeds. Continuando..."
  echo "⚠️  Esto no debería impedir que el servidor inicie"
}
echo "✅ Script de seeds completado"

# Volver al directorio raíz
cd ..

# Ejecutar el comando principal
exec "$@"

