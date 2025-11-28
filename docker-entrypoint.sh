#!/bin/bash
# No usar set -e aquí para evitar que el script se detenga silenciosamente
# En su lugar, manejaremos errores explícitamente

echo "🚀 Iniciando Milo Bookings..."
echo "📂 Directorio actual: $(pwd)"
echo "📦 Variables de entorno:"
echo "   NODE_ENV: ${NODE_ENV:-not set}"
echo "   PORT: ${PORT:-not set}"
echo "   DATABASE_URL: ${DATABASE_URL:+set (hidden)}"

# Ejecutar migraciones de base de datos
echo "📊 Ejecutando migraciones de base de datos..."
cd backend || {
  echo "❌ Error: No se pudo cambiar al directorio backend"
  exit 1
}

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

# Permitir forzar la ejecución de seeds completos (npm run db:seed)
if [ "$FORCE_DB_SEED" = "true" ]; then
  echo "🌱 FORCE_DB_SEED= true → ejecutando npm run db:seed..."
  npm run db:seed || {
    echo "⚠️  Error al ejecutar npm run db:seed forzado"
  }
  echo "✅ Seeds forzados completados (o se reportó el error arriba)"
fi

# Volver al directorio raíz
cd .. || {
  echo "❌ Error: No se pudo volver al directorio raíz"
  exit 1
}

# Ejecutar el comando principal
echo "🚀 Ejecutando comando principal: $@"
exec "$@"

