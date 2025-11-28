/**
 * Script para verificar si hay datos y ejecutar seeds si es necesario
 * Se ejecuta desde docker-entrypoint.sh en cada deploy
 */
console.log('='.repeat(60));
console.log('[SeedCheck] 🌱 Iniciando verificación de seeds...');
console.log('[SeedCheck] NODE_ENV:', process.env.NODE_ENV);
console.log('[SeedCheck] DATABASE_URL definida:', !!process.env.DATABASE_URL);
console.log('='.repeat(60));

import knex from 'knex';
import config from '../knexfile.js';
import { seed as seedDemo } from '../database/seeds/001_demo_data.js';
import { seed as seedSystemUsers } from '../database/seeds/003_system_users.js';

async function checkAndSeed() {
  let db;
  try {
    console.log('[SeedCheck] 📊 Conectando a la base de datos...');
    const environment = process.env.NODE_ENV || 'production';
    db = knex(config[environment]);
    console.log('[SeedCheck] ✅ Conexión establecida');

    console.log('[SeedCheck] 🔍 Verificando si hay negocios en la base de datos...');
    const businessesCount = await db('businesses').count('* as count').first();
    const count = parseInt(businessesCount?.count || 0, 10);
    console.log(`[SeedCheck] 📈 Negocios encontrados: ${count}`);

    if (count === 0) {
      console.log('[SeedCheck] ⚠️  No hay datos, ejecutando seeds...');
      console.log('[SeedCheck] 📝 Ejecutando seed de datos demo...');
      await seedDemo(db);
      console.log('[SeedCheck] ✅ Seed de datos demo completado');
      
      console.log('[SeedCheck] 👤 Ejecutando seed de usuarios del sistema...');
      await seedSystemUsers(db);
      console.log('[SeedCheck] ✅ Seed de usuarios del sistema completado');
      
      console.log('[SeedCheck] 🎉 ✅ TODOS LOS SEEDS EJECUTADOS CORRECTAMENTE');
      console.log('[SeedCheck] 📋 Credenciales demo:');
      console.log('[SeedCheck]    Business ID: demo-business-001');
      console.log('[SeedCheck]    Teléfono: +5491123456789');
      console.log('[SeedCheck]    Contraseña: demo123');
    } else {
      console.log('[SeedCheck] ✅ Ya hay datos en la base de datos, saltando seeds');
    }

    await db.destroy();
    console.log('[SeedCheck] 🔌 Conexión cerrada');
    console.log('='.repeat(60));
    process.exit(0);
  } catch (error) {
    console.error('[SeedCheck] ❌ ERROR:', error.message);
    console.error('[SeedCheck] Stack:', error.stack);
    if (db) {
      try {
        await db.destroy();
      } catch (e) {
        // Ignore
      }
    }
    // No fallar el deploy si hay error en seeds
    console.log('[SeedCheck] ⚠️  Continuando sin seeds...');
    console.log('='.repeat(60));
    process.exit(0);
  }
}

checkAndSeed().catch((error) => {
  console.error('[SeedCheck] ❌ Error no capturado:', error);
  process.exit(0);
});

