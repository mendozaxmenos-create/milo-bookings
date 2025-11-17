/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('availability_slots', (table) => {
    table.string('id').primary();
    table.string('business_id').notNullable().references('id').inTable('businesses').onDelete('CASCADE');
    table.date('date').notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.boolean('is_available').defaultTo(true);
    table.boolean('is_blocked').defaultTo(false);
    table.string('service_id').references('id').inTable('services').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['business_id', 'date']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('availability_slots');
}

