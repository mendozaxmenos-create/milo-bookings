/**
 * Script para migrar businesses existentes a clients
 * 
 * Este script:
 * 1. Lee todos los businesses activos
 * 2. Crea un client por cada business
 * 3. Genera un slug único basado en el nombre
 * 
 * Uso:
 *   node scripts/migrate-businesses-to-clients.js
 */

import dotenv from 'dotenv';
import knex from 'knex';
import config from '../knexfile.js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Función para generar slug desde nombre
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
    .replace(/^-+|-+$/g, ''); // Remover guiones al inicio y final
}

// Función para generar slug único
async function generateUniqueSlug(db, baseSlug, businessId) {
  let slug = baseSlug;
  let counter = 1;
  
  // Si el slug está vacío, usar el ID del business
  if (!slug) {
    slug = `business-${businessId.substring(0, 8)}`;
  }
  
  // Verificar si el slug ya existe
  while (true) {
    const existing = await db('clients')
      .where({ slug })
      .first();
    
    if (!existing) {
      return slug;
    }
    
    // Si existe, agregar un número
    slug = `${baseSlug || `business-${businessId.substring(0, 8)}`}-${counter}`;
    counter++;
  }
}

async function migrateBusinessesToClients() {
  const environment = process.env.NODE_ENV || 'production';
  const db = knex(config[environment]);
  
  try {
    console.log('='.repeat(60));
    console.log('🔄 Iniciando migración de businesses a clients...');
    console.log('='.repeat(60));
    
    // Obtener todos los businesses activos
    const businesses = await db('businesses')
      .where({ is_active: true })
      .orderBy('created_at', 'asc');
    
    console.log(`📊 Encontrados ${businesses.length} business(es) activo(s)`);
    
    if (businesses.length === 0) {
      console.log('⚠️  No hay businesses para migrar');
      await db.destroy();
      return;
    }
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const business of businesses) {
      try {
        // Verificar si ya existe un client para este business
        const existingClient = await db('clients')
          .where({ business_id: business.id })
          .first();
        
        if (existingClient) {
          console.log(`⏭️  Ya existe client para business: ${business.name} (${business.id})`);
          skipped++;
          continue;
        }
        
        // Generar slug único
        const baseSlug = generateSlug(business.name);
        const uniqueSlug = await generateUniqueSlug(db, baseSlug, business.id);
        
        // Crear client
        const client = {
          id: `client-${business.id}`,
          name: business.name,
          slug: uniqueSlug,
          business_id: business.id,
          settings: JSON.stringify({
            welcome_message: `¡Hola! 👋\n\nBienvenido a *${business.name}*.\n\n¿En qué puedo ayudarte hoy?`,
          }),
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        await db('clients').insert(client);
        
        console.log(`✅ Creado client: ${business.name}`);
        console.log(`   - ID: ${client.id}`);
        console.log(`   - Slug: ${client.slug}`);
        console.log(`   - Shortlink: https://tu-dominio.vercel.app/${client.slug}`);
        console.log('');
        
        created++;
      } catch (error) {
        console.error(`❌ Error migrando business ${business.name} (${business.id}):`, error.message);
        errors++;
      }
    }
    
    console.log('='.repeat(60));
    console.log('📊 Resumen de migración:');
    console.log(`   ✅ Creados: ${created}`);
    console.log(`   ⏭️  Omitidos: ${skipped}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log('='.repeat(60));
    
    // Mostrar todos los clients creados
    if (created > 0) {
      console.log('\n📋 Clients creados:');
      const clients = await db('clients')
        .whereIn('business_id', businesses.map(b => b.id))
        .orderBy('created_at', 'asc');
      
      clients.forEach(client => {
        console.log(`   - ${client.name} → ${client.slug}`);
      });
    }
    
    console.log('\n✅ Migración completada');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Ejecutar migración
migrateBusinessesToClients()
  .then(() => {
    console.log('\n🎉 Proceso finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });

