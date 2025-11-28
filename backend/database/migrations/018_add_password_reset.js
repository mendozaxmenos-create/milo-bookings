/**
 * Migration: Agregar campos para recuperación de contraseña
 * 
 * Agrega campos para almacenar tokens de recuperación de contraseña
 * y su fecha de expiración.
 */

export async function up(knex) {
  await knex.schema.alterTable('business_users', (table) => {
    table.string('password_reset_token').nullable();
    table.timestamp('password_reset_expires').nullable();
  });
}

export async function down(knex) {
  await knex.schema.alterTable('business_users', (table) => {
    table.dropColumn('password_reset_expires');
    table.dropColumn('password_reset_token');
  });
}

