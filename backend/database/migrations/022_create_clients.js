/**
 * Migration: Crear tabla clients para sistema multi-negocio
 * 
 * Esta tabla almacena los comercios/clientes que usan el bot
 * Cada comercio tiene un slug único que se usa en los shortlinks
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('clients', (table) => {
    table.string('id').primary();
    table.string('name').notNullable(); // Nombre del comercio
    table.string('slug').notNullable().unique(); // Slug único para shortlink (ej: "monpatisserie")
    table.string('business_id').nullable().references('id').inTable('businesses').onDelete('SET NULL'); // Relación opcional con businesses existente
    table.json('settings').defaultTo('{}'); // Configuración del comercio (horarios, mensajes, plantillas)
    table.string('status').defaultTo('active'); // active, inactive, suspended
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Índices
    table.index('slug');
    table.index('status');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('clients');
}

