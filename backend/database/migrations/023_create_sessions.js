/**
 * Migration: Crear tabla sessions para manejo de sesiones multi-negocio
 * 
 * Esta tabla almacena las sesiones de conversación entre usuarios y comercios
 * Permite que un usuario pueda interactuar con múltiples comercios desde el mismo número
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('sessions', (table) => {
    table.string('id').primary();
    table.string('user_phone').notNullable(); // Número de teléfono del usuario
    table.string('client_slug').notNullable(); // Slug del comercio
    table.string('state').defaultTo('inicio'); // Estado de la sesión: inicio, eligiendo_fecha, eligiendo_horario, confirmando, finalizado
    table.json('data').defaultTo('{}'); // Datos adicionales de la sesión (servicio seleccionado, fecha, etc.)
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Índices para búsquedas rápidas
    table.index(['user_phone', 'client_slug']); // Búsqueda de sesión activa
    table.index('client_slug');
    table.index('updated_at'); // Para limpiar sesiones antiguas
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('sessions');
}

