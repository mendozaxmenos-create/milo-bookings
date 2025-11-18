/**
 * Script para verificar si hay datos y ejecutar seeds si es necesario
 * Se ejecuta desde docker-entrypoint.sh
 */
console.log('[SeedCheck] Iniciando verificación de seeds...');
console.log('[SeedCheck] NODE_ENV:', process.env.NODE_ENV);
console.log('[SeedCheck] DATABASE_URL definida:', !!process.env.DATABASE_URL);

import knex from 'knex';
import config from '../knexfile.js';
import { seed as seedDemo } from '../database/seeds/001_demo_data.js';
import { seed as seedSystemUsers } from '../database/seeds/003_system_users.js';

async function checkAndSeed() {
  let db;
  try {
    console.log('[SeedCheck] Conectando a la base de datos...');
    const environment = process.env.NODE_ENV || 'development';
    db = knex(config[environment]);

    console.log('[SeedCheck] Verificando si hay negocios en la base de datos...');
    // Verificar si hay negocios en la base de datos
    const businessesCount = await db('businesses').count('* as count').first();
    const count = parseInt(businessesCount?.count || 0, 10);

    console.log(`[SeedCheck] Negocios encontrados en la base de datos: ${count}`);

    if (count === 0) {
      console.log('[SeedCheck] ⚠️ No hay datos iniciales, ejecutando seeds...');
      
      try {
        // Ejecutar seeds directamente
        console.log('[SeedCheck] Ejecutando seed de datos demo...');
        await seedDemo(db);
        console.log('[SeedCheck] Seed de datos demo completado');
        
        console.log('[SeedCheck] Ejecutando seed de usuarios del sistema...');
        await seedSystemUsers(db);
        console.log('[SeedCheck] Seed de usuarios del sistema completado');
        
        console.log('[SeedCheck] ✅ Seeds ejecutados correctamente');
      } catch (seedError) {
        console.error('[SeedCheck] Error ejecutando seeds:', seedError);
        throw seedError;
      }
    } else {
      console.log('[SeedCheck] ✅ Ya hay datos en la base de datos, saltando seeds');
    }

    await db.destroy();
    console.log('[SeedCheck] Conexión a base de datos cerrada');
    process.exit(0);
  } catch (error) {
    console.error('[SeedCheck] ❌ Error:', error);
    console.error('[SeedCheck] Stack:', error.stack);
    if (db) {
      try {
        await db.destroy();
      } catch (e) {
        console.error('[SeedCheck] Error cerrando conexión:', e);
      }
    }
    // No fallar el deploy si hay error en seeds
    console.log('[SeedCheck] Continuando sin seeds...');
    process.exit(0);
  }
}

checkAndSeed().catch((error) => {
  console.error('[SeedCheck] Error no capturado:', error);
  process.exit(0);
});

