import dotenv from 'dotenv';

dotenv.config();

// Debug: Verificar variables de entorno en producción
if (process.env.NODE_ENV === 'production') {
  console.log('[KnexConfig] NODE_ENV:', process.env.NODE_ENV);
  console.log('[KnexConfig] DATABASE_URL definida:', !!process.env.DATABASE_URL);
  if (process.env.DATABASE_URL) {
    // Ocultar password en logs
    const url = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
    console.log('[KnexConfig] DATABASE_URL:', url);
  } else {
    console.warn('[KnexConfig] ⚠️  DATABASE_URL no está definida!');
    console.log('[KnexConfig] Variables disponibles:', {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_SSL: process.env.DB_SSL,
    });
  }
}

const config = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DB_PATH || './data/bookings.db',
    },
    useNullAsDefault: true,
    migrations: {
      directory: './database/migrations',
    },
    seeds: {
      directory: './database/seeds',
    },
  },
  production: {
    client: 'postgresql',
    // Si DATABASE_URL está definida, usarla directamente (formato: postgresql://user:pass@host:port/db)
    // Si no, usar variables individuales
    connection: process.env.DATABASE_URL 
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.DATABASE_URL.includes('render.com') || process.env.DATABASE_URL.includes('railway.app')
            ? { rejectUnauthorized: false }
            : false,
        }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          database: process.env.DB_NAME || 'milo_bookings',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || '',
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './database/migrations',
    },
    seeds: {
      directory: './database/seeds',
    },
  },
};

export default config;

