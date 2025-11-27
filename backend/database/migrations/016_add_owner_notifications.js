/**
 * Migration: Agregar configuración de notificaciones al dueño
 * 
 * Agrega campos para configurar si el dueño quiere recibir notificaciones
 * cuando hay una nueva reserva.
 */

export async function up(knex) {
  await knex.schema.alterTable('business_settings', (table) => {
    table.boolean('owner_notifications_enabled').defaultTo(true); // Por defecto activado
    table.string('owner_notification_message').nullable(); // Mensaje personalizado para el dueño
  });
}

export async function down(knex) {
  await knex.schema.alterTable('business_settings', (table) => {
    table.dropColumn('owner_notification_message');
    table.dropColumn('owner_notifications_enabled');
  });
}

