/**
 * Script para migrar shortlinks sin business_id a businesses
 * Crea un business para cada shortlink que no tenga business_id asociado
 */

import db from '../database/index.js';
import { Business } from '../database/models/Business.js';
import { ClientService } from '../services/clientService.js';

async function migrateShortlinksToBusinesses() {
  try {
    console.log('[Migrate] Iniciando migración de shortlinks a businesses...');
    
    // Obtener todos los shortlinks activos sin business_id
    const clientsWithoutBusiness = await db('clients')
      .where({ status: 'active' })
      .whereNull('business_id');
    
    console.log(`[Migrate] Encontrados ${clientsWithoutBusiness.length} shortlinks sin business_id`);
    
    for (const client of clientsWithoutBusiness) {
      console.log(`[Migrate] Procesando shortlink: ${client.name} (${client.slug})`);
      
      try {
        // Crear business para este shortlink
        const business = await Business.create({
          name: client.name,
          phone: null,
          email: null,
          whatsapp_number: null,
          owner_phone: null,
          is_active: true,
          plan_type: 'basic', // Plan básico por defecto
          is_trial: false,
        });
        
        console.log(`[Migrate] ✅ Business creado: ${business.id} para ${client.name}`);
        
        // Actualizar el shortlink con el business_id
        await ClientService.update(client.id, {
          business_id: business.id,
        });
        
        console.log(`[Migrate] ✅ Shortlink ${client.slug} vinculado a business ${business.id}`);
      } catch (error) {
        console.error(`[Migrate] ❌ Error procesando shortlink ${client.slug}:`, error.message);
      }
    }
    
    console.log('[Migrate] ✅ Migración completada');
    process.exit(0);
  } catch (error) {
    console.error('[Migrate] ❌ Error en migración:', error);
    process.exit(1);
  }
}

migrateShortlinksToBusinesses();



