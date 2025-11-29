/**
 * Migration: Crear tabla para analytics de shortlinks
 * 
 * Trackea cada acceso a un shortlink para poder mostrar estadísticas
 * de uso, reportes, y métricas de conversión
 */

export async function up(knex) {
  await knex.schema.createTable('shortlink_analytics', (table) => {
    table.string('id').primary();
    table.string('client_id').notNullable().references('id').inTable('clients').onDelete('CASCADE');
    table.string('slug').notNullable(); // Slug del shortlink (para búsquedas rápidas)
    table.string('business_id').nullable().references('id').inTable('businesses').onDelete('SET NULL');
    
    // Información del acceso
    table.string('ip_address').nullable(); // IP del usuario que accedió
    table.string('user_agent').nullable(); // User agent del navegador
    table.string('referer').nullable(); // URL de origen (si viene de otro sitio)
    
    // Metadata
    table.timestamp('accessed_at').defaultTo(knex.fn.now()); // Cuándo se accedió
    
    // Índices para búsquedas rápidas
    table.index(['client_id', 'accessed_at']);
    table.index(['slug', 'accessed_at']);
    table.index(['business_id', 'accessed_at']);
    table.index(['accessed_at']); // Para reportes por fecha
  });
}

export async function down(knex) {
  await knex.schema.dropTable('shortlink_analytics');
}

