/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Agregar campo insurance_enabled a business_settings
  await knex.schema.table('business_settings', (table) => {
    table.boolean('insurance_enabled').defaultTo(false);
  });

  // Crear tabla de obras sociales (insurance_providers)
  await knex.schema.createTable('insurance_providers', (table) => {
    table.string('id').primary();
    table.string('business_id').notNullable().references('id').inTable('businesses').onDelete('CASCADE');
    table.string('name').notNullable(); // Nombre de la obra social (ej: "OSDE", "Swiss Medical")
    table.decimal('copay_amount', 10, 2).notNullable().defaultTo(0); // Coseguro en pesos
    table.integer('display_order').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Índice para búsquedas rápidas por negocio
    table.index('business_id');
  });

  // Agregar campos de obra social a bookings
  await knex.schema.table('bookings', (table) => {
    table.string('insurance_provider_id').nullable().references('id').inTable('insurance_providers').onDelete('SET NULL');
    table.decimal('copay_amount', 10, 2).nullable(); // Coseguro aplicado en esta reserva
    table.string('insurance_provider_name').nullable(); // Nombre de la obra social (para referencia histórica)
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Eliminar campos de bookings
  await knex.schema.table('bookings', (table) => {
    table.dropColumn('insurance_provider_id');
    table.dropColumn('copay_amount');
    table.dropColumn('insurance_provider_name');
  });

  // Eliminar tabla de obras sociales
  await knex.schema.dropTable('insurance_providers');

  // Eliminar campo de business_settings
  await knex.schema.table('business_settings', (table) => {
    table.dropColumn('insurance_enabled');
  });
}

