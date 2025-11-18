#!/bin/bash
set -e

echo "🚀 Iniciando Milo Bookings..."

# Ejecutar migraciones de base de datos
echo "📊 Ejecutando migraciones de base de datos..."
cd backend
npm run db:migrate || {
  echo "⚠️  Advertencia: Error al ejecutar migraciones. Continuando..."
}

# Ejecutar seeds (solo en producción, y solo si RUN_SEEDS está configurado)
# Por defecto, los seeds se ejecutan manualmente desde Render Shell
# Para ejecutar automáticamente, agrega RUN_SEEDS=true en las variables de entorno
if [ "$NODE_ENV" = "production" ] && [ "$RUN_SEEDS" = "true" ]; then
  echo "🌱 Ejecutando seeds de base de datos..."
  npm run db:seed || {
    echo "⚠️  Advertencia: Error al ejecutar seeds. Continuando..."
  }
else
  echo "ℹ️  Seeds no se ejecutarán automáticamente. Ejecuta 'npm run db:seed' manualmente si es necesario."
fi

# Volver al directorio raíz
cd ..

# Ejecutar el comando principal
exec "$@"

