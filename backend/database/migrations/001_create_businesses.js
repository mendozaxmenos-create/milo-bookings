/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('businesses', (table) => {
    table.string('id').primary();
    table.string('name').notNullable();
    table.string('phone').notNullable();
    table.string('email');
    table.string('whatsapp_number').notNullable();
    table.string('owner_phone').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('businesses');
}

